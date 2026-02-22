export const API_BASE_URL = "https://jskloc8w2-production.up.railway.app";
export const PYTHON_API_BASE_URL = "https://jskloc8w2-production.up.railway.app";

// ========== Helper Functions ==========
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// ========== 1. GitHub Analytics APIs ==========
export const syncGitHubRepo = async (teamName, githubUrl) => {
    try {
        const response = await fetch(`${API_BASE_URL}/github/sync/${teamName}`, {
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
};

export const getGitHubStats = async (teamName) => {
    const response = await fetch(`${API_BASE_URL}/github/stats/${teamName}`);
    if (!response.ok) throw new Error('Failed to fetch GitHub stats');
    return await response.json();
};

// ========== 2. Admin APIs (Shortlist Management) ==========
export const getConfig = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/config`);
    return await response.json();
};

export const saveConfig = async (config) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    });
    return await response.json();
};

export const getLeaderboard = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/leaderboard`);
    return await response.json();
};

export const getAllEntries = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/entries`);
    return await response.json();
};

export const startEvaluation = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/start-evaluation`, {
        method: 'POST'
    });
    return await response.json();
};

export const getQueueStatus = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/queue-status`);
    return await response.json();
};

export const eliminateEntry = async (entryId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/entries/${entryId}/eliminate`, {
        method: 'POST'
    });
    return await response.json();
};

export const restoreEntry = async (entryId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/entries/${entryId}/restore`, {
        method: 'POST'
    });
    return await response.json();
};

export const requeueEntry = async (entryId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/entries/${entryId}/requeue`, {
        method: 'POST'
    });
    return await response.json();
};

export const setAdminNote = async (entryId, note) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/entries/${entryId}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
    });
    return await response.json();
};

export const overrideScore = async (entryId, score, note = '') => {
    const response = await fetch(`${API_BASE_URL}/api/admin/entries/${entryId}/override`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, note })
    });
    return await response.json();
};

export const publishLeaderboard = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/publish`, { method: 'POST' });
    return await response.json();
};

export const rescoreAll = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/rescore`, { method: 'POST' });
    return await response.json();
};

export const uploadPPTXFiles = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('pptxFiles', file);
    });

    const response = await fetch(`${API_BASE_URL}/api/admin/mass-upload`, {
        method: 'POST',
        body: formData
    });
    
    return await response.json();
};

// ========== 3. Public Shortlist APIs ==========
export const submitEntry = async (teamName, githubUrl, pptxFile) => {
    const formData = new FormData();
    formData.append('teamName', teamName);
    formData.append('githubUrl', githubUrl || '');
    formData.append('pptx', pptxFile);

    const response = await fetch(`${API_BASE_URL}/api/shortlist/submit`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Submission failed');
    }
    
    return await response.json();
};

export const getEntry = async (entryId) => {
    const response = await fetch(`${API_BASE_URL}/api/shortlist/${entryId}`);
    return await response.json();
};

// ========== 4. Authentication APIs ==========
export const signup = async (email, password, fullName, phone) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone })
    });
    
    const data = await response.json();
    if (data.access_token) {
        localStorage.setItem('token', data.access_token);
    }
    return data;
};

export const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.access_token) {
        localStorage.setItem('token', data.access_token);
    }
    return data;
};

export const loginWithGitHub = () => {
    window.location.href = `${API_BASE_URL}/api/auth/github`;
};

// ========== 5. Profile APIs ==========
export const getProfile = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
    return await response.json();
};

export const updateProfile = async (userId, profileData) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
    });
    return await response.json();
};

export const uploadResume = async (userId, resumeFile) => {
    const formData = new FormData();
    formData.append('resume', resumeFile);

    const response = await fetch(`${API_BASE_URL}/api/profile/${userId}/resume`, {
        method: 'POST',
        body: formData
    });
    return await response.json();
};

// ========== 6. Registration APIs (Team Management) ==========
export const createTeam = async (hackathonId, teamName) => {
    const response = await fetch(`${API_BASE_URL}/api/registration/team`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hackathonId, teamName })
    });
    return await response.json();
};

export const joinTeam = async (inviteCode, hackathonId) => {
    const response = await fetch(`${API_BASE_URL}/api/registration/join`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ inviteCode, hackathonId })
    });
    return await response.json();
};

export const registerSolo = async (hackathonId) => {
    const response = await fetch(`${API_BASE_URL}/api/registration/solo`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hackathonId })
    });
    return await response.json();
};

export const getCommunity = async (hackathonId) => {
    const response = await fetch(`${API_BASE_URL}/api/registration/community/${hackathonId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return await response.json();
};

// ========== 7. Test/Mock APIs ==========
export const getMockGithubData = async (teamName) => {
    const response = await fetch(`${API_BASE_URL}/test/mock-github-data/${teamName}`);
    return await response.json();
};

export const getMockAiFeatures = async (teamName) => {
    const response = await fetch(`${API_BASE_URL}/test/mock-ai-features/${teamName}`);
    return await response.json();
};

export const awardSpark = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/test/mock-spark/${userId}`, {
        method: 'POST'
    });
    return await response.json();
};
