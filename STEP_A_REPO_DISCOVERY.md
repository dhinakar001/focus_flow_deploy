# STEP A: Repository Discovery

## Top-Level Structure

```
focus_flow_deploy/
├── frontend/              # React + Vite frontend application
├── server/                # Node.js + Express backend API
├── python_service/        # FastAPI AI service
├── python-summarizer/    # Legacy summarizer service
├── tests/                # Backend test suite
├── bots/                 # Zoho Cliq bot definitions
├── widgets/              # Zoho Cliq widget HTML
├── functions/            # Deluge functions
├── docs/                 # Documentation
├── .github/              # GitHub Actions workflows
├── docker-compose.yml     # Docker orchestration
├── Dockerfile            # Backend Docker image
├── package.json          # Root package.json (backend)
├── env.example           # Environment variables template
└── [various .md files]   # Documentation files
```

## Detected Languages, Frameworks, and Tools

### Backend
- **Language**: JavaScript (Node.js)
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.19.0
- **Database**: PostgreSQL 14+ (via `pg` driver)
- **Package Manager**: npm (detected from `package-lock.json`)
- **Testing**: Jest 29.7.0 + Supertest
- **Linting**: ESLint 8.54.0
- **Formatting**: Prettier 3.1.0

### Frontend
- **Language**: JavaScript (JSX)
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.11
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React 0.309.0
- **Package Manager**: npm (detected from `package-lock.json`)
- **Testing**: Vitest 1.1.0 + React Testing Library
- **Linting**: ESLint 8.56.0

### Python Service
- **Language**: Python 3.11+
- **Framework**: FastAPI 0.110.0
- **Server**: Uvicorn 0.29.0
- **Package Manager**: pip (requirements.txt)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (frontend production)
- **Database**: PostgreSQL 14-alpine (Docker)

## Frontend vs Backend Separation

### Frontend (`frontend/`)
- React SPA with Vite
- Port: 5173 (dev), 80 (production via Nginx)
- Components: Dashboard, FocusTimer, Analytics, AI features
- Build output: `frontend/dist/`

### Backend (`server/`)
- Express REST API
- Port: 4000
- Routes: `/auth`, `/modes`, `/stats`, `/ai`, `/bot`, etc.
- Services: Database, Zoho Cliq API, AI service proxy
- Middleware: Auth, CSRF, rate limiting, validation

### Python AI Service (`python_service/`)
- FastAPI microservice
- Port: 8000
- Routes: `/api/ai/*`
- Purpose: AI-powered features (focus coach, distraction detection)

## Package Managers

- **Backend**: npm (confirmed by `package-lock.json` in root)
- **Frontend**: npm (confirmed by `package-lock.json` in `frontend/`)
- **Python**: pip (confirmed by `requirements.txt`)

## Test & Lint Scripts

### Backend (root `package.json`)
```json
{
  "test": "cross-env NODE_ENV=test jest",
  "test:watch": "cross-env NODE_ENV=test jest --watch",
  "test:coverage": "cross-env NODE_ENV=test jest --coverage",
  "test:ci": "cross-env NODE_ENV=test jest --ci --coverage --maxWorkers=2",
  "lint": "eslint . --ext .js,.jsx",
  "lint:fix": "eslint . --ext .js,.jsx --fix",
  "format": "prettier --write \"**/*.{js,jsx,json,md}\""
}
```

### Frontend (`frontend/package.json`)
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "test:run": "vitest run",
  "lint": "eslint . --ext js,jsx,ts,tsx"
}
```

## Exact Terminal Commands

### Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

**Python Service:**
```bash
cd python_service
pip install -r requirements.txt
cd ..
```

**All at once:**
```bash
npm install && cd frontend && npm install && cd ../python_service && pip install -r requirements.txt && cd ..
```

### Run Dev Servers

**Backend (Terminal 1):**
```bash
npm run dev
# Server runs on http://localhost:4000
```

**Python AI Service (Terminal 2):**
```bash
cd python_service
uvicorn src.api.main:app --reload --port 8000
# Service runs on http://localhost:8000
```

**Frontend (Terminal 3):**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

**Using Docker Compose (all services):**
```bash
docker-compose up
# Backend: http://localhost:4000
# Frontend: http://localhost:3000
# Python Service: http://localhost:8000
# Database: localhost:5432
```

### Run Build

**Backend:**
```bash
npm run build
# Note: Backend is Node.js runtime, no build step (just validates)
```

**Frontend:**
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

**Python Service:**
```bash
# No build step - Python is interpreted
```

**Docker Build:**
```bash
# Backend
docker build -t focusflow-backend .

# Frontend
cd frontend
docker build -t focusflow-frontend .

# All services
docker-compose build
```

### Run Tests / Lint

**Backend Tests:**
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:ci            # CI mode
```

**Backend Lint:**
```bash
npm run lint                # Check linting
npm run lint:fix            # Auto-fix issues
npm run format              # Format with Prettier
```

**Frontend Tests:**
```bash
cd frontend
npm test                    # Run tests (watch mode)
npm run test:run            # Run once
npm run test:coverage       # With coverage
npm run test:ui             # UI mode
```

**Frontend Lint:**
```bash
cd frontend
npm run lint                # Check linting
```

**All Tests:**
```bash
npm test && cd frontend && npm run test:run && cd ..
```

## Missing Items

### MISSING: ESLint Configuration
- No `.eslintrc.js` or `.eslintrc.json` found
- ESLint is installed but may use default config
- **Action**: Add ESLint config file

### MISSING: Prettier Configuration
- No `.prettierrc` or `.prettierrc.json` found
- Prettier is installed but may use default config
- **Action**: Add Prettier config file

### MISSING: Database Seed Script
- No `npm run db:seed` script found
- No seed data for demo mode
- **Action**: Add seed script for demo data

### MISSING: OpenAPI/Swagger Documentation
- API_DOCUMENTATION.md exists but no interactive Swagger UI
- No `/docs` endpoint serving OpenAPI spec
- **Action**: Add Swagger/OpenAPI integration

### MISSING: GitHub Actions Workflow
- `.github/workflows/` directory exists but no `ci.yml`
- **Action**: Add CI/CD workflow

### MISSING: Demo Mode Toggle
- No demo mode or seed data auto-population
- **Action**: Add demo mode feature
