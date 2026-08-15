import time
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from sqlalchemy import func
from passlib.context import CryptContext

from .database import SessionLocal, engine, Base
from . import models, schemas

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from .algorithms import (
    prioritize_tasks,
    prioritize_tasks_by_urgency,
    detect_due_date,
    parse_quick_task,
    insertion_sort,
    binary_search,
    linear_search,
    insertion_sort_count,
    binary_search_count,
    linear_search_count,
    get_recommended_task
)
from datetime import date


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
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],
    allow_headers=[
        "Authorization",
        "Content-Type"
    ],
)

# =========================
# REQUEST TIMING MIDDLEWARE
# =========================

@app.middleware("http")
async def request_logger(request, call_next):
    start_time = time.perf_counter()

    response = await call_next(request)

    process_time = (time.perf_counter() - start_time) * 1000

    print(
        f"{request.method} {request.url.path} "
        f"- {process_time:.2f} ms"
    )

    return response


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
# UPDATE MY PROFILE
# =========================

@app.put(
    "/users/me",
    response_model=schemas.UserResponse
)
def update_my_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if another user already has this email
    existing_user = (
        db.query(models.User)
        .filter(
            models.User.email == user_update.email,
            models.User.id != current_user.id
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Update current user's profile
    current_user.name = user_update.name
    current_user.email = user_update.email

    db.commit()
    db.refresh(current_user)

    return current_user


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
    sort: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tasks = (
        db.query(models.Task)
        .join(models.Project)
        .filter(
            models.Project.owner_id == current_user.id
        )
        .all()
    )

    # Normal task list
    if sort is None:
        return tasks

    # Section 2: insertion sort by priority
    if sort == "priority":

        priority_rank = {
            "low": 1,
            "medium": 2,
            "high": 3
        }

        records = [
            {
                "id": task.id,
                "project_id": task.project_id,
                "title": task.title,
                "priority": task.priority,
                "due_date": task.due_date,
                "status": task.status,
                "_priority_rank": priority_rank.get(
                    task.priority,
                    1
                )
            }
            for task in tasks
        ]

        # Our own insertion sort
        insertion_sort(records, "_priority_rank")

        # Highest priority first
        records.reverse()

        # Remove internal sorting field
        for record in records:
            del record["_priority_rank"]

        return records

    raise HTTPException(
        status_code=400,
        detail="Unsupported sort option"
    )
# =========================
# PRIORITIZED TASKS
# =========================

@app.get(
    "/tasks/prioritized",
    response_model=list[schemas.TaskResponse]
)
def get_prioritized_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tasks = (
        db.query(models.Task)
        .join(models.Project)
        .filter(
            models.Project.owner_id == current_user.id
        )
        .all()
    )

    prioritized = prioritize_tasks(tasks)

    return prioritized


# =========================
# URGENT TASKS
# =========================

@app.get(
    "/tasks/urgent",
    response_model=list[schemas.TaskResponse]
)
def get_urgent_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tasks = (
        db.query(models.Task)
        .join(models.Project)
        .filter(
            models.Project.owner_id == current_user.id
        )
        .all()
    )

    urgent_tasks = prioritize_tasks_by_urgency(tasks)

    return urgent_tasks


# =========================
# RECOMMENDED TASK
# =========================

@app.get(
    "/tasks/recommended",
    response_model=schemas.TaskResponse
)
def get_recommended_task_endpoint(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tasks = (
        db.query(models.Task)
        .join(models.Project)
        .filter(
            models.Project.owner_id == current_user.id,
            models.Task.status != "completed"
        )
        .all()
    )

    recommended_task = get_recommended_task(tasks)

    if not recommended_task:
        raise HTTPException(
            status_code=404,
            detail="No pending tasks found"
        )

    return recommended_task



# =========================
# TASK STATISTICS
# =========================

@app.get("/tasks/statistics")
def get_task_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    statistics = (
        db.query(
            models.Project.id.label("project_id"),
            models.Project.name.label("project_name"),
            func.count(models.Task.id).label("task_count")
        )
        .outerjoin(
            models.Task,
            models.Task.project_id == models.Project.id
        )
        .filter(
            models.Project.owner_id == current_user.id
        )
        .group_by(
            models.Project.id,
            models.Project.name
        )
        .all()
    )

    return [
        {
            "project_id": row.project_id,
            "project_name": row.project_name,
            "task_count": row.task_count
        }
        for row in statistics
    ]
# =========================
# SEARCH TASK
# =========================

@app.get(
    "/tasks/search",
    response_model=schemas.TaskResponse
)
def search_task(
    title: str,
    algo: str = "binary",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get current user's tasks from the database
    tasks = (
        db.query(models.Task)
        .join(models.Project)
        .filter(
            models.Project.owner_id == current_user.id
        )
        .all()
    )

    # Build search records
    records = [
        {
            "id": task.id,
            "title": task.title
        }
        for task in tasks
    ]

    # =========================
    # BINARY SEARCH
    # =========================

    if algo == "binary":

        # Binary search requires sorted records
        insertion_sort(records, "title")

        index = binary_search(
            records,
            title,
            "title"
        )

    # =========================
    # LINEAR SEARCH
    # =========================

    elif algo == "linear":

        index = linear_search(
            records,
            title,
            "title"
        )

    # =========================
    # INVALID ALGORITHM
    # =========================

    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported search algorithm. Use 'binary' or 'linear'."
        )

    # =========================
    # TASK NOT FOUND
    # =========================

    if index == -1:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    # Get actual task ID from search result
    task_id = records[index]["id"]

    # =========================
    # GET ACTUAL TASK
    # =========================

    task = (
        db.query(models.Task)
        .filter(
            models.Task.id == task_id
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


# =========================
# ALGORITHM BENCHMARK
# =========================

@app.get("/tasks/benchmark")
def benchmark_algorithms(
    title: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tasks = (
        db.query(models.Task)
        .join(models.Project)
        .filter(
            models.Project.owner_id == current_user.id
        )
        .all()
    )

    records = [
        {
            "id": task.id,
            "title": task.title
        }
        for task in tasks
    ]

    # -------------------------
    # INSERTION SORT
    # -------------------------

    insertion_records = records.copy()

    insertion_start = time.perf_counter()

    insertion_comparisons = insertion_sort_count(
        insertion_records,
        "title"
    )

    insertion_time = (
        time.perf_counter() - insertion_start
    ) * 1000

    # -------------------------
    # BINARY SEARCH
    # -------------------------

    binary_start = time.perf_counter()

    binary_result = binary_search_count(
        insertion_records,
        title,
        "title"
    )

    binary_time = (
        time.perf_counter() - binary_start
    ) * 1000

    # -------------------------
    # LINEAR SEARCH
    # -------------------------

    linear_start = time.perf_counter()

    linear_result = linear_search_count(
        records,
        title,
        "title"
    )

    linear_time = (
        time.perf_counter() - linear_start
    ) * 1000

    return {
        "target": title,
        "total_records": len(records),

        "insertion_sort": {
            "comparisons": insertion_comparisons,
            "time_ms": round(insertion_time, 4)
        },

        "binary_search": {
            "index": binary_result["index"],
            "comparisons": binary_result["comparison_count"],
            "time_ms": round(binary_time, 4)
        },

        "linear_search": {
            "index": linear_result["index"],
            "comparisons": linear_result["comparison_count"],
            "time_ms": round(linear_time, 4)
        }
    }
    

# =========================
# GET SINGLE TASK
# =========================

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


# =========================
# UPDATE TASK
# =========================

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


# =========================
# DELETE TASK
# =========================

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


# =========================
# UPDATE TASK STATUS
# =========================

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

# =========================
# AI QUICK-ADD TASK
# =========================

@app.post(
    "/tasks/quick-add",
    response_model=schemas.TaskResponse,
    status_code=201
)
def quick_add_task(
    quick_task: schemas.QuickTaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check whether project exists
    project = db.query(models.Project).filter(
        models.Project.id == quick_task.project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=422,
            detail="Project does not exist"
        )

    # Check project ownership
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to add tasks to this project"
        )

    # =========================
    # ROLE-BASED PROMPT
    # =========================

    system_prompt = """
    You are a task parsing assistant.
    Extract the task title, priority and due date hint
    from the user's task description.
    """

    user_prompt = quick_task.description

    # Mock parser
    parsed_task = parse_quick_task(user_prompt)

    # =========================
    # CREATE TASK
    # =========================

    new_task = models.Task(
        project_id=quick_task.project_id,
        title=parsed_task["title"],
        priority=parsed_task["priority"],
        due_date=parsed_task["due_date_hint"]
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task