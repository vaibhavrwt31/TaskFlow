# TaskFlow — Full-Stack AI-Assisted Task Management Platform

TaskFlow is a full-stack task and project management application built with FastAPI, SQLAlchemy, SQLite, and a frontend dashboard.

The application provides:

- User registration and login
- JWT-based authentication
- Project management
- Task CRUD operations
- Task priority and status management
- Task statistics
- Insertion-sort based task sorting
- Binary and linear task searching
- Algorithm benchmarking
- AI-assisted Quick-Add task creation
- Rule-based mock AI parser
- Frontend dashboard connected to the real backend

---

## 1. Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- JWT authentication
- Passlib/Bcrypt

### Frontend

- React
- Vite
- JavaScript
- CSS

### Algorithms

- Insertion Sort
- Binary Search
- Linear Search

---

## 2. Project Structure

```text
TaskFlow/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   └── algorithms.py
│
├── frontend/
│
├── benchmark.py
├── check_algorithms.py
├── requirements.txt
└── README.md
```

---

## 3. Algorithms Engine

TaskFlow uses custom algorithm implementations for task sorting and searching.

### 3.1 Insertion Sort

The `insertion_sort(records, key)` function sorts records in place using the insertion sort algorithm.

**Time Complexity:**

- Best case: O(n)
- Worst case: O(n²)
- Space Complexity: O(1)

### 3.2 Binary Search

The `binary_search(sorted_records, target_value, key)` function searches a sorted list using the binary search algorithm.

It returns the matching index, or `-1` when the target is not found.

**Time Complexity:**

- Best case: O(1)
- Worst case: O(log n)
- Space Complexity: O(1)

### 3.3 Linear Search

The `linear_search(records, target_value, key)` function scans records sequentially and returns the index of the first matching record.

**Time Complexity:**

- Best case: O(1)
- Worst case: O(n)
- Space Complexity: O(1)

---

## 4. Algorithm Integration

The algorithms are integrated directly into the TaskFlow backend.

### 4.1 Sorting

The following endpoint uses the custom insertion sort implementation:

```text
GET /tasks?sort=priority
```

The endpoint:

- Fetches the current user's tasks from the real database.
- Converts priority values into comparable ranks:
  - `low = 1`
  - `medium = 2`
  - `high = 3`
- Calls the custom `insertion_sort()` function.
- Returns the tasks with the highest priority first.

The backend does not use Python's built-in `sorted()` or `list.sort()` for this endpoint.

### 4.2 Searching

The following endpoint supports binary search:

```text
GET /tasks/search?title=<exact title>&algo=binary
```

The endpoint:

1. Builds an in-memory search index from the real tasks stored in the database.
2. Sorts the index using the custom `insertion_sort()` implementation.
3. Searches the sorted index using `binary_search()`.

The endpoint also supports linear search:

```text
GET /tasks/search?title=<exact title>&algo=linear
```

Linear search scans the task index sequentially using the custom `linear_search()` implementation.

---

## 5. Algorithm Benchmark Results

The benchmark was executed using task-shaped records at three different data sizes.

| Data Size | Insertion Sort | Binary Search | Linear Search |
|---:|---:|---:|---:|
| 10 | 45 | 3 | 6 |
| 500 | 124750 | 8 | 251 |
| 3000 | 4498500 | 11 | 1501 |

The benchmark shows that insertion sort requires substantially more comparisons as the dataset grows, while binary search requires only a small number of comparisons after sorting. Linear search grows proportionally with the number of records.

TaskFlow users are expected to view and search their tasks repeatedly during the day, while adding or renaming tasks less frequently. Therefore, the upfront cost of sorting can be worthwhile when the sorted data is used for repeated searches.

The benchmark demonstrates that binary search is much more efficient than linear search for larger datasets.

---

## 6. Automated Algorithm Checks

The algorithm validation script can be executed with:

```bash
python check_algorithms.py
```

The validation script checks important algorithm behaviors including:

- Insertion sort with an empty list
- Insertion sort with a single element
- Binary search for the first index
- Binary search for a middle index
- Binary search for the last index
- Binary search when an element is not found
- Insertion sort comparison counting
- Binary search comparison counting
- Linear search comparison counting

Example successful output:

```text
PASS: Insertion sort empty list
PASS: Insertion sort single element
PASS: Binary search first index
PASS: Binary search middle index
PASS: Binary search last index
PASS: Binary search not found
PASS: Insertion sort count sorted result
PASS: Insertion sort count returns positive int
PASS: Binary search count
PASS: Linear search count not found
```

---

## 7. API Endpoints

TaskFlow provides REST API endpoints for user management, authentication, projects, tasks, statistics, algorithm-based sorting and searching, and AI-assisted Quick-Add.

All protected endpoints require a valid JWT access token in the:

```text
Authorization: Bearer <token>
```

header.

### 7.1 User Endpoints

#### Create User

```text
POST /users
```

Creates a new user account.

#### Get Users

```text
GET /users
```

Returns the registered users.

#### Update My Profile

```text
PUT /users/me
```

Updates the authenticated user's name and email.

### 7.2 Authentication

#### Login

```text
POST /login
```

Authenticates a user and returns a JWT access token.

Example response:

```json
{
    "access_token": "<JWT_TOKEN>",
    "token_type": "bearer"
}
```

### 7.3 Project Endpoints

#### Create Project

```text
POST /projects
```

Creates a project owned by the authenticated user.

#### Get Projects

```text
GET /projects
```

Returns projects belonging to the authenticated user.

#### Get Single Project

```text
GET /projects/{project_id}
```

Returns a specific project after checking ownership.

#### Update Project

```text
PUT /projects/{project_id}
```

Updates an existing project.

#### Delete Project

```text
DELETE /projects/{project_id}
```

Deletes an existing project.

### 7.4 Task Endpoints

#### Create Task

```text
POST /tasks
```

Creates a task inside an existing project.

#### Get Tasks

```text
GET /tasks
```

Returns the authenticated user's tasks.

Tasks can also be sorted using the custom insertion sort implementation:

```text
GET /tasks?sort=priority
```

#### Get Single Task

```text
GET /tasks/{task_id}
```

Returns a specific task after checking project ownership.

#### Update Task

```text
PUT /tasks/{task_id}
```

Updates the project, title, priority, and due date of a task.

#### Delete Task

```text
DELETE /tasks/{task_id}
```

Deletes a task.

#### Update Task Status

```text
PATCH /tasks/{task_id}/status
```

Updates the status of a task.

### 7.5 Algorithm-Based Task Search

#### Binary Search

```text
GET /tasks/search?title=<exact title>&algo=binary
```

Searches for a task using binary search after sorting the search index.

#### Linear Search

```text
GET /tasks/search?title=<exact title>&algo=linear
```

Searches for a task using linear search.

### 7.6 Prioritized Tasks

```text
GET /tasks/prioritized
```

Returns tasks ordered according to their priority score.

### 7.7 Urgent Tasks

```text
GET /tasks/urgent
```

Returns tasks ordered according to their calculated urgency.

### 7.8 Recommended Task

```text
GET /tasks/recommended
```

Returns the most urgent pending task.

### 7.9 Task Statistics

```text
GET /tasks/statistics
```

Returns task completion statistics.

### 7.10 AI Quick-Add

```text
POST /tasks/quick-add
```

Creates a task from a natural-language description using the rule-based Quick-Add parser.

---

## 8. AI Quick-Add Task

TaskFlow provides an AI-assisted Quick-Add feature that allows users to create tasks using natural language.

Instead of manually entering the task title, priority, and due date, the user can provide a simple description such as:

```text
Submit assignment urgently tomorrow
```

### 8.1 Quick-Add Endpoint

The Quick-Add feature is available through:

```text
POST /tasks/quick-add
```

Example request:

```json
{
    "project_id": 1,
    "description": "Submit assignment urgently tomorrow"
}
```

The endpoint validates the project, checks ownership, parses the description, creates the task, and returns the created task.

### 8.2 Rule-Based Task Parsing

The parser is implemented in:

```text
backend/algorithms.py
```

The function used is:

```text
parse_quick_task(description)
```

The parser detects:

- Task title
- Task priority
- Due date hint

### 8.3 Priority Detection

The parser uses predefined rules to determine task priority.

| Keyword | Priority |
|---|---|
| urgent | high |
| asap | high |
| whenever | low |
| low priority | low |
| No matching keyword | medium |

For example:

```text
Finish project urgently
```

is interpreted with:

```text
priority = high
```

### 8.4 Due Date Detection

The parser detects common date-related phrases including:

- today
- tomorrow
- next week
- next Monday
- next Tuesday
- next Wednesday
- next Thursday
- next Friday
- next Saturday
- next Sunday
- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

For example:

```text
Submit assignment tomorrow
```

produces:

```text
due_date_hint = tomorrow
```

### 8.5 Title Cleaning

Priority keywords and detected date phrases are removed from the original description to produce a cleaner task title.

Example:

```text
Urgent submit assignment tomorrow
```

is converted approximately into:

```json
{
    "title": "submit assignment",
    "priority": "high",
    "due_date_hint": "tomorrow"
}
```

If no usable title remains, the parser uses:

```text
Untitled task
```

### 8.6 Task Creation Flow

The Quick-Add process follows these steps:

```text
User enters natural-language description
              ↓
POST /tasks/quick-add
              ↓
Validate project
              ↓
Check project ownership
              ↓
Parse task description
              ↓
Detect priority
              ↓
Detect due date
              ↓
Clean task title
              ↓
Create task in SQLite database
              ↓
Return created task
```

### 8.7 Mock AI Design

The current implementation uses a deterministic rule-based parser instead of an external AI API.

This approach provides:

- Predictable results
- No external API dependency
- No API key requirement
- Easy testing
- Fast task creation

The architecture can later be extended to connect an actual AI/LLM service without changing the overall Quick-Add endpoint design.

---

## 9. Task Analytics and Smart Prioritization

TaskFlow includes an algorithm-based task prioritization and analytics system to help users identify important and urgent tasks.

### 9.1 Priority-Based Task Ranking

Each task is assigned a priority value:

| Priority | Score |
|---|---:|
| high | 3 |
| medium | 2 |
| low | 1 |

The `calculate_task_score()` function converts the task priority into a numerical score.

The `prioritize_tasks()` function uses this score to arrange tasks from highest priority to lowest priority.

Endpoint:

```text
GET /tasks/prioritized
```

### 9.2 Urgency-Based Task Ranking

TaskFlow also considers the task due date along with its priority.

The `calculate_urgency_score()` function adds additional points depending on how close the task's due date is.

| Due Date Condition | Additional Score |
|---|---:|
| Overdue | +5 |
| Due today | +4 |
| Due tomorrow | +3 |
| Due within 3 days | +2 |
| Due within 7 days | +1 |

The final urgency score is calculated using:

```text
Urgency Score = Priority Score + Due Date Score
```

Tasks with higher urgency scores are placed first.

Endpoint:

```text
GET /tasks/urgent
```

### 9.3 Recommended Task

TaskFlow provides a recommendation endpoint that identifies the most urgent pending task.

Endpoint:

```text
GET /tasks/recommended
```

Completed tasks are excluded from the recommendation.

The system uses the `get_recommended_task()` function to select the task with the highest urgency score.

If there are no pending tasks, the API returns:

```text
404 - No pending tasks found
```

### 9.4 Task Statistics

TaskFlow calculates basic task completion statistics using the `calculate_task_statistics()` function.

Endpoint:

```text
GET /tasks/statistics
```

The endpoint returns:

- Total number of tasks
- Number of completed tasks
- Number of pending tasks
- Completion percentage

Example response:

```json
{
    "total_tasks": 10,
    "completed_tasks": 6,
    "pending_tasks": 4,
    "completion_percentage": 60.0
}
```

### 9.5 Smart Task Filtering

TaskFlow provides filtering functionality based on:

- Keyword
- Priority
- Status

The filtering logic is implemented through:

```text
filter_tasks(tasks, keyword, priority, status)
```

The keyword search checks the task title, while priority and status filters compare their corresponding task fields.

This allows the system to narrow down a large task collection efficiently.

### 9.6 Task Prioritization Flow

The overall prioritization process can be represented as:

```text
Tasks from Database
        ↓
Calculate Priority Score
        ↓
Check Due Date
        ↓
Calculate Urgency Score
        ↓
Rank Tasks
        ↓
Return Prioritized / Recommended Task
```

---

## 10. Authentication and Security

TaskFlow uses JWT-based authentication to protect user-specific resources.

### 10.1 Password Security

User passwords are hashed before being stored in the database using Passlib with bcrypt.

Plain-text passwords are not stored in the database.

### 10.2 JWT Authentication

After successful login, the backend creates a JWT access token.

The token contains the authenticated user's ID and an expiration time.

Protected endpoints use the JWT token to identify the current user.

### 10.3 Authorization

TaskFlow checks project ownership before allowing users to:

- View protected projects
- Update projects
- Delete projects
- Create tasks inside projects
- Update tasks
- Delete tasks
- Update task status

This prevents users from modifying resources belonging to another user.

---

## 11. Database Design

TaskFlow uses SQLite with SQLAlchemy ORM.

The main entities are:

```text
User
  │
  └── Projects
        │
        └── Tasks
```

### 11.1 User

Users contain information such as:

- ID
- Name
- Email
- Password

### 11.2 Project

Projects contain:

- ID
- Name
- Owner ID

Each project belongs to a user.

### 11.3 Task

Tasks contain:

- ID
- Project ID
- Title
- Priority
- Status
- Due Date

Each task belongs to a project.

---

## 12. Testing and Validation

TaskFlow includes automated algorithm validation and benchmark testing.

### 12.1 Algorithm Validation

Run:

```bash
python check_algorithms.py
```

The script validates the behavior of the custom sorting and searching algorithms.

### 12.2 Algorithm Benchmark

Run:

```bash
python benchmark.py
```

The benchmark measures comparison counts for different data sizes.

Example:

```text
TASKFLOW ALGORITHM BENCHMARK
==================================================

DATA SIZE: 10 TASKS
Insertion Sort comparisons: 45
Binary Search comparisons: 3
Linear Search comparisons: 6

DATA SIZE: 500 TASKS
Insertion Sort comparisons: 124750
Binary Search comparisons: 8
Linear Search comparisons: 251

DATA SIZE: 3000 TASKS
Insertion Sort comparisons: 4498500
Binary Search comparisons: 11
Linear Search comparisons: 1501

BENCHMARK COMPLETE
```

---

## 13. Running the Application

### 13.1 Start the Backend

From the TaskFlow project directory:

```bash
uvicorn backend.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

### 13.2 Open API Documentation

FastAPI provides interactive Swagger documentation at:

```text
http://127.0.0.1:8000/docs
```

The Swagger interface can be used to test:

- Authentication
- Users
- Projects
- Tasks
- Task search
- Task prioritization
- Task statistics
- Quick-Add

### 13.3 Start the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies if required:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 14. Frontend Dashboard

The TaskFlow frontend provides a dashboard for interacting with the backend API.

The frontend is designed to provide access to:

- User authentication
- Project management
- Task creation
- Task editing
- Task deletion
- Task status updates
- Task prioritization
- Task statistics
- Task search
- AI Quick-Add

The frontend communicates with the FastAPI backend through REST API requests.

---

## 15. Key Features

TaskFlow combines task management with algorithmic processing and AI-assisted functionality.

### Core Features

- User registration
- Secure login
- JWT authentication
- Profile management
- Project CRUD
- Task CRUD
- Task status management
- Task priority management
- Due date support

### Algorithm Features

- Custom insertion sort
- Custom binary search
- Custom linear search
- Comparison-counting implementations
- Algorithm benchmark
- Priority-based sorting
- Urgency-based ranking

### AI-Assisted Features

- Natural-language Quick-Add
- Rule-based priority detection
- Due-date phrase detection
- Automatic title cleaning
- Mock AI architecture ready for future LLM integration

### Analytics

- Total task count
- Completed task count
- Pending task count
- Completion percentage
- Urgency ranking
- Recommended pending task

---

## 16. Future Improvements

Possible future improvements include:

- Integration with a real LLM API for Quick-Add
- More advanced natural-language date parsing
- Recurring tasks
- Task reminders and notifications
- Team collaboration
- Project-level analytics
- Advanced filtering
- Pagination for large task collections
- Improved frontend UI
- Production database such as PostgreSQL
- Docker deployment
- Cloud deployment
- Automated API testing

---

## 17. Conclusion

TaskFlow demonstrates a complete full-stack task management system combining:

- FastAPI backend development
- SQLAlchemy database management
- JWT authentication
- REST API design
- React frontend development
- Custom data structures and algorithms
- Algorithm benchmarking
- Task analytics
- Rule-based AI-assisted task creation

The project demonstrates how traditional algorithms such as insertion sort, binary search, and linear search can be integrated into a practical full-stack application while providing measurable performance comparisons and useful task-management functionality.