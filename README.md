# Task Manager

A full-stack task management app with user authentication, allowing users to sign up, log in, and manage their own personal to-do list — create, edit, complete, delete, search, and filter tasks, with due dates and overdue tracking.

## Features

- **User authentication** — register and log in with JWT-based auth; passwords and sessions are handled server-side
- **Personal task lists** — each user only sees and manages their own tasks (enforced via authenticated API routes)
- **Task CRUD** — create, edit, complete/undo, and delete tasks
- **Due dates** — assign a due date to any task
- **Overdue highlighting** — tasks past their due date are visually flagged (unless already completed)
- **Search** — filter tasks by title in real time
- **Status filters** — view All, Active, or Completed tasks

## Tech Stack

**Frontend**
- React (functional components, hooks)
- Fetch API for HTTP requests
- `localStorage` for storing the auth token and user session

**Backend**
- Node.js + Express
- SQLite (via `sqlite3`) for data storage
- JSON Web Tokens (JWT) for authentication middleware

## Project Structure

```
task-manager/
├── backend/
│   ├── db.js                # SQLite connection + schema setup
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js          # /api/auth/login, /api/auth/register
│   │   └── tasks.js         # /api/tasks CRUD routes
│   ├── server.js            # Express app entry point
│   └── database.db          # SQLite database file (gitignored)
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Login.js
        │   ├── Register.js
        │   └── TaskList.js
        └── App.js
```

## Database Schema

**users**
| Column   | Type    | Notes                |
|----------|---------|-----------------------|
| id       | INTEGER | Primary key, autoincrement |
| name     | TEXT    | Required              |
| email    | TEXT    | Required, unique      |
| password | TEXT    | Required, hashed      |

**tasks**
| Column      | Type    | Notes                          |
|-------------|---------|----------------------------------|
| id          | INTEGER | Primary key, autoincrement       |
| title       | TEXT    | Required                         |
| description | TEXT    | Optional                         |
| completed   | INTEGER | Defaults to `0` (false)          |
| user_id     | INTEGER | Foreign key → `users.id`         |
| due_date    | TEXT    | Optional                         |

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm

### Backend Setup
```bash
cd backend
npm install
```

Copy the example environment file and fill in your own values:
```bash
cp .env.example .env
```

Start the server:
```bash
node server.js
```
The API will run at `http://localhost:5000`.

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
The app will run at `http://localhost:3000`.

## API Endpoints

| Method | Endpoint             | Description                  | Auth required |
|--------|-----------------------|-------------------------------|----------------|
| POST   | `/api/auth/register`  | Create a new user account     | No             |
| POST   | `/api/auth/login`     | Log in and receive a JWT      | No             |
| GET    | `/api/tasks`          | Get all tasks for the logged-in user | Yes    |
| POST   | `/api/tasks`          | Create a new task             | Yes            |
| PUT    | `/api/tasks/:id`      | Update a task (title, completed, etc.) | Yes  |
| DELETE | `/api/tasks/:id`      | Delete a task                 | Yes            |

Authenticated requests must include:
```
Authorization: Bearer <token>
```

## Roadmap / Possible Improvements
- Password hashing verification (bcrypt) audit
- Task categories/tags
- Pagination for large task lists
- Deployment (e.g. Render/Railway for backend, Vercel/Netlify for frontend)

## Author

Harrison Daniel Abolaji (Okurinmeta)

## License

This project is open source and available under the [MIT License](LICENSE).
