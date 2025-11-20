from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from datetime import datetime

from app.models.task import CreateTask, ReadTask, UpdateTask
from app.auth.dependencies import get_current_user
from app.core.client import supabase


router = APIRouter()


@router.get("/tasks", response_model=list[ReadTask])
async def list_tasks(
    task_status: Optional[str] = Query(None, regex="^(todo|in_progress|done)$"),
    due_before: Optional[datetime] = Query(None),
    due_after: Optional[datetime] = Query(None),
    tags: Optional[str] = Query(
        None, description="Comma-separated list of tag UUIDs to filter tasks"
    ),
    search: Optional[str] = Query(None),
    search_mode: Optional[str] = Query(None, regex="^(simple|fulltext)$"),
    order_by: Optional[str] = Query("created_at"),
    order: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    limit: Optional[int] = Query(50, gt=0, le=1000),
    offset: Optional[int] = Query(0, ge=0),
    user=Depends(get_current_user),
):
    try:
        """
        Filters:
         - status: todo|in_progress|done
         - due_before / due_after: ISO datetimes
         - tags: 'uuid1,uuid2' (OR logic)
         - search_mode: 'simple' or 'fulltext' (ILIKE or RPC)
        """
        # Build base: if search_mode == 'fulltext', we will call RPC first to get task UUIDs
        tasks = None
        # Tag filter: If tags, get matching task IDs from task_tag table
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
            if tag_list:
                task_tag = (
                    supabase.table("task_tag")
                    .select("task")
                    .in_("tag", tag_list)
                    .execute()
                )
                tasks = list({item["task"] for item in task_tag.data})

        # Search mode via RPC (fulltext)
        if search and search_mode == "fulltext":
            rpc = supabase.rpc("fts_tasks", {"q": search}).execute()
            ft_ids = [r["pk"] for r in rpc.data] if rpc.data else []
            tasks = list(set(ft_ids) & set(tasks)) if tasks is not None else ft_ids
            if not tasks:
                return []

        # Build query --> Supabase oriented
        query = supabase.table("task").select("*")
        if user["role"] != "admin":
            query = query.eq("user", user["sub"])
        if task_status:
            query = query.eq("status", task_status)
        if due_before:
            query = query.lte("due_date", due_before.isoformat())
        if due_after:
            query = query.gte("due_date", due_after.isoformat())
        if tasks is not None:
            query = query.in_("pk", tasks)
        # Search mode via ILIKE (simple)
        if search and search_mode == "simple":
            expr = f"or(ilike(titile,.*{search}.*),ilike(description,.*{search}.*))"
            query = query.filter(expr)
        # Apply ordering, limit and offset
        asc = True if order == "asc" else False
        try:
            query = query.order(order_by, {"ascending": asc})
        except Exception:
            pass
        query = query.range(offset, offset + limit - 1)

        res = query.execute()
        if not isinstance(res.data, list):
            return [res.data]
        return res.data

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/tasks/{task_id}", response_model=ReadTask)
async def get_task(task_id: str, user=Depends(get_current_user)):
    try:
        res = supabase.table("task").select("*").eq("pk", task_id).single().execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )
        if user["role"] != "admin" and res.data["user"] != user["sub"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )
        return res.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/tasks", response_model=ReadTask)
async def create_task(task: CreateTask, user=Depends(get_current_user)):
    try:
        payload = {**task.model_dump(exclude_unset=True)}
        tags = payload.pop("tags", None)
        payload["user"] = user["sub"]
        res = supabase.table("task").insert([payload]).execute()

        created_task = res.data[0]
        if tags:
            mappings = [
                {"pk": str(uuid.uuid4()), "task": created_task["pk"], "tag": tag}
                for tag in tags
            ]
            supabase.table("task_tag").insert(mappings).execute()
        return created_task
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/tasks/{task_id}", response_model=ReadTask)
async def update_task(
    task_id: str, updated_task: UpdateTask, user=Depends(get_current_user)
):
    try:
        existing = (
            supabase.table("task").select("*").eq("pk", task_id).single().execute()
        )
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )
        if user["role"] != "admin" and existing.data["user"] != user["sub"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )
        res = (
            supabase.table("task")
            .update(updated_task.model_dump(exclude_unset=True))
            .eq("pk", task_id)
            .execute()
        )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user=Depends(get_current_user)):
    try:
        existing = (
            supabase.table("task").select("*").eq("pk", task_id).single().execute()
        )
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )
        if user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )
        supabase.table("task").delete().eq("pk", task_id).execute()
        return {"detail": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
