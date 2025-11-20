# Task Manager Monorepo

Este repositorio contiene dos servicios backend — uno en Python (FastAPI) y otro en TypeScript (NestJS) — que implementan la misma API de gestión de tareas.

## 🚀 Tecnologías principales

Servicio Framework ORM / DB Autenticación
Python FastAPI SQLAlchemy + Alembic JWT (Access + Refresh)
TypeScript NestJS Prisma JWT (Access + Refresh)

Base de datos compartida: PostgreSQL

Dockerizado con Docker Compose para facilitar el desarrollo.

⸻

## ✨ Funcionalidades (roadmap)

    •	Monorepo estructurado
    •	Autenticación y autorización con JWT
    •	CRUD de tareas
    •	Roles de usuario (user/admin)
    •	Tests automáticos
    •	Deploy en hosting gratuito

⸻

## 📦 Estructura del monorepo

/task-manager
├── python/ # Backend en FastAPI
├── typescript/ # Backend en NestJS
└── docs/ # Documentación del proyecto

⸻

## 🐳 Entorno de desarrollo con Docker

### Levantar los contenedores

$ docker compose up --build

La API de FastAPI estará disponible en http://localhost:8000 y NestJS en http://localhost:3000.

⸻

## 🧪 Test

Cada servicio incluirá sus propios tests:

cd python && pytest
cd typescript && npm test

⸻

## Ejecutar en local

### Python (VS Code)

```json
{
  "configurations": [
    {
      "name": "Python: Task Manager API",
      "type": "debugpy",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload"],
      "cwd": "${workspaceFolder}/task-manager/python/src",
      "env": {
        "SUPABASE_URL": "https://rhucagujuskuwxblamtr.supabase.co",
        "SUPABASE_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodWNhZ3VqdXNrdXd4YmxhbXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTcwMDksImV4cCI6MjA3OTAzMzAwOX0.7EZ49LmUoziqLFc8U9v6ITlKS7NAB1vhm1UM5LIwUas",
        "JWT_SECRET": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodWNhZ3VqdXNrdXd4YmxhbXRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ1NzAwOSwiZXhwIjoyMDc5MDMzMDA5fQ.gsL8if1YcupTMym7F3flbbGlcjZUTjOF1EoUy6M2ll4",
        "ACCESS_TOKEN_EXPIRE_MINUTES": "15",
        "REFRESH_TOKEN_EXPIRE_DAYS": "14"
      }
    }
  ]
}
```

⸻

## 📜 Licencia

MIT License — Libre para aprender y construir sobre este proyecto.
