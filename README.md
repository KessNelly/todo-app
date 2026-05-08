# ✦ Taskly — Todo Application

A full-stack Todo application built with Node.js, Express, EJS, and MongoDB. Users can sign up, log in, create tasks, and track their status (pending/completed/deleted).

---

## Features

- **Authentication** — Signup and login with username/password (bcrypt-hashed)
- **Session-based auth** — Persistent sessions via express-session + MongoDB store
- **Task management** — Create, complete, and soft-delete tasks
- **Filtering** — Sort tasks by pending or completed status
- **Server-side rendering** — EJS templates with express-ejs-layouts
- **Global error handling** — Centralized error handler with local validation
- **Structured logging** — Winston with timestamp-formatted logs
- **Tests** — Jest test suite (41 tests)

---

## ER Diagram

```
USER                    TASK
─────────────────       ──────────────────────────────
_id (PK)     ───┐       _id (PK)
username         └───── user (FK)
password                title
createdAt               description
updatedAt               status (pending|completed|deleted)
                        completedAt
                        createdAt
                        updatedAt

Relationship: One USER owns zero or many TASKs (1..*)
```

---

## Project Structure

```
todo-app/
├── src/
│   ├── app.js               # Express app setup
│   ├── server.js            # Entry point + DB connect
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── auth.js          # isAuthenticated, isGuest
│   │   └── errorHandler.js  # Global 404 + error handler
│   ├── models/
│   │   ├── User.js          # Mongoose User schema
│   │   └── Task.js          # Mongoose Task schema
│   ├── routes/
│   │   ├── auth.js
│   │   └── tasks.js
│   └── utils/
│       ├── db.js            # MongoDB connection
│       └── logger.js        # Winston logger
├── views/
│   ├── layouts/
│   │   ├── main.ejs         # Authenticated layout
│   │   └── auth.ejs         # Auth pages layout
│   ├── auth/
│   │   ├── login.ejs
│   │   └── signup.ejs
│   ├── tasks/
│   │   └── index.ejs
│   └── error.ejs
├── public/
│   ├── css/style.css
│   └── js/app.js
├── tests/
│   ├── setup.js
│   ├── auth.test.js
│   ├── task.model.test.js
│   ├── tasks.test.js
│   └── user.model.test.js
├── logs/                    # Auto-created at runtime
├── .env.example
├── render.yaml              # Render deployment config
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Installation

```bash
git clone <repo-url>
cd todo-app
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and session secret
```

### Running

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

---

## API Routes

| Method | Path                | Description                                             | Auth       |
| ------ | ------------------- | ------------------------------------------------------- | ---------- |
| GET    | `/`                 | Redirect to tasks or login                              | —          |
| GET    | `/auth/signup`      | Signup form                                             | Guest only |
| POST   | `/auth/signup`      | Register user                                           | Guest only |
| GET    | `/auth/login`       | Login form                                              | Guest only |
| POST   | `/auth/login`       | Authenticate user                                       | Guest only |
| POST   | `/auth/logout`      | Destroy session                                         | Required   |
| GET    | `/tasks`            | List tasks (supports `?filter=pending\|completed\|all`) | Required   |
| POST   | `/tasks`            | Create task                                             | Required   |
| POST   | `/tasks/:id/status` | Update task status                                      | Required   |
| POST   | `/tasks/:id/delete` | Soft-delete task                                        | Required   |
| GET    | `/health`           | Health check                                            | —          |

---

## Testing

```bash
npm test
```

Tests cover:

- Auth validation rules (username, password, confirm password)
- Auth middleware logic (session checks)
- Task status constants and transitions
- Task title validation
- User password hashing (bcrypt)
- Task filtering logic
- Authorization (ownership checks)

---

## Logging Format

```
[YYYY-MM-DD HH:mm:ss] LEVEL: Message | {meta: data}
```

Example:

```
[2024-01-15 10:23:45] INFO: User logged in | username=alice | id=65a...
[2024-01-15 10:24:01] INFO: Task created | user=alice | taskId=65b... | title="Buy groceries"
[2024-01-15 10:24:15] WARN: Failed login attempt | username=bob | reason=wrong_password
```

Logs are written to:

- Console (colorized, development)
- `logs/combined.log`
- `logs/error.log` (errors only)

---

## Security Notes

- Passwords are hashed with bcrypt (12 salt rounds)
- Sessions stored in MongoDB (not memory)
- HTTP-only session cookies
- Secure cookies in production
- Input validation via express-validator
- Each user can only access/modify their own tasks
