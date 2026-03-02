# Speak Sense AI

Speak Sense AI is a full-stack mock interview platform with AI-style interviewer chat, live speech/posture feedback, and detailed interview analytics.

## What this project does

- Simulates role-based interviews (technical/behavioral/system-design/mixed)
- Captures user responses (text + voice input)
- Analyzes response quality (relevance, grammar, structure, speech metrics)
- Generates a result report with score breakdown and recommendations
- Persists completed sessions into MongoDB and exposes history via API

## Tech stack

- Frontend: React (client)
- Backend API: Express + Mongoose + JWT (server)
- AI metrics microservice: FastAPI (ai-service)
- Database: MongoDB
- Testing: Jest + React Testing Library + Supertest

## Project structure

```text
speak-sense-ai/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/             # Main app screens (Interview, Results, History, etc.)
│   │   ├── services/          # API client wrapper
│   │   ├── utils/             # Shared utility logic
│   │   └── __tests__/         # Frontend tests
├── server/                    # Express API + Mongo models/routes
│   ├── models/                # Mongoose models (User, InterviewSession)
│   ├── routes/                # auth and interview endpoints
│   └── __tests__/             # Backend route tests
├── ai-service/                # FastAPI service for supplemental analysis
├── docker-compose.yml         # Multi-service local setup
└── README.md
```

## Core algorithms used

### 1) Response relevance scoring

Implemented in `server/routes/interviewRoutes.js`:

- Tokenize question and answer
- Remove stop words
- Compute keyword overlap ratio
- Add answer-length bonus
- Produce relevance score and verdict

### 2) Grammar and communication checks

Implemented in `server/routes/interviewRoutes.js`:

- Rule-based regex pattern matching for common interview language issues
- Filler-word detection (`um`, `uh`, etc.)
- Sentence/word statistics and actionable improvement tips

### 3) Verification scoring (answer quality)

Composite score in `server/routes/interviewRoutes.js` combines:

- Grammar score (error-penalized)
- Relevance score (question alignment)
- Structure bonus (multi-sentence answer quality)

Classification labels:

- `correct`
- `partially-correct`
- `needs-improvement`

### 4) Interview report aggregation

Implemented in `client/src/pages/Interview.jsx`:

- Aggregates per-question analyses
- Builds category scores and confidence timeline
- Computes speaking metrics (WPM, pauses, filler count)
- Generates positive feedback + improvement list

### 5) Live posture heuristic (frontend)

Implemented in `client/src/pages/Interview.jsx`:

- Frame sampling from webcam feed
- Brightness/detail/centering/balance analysis
- Rolling-sample smoothing for stability
- Converts penalties to a `0–100` posture score and guidance

## Datasets required

### Required for running

No external CSV/JSON dataset download is required to run the app.

The app works with:

- Built-in question banks (role/type/difficulty) in `client/src/pages/Interview.jsx`
- Datasets folder archives used by backend loader (`datasets/*.zip`)
- Server-side structured fallback interview bank in `server/data/interviewQuestionBank.json`
- MongoDB collections created by Mongoose models:
	- `users`
	- `interviewsessions`

### Advanced dataset engine (new)

Interview question generation is now dataset-driven on the backend:

- Dataset sources currently used:
	- `datasets/archive.zip` (`prepared_dataset 1.json`)
	- `datasets/tedtalks.zip` (`ted_main.csv` sampled)
	- `datasets/sttack.zip` (`Questions.csv` sampled)
- Loader: `server/utils/datasetQuestionLoader.js`
- Structured fallback bank: `server/data/interviewQuestionBank.json`
- Selection dimensions:
	- role track (`frontend`, `backend`, `data`, `general`)
	- interview mode (`technical`, `behavioral`, `communication`, `systemDesign`, `balanced`)
	- difficulty (`beginner`, `intermediate`, `advanced`)
- Session continuity:
	- `POST /api/interview/start` returns `sessionId`
	- client sends `sessionId` to `POST /api/interview/chat` for consistent queue progression
- Fallback safety:
	- gracefully falls back to default question sets if dataset path has gaps

### Dataset status endpoint

Use the following endpoint to confirm dataset loader activity and extracted counts:

- `GET /api/interview/dataset-status`

Response includes:

- `active` (boolean)
- `totalQuestions`
- `sources` (per-archive extraction status)
- `counts` (track/category/difficulty counts)

### Optional/custom datasets

You can plug your own question dataset by replacing/extending the in-file question map in `client/src/pages/Interview.jsx`.

Recommended record shape:

```json
{
	"role": "Frontend Developer",
	"type": "technical",
	"difficulty": "intermediate",
	"questions": [
		"Explain React reconciliation.",
		"How do you optimize rendering performance?"
	]
}
```

## Database persistence

Interview completion is persisted to MongoDB.

- Model: `server/models/InterviewSession.js`
- Save endpoint: `POST /api/interview/session`
- History endpoint: `GET /api/interview/history`

## Results flow DB status indicator

After interview completion, Results shows save status:

- `✅ Saved to database` (DB write succeeded)
- `⚠️ Could not save to database` (local report fallback still shown)

Implemented in:

- `client/src/pages/Results.jsx`
- `client/src/pages/results.css`

## Environment setup

This project reads API/secret configuration from:

- `server/.env`
- `ai-service/.env`

Template files:

- `server/.env.example`
- `ai-service/.env.example`

### Server required env

- `MONGO_URI`
- `JWT_SECRET`
- `PORT` (optional, default 5000)

### Optional shared env

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`

### Frontend optional flags

- `REACT_APP_EXPERIMENTAL_PROMPTS=true`
- Local override via `localStorage`: `ff.experimentalPrompts` (`true` / `false`)

## Run locally

From repository root:

```bash
npm install
npm start
```

This starts both client and server concurrently.

## Run with Docker Compose

```bash
docker-compose up --build
```

## Test commands

Backend:

```bash
cd server && npm test
```

Frontend:

```bash
cd client && npm test -- --watchAll=false
```

## Notes

- MongoDB is the active persistence layer.
- Postgres environment keys are present for future integration but currently unused by routes.
