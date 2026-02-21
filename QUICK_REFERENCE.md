# 🚀 LOC_PREP - Quick Reference Card

## Port Configuration
| Service | Port | URL |
|---------|------|-----|
| NestJS Backend | 3000 | http://localhost:3000 |
| Vite Frontend | 5173 | http://localhost:5173 |
| PostgreSQL | 5432 | (Supabase Cloud) |
| Redis | 18651 | (RedisLabs Cloud) |

## Start Services
```powershell
# Quick start (opens 2 terminals automatically)
./start-servers.ps1

# Manual start
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

## GitHub Analytics Endpoints

### 🔄 Sync Repository
```http
POST http://localhost:3000/github/sync/{teamName}
Content-Type: application/json

{
  "teamName": "Team Innovix",
  "githubUrl": "https://github.com/username/repo"
}
```

### 📊 Get Stats
```http
GET http://localhost:3000/github/stats/{teamName}
```

**Response:**
```json
{
  "githubData": {
    "totalCommits": 342,
    "contributors": [
      {
        "author": "alice-coder",
        "commits": 154,
        "additions": 12450,
        "deletions": 4320,
        "featuresBuilt": ["JWT Auth", "Dashboard UI"]
      }
    ],
    "languages": { "TypeScript": 85000, "Python": 12000 }
  },
  "aiData": {
    "implementedFeatures": ["Authentication", "Real-time Chat"],
    "missingPitchedFeatures": ["Email notifications", "Payment Gateway"],
    "relevanceScore": 78
  }
}
```

## Frontend Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Landing page |
| `/cockpit` | HackerCockpit | Team telemetry dashboard |
| `/evaluator/:teamName` | EvaluatorPortal | Judge evaluation view |
| `/admin` | AdminDashboard | Admin control panel |
| `/shortlist/submit` | ShortlistSubmit | PPT submission |
| `/shortlist/:id` | ShortlistResult | Evaluation results |

## Vite Proxy Routes
Frontend requests are automatically proxied:

```javascript
/github/*       → http://localhost:3000/github/*
/test/*         → http://localhost:3000/test/*
/api/shortlist/* → http://localhost:3000/shortlist/*
/api/admin/*    → http://localhost:3000/admin/*
```

## Testing Workflow

### 1. Test Mock Data (No GitHub required)
```bash
curl http://localhost:3000/test/mock-github-data/TestTeam
curl http://localhost:3000/test/mock-ai-features/TestTeam
```

### 2. Test Real GitHub Analytics
```bash
# Sync a public repo
curl -X POST http://localhost:3000/github/sync/ReactTeam \
  -H "Content-Type: application/json" \
  -d '{"githubUrl":"https://github.com/facebook/react"}'

# Get stats
curl http://localhost:3000/github/stats/ReactTeam
```

### 3. Test Frontend Integration
1. Open: http://localhost:5173/cockpit
2. Enter Team Name: "ReactTeam"
3. Enter GitHub URL: https://github.com/facebook/react
4. Click "Initiate AI Codebase Scan"
5. Wait ~60 seconds for AI analysis
6. View results in real-time

## Troubleshooting

### Port 3000 Already in Use
```powershell
Get-NetTCPConnection -LocalPort 3000 | Select -Expand OwningProcess | Stop-Process -Force
```

### Check if Backend is Running
```powershell
curl http://localhost:3000/
# Should return: Hello World!
```

### Check Logs
```bash
# Backend logs
cd backend
npm run start:dev  # Watch for errors

# Frontend logs
cd frontend
npm run dev  # Watch for proxy errors
```

### Common Issues

**Issue**: `ERR_CONNECTION_REFUSED`
- ✅ Backend not running. Start backend first.

**Issue**: `500 Internal Server Error` on `/github/sync`
- ✅ Check `.env` has `GITHUB_PAT` and `GROQ_API_KEY_SECONDARY`
- ✅ Verify repository is public or token has access
- ✅ Check backend logs for detailed error

**Issue**: Frontend shows `localhost:3000` instead of `/github`
- ✅ Ensure vite.config.js has proxy configured
- ✅ Restart frontend dev server

## Environment Variables Checklist

```env
# ✅ Backend (.env)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
GITHUB_PAT=ghp_...
GROQ_API_KEY=gsk_...
GROQ_API_KEY_SECONDARY=gsk_...
PORT=3000
```

## Postman Collection
Import: `LOC_PREP_Updated.postman_collection.json`

**Collections:**
- 🚀 GitHub Analytics (3 requests)
- 🧪 Test & Mock Data (3 requests)
- 📊 Shortlist Public (3 requests)
- 🔐 Admin Management (14 requests)

## Performance Notes

| Operation | Expected Time |
|-----------|---------------|
| Mock data endpoints | <100ms |
| GitHub stats (cached) | <500ms |
| GitHub sync (first time) | 30-90s |
| AI codebase evaluation | 45-120s |
| Shortlist PPT evaluation | 60-90s |

## Success Checklist
- [ ] Backend starts on port 3000
- [ ] Frontend starts on port 5173
- [ ] `/cockpit` page loads
- [ ] Mock endpoints return data
- [ ] GitHub sync returns 200
- [ ] AI analysis completes
- [ ] Contributors appear in UI
- [ ] Evaluator portal loads team data

## Quick Health Check
```bash
# One-liner to check all services
curl http://localhost:3000 && curl http://localhost:3000/test/mock-github-data/Test && echo "✅ All systems operational"
```

---
**Created**: February 22, 2026  
**Version**: 2.0.0  
**Status**: ✅ Fully Operational
