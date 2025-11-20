import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import exists
from app.auth.dependencies import get_current_user
from app.core.client import supabase

router = APIRouter()


@router.post("/tasks/{task_id}/tags/{tag_id}", status_code=status.HTTP_201_CREATED)
async def assign_tag(task_id: str, tag_id: str, user=Depends(get_current_user)):
    try:
        task = supabase.table("task").select("*").eq("pk", task_id).single().execute()
        if not task.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )
        if user["role"] != "admin" and task.data["user"] != user["sub"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied"
            )

        tag = supabase.table("tag").select("*").eq("pk", tag_id).single().execute()
        if not tag.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
            )
        if user["role"] != "admin" and tag.data["user"] != user["sub"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied"
            )

        exists = (
            supabase.table("task_tag")
            .select("*")
            .eq("task", task_id)
            .eq("tag", tag_id)
            .execute()
        )
        if exists.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tag already assigned to task",
            )

        res = (
            supabase.table("task_tag")
            .insert([{"pk": str(uuid.uuid4()), "task": task_id, "tag": tag_id}])
            .execute()
        )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.delete("/tasks/{task_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unassign_tag(task_id: str, tag_id: str, user=Depends(get_current_user)):
    try:
        task = supabase.table("task").select("*").eq("pk", task_id).single().execute()
        if not task.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )
        if user["role"] != "admin" and task.data["user"] != user["sub"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied"
            )

        supabase.table("task_tag").delete().eq("task", task_id).eq("tag", tag_id).execute()
        return
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )
