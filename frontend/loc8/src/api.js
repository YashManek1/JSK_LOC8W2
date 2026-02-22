export const API_BASE_URL = "https://jskloc8w2-production.up.railway.app/api";
export const PYTHON_API_BASE_URL = "https://jskloc8w2-production.up.railway.app/api";

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
    const response = await fetch(`${API_BASE_URL}/admin/config`);
    return await response.json();
};

export const saveConfig = async (config) => {
    const response = await fetch(`${API_BASE_URL}/admin/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    });
    return await response.json();
};

export const getLeaderboard = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/leaderboard`);
    return await response.json();
};

export const getAllEntries = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/entries`);
    return await response.json();
};

export const startEvaluation = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/start-evaluation`, {
        method: 'POST'
    });
    return await response.json();
};

export const getQueueStatus = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/queue-status`);
    return await response.json();
};

export const eliminateEntry = async (entryId) => {
    const response = await fetch(`${API_BASE_URL}/admin/entries/${entryId}/eliminate`, {
        method: 'POST'
    });
    return await response.json();
};

export const restoreEntry = async (entryId) => {
    const response = await fetch(`${API_BASE_URL}/admin/entries/${entryId}/restore`, {
        method: 'POST'
    });
    return await response.json();
};

export const requeueEntry = async (entryId) => {
    const response = await fetch(`${API_BASE_URL}/admin/entries/${entryId}/requeue`, {
        method: 'POST'
    });
    return await response.json();
};

export const setAdminNote = async (entryId, note) => {
    const response = await fetch(`${API_BASE_URL}/admin/entries/${entryId}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
    });
    return await response.json();
};

export const overrideScore = async (entryId, score, note = '') => {
    const response = await fetch(`${API_BASE_URL}/admin/entries/${entryId}/override`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, note })
    });
    return await response.json();
};

export const publishLeaderboard = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/publish`, { method: 'POST' });
    return await response.json();
};

export const rescoreAll = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/rescore`, { method: 'POST' });
    return await response.json();
};

export const uploadPPTXFiles = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('pptxFiles', file);
    });

    const response = await fetch(`${API_BASE_URL}/admin/mass-upload`, {
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

    const response = await fetch(`${API_BASE_URL}/shortlist/submit`, {
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
    const response = await fetch(`${API_BASE_URL}/shortlist/${entryId}`);
    return await response.json();
};

// ========== 4. Authentication APIs ==========
export const signup = async (email, password, fullName, phone) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
    window.location.href = `${API_BASE_URL}/auth/github`;
};

// ========== 5. Profile APIs ==========
export const getProfile = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
    return await response.json();
};

export const updateProfile = async (userId, profileData) => {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
    });
    return await response.json();
};

export const uploadResume = async (userId, resumeFile) => {
    const formData = new FormData();
    formData.append('resume', resumeFile);

    const response = await fetch(`${API_BASE_URL}/profile/${userId}/resume`, {
        method: 'POST',
        body: formData
    });
    return await response.json();
};

// ========== 6. Registration APIs (Team Management) ==========
export const createTeam = async (hackathonId, teamName) => {
    const response = await fetch(`${API_BASE_URL}/registration/team`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hackathonId, teamName })
    });
    return await response.json();
};

export const joinTeam = async (inviteCode, hackathonId) => {
    const response = await fetch(`${API_BASE_URL}/registration/join`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ inviteCode, hackathonId })
    });
    return await response.json();
};

export const registerSolo = async (hackathonId) => {
    const response = await fetch(`${API_BASE_URL}/registration/solo`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hackathonId })
    });
    return await response.json();
};

export const getCommunity = async (hackathonId) => {
    const response = await fetch(`${API_BASE_URL}/registration/community/${hackathonId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return await response.json();
};

// ========== 7. Problem Statement APIs ==========
export const getProblemStatements = async (hackathonId) => {
    const response = await fetch(`${API_BASE_URL}/ps/${hackathonId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return await response.json();
};

export const getPSPreferences = async (hackathonId) => {
    const response = await fetch(`${API_BASE_URL}/ps/${hackathonId}/preferences`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return await response.json();
};

export const setPSPreferences = async (hackathonId, preferences) => {
    const response = await fetch(`${API_BASE_URL}/ps/${hackathonId}/preferences`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ preferences })
    });
    return await response.json();
};

export const allocatePS = async (hackathonId, maxTeamsPerDomain = 5) => {
    const response = await fetch(`${API_BASE_URL}/admin/hackathons/${hackathonId}/allocate-ps`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ maxTeamsPerDomain })
    });
    return await response.json();
};

// ========== 8. Public Leaderboard API ==========
export const getPublicLeaderboard = async () => {
    const response = await fetch(`${API_BASE_URL}/shortlist/leaderboard`);
    return await response.json();
};

// ========== 9. Admin Stats & Rounds ==========
export const getAdminStats = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`);
    return await response.json();
};

export const startNewRound = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/new-round`, {
        method: 'POST'
    });
    return await response.json();
};

// ========== 10. GitHub Sync by Entry ID ==========
export const syncGitHubByEntryId = async (entryId) => {
    const response = await fetch(`${API_BASE_URL}/github/sync/${entryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sync failed');
    }
    return await response.json();
};

// ========== 11. Test/Mock APIs ==========
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

// ========== 12. OTP APIs ==========
export const sendOTP = async (email, phone) => {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
    });
    return await response.json();
};

export const verifyOTP = async (email, otp) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });
    return await response.json();
};

// ========== 13. Judge APIs ==========
export const getJudgeTeams = async () => {
    const response = await fetch(`${API_BASE_URL}/judge/teams`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

export const submitJudgeScore = async (teamId, scores, feedback = '') => {
    const response = await fetch(`${API_BASE_URL}/judge/score/${teamId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ scores, feedback })
    });
    return await response.json();
};

export const getJudgeLeaderboard = async () => {
    const response = await fetch(`${API_BASE_URL}/judge/leaderboard`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

// ========== 14. Admin Overview & Users APIs ==========
export const getAdminOverviewStats = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/overview-stats`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

export const getAdminUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

export const createAdminUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
    });
    return await response.json();
};

export const updateAdminUser = async (userId, updates) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
    });
    return await response.json();
};

export const resetUserPassword = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    return await response.json();
};

// ========== 15. Check-In & Meal QR APIs ==========
export const generateCheckInQR = async (participantId) => {
    const response = await fetch(`${API_BASE_URL}/check-in/qr/${participantId}`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

export const checkInScan = async (qrData) => {
    const response = await fetch(`${API_BASE_URL}/check-in/scan`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ qrData })
    });
    return await response.json();
};

export const mealScan = async (qrData, mealType) => {
    const response = await fetch(`${API_BASE_URL}/check-in/meal-scan`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ qrData, mealType })
    });
    return await response.json();
};

// ========== 16. Student Dashboard APIs ==========
export const getHackathonTime = async (hackathonId) => {
    const response = await fetch(`${API_BASE_URL}/hackathon/${hackathonId}/time`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

export const getStudentScore = async () => {
    const response = await fetch(`${API_BASE_URL}/student/score`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

export const getStudentMeals = async () => {
    const response = await fetch(`${API_BASE_URL}/student/meals`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

export const getStudentDashboardData = async () => {
    const response = await fetch(`${API_BASE_URL}/student/dashboard`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

// ========== 17. Face Verification API ==========
export const verifyFace = async (selfieFile) => {
    const formData = new FormData();
    formData.append('selfie', selfieFile);
    const response = await fetch(`${API_BASE_URL}/verify-face`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    });
    return await response.json();
};

// ========== 18. Community APIs ==========
export const getCommunityDiscussions = async (hackathonId) => {
    const response = await fetch(`${API_BASE_URL}/community/discussions${hackathonId ? `?hackathonId=${hackathonId}` : ''}`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

export const createDiscussionPost = async (content, tags = []) => {
    const response = await fetch(`${API_BASE_URL}/community/discussions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, tags })
    });
    return await response.json();
};

export const getCommunityTeams = async (hackathonId) => {
    const response = await fetch(`${API_BASE_URL}/community/teams${hackathonId ? `?hackathonId=${hackathonId}` : ''}`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

export const getCommunityRequests = async () => {
    const response = await fetch(`${API_BASE_URL}/community/requests`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

export const respondToRequest = async (requestId, action) => {
    const response = await fetch(`${API_BASE_URL}/community/requests/${requestId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
    });
    return await response.json();
};

export const applyToTeam = async (teamId, message = '') => {
    const response = await fetch(`${API_BASE_URL}/community/apply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ teamId, message })
    });
    return await response.json();
};

// ========== 19. Admin Hackathon Timeline ==========
export const getAdminTimeline = async (hackathonId) => {
    const response = await fetch(`${API_BASE_URL}/admin/hackathons/${hackathonId}/timeline`, {
        headers: getAuthHeaders()
    });
    return await response.json();
};

// ========== 20. Voice Chat (AI Registration) ==========
export const startChatSession = async (email) => {
    const response = await fetch(`${API_BASE_URL}/chat/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to start chat session');
    }
    return await response.json();
};

export const sendChatMessage = async (sessionId, message) => {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to send message');
    }
    return await response.json();
};

export const sendChatVoice = async (sessionId, audioBlob) => {
    const fd = new FormData();
    fd.append('sessionId', sessionId);
    fd.append('audio', audioBlob, 'recording.webm');
    const response = await fetch(`${API_BASE_URL}/chat/voice`, {
        method: 'POST',
        body: fd
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to send voice');
    }
    return await response.json();
};

export const getChatSession = async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`);
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to get session');
    }
    return await response.json();
};
