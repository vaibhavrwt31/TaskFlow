from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from passlib.context import CryptContext

from .database import SessionLocal, engine, Base
from . import models, schemas

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm



# =========================
# JWT CONFIGURATION
# =========================

SECRET_KEY = "taskflow-super-secret-key-change-this-later"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# =========================
# PASSWORD HASHING
# =========================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# =========================
# OAUTH2
# =========================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login"
)


# =========================
# DATABASE
# =========================

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================
# FASTAPI APP
# =========================

app = FastAPI(
    title="TaskFlow API",
    description="A task management API built with FastAPI and SQLAlchemy",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# AUTH FUNCTIONS
# =========================

def verify_password(
    plain_password: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.id == int(user_id)
    ).first()

    if user is None:
        raise credentials_exception

    return user


# =========================
# ROOT
# =========================

@app.get("/")
def root():
    return {
        "message": "TaskFlow API is running!"
    }


# =========================
# USERS
# =========================

@app.post(
    "/users",
    response_model=schemas.UserResponse
)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    # Check if email already exists
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(
        user.password
    )

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.get(
    "/users",
    response_model=list[schemas.UserResponse]
)
def get_users(
    db: Session = Depends(get_db)
):
    users = db.query(models.User).all()

    return users


# =========================
# LOGIN
# =========================

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    existing_user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        form_data.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token({
        "sub": str(existing_user.id)
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# =========================
# PROJECTS
# =========================

@app.post(
    "/projects",
    response_model=schemas.ProjectResponse
)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_project = models.Project(
        name=project.name,
        owner_id=current_user.id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


@app.get(
    "/projects",
    response_model=list[schemas.ProjectResponse]
)
def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    projects = db.query(models.Project).filter(
        models.Project.owner_id == current_user.id
    ).all()

    return projects


@app.get(
    "/projects/{project_id}",
    response_model=schemas.ProjectResponse
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to access this project"
        )

    return project


@app.put(
    "/projects/{project_id}",
    response_model=schemas.ProjectResponse
)
def update_project(
    project_id: int,
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing_project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()

    if not existing_project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # Check ownership
    if existing_project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to update this project"
        )

    existing_project.name = project.name

    db.commit()
    db.refresh(existing_project)

    return existing_project

@app.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # Check ownership
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to delete this project"
        )

    db.delete(project)
    db.commit()

    return {
        "message": "Project deleted successfully"
    }

# =========================
# TASKS
# =========================

@app.post(
    "/tasks",
    response_model=schemas.TaskResponse
)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check whether project exists
    project = db.query(models.Project).filter(
        models.Project.id == task.project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # Check project ownership
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to add tasks to this project"
        )

    new_task = models.Task(
        project_id=task.project_id,
        title=task.title,
        priority=task.priority,
        due_date=task.due_date
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@app.get(
    "/tasks",
    response_model=list[schemas.TaskResponse]
)
def get_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tasks = (
        db.query(models.Task)
        .join(models.Project)
        .filter(models.Project.owner_id == current_user.id)
        .all()
    )

    return tasks

@app.get(
    "/tasks/{task_id}",
    response_model=schemas.TaskResponse
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    project = db.query(models.Project).filter(
        models.Project.id == task.project_id
    ).first()

    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to access this task"
        )

    return task

@app.put(
    "/tasks/{task_id}",
    response_model=schemas.TaskResponse
)
def update_task(
    task_id: int,
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing_task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not existing_task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    project = db.query(models.Project).filter(
        models.Project.id == existing_task.project_id
    ).first()

    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to update this task"
        )

    new_project = db.query(models.Project).filter(
        models.Project.id == task.project_id
    ).first()

    if not new_project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    if new_project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to move task to this project"
        )

    existing_task.project_id = task.project_id
    existing_task.title = task.title
    existing_task.priority = task.priority
    existing_task.due_date = task.due_date

    db.commit()
    db.refresh(existing_task)

    return existing_task

@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    project = db.query(models.Project).filter(
        models.Project.id == task.project_id
    ).first()

    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to delete this task"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }

@app.patch(
    "/tasks/{task_id}/status",
    response_model=schemas.TaskResponse
)
def update_task_status(
    task_id: int,
    status_update: schemas.TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    project = db.query(models.Project).filter(
        models.Project.id == task.project_id
    ).first()

    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to update this task"
        )

    task.status = status_update.status

    db.commit()
    db.refresh(task)

    return task
