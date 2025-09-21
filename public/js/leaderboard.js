// Leaderboard Manager
class LeaderboardManager {
    constructor() {
        this.currentTab = 'global';
        this.leaderboards = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add any leaderboard-specific event listeners here
    }

    async loadLeaderboard(type = 'global') {
        try {
            this.currentTab = type;
            const response = await authManager.makeRequest(`/api/leaderboard/${type}`, 'GET');
            if (response.ok) {
                const data = await response.json();
                this.leaderboards[type] = data;
                this.displayLeaderboard(data, type);
            } else {
                this.showMessage('Failed to load leaderboard', 'error');
            }
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    async loadMyRank() {
        try {
            const response = await authManager.makeRequest('/api/leaderboard/my-rank', 'GET');
            if (response.ok) {
                const data = await response.json();
                this.displayMyRank(data);
            }
        } catch (error) {
            console.error('Failed to load my rank:', error);
        }
    }

    displayLeaderboard(data, type) {
        const container = document.getElementById('leaderboard-list');
        if (!container) return;

        if (!data.leaderboard || data.leaderboard.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <h3>No data available</h3>
                    <p>Be the first to complete lessons and appear on the leaderboard!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.leaderboard.map((user, index) => `
            <div class="leaderboard-item ${index < 3 ? 'top-three' : ''}">
                <div class="rank">
                    ${this.getRankIcon(index + 1)}
                </div>
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-details">
                        <h4>${user.name}</h4>
                        <p>Level ${user.level || 1}</p>
                    </div>
                </div>
                <div class="user-stats">
                    <div class="stat">
                        <span class="stat-value">${user.coins || 0}</span>
                        <span class="stat-label">Coins</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${user.totalScore || 0}</span>
                        <span class="stat-label">Score</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Load my rank
        this.loadMyRank();
    }

    displayMyRank(data) {
        const container = document.getElementById('my-rank');
        if (!container) return;

        container.innerHTML = `
            <div class="my-rank-card">
                <div class="rank-info">
                    <h3>Your Rank</h3>
                    <div class="rank-number">#${data.rank || 'N/A'}</div>
                </div>
                <div class="rank-stats">
                    <div class="stat">
                        <span class="stat-value">${data.coins || 0}</span>
                        <span class="stat-label">Coins</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${data.totalScore || 0}</span>
                        <span class="stat-label">Score</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${data.percentile || 0}%</span>
                        <span class="stat-label">Percentile</span>
                    </div>
                </div>
            </div>
        `;
    }

    getRankIcon(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    }

    showLeaderboardTab(type) {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = document.querySelector(`[onclick="showLeaderboardTab('${type}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Load leaderboard for this type
        this.loadLeaderboard(type);
    }

    showMessage(message, type = 'success') {
        const container = document.getElementById('message-container');
        if (!container) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }
}

// Global functions for HTML onclick handlers
function showLeaderboardTab(type) {
    leaderboardManager.showLeaderboardTab(type);
}

// Initialize leaderboard manager
const leaderboardManager = new LeaderboardManager();