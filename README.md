# FocusFlow 🎯

**AI-powered productivity extension for Zoho Cliq that helps teams stay focused, block distractions, and optimize workflow through intelligent focus mode management.**

---

## 🎬 Demo

![FocusFlow Demo](docs/screenshots/demo.gif)

> **📹 Full Demo Video:** [Watch 60-second demo](docs/screenshots/demo-video.mp4) | [View Screenshots Gallery](docs/screenshots/)

---

## 📋 Problem Statement

Modern knowledge workers struggle with constant interruptions from messaging platforms, leading to:
- **Context switching costs** - Up to 23 minutes to refocus after each interruption
- **Reduced productivity** - 40% of work time lost to distractions
- **Burnout** - Constant notifications create stress and mental fatigue
- **Poor work-life balance** - Inability to create focused time blocks

FocusFlow solves this by integrating directly into Zoho Cliq to:
- **Automatically block messages** during focus sessions
- **Track productivity metrics** with AI-powered insights
- **Provide smart suggestions** for optimal focus timing
- **Generate meeting summaries** from collected notes
- **Enable team coordination** through focus status visibility

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Python** 3.11+ and pip
- **PostgreSQL** 14+ (or use Docker)
- **Zoho Cliq Developer Account** (for OAuth credentials)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhinakar001/focus_flow_deploy.git
   cd focus_flow_deploy
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Install Python service dependencies**
   ```bash
   cd python_service
   pip install -r requirements.txt
   cd ..
   ```

5. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration (see Environment Variables below)
   ```

6. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb focusflow
   
   # Run migrations
   psql -U postgres -d focusflow -f server/db/migrations/001_create_tables.sql
   psql -U postgres -d focusflow -f server/db/migrations/002_ai_features_tables.sql
   psql -U postgres -d focusflow -f server/db/migrations/003_production_schema.sql
   psql -U postgres -d focusflow -f server/db/migrations/004_saas_schema.sql
   ```

### Running the Application

**Terminal 1: Backend Server**
```bash
npm run dev
# Server runs on http://localhost:4000
```

**Terminal 2: Python AI Service**
```bash
cd python_service
uvicorn src.api.main:app --reload --port 8000
# AI service runs on http://localhost:8000
```

**Terminal 3: Frontend**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

**Verify Installation:**
```bash
# Check backend health
curl http://localhost:4000/health

# Check Python service health
curl http://localhost:8000/health
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory based on `env.example`:

### Required for Production

```bash
# Server Configuration
NODE_ENV=production
PORT=4000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/focusflow
DB_POOL_SIZE=10
DB_SSL=false

# Security (REQUIRED - Generate strong secrets!)
JWT_SECRET=your-32-character-random-secret-here
TOKEN_ENCRYPTION_KEY=base64-encoded-32-byte-key-here
BCRYPT_ROUNDS=12

# Zoho Cliq OAuth (Required for integration)
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REDIRECT_URI=https://your-domain.com/auth/callback
ZOHO_SCOPES=ZohoCliq.bots.CREATE,ZohoCliq.bots.READ,ZohoCliq.bots.UPDATE
ZOHO_ACCOUNTS_BASE_URL=https://accounts.zoho.com

# Python AI Service
PYTHON_SERVICE_URL=http://localhost:8000
```

### Optional Configuration

```bash
# Logging
LOG_LEVEL=info
LOG_FORMAT=text

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Payments (if using subscription features)
DEFAULT_PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# OAuth State Security
OAUTH_STATE_SECRET=random-state-secret
OAUTH_STATE_TTL_MS=600000

# Request Configuration
BODY_LIMIT=10mb
REQUEST_TIMEOUT=30000
```

### Generating Secrets

```bash
# Generate JWT Secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Encryption Key (base64 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Zoho Cliq Platform                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Bot Commands│  │   Widgets    │  │  Webhooks    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼─────────────────┘
          │                 │                 │
          │  OAuth 2.0      │  HTTP/HTTPS     │  Webhook Events
          │                 │                 │
┌─────────▼─────────────────▼─────────────────▼─────────────────┐
│                    FocusFlow Backend (Node.js)                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Express Server (Port 4000)                              │ │
│  │  ├── Auth Routes (JWT, OAuth)                            │ │
│  │  ├── Bot Routes (Command handling)                       │ │
│  │  ├── Mode Routes (Focus session management)              │ │
│  │  ├── AI Routes (AI service proxy)                        │ │
│  │  └── Analytics Routes (Stats & insights)                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Middleware Layer                                         │ │
│  │  ├── CSRF Protection                                      │ │
│  │  ├── Rate Limiting                                        │ │
│  │  ├── Input Validation                                     │ │
│  │  ├── Authentication                                       │ │
│  │  └── Error Handling                                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Service Layer                                             │ │
│  │  ├── modeService (Focus mode logic)                       │ │
│  │  ├── cliqApi (Zoho API integration)                       │ │
│  │  ├── aiService (AI features)                               │ │
│  │  ├── analyticsService (Metrics)                            │ │
│  │  └── dbService (Database operations)                       │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────┬──────────────────────────────────────────────────────┘
          │
          │  HTTP/REST
          │
┌─────────▼──────────────────────────────────────────────────────┐
│              PostgreSQL Database                                 │
│  ├── Users & Authentication                                     │
│  ├── Focus Sessions & Modes                                      │
│  ├── OAuth Credentials (encrypted)                              │
│  ├── Analytics & Stats                                          │
│  └── Meeting Notes & Summaries                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              Python AI Service (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Port 8000                                                │   │
│  │  ├── /api/ai/focus-coach (Smart suggestions)             │   │
│  │  ├── /api/ai/distraction-detector (Message analysis)      │   │
│  │  ├── /api/ai/time-predictor (Session duration)            │   │
│  │  └── /api/summaries (Meeting summaries)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              React Frontend (Vite)                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Port 5173                                                 │   │
│  │  ├── Dashboard (Analytics & Stats)                         │   │
│  │  ├── Focus Timer (Session management)                      │   │
│  │  ├── AI Features (Focus Coach, Suggestions)                │   │
│  │  └── Settings (User preferences)                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Architecture Diagram:** See [docs/ARCHITECTURE_DIAGRAM.md](docs/ARCHITECTURE_DIAGRAM.md) for detailed architecture documentation.

---

## 🎥 Demo Recording

### Recording a 60-Second Demo Video

**Using FFmpeg (Recommended):**

```bash
# Install FFmpeg (if not installed)
# macOS: brew install ffmpeg
# Ubuntu: sudo apt-get install ffmpeg
# Windows: Download from https://ffmpeg.org/download.html

# Record screen (60 seconds, 30 FPS, high quality)
ffmpeg -f avfoundation -i "1:0" -r 30 -t 60 -vf "scale=1920:1080" \
  -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k \
  docs/screenshots/demo-video.mp4

# Alternative: Record specific window (macOS)
ffmpeg -f avfoundation -i "1" -r 30 -t 60 \
  -vf "crop=1920:1080:0:0" -c:v libx264 -preset slow -crf 18 \
  docs/screenshots/demo-video.mp4

# Create GIF from video (for README)
ffmpeg -i docs/screenshots/demo-video.mp4 -vf "fps=10,scale=800:-1:flags=lanczos" \
  -t 15 docs/screenshots/demo.gif
```

**Using OBS Studio (Alternative):**
1. Open OBS Studio
2. Add "Display Capture" or "Window Capture" source
3. Set output to "Custom Output (FFmpeg)"
4. Configure: MP4, 1920x1080, 30 FPS
5. Record for 60 seconds
6. Save to `docs/screenshots/demo-video.mp4`

### 60-Second Demo Script

Follow this script to create a compelling demo:

**0-10 seconds: Problem & Solution**
- Show cluttered Zoho Cliq with multiple notifications
- "Knowledge workers lose 40% of their time to distractions"
- "FocusFlow integrates directly into Zoho Cliq to solve this"

**10-25 seconds: Core Features**
- Open FocusFlow widget in Cliq
- Start a 50-minute focus session
- Show timer counting down
- "FocusFlow automatically blocks messages during focus time"

**25-40 seconds: AI Features**
- Show Focus Coach suggesting optimal focus times
- Display distraction detection in action
- "AI analyzes your patterns to suggest the best focus windows"

**40-55 seconds: Analytics & Insights**
- Open analytics dashboard
- Show productivity metrics, streaks, and trends
- "Track your progress with detailed analytics and insights"

**55-60 seconds: Call to Action**
- Show meeting summary feature
- "FocusFlow: Stay focused, stay productive"
- End with logo/branding

**Full Script:**
```
[0:00-0:10] 
"Modern knowledge workers face constant interruptions. 
FocusFlow integrates directly into Zoho Cliq to help teams 
stay focused and productive."

[0:10-0:25]
"Start a focus session with one click. FocusFlow automatically 
blocks distracting messages while you work. The timer shows 
your progress in real-time."

[0:25-0:40]
"Our AI-powered Focus Coach analyzes your work patterns and 
suggests optimal focus times. Distraction detection helps 
identify when you're most likely to be interrupted."

[0:40-0:55]
"Track your productivity with detailed analytics. See your 
focus streaks, daily stats, and trends over time. Meeting 
summaries help you stay on top of important discussions."

[0:55-1:00]
"FocusFlow: AI-powered productivity for Zoho Cliq teams. 
Try it today."
```

---

## 📸 Screenshots

Screenshots are located in [`docs/screenshots/`](docs/screenshots/). Expected files:

- **`01-dashboard-overview.png`** - Main dashboard with analytics
- **`02-focus-timer-active.png`** - Active focus session with timer
- **`03-cliq-widget.png`** - FocusFlow widget embedded in Zoho Cliq
- **`04-ai-suggestions.png`** - AI-powered focus coach suggestions
- **`05-analytics-detail.png`** - Detailed productivity analytics
- **`06-meeting-summary.png`** - AI-generated meeting summaries
- **`07-bot-commands.png`** - Bot command interactions in Cliq
- **`08-settings.png`** - User settings and preferences
- **`demo.gif`** - Animated demo (15 seconds, optimized for README)
- **`demo-video.mp4`** - Full 60-second demo video

> **📝 Note:** Generate screenshots at 1920x1080 resolution. Use consistent branding and UI theme.

---

## 🏆 Judging Highlights

### 🔒 Security Excellence

- **JWT Authentication** with refresh tokens and secure session management
- **CSRF Protection** on all state-changing requests
- **Input Validation** and sanitization using express-validator
- **Token Encryption** - OAuth tokens encrypted at rest using AES-256-GCM
- **Rate Limiting** - API rate limiting to prevent abuse
- **SQL Injection Prevention** - Parameterized queries throughout
- **XSS Prevention** - Content Security Policy and input sanitization
- **Helmet.js** - Security headers configured
- **Password Hashing** - bcrypt with 12 rounds
- **Environment-based Secrets** - No hardcoded credentials

### 📈 Scalability & Performance

- **Connection Pooling** - Optimized PostgreSQL connection pool
- **Efficient Queries** - Indexed database queries for fast lookups
- **Code Splitting** - Frontend bundle optimization with Vite
- **Caching Ready** - Architecture supports Redis integration
- **Background Jobs** - Cron-based schedulers for async processing
- **Service Separation** - Microservices architecture (Node.js + Python)
- **Error Handling** - Comprehensive error handling and recovery
- **Health Checks** - Monitoring endpoints for all services

### 🔌 Zoho Cliq Integration

- **Native Bot Integration** - Deluge-based bot handler for commands
- **OAuth 2.0 Flow** - Secure authentication with Zoho accounts
- **Widget Embedding** - Custom HTML widgets in Cliq channels
- **Webhook Handling** - Real-time event processing from Cliq
- **Message Blocking** - Intelligent message filtering during focus
- **API Integration** - Full Zoho Cliq API v2 integration
- **Token Management** - Automatic OAuth token refresh
- **Multi-tenant Support** - Supports multiple Cliq organizations

### 🤖 AI-Powered Features

- **Focus Coach** - ML-based suggestions for optimal focus times
- **Distraction Detector** - Analyzes message patterns to predict interruptions
- **Time Predictor** - Predicts ideal session duration based on history
- **Smart Suggestions** - Context-aware productivity recommendations
- **Meeting Summaries** - AI-generated summaries from meeting notes

### 🎨 User Experience

- **Modern UI** - React + Tailwind CSS with responsive design
- **Real-time Updates** - Live timer and status updates
- **Intuitive Navigation** - Clear information architecture
- **Accessibility** - ARIA labels and keyboard navigation support
- **Error Boundaries** - Graceful error handling in React
- **Loading States** - Skeleton loaders and progress indicators

### 📊 Analytics & Insights

- **Productivity Metrics** - Focus time, sessions, distractions blocked
- **Trend Analysis** - Daily, weekly, monthly trends
- **Streak Tracking** - Gamification with streaks and scores
- **Meeting Analytics** - Summary statistics and note counts
- **Export Capabilities** - Data export for external analysis

---

## 📚 Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Testing Guide](docs/TESTING.md)** - Testing strategies and examples
- **[Architecture Diagram](docs/ARCHITECTURE_DIAGRAM.md)** - Detailed system architecture
- **[Integration Guide](docs/INTEGRATION.md)** - Zoho Cliq setup instructions

---

## 🛠️ Development

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Run database migrations
npm run migrate
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Harshith D** - hdharshith7@gmail.com
- **Dhinakar** - dhinakar79044@gmail.com

---

## 🙏 Acknowledgments

- Zoho Cliq for the integration platform
- React, Express, and FastAPI communities
- All contributors and users

---

**Built for Zoho Cliqtrix 2024** 🏆
