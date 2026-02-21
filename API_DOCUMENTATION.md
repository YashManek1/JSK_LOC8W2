# Backend API Documentation & Frontend Integration Guide

**Base URL**: `http://localhost:3000`  
**For Production**: Use Vite proxy (all routes work with `/api`, `/github`, `/test` prefix)

---

## 📍 **1. GitHub Analytics APIs**

### 1.1 Sync Repository Stats
**Endpoint**: `POST /github/sync/:teamName`  
**Description**: Triggers GitHub stats sync + AI codebase analysis  
**Auth**: None

**Frontend Code**:
```javascript
const syncRepo = async (teamName, githubUrl) => {
    const response = await fetch(`/github/sync/${teamName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl })
    });
    const data = await response.json();
    return data;
};

// Usage
const result = await syncRepo('ByteForces', 'https://github.com/owner/repo');
```

**Response**:
```json
{
  "id": "uuid",
  "teamName": "ByteForces",
  "githubUrl": "https://github.com/owner/repo",
  "totalCommits": 342,
  "contributors": [
    {
      "author": "alice-coder",
      "avatarUrl": "https://github.com/identicons/alice.png",
      "commits": 154,
      "additions": 12450,
      "deletions": 4320,
      "commitMessages": ["feat: add login", "fix: auth bug"],
      "featuresBuilt": ["JWT Authentication", "User Dashboard"]
    }
  ],
  "branches": [
    { "name": "main", "protected": true, "commit": "a1b2c3d" },
    { "name": "dev", "protected": false, "commit": "x9y8z7w" }
  ],
  "timeline": [[0, 9, 5], [0, 10, 12]],
  "languages": { "TypeScript": 85000, "Python": 12000 },
  "implementedFeatures": ["JWT Auth", "Real-time Chat", "Dashboard"],
  "missingPitchedFeatures": ["Payment Gateway", "Email Service"],
  "relevanceScore": 78,
  "summary": {
    "totalFeatures": 3,
    "missingFeatures": 2,
    "relevanceScore": 78,
    "fileCount": 142,
    "codebaseSize": 567000
  }
}
```

---

### 1.2 Get Repository Stats
**Endpoint**: `GET /github/stats/:teamName`  
**Description**: Retrieves GitHub stats (cached if available)  
**Auth**: None

**Frontend Code**:
```javascript
const getRepoStats = async (teamName) => {
    const response = await fetch(`/github/stats/${teamName}`);
    const data = await response.json();
    return data;
};

// Usage in React
useEffect(() => {
    const fetchStats = async () => {
        const data = await getRepoStats('ByteForces');
        setGithubData(data);
    };
    fetchStats();
}, []);
```

---

## 📍 **2. Admin APIs** (Shortlist Management)

### 2.1 Get Active Config
**Endpoint**: `GET /admin/config`  
**Description**: Get current round configuration

**Frontend Code**:
```javascript
const getConfig = async () => {
    const response = await fetch('/api/admin/config');
    return await response.json();
};
```

**Response**:
```json
{
  "id": "uuid",
  "targetShortlist": 10,
  "maxSlides": 15,
  "domains": ["AI/ML", "Web3"],
  "keywords": ["blockchain", "llm"],
  "problemStatement": "Build a decentralized AI assistant",
  "scoringWeights": {
    "problemRelevance": 25,
    "innovation": 25,
    "technicalDepth": 20,
    "marketImpact": 15,
    "slideQuality": 15
  },
  "isPublished": false
}
```

---

### 2.2 Save/Update Config
**Endpoint**: `POST /admin/config`  
**Description**: Update round configuration

**Frontend Code**:
```javascript
const saveConfig = async (configData) => {
    const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
    });
    return await response.json();
};

// Usage
await saveConfig({
    targetShortlist: 10,
    maxSlides: 15,
    domains: ['AI/ML', 'Web3'],
    keywords: ['blockchain', 'llm'],
    problemStatement: 'Build a decentralized AI assistant',
    scoringWeights: {
        problemRelevance: 25,
        innovation: 25,
        technicalDepth: 20,
        marketImpact: 15,
        slideQuality: 15
    }
});
```

---

### 2.3 Mass Upload PPT Files
**Endpoint**: `POST /admin/mass-upload`  
**Description**: Upload multiple PPTX files (multipart/form-data)

**Frontend Code**:
```javascript
const massUploadPPTX = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('pptxFiles', file);
    });

    const response = await fetch('/api/admin/mass-upload', {
        method: 'POST',
        body: formData
    });
    return await response.json();
};

// Usage with file input
const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const result = await massUploadPPTX(files);
    console.log(`Uploaded ${result.count} files, ETA: ${result.etaSeconds}s`);
};
```

---

### 2.4 Start Evaluation
**Endpoint**: `POST /admin/start-evaluation`  
**Description**: Queue all PENDING entries for AI evaluation

**Frontend Code**:
```javascript
const startEvaluation = async () => {
    const response = await fetch('/api/admin/start-evaluation', {
        method: 'POST'
    });
    return await response.json();
};
```

---

### 2.5 Get Leaderboard
**Endpoint**: `GET /admin/leaderboard`  
**Description**: Get ranked shortlist entries

**Frontend Code**:
```javascript
const getLeaderboard = async () => {
    const response = await fetch('/api/admin/leaderboard');
    return await response.json();
};
```

**Response**:
```json
[
  {
    "id": "uuid",
    "teamName": "Team Alpha",
    "rank": 1,
    "finalScore": 95.5,
    "status": "EVALUATED",
    "slideCount": 12,
    "createdAt": "2026-02-22T10:00:00Z"
  }
]
```

---

### 2.6 Get All Entries
**Endpoint**: `GET /admin/entries`  
**Description**: Get all submissions (including eliminated)

**Frontend Code**:
```javascript
const getAllEntries = async () => {
    const response = await fetch('/api/admin/entries');
    return await response.json();
};
```

---

### 2.7 Get Queue Status
**Endpoint**: `GET /admin/queue-status`  
**Description**: Get BullMQ queue statistics

**Frontend Code**:
```javascript
const getQueueStatus = async () => {
    const response = await fetch('/api/admin/queue-status');
    return await response.json();
};
```

**Response**:
```json
{
  "waiting": 5,
  "active": 2,
  "completed": 18,
  "failed": 1
}
```

---

### 2.8 Get Stats
**Endpoint**: `GET /admin/stats`  
**Description**: Get overall statistics

**Frontend Code**:
```javascript
const getStats = async () => {
    const response = await fetch('/api/admin/stats');
    return await response.json();
};
```

---

### 2.9 Eliminate Entry
**Endpoint**: `POST /admin/entries/:id/eliminate`  
**Description**: Mark entry as eliminated

**Frontend Code**:
```javascript
const eliminateEntry = async (entryId) => {
    const response = await fetch(`/api/admin/entries/${entryId}/eliminate`, {
        method: 'POST'
    });
    return await response.json();
};
```

---

### 2.10 Restore Entry
**Endpoint**: `POST /admin/entries/:id/restore`  
**Description**: Restore eliminated entry

**Frontend Code**:
```javascript
const restoreEntry = async (entryId) => {
    const response = await fetch(`/api/admin/entries/${entryId}/restore`, {
        method: 'POST'
    });
    return await response.json();
};
```

---

### 2.11 Requeue Entry
**Endpoint**: `POST /admin/entries/:id/requeue`  
**Description**: Re-evaluate a single entry

**Frontend Code**:
```javascript
const requeueEntry = async (entryId) => {
    const response = await fetch(`/api/admin/entries/${entryId}/requeue`, {
        method: 'POST'
    });
    return await response.json();
};
```

---

### 2.12 Set Admin Note
**Endpoint**: `PATCH /admin/entries/:id/note`  
**Description**: Add private admin note

**Frontend Code**:
```javascript
const setAdminNote = async (entryId, note) => {
    const response = await fetch(`/api/admin/entries/${entryId}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
    });
    return await response.json();
};
```

---

### 2.13 Override Score
**Endpoint**: `PATCH /admin/entries/:id/override`  
**Description**: Manually override AI score

**Frontend Code**:
```javascript
const overrideScore = async (entryId, score, note = '') => {
    const response = await fetch(`/api/admin/entries/${entryId}/override`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, note })
    });
    return await response.json();
};
```

---

### 2.14 Publish Leaderboard
**Endpoint**: `POST /admin/publish`  
**Description**: Finalize and publish rankings

**Frontend Code**:
```javascript
const publishLeaderboard = async () => {
    const response = await fetch('/api/admin/publish', {
        method: 'POST'
    });
    return await response.json();
};
```

---

### 2.15 Rescore All
**Endpoint**: `POST /admin/rescore`  
**Description**: Recalculate all scores based on updated weights

**Frontend Code**:
```javascript
const rescoreAll = async () => {
    const response = await fetch('/api/admin/rescore', {
        method: 'POST'
    });
    return await response.json();
};
```

---

## 📍 **3. Public Shortlist APIs**

### 3.1 Submit Entry
**Endpoint**: `POST /shortlist/submit`  
**Description**: Team submits PPTX file (multipart/form-data)

**Frontend Code**:
```javascript
const submitEntry = async (teamName, githubUrl, pptxFile) => {
    const formData = new FormData();
    formData.append('teamName', teamName);
    formData.append('githubUrl', githubUrl || '');
    formData.append('pptx', pptxFile);

    const response = await fetch('/api/shortlist/submit', {
        method: 'POST',
        body: formData
    });
    return await response.json();
};

// Usage with file input
const handleSubmit = async (e) => {
    e.preventDefault();
    const file = document.querySelector('input[type="file"]').files[0];
    const result = await submitEntry('Team Alpha', 'https://github.com/team/repo', file);
    console.log(result);
};
```

---

### 3.2 Get Entry
**Endpoint**: `GET /shortlist/:id`  
**Description**: Get submission details (participant-safe, no admin notes)

**Frontend Code**:
```javascript
const getEntry = async (entryId) => {
    const response = await fetch(`/api/shortlist/${entryId}`);
    return await response.json();
};
```

---

## 📍 **4. Authentication APIs**

### 4.1 Signup
**Endpoint**: `POST /auth/signup`  
**Description**: Register new user with optional file uploads

**Frontend Code**:
```javascript
const signup = async (userData, files = {}) => {
    const formData = new FormData();
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('fullName', userData.fullName);
    formData.append('phone', userData.phone || '');
    formData.append('college', userData.college || '');
    
    if (files.aadhaar) formData.append('aadhaar', files.aadhaar);
    if (files.idCard) formData.append('idCard', files.idCard);

    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData
    });
    return await response.json();
};

// Usage
const result = await signup({
    email: 'user@example.com',
    password: 'securepass123',
    fullName: 'John Doe',
    phone: '+918888888888'
}, {
    aadhaar: aadhaarFile,
    idCard: idCardFile
});
```

---

### 4.2 Login
**Endpoint**: `POST /auth/login`  
**Description**: Email/password login

**Frontend Code**:
```javascript
const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    
    // Store JWT token
    if (data.access_token) {
        localStorage.setItem('token', data.access_token);
    }
    return data;
};
```

---

### 4.3 GitHub OAuth
**Endpoints**: 
- `GET /auth/github` - Redirect to GitHub OAuth
- `GET /auth/github/callback` - OAuth callback

**Frontend Code**:
```javascript
// Redirect to GitHub OAuth
const loginWithGitHub = () => {
    window.location.href = '/api/auth/github';
};

// After callback, user is redirected to frontend with token in URL
// Parse and store token
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
if (token) {
    localStorage.setItem('token', token);
}
```

---

## 📍 **5. Profile APIs**

### 5.1 Get Profile
**Endpoint**: `GET /profile/:id`  
**Description**: Get user profile

**Frontend Code**:
```javascript
const getProfile = async (userId) => {
    const response = await fetch(`/api/profile/${userId}`);
    return await response.json();
};
```

---

### 5.2 Update Profile
**Endpoint**: `PUT /profile/:id`  
**Description**: Update user profile

**Frontend Code**:
```javascript
const updateProfile = async (userId, profileData) => {
    const response = await fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
    });
    return await response.json();
};

// Usage
await updateProfile('user-id', {
    fullName: 'Jane Doe',
    college: 'MIT',
    primarySkillset: ['React', 'Node.js'],
    githubUrl: 'https://github.com/janedoe'
});
```

---

### 5.3 Upload Resume
**Endpoint**: `POST /profile/:id/resume`  
**Description**: Upload and parse resume

**Frontend Code**:
```javascript
const uploadResume = async (userId, resumeFile) => {
    const formData = new FormData();
    formData.append('resume', resumeFile);

    const response = await fetch(`/api/profile/${userId}/resume`, {
        method: 'POST',
        body: formData
    });
    return await response.json();
};
```

---

## 📍 **6. Registration APIs** (Team Management)

### 6.1 Create Team
**Endpoint**: `POST /registration/team`  
**Description**: Create new team
**Auth**: Required (JWT)

**Frontend Code**:
```javascript
const createTeam = async (teamData, token) => {
    const response = await fetch('/api/registration/team', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teamData)
    });
    return await response.json();
};

// Usage
await createTeam({
    hackathonId: 'hackathon-uuid',
    teamName: 'Code Warriors'
}, localStorage.getItem('token'));
```

---

### 6.2 Join Team
**Endpoint**: `POST /registration/join`  
**Description**: Join existing team with invite code
**Auth**: Required (JWT)

**Frontend Code**:
```javascript
const joinTeam = async (inviteCode, hackathonId, token) => {
    const response = await fetch('/api/registration/join', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ inviteCode, hackathonId })
    });
    return await response.json();
};
```

---

### 6.3 Register Solo
**Endpoint**: `POST /registration/solo`  
**Description**: Register as solo participant
**Auth**: Required (JWT)

**Frontend Code**:
```javascript
const registerSolo = async (hackathonId, token) => {
    const response = await fetch('/api/registration/solo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hackathonId })
    });
    return await response.json();
};
```

---

### 6.4 Get Community
**Endpoint**: `GET /registration/community/:hackathonId`  
**Description**: Get all teams and solo participants
**Auth**: Required (JWT)

**Frontend Code**:
```javascript
const getCommunity = async (hackathonId, token) => {
    const response = await fetch(`/api/registration/community/${hackathonId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return await response.json();
};
```

---

## 📍 **7. Test/Mock APIs** (Development Only)

### 7.1 Mock GitHub Data
**Endpoint**: `GET /test/mock-github-data/:teamName`  
**Description**: Get fake GitHub stats for testing

**Frontend Code**:
```javascript
const getMockGithubData = async (teamName) => {
    const response = await fetch(`/test/mock-github-data/${teamName}`);
    return await response.json();
};
```

---

### 7.2 Mock AI Features
**Endpoint**: `GET /test/mock-ai-features/:teamName`  
**Description**: Get fake AI analysis for testing

**Frontend Code**:
```javascript
const getMockAiFeatures = async (teamName) => {
    const response = await fetch(`/test/mock-ai-features/${teamName}`);
    return await response.json();
};
```

---

### 7.3 Mock Award Spark
**Endpoint**: `POST /test/mock-spark/:userId`  
**Description**: Mock peer kudos system

**Frontend Code**:
```javascript
const awardSpark = async (userId) => {
    const response = await fetch(`/test/mock-spark/${userId}`, {
        method: 'POST'
    });
    return await response.json();
};
```

---

## 🔧 **Complete React Example Component**

```jsx
import React, { useState, useEffect } from 'react';

function GitHubAnalytics() {
    const [teamName, setTeamName] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [stats, setStats] = useState(null);
    const [syncing, setSyncing] = useState(false);

    // Fetch existing stats
    const fetchStats = async (team) => {
        try {
            const response = await fetch(`/github/stats/${team}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    // Sync new repository
    const handleSync = async () => {
        if (!teamName || !githubUrl) {
            alert('Please enter team name and GitHub URL');
            return;
        }

        setSyncing(true);
        try {
            const response = await fetch(`/github/sync/${teamName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ githubUrl })
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
                alert('✅ Repository synced successfully!');
            } else {
                const error = await response.json();
                alert(`❌ Sync failed: ${error.message}`);
            }
        } catch (error) {
            alert('❌ Network error');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">GitHub Analytics</h1>
            
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="border p-2 rounded mr-2"
                />
                <input
                    type="text"
                    placeholder="https://github.com/owner/repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="border p-2 rounded mr-2"
                />
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {syncing ? 'Syncing...' : 'Sync Repository'}
                </button>
            </div>

            {stats && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Repository Stats</h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-100 p-4 rounded">
                            <p className="text-sm text-gray-600">Total Commits</p>
                            <p className="text-2xl font-bold">{stats.totalCommits}</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded">
                            <p className="text-sm text-gray-600">Branches</p>
                            <p className="text-2xl font-bold">{stats.branches?.length || 0}</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded">
                            <p className="text-sm text-gray-600">Relevance Score</p>
                            <p className="text-2xl font-bold">{stats.relevanceScore}%</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded">
                            <p className="text-sm text-gray-600">Contributors</p>
                            <p className="text-2xl font-bold">{stats.contributors?.length || 0}</p>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold mb-2">Implemented Features</h3>
                    <ul className="list-disc list-inside mb-4">
                        {stats.implementedFeatures?.map((feature, idx) => (
                            <li key={idx} className="text-green-600">{feature}</li>
                        ))}
                    </ul>

                    <h3 className="text-lg font-bold mb-2">Contributors</h3>
                    <div className="grid gap-4">
                        {stats.contributors?.map((contributor) => (
                            <div key={contributor.author} className="border p-4 rounded">
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={contributor.avatarUrl} 
                                        alt={contributor.author}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div>
                                        <p className="font-bold">{contributor.author}</p>
                                        <p className="text-sm text-gray-600">
                                            {contributor.commits} commits • 
                                            +{contributor.additions} • 
                                            -{contributor.deletions}
                                        </p>
                                        {contributor.featuresBuilt?.length > 0 && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                Built: {contributor.featuresBuilt.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default GitHubAnalytics;
```

---

## 🚀 **Quick Start Commands**

### Start Backend:
```bash
cd backend
npm run start:dev
```

### Start Frontend:
```bash
cd frontend
npm run dev
```

### Backend URL: `http://localhost:3000`
### Frontend URL: `http://localhost:5173`

---

## 📝 **Notes**

1. **Vite Proxy**: All API calls from frontend should use relative paths (`/github/*`, `/api/*`, `/test/*`)
2. **Authentication**: JWT tokens should be sent in `Authorization: Bearer <token>` header
3. **File Uploads**: Use `FormData` for multipart uploads (PPTX, images, resumes)
4. **CORS**: Enabled for `http://localhost:5173`
5. **AI Analysis**: Requires `problemStatement` in RoundConfig for full AI features

---

## 🎯 **Priority Routes for Frontend Developer**

**Core Features**:
1. ✅ `POST /github/sync/:teamName` - Sync repository
2. ✅ `GET /github/stats/:teamName` - Get analytics
3. ✅ `POST /shortlist/submit` - Submit PPTX
4. ✅ `GET /admin/leaderboard` - Get rankings
5. ✅ `POST /admin/config` - Update config
6. ✅ `POST /auth/signup` - User registration
7. ✅ `POST /auth/login` - User login

**Secondary Features**:
8. `POST /registration/team` - Team creation
9. `GET /profile/:id` - User profile
10. `POST /admin/mass-upload` - Bulk upload

---

**Last Updated**: February 22, 2026  
**API Version**: v1.0  
**Backend Framework**: NestJS  
**Database**: PostgreSQL (Supabase)
