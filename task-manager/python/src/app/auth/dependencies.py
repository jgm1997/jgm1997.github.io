from fastapi import Depends, HTTPException, status
from app.core.client import supabase
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


reusable_oauth2 = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(reusable_oauth2),
):
    token = credentials.credentials
    
    try:
        # Validate token with Supabase
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        user = user_response.user
        # Get role from user metadata, default to 'user'
        user_role = user.user_metadata.get("role", "user") if user.user_metadata else "user"
        
        return {"sub": user.user_metadata.get("sub"), "role": user_role, "user_id": user.id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}"
        )


async def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required"
        )
    return user
