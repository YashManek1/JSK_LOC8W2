# Frontend Developer Quick Reference - API Integration

## Base Configuration

```javascript
// All API calls use Vite proxy - no need for full URLs
const API_BASE = ''; // Empty string, use relative paths

// For authenticated requests, add token to headers
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});
```

---

## 🔥 Most Used Routes (Copy-Paste Ready)

### 1. **GitHub Analytics** (Main Feature)

```javascript
// Sync GitHub Repository + AI Analysis
async function syncGitHubRepo(teamName, githubUrl) {
    try {
        const response = await fetch(`/github/sync/${teamName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ githubUrl })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Sync failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Sync failed:', error);
        throw error;
    }
}

// Get GitHub Stats (includes AI analysis)
async function getGitHubStats(teamName) {
    const response = await fetch(`/github/stats/${teamName}`);
    return await response.json();
}

// Usage Example:
const handleSync = async () => {
    setLoading(true);
    try {
        const data = await syncGitHubRepo('TeamName', 'https://github.com/owner/repo');
        console.log('Synced!', data);
        // data.contributors - array of contributors
        // data.implementedFeatures - AI detected features
        // data.branches - all repository branches
        // data.relevanceScore - 0-100 score
    } catch (error) {
        alert('Failed: ' + error.message);
    } finally {
        setLoading(false);
    }
};
```

**Response Structure:**
```typescript
{
    teamName: string;
    totalCommits: number;
    contributors: Array<{
        author: string;
        avatarUrl: string;
        commits: number;
        additions: number;
        deletions: number;
        featuresBuilt: string[];  // AI mapped features
    }>;
    branches: Array<{
        name: string;
        protected: boolean;
        commit: string;
    }>;
    implementedFeatures: string[];  // Features found in code
    missingPitchedFeatures: string[];  // Features pitched but not built
    relevanceScore: number;  // 0-100
    summary: {
        totalFeatures: number;
        missingFeatures: number;
        fileCount: number;
        codebaseSize: number;
    };
}
```

---

### 2. **Admin Dashboard APIs**

```javascript
// Get Current Config
async function getConfig() {
    const response = await fetch('/api/admin/config');
    return await response.json();
}

// Update Config
async function saveConfig(config) {
    const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    });
    return await response.json();
}

// Get Leaderboard
async function getLeaderboard() {
    const response = await fetch('/api/admin/leaderboard');
    return await response.json();
}

// Get All Entries (including eliminated)
async function getAllEntries() {
    const response = await fetch('/api/admin/entries');
    return await response.json();
}

// Start Evaluation (queue all pending)
async function startEvaluation() {
    const response = await fetch('/api/admin/start-evaluation', {
        method: 'POST'
    });
    return await response.json();
}

// Get Queue Status
async function getQueueStatus() {
    const response = await fetch('/api/admin/queue-status');
    return await response.json();
    // Returns: { waiting: 5, active: 2, completed: 18, failed: 1 }
}
```

---

### 3. **Mass Upload PPTX Files**

```javascript
// Upload multiple PPTX files
async function uploadPPTXFiles(files) {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('pptxFiles', file);
    });

    const response = await fetch('/api/admin/mass-upload', {
        method: 'POST',
        body: formData  // No Content-Type header needed for FormData
    });
    
    return await response.json();
    // Returns: { count: 10, etaSeconds: 120 }
}

// React Component Example:
function MassUpload() {
    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        const result = await uploadPPTXFiles(files);
        alert(`Uploaded ${result.count} files. ETA: ${result.etaSeconds}s`);
    };

    return (
        <input 
            type="file" 
            multiple 
            accept=".pptx"
            onChange={handleUpload}
        />
    );
}
```

---

### 4. **Entry Management**

```javascript
// Eliminate Entry
async function eliminateEntry(entryId) {
    const response = await fetch(`/api/admin/entries/${entryId}/eliminate`, {
        method: 'POST'
    });
    return await response.json();
}

// Restore Entry
async function restoreEntry(entryId) {
    const response = await fetch(`/api/admin/entries/${entryId}/restore`, {
        method: 'POST'
    });
    return await response.json();
}

// Requeue for Re-evaluation
async function requeueEntry(entryId) {
    const response = await fetch(`/api/admin/entries/${entryId}/requeue`, {
        method: 'POST'
    });
    return await response.json();
}

// Set Admin Note (private)
async function setAdminNote(entryId, note) {
    const response = await fetch(`/api/admin/entries/${entryId}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
    });
    return await response.json();
}

// Override Score Manually
async function overrideScore(entryId, score, note = '') {
    const response = await fetch(`/api/admin/entries/${entryId}/override`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, note })
    });
    return await response.json();
}

// Publish Final Leaderboard
async function publishLeaderboard() {
    const response = await fetch('/api/admin/publish', { method: 'POST' });
    return await response.json();
}

// Rescore All (after changing weights)
async function rescoreAll() {
    const response = await fetch('/api/admin/rescore', { method: 'POST' });
    return await response.json();
}
```

---

### 5. **Public Submission (Participants)**

```javascript
// Submit PPTX Entry
async function submitEntry(teamName, githubUrl, pptxFile) {
    const formData = new FormData();
    formData.append('teamName', teamName);
    formData.append('githubUrl', githubUrl || '');
    formData.append('pptx', pptxFile);

    const response = await fetch('/api/shortlist/submit', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Submission failed');
    }
    
    return await response.json();
}

// Get Entry Details (no admin notes)
async function getEntry(entryId) {
    const response = await fetch(`/api/shortlist/${entryId}`);
    return await response.json();
}

// React Example:
function SubmitForm() {
    const [teamName, setTeamName] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!teamName || !file) {
            alert('Team name and PPTX file are required');
            return;
        }

        try {
            const result = await submitEntry(teamName, githubUrl, file);
            alert('✅ Submission successful! Entry ID: ' + result.id);
        } catch (error) {
            alert('❌ ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                placeholder="Team Name" 
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
            />
            <input 
                placeholder="GitHub URL (optional)" 
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
            />
            <input 
                type="file" 
                accept=".pptx"
                onChange={(e) => setFile(e.target.files[0])}
            />
            <button type="submit">Submit</button>
        </form>
    );
}
```

---

### 6. **Authentication**

```javascript
// Signup
async function signup(email, password, fullName, phone) {
    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone })
    });
    
    const data = await response.json();
    if (data.access_token) {
        localStorage.setItem('token', data.access_token);
    }
    return data;
}

// Login
async function login(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.access_token) {
        localStorage.setItem('token', data.access_token);
    }
    return data;
}

// GitHub OAuth
function loginWithGitHub() {
    window.location.href = '/api/auth/github';
}

// Check if logged in
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

// Logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}
```

---

### 7. **Team Management** (Requires JWT)

```javascript
// Create Team
async function createTeam(hackathonId, teamName) {
    const response = await fetch('/api/registration/team', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hackathonId, teamName })
    });
    return await response.json();
}

// Join Team
async function joinTeam(inviteCode, hackathonId) {
    const response = await fetch('/api/registration/join', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ inviteCode, hackathonId })
    });
    return await response.json();
}

// Register Solo
async function registerSolo(hackathonId) {
    const response = await fetch('/api/registration/solo', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hackathonId })
    });
    return await response.json();
}

// Get Community
async function getCommunity(hackathonId) {
    const response = await fetch(`/api/registration/community/${hackathonId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return await response.json();
}
```

---

### 8. **Mock/Test APIs** (Development Only)

```javascript
// Mock GitHub Data
async function getMockGithubData(teamName) {
    const response = await fetch(`/test/mock-github-data/${teamName}`);
    return await response.json();
}

// Mock AI Features
async function getMockAiFeatures(teamName) {
    const response = await fetch(`/test/mock-ai-features/${teamName}`);
    return await response.json();
}

// Mock Spark/Kudos
async function awardSpark(userId) {
    const response = await fetch(`/test/mock-spark/${userId}`, {
        method: 'POST'
    });
    return await response.json();
}
```

---

## 🎨 Complete Page Example: HackerCockpit Component

```jsx
import React, { useState, useEffect } from 'react';

function HackerCockpit() {
    const [teamName, setTeamName] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [stats, setStats] = useState(null);
    const [syncing, setSyncing] = useState(false);

    // Fetch stats on load
    useEffect(() => {
        if (!teamName) return;
        
        const fetchStats = async () => {
            try {
                const response = await fetch(`/github/stats/${teamName}`);
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        fetchStats();
        // Poll every 15 seconds
        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, [teamName]);

    // Sync repository
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
                alert(`❌ ${error.message}`);
            }
        } catch (error) {
            alert('❌ Network error');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Hacker Cockpit</h1>

            {/* Sync Form */}
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <input
                    type="text"
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-gray-700 text-white p-3 rounded mr-2"
                />
                <input
                    type="text"
                    placeholder="https://github.com/owner/repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="bg-gray-700 text-white p-3 rounded mr-2"
                />
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="bg-blue-600 text-white px-6 py-3 rounded disabled:opacity-50"
                >
                    {syncing ? '⏳ Syncing...' : '🚀 Sync Repository'}
                </button>
            </div>

            {/* Stats Display */}
            {stats && (
                <div>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-800 p-4 rounded">
                            <p className="text-sm text-gray-400">Total Commits</p>
                            <p className="text-3xl font-bold text-green-400">
                                {stats.totalCommits}
                            </p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <p className="text-sm text-gray-400">Branches</p>
                            <p className="text-3xl font-bold text-blue-400">
                                {stats.branches?.length || 0}
                            </p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <p className="text-sm text-gray-400">Relevance Score</p>
                            <p className="text-3xl font-bold text-purple-400">
                                {stats.relevanceScore}%
                            </p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <p className="text-sm text-gray-400">Contributors</p>
                            <p className="text-3xl font-bold text-yellow-400">
                                {stats.contributors?.length || 0}
                            </p>
                        </div>
                    </div>

                    {/* AI Features */}
                    <div className="bg-gray-800 p-6 rounded-lg mb-8">
                        <h2 className="text-xl font-bold mb-4">AI Detected Features</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-green-400 font-semibold mb-2">
                                    ✅ Implemented
                                </h3>
                                <ul className="space-y-2">
                                    {stats.implementedFeatures?.map((feat, idx) => (
                                        <li key={idx} className="bg-green-900/20 p-2 rounded text-sm">
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-red-400 font-semibold mb-2">
                                    ❌ Missing
                                </h3>
                                <ul className="space-y-2">
                                    {stats.missingPitchedFeatures?.map((feat, idx) => (
                                        <li key={idx} className="bg-red-900/20 p-2 rounded text-sm">
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Contributors */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">Contributors</h2>
                        <div className="grid gap-4">
                            {stats.contributors?.map((contributor) => (
                                <div key={contributor.author} className="bg-gray-700 p-4 rounded flex items-start gap-4">
                                    <img 
                                        src={contributor.avatarUrl} 
                                        alt={contributor.author}
                                        className="w-16 h-16 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-lg">{contributor.author}</p>
                                        <p className="text-sm text-gray-400">
                                            {contributor.commits} commits • 
                                            <span className="text-green-400"> +{contributor.additions}</span> • 
                                            <span className="text-red-400"> -{contributor.deletions}</span>
                                        </p>
                                        {contributor.featuresBuilt?.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs text-blue-400 font-semibold mb-1">
                                                    AI Mapped Features:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {contributor.featuresBuilt.map((feat, idx) => (
                                                        <span key={idx} className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs">
                                                            {feat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HackerCockpit;
```

---

## 🚀 Testing Backend APIs

```bash
# Start Backend
cd backend
npm run start:dev

# Backend runs on: http://localhost:3000

# Test endpoints with curl:
curl http://localhost:3000/test/mock-github-data/TestTeam
curl http://localhost:3000/admin/config
curl -X POST http://localhost:3000/github/sync/TestTeam -H "Content-Type: application/json" -d '{"githubUrl":"https://github.com/facebook/react"}'
```

---

## ⚠️ Important Notes

1. **Always use relative paths** - Vite proxy handles the routing
2. **FormData for file uploads** - Don't set Content-Type header manually
3. **JWT tokens** - Store in localStorage, send in Authorization header
4. **Error handling** - Always check `response.ok` before parsing JSON
5. **AI features** - Requires `problemStatement` in config to work

---

## 📱 Quick Contact for Issues

If backend returns errors:
- **400**: Bad request (check request body/params)
- **401**: Not authenticated (missing/invalid token)
- **404**: Route not found (check URL spelling)
- **500**: Server error (check backend console logs)

---

**Updated**: February 22, 2026  
**Backend**: NestJS running on port 3000  
**Frontend**: Vite React on port 5173
