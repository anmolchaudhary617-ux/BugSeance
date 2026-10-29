# BugSéance 👻

**Summon the evidence. Find the bug.**

BugSéance is a local-first AI debugging investigator that analyzes error logs and produces a structured investigation report: a summary, likely root cause, evidence, suggested fixes, severity, confidence, and a spooky closing line.

It uses the open-weight Gemma 4 model through Ollama, allowing analysis to run locally instead of sending logs to a hosted AI API.

## Features

- Analyze Python, JavaScript, and other error logs
- Identify evidence directly present in the supplied log
- Separate confirmed evidence from possible explanations
- Suggest actionable troubleshooting steps
- Display severity and model-estimated confidence
- Upload `.txt` and `.log` files or paste log contents
- Run inference locally using Ollama
- Use a React + Vite frontend and FastAPI backend

## Architecture

- **Frontend:** React, Vite, CSS
- **Backend:** Python, FastAPI, Pydantic, HTTPX
- **AI runtime:** Ollama
- **Model:** `gemma4:e2b`

## Requirements

- Windows, macOS, or Linux
- Python 3.14 or a compatible Python version
- Node.js and npm
- Ollama
- Enough RAM and available disk space for the selected model

Model performance depends on your hardware. The first analysis can take longer while the model loads.

## Setup

### 1. Download the model

Install Ollama from https://ollama.com/ and run:

```bash
ollama pull gemma4:e2b
```

Ensure Ollama is running locally.

### 2. Set up the backend

From the project root, create and activate a virtual environment if you do not already have one:

```powershell
python -m venv backend\.venv
.\backend\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
```

Create `backend\.env` if needed:

```env
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma4:e2b
```

Start the API from the project root:

```powershell
.\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

API documentation: http://127.0.0.1:8000/docs

Health check: http://127.0.0.1:8000/api/health

### 3. Set up the frontend

Open another terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally http://localhost:5173/.

## Run tests

From the project root:

```powershell
$env:PYTHONPATH = "$PWD\backend"
& ".\backend\.venv\Scripts\python.exe" -m pytest ".\backend\tests" -q
```

The API tests mock the AI service for predictable, repeatable testing. A passing mocked test does not guarantee every live model response will be correct.

## Privacy and limitations

- Log analysis is sent to the locally running Ollama service configured for this application.
- Avoid pasting passwords, access tokens, API keys, or other secrets into logs.
- AI-generated root causes and fixes can be incorrect. Verify suggestions before applying them.
- Confidence is a model-generated estimate, not a statistically calibrated probability.
- Results depend on the completeness and quality of the supplied logs.
- Scanned screenshots and images are not automatically converted into logs.

## Why open innovation matters

Open-weight models and local inference give developers more control over where debugging data is processed. They make experimentation possible without requiring a hosted AI API for every investigation, and let developers inspect, adapt, and improve their workflows around locally available models.

BugSéance demonstrates how open AI tooling can make practical debugging assistance more accessible while keeping the user in control of their data and development environment.

## Project status

Hackathon MVP. Built for the MLH Global Hack Week DEV Challenge: Ghost in the Machine.

## License

MIT. See [LICENSE](LICENSE).
