# backend-v2

Clean **NestJS + Prisma + PostgreSQL** MVP backend.

## Stack
- NestJS 10
- Prisma ORM 5 + PostgreSQL
- JWT authentication (Passport) + RBAC-ready `Role` enum
- Swagger docs at `/api/docs`

## Setup
```bash
npm install            # also runs `prisma generate` (postinstall)
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm run build
npm run start:prod     # http://localhost:4000/api
```

To create the database schema:
```bash
npm run prisma:migrate
```

## Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/register` | — | Register (email/password) |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/users/me` | Bearer | Current user |
| POST | `/api/tasks` | Bearer | Create task |
| GET | `/api/tasks` | Bearer | List my tasks |
| GET | `/api/tasks/:id` | Bearer | Get one task |
| PATCH | `/api/tasks/:id` | Bearer | Update task |
| DELETE | `/api/tasks/:id` | Bearer | Delete task |

## Models
- `User` — id, email, passwordHash, fullName, role
- `Task` — id, ownerId, title, description, status (`TODO`/`IN_PROGRESS`/`DONE`)

> The Prisma connection is non-fatal at boot, so the server starts even when
> the database is not yet reachable.
