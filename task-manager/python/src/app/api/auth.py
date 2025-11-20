from fastapi import APIRouter, HTTPException

from app.models.auth import CreateUser, LoginUser
from app.core.client import supabase

router = APIRouter()


@router.post("/auth/register")
async def register(user: CreateUser):
    try:
        res = supabase.auth.sign_up(
            {
                "email": user.email,
                "password": user.password,
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create user: {e}")

    if not res or not res.session:
        raise HTTPException(status_code=400, detail="Failed to create user")
    
    return {
        "access_token": res.session.access_token,
        "refresh_token": res.session.refresh_token
    }


@router.post("/auth/login")
async def login(user: LoginUser):
    try:
        res = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password,
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Failed to login: {e}")

    if not res or not res.session:
        raise HTTPException(status_code=401, detail="Failed to login")
    
    return {
        "access_token": res.session.access_token,
        "refresh_token": res.session.refresh_token
    }

@router.post("/auth/refresh")
async def refresh(supabase_refresh_token: str):
    try:
        res = supabase.auth.refresh_session(supabase_refresh_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Failed to refresh token: {e}")

    if not res or not res.session:
        raise HTTPException(status_code=401, detail="Failed to refresh token")
    
    return {
        "access_token": res.session.access_token,
        "refresh_token": res.session.refresh_token
    }

@router.post("/auth/logout")
async def logout(supabase_refresh_token: str):
    try:
        supabase.auth.sign_out(supabase_refresh_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Failed to logout: {e}")
    return {"message": "Logged out successfully"}