import uvicorn
import sys
from pathlib import Path

# Add the src directory to Python path FIRST
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from fastapi import FastAPI
from app.api import auth, tasks, tags, task_tags

app = FastAPI(
    title="Task Manager API",
    description="API for managing tasks and tags",
    version="1.0.0"
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])
app.include_router(tags.router, prefix="/api", tags=["Tags"])
app.include_router(task_tags.router, prefix="/api", tags=["Task Tags"])
