from fastapi import APIRouter, Depends, HTTPException, status
from app.core.client import supabase
from app.models.tag import CreateTag, ReadTag, UpdateTag
from app.auth.dependencies import get_current_user

router = APIRouter()


@router.get("/tags", response_model=list[ReadTag])
async def list_tags(user=Depends(get_current_user)):
    try:
        query = supabase.table("tag").select("*")
        if user["role"] != "admin":
            query = query.eq("user", user["sub"])
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.get("/tags/{tag_id}", response_model=ReadTag)
async def get_tag(tag_id: str, user=Depends(get_current_user)):
    try:
        res = supabase.table("tag").select("*").eq("pk", tag_id).single().execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
            )
        if user["role"] != "admin" and res.data["user"] != user["sub"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied"
            )
        return res.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.post("/tags", response_model=ReadTag, status_code=status.HTTP_201_CREATED)
async def create_tag(payload: CreateTag, user=Depends(get_current_user)):
    try:
        exists = (
            supabase.table("tag")
            .select("pk")
            .eq("user", user["sub"])
            .eq("name", payload.name)
            .execute()
        )
        if exists.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Tag already exists"
            )

        res = (
            supabase.table("tag")
            .insert(
                [
                    {
                        **payload.model_dump(),
                        "user": user["sub"],
                    }
                ]
            )
            .execute()
        )
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.put("/tags/{tag_id}", response_model=ReadTag)
async def update_tag(tag_id: str, payload: UpdateTag, user=Depends(get_current_user)):
    try:
        res = supabase.table("tag").select("*").eq("pk", tag_id).single().execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
            )
        if user["role"] != "admin" and res.data["user"] != user["sub"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied"
            )

        update = (
            supabase.table("tag")
            .update(payload.model_dump(exclude_unset=True))
            .eq("pk", tag_id)
            .execute()
        )
        return update.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(tag_id: str, user=Depends(get_current_user)):
    try:
        res = supabase.table("tag").select("*").eq("pk", tag_id).single().execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
            )
        if user["role"] != "admin" and res.data["user"] != user["sub"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied"
            )
        supabase.table("task_tag").delete().eq("tag", tag_id).execute()
        supabase.table("tag").delete().eq("pk", tag_id).execute()
        return
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )
