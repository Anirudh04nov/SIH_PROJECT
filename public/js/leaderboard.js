// Leaderboard functionality
class LeaderboardManager {
    constructor() {
        this.currentTab = 'global';
        this.leaderboardData = {};
    }

    // Load leaderboard data
    async loadLeaderboard(tab = 'global') {
        try {
            this.currentTab = tab;
            let response;

            if (tab === 'global') {
                response = await fetch('/api/leaderboard/global?limit=50', {
                    headers: authManager.getAuthHeaders()
                });
            } else {
                response = await fetch(`/api/leaderboard/world/${tab}?limit=20`, {
                    headers: authManager.getAuthHeaders()
                });
            }

            if (response.ok) {
                const data = await response.json();
                this.leaderboardData[tab] = data;
                this.displayLeaderboard(data, tab);
            } else {
                throw new Error('Failed to load leaderboard');
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            authManager.showMessage('Failed to load leaderboard', 'error');
        }
    }

    // Display leaderboard
    displayLeaderboard(data, tab) {
        const leaderboardList = document.getElementById('leaderboard-list');
        
        if (!data.leaderboard || data.leaderboard.length === 0) {
            leaderboardList.innerHTML = `
                <div class="no-data">
                    <h3>No data available</h3>
                    <p>Be the first to complete lessons in this category!</p>
                </div>
            `;
            return;
        }

        leaderboardList.innerHTML = data.leaderboard.map((user, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;
            const rankIcon = this.getRankIcon(rank);
            
            return `
                <div class="leaderboard-item">
                    <div class="rank-number ${isTopThree ? 'top-3' : ''}">
                        ${rankIcon}
                    </div>
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-stats">
                            ${tab === 'global' ? 
                                `Total Score: ${user.totalScore} | Coins: ${user.coins}` :
                                `Level: ${this.getWorldLevel(user.level, tab)} | Score: ${user.totalScore}`
                            }
                        </div>
                    </div>
                    <div class="user-score">
                        ${tab === 'global' ? user.totalScore : user.totalScore}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Get rank icon
    getRankIcon(rank) {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return rank;
        }
    }

    // Get world level
    getWorldLevel(levels, world) {
        const worldKey = world === 'lifeSkills' ? 'lifeSkills' : world;
        return levels[worldKey] || 1;
    }

    // Load user's rank
    async loadUserRank() {
        try {
            const response = await fetch('/api/leaderboard/my-rank', {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.displayUserRank(data);
            }
        } catch (error) {
            console.error('Error loading user rank:', error);
        }
    }

    // Display user's rank
    displayUserRank(rankData) {
        const myRankElement = document.getElementById('my-rank');
        
        myRankElement.innerHTML = `
            <div class="rank-info">
                <h3>Your Ranking</h3>
                <div class="rank-details">
                    <div class="rank-item">
                        <span class="rank-value">#${rankData.rank}</span>
                        <span class="rank-label">Global Rank</span>
                    </div>
                    <div class="rank-item">
                        <span class="rank-value">${rankData.userScore}</span>
                        <span class="rank-label">Total Score</span>
                    </div>
                    <div class="rank-item">
                        <span class="rank-value">${rankData.userCoins}</span>
                        <span class="rank-label">Coins</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Load top performers
    async loadTopPerformers() {
        try {
            const response = await fetch('/api/leaderboard/top-performers', {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                return data.topPerformers;
            }
        } catch (error) {
            console.error('Error loading top performers:', error);
            return [];
        }
    }

    // Show leaderboard tab
    showLeaderboardTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[onclick="showLeaderboardTab('${tab}')"]`).classList.add('active');

        // Load and display leaderboard for the selected tab
        this.loadLeaderboard(tab);
    }

    // Get leaderboard statistics
    getLeaderboardStats() {
        const stats = {
            totalUsers: 0,
            averageScore: 0,
            topScore: 0,
            worldDistribution: {}
        };

        if (this.leaderboardData.global && this.leaderboardData.global.leaderboard) {
            const users = this.leaderboardData.global.leaderboard;
            stats.totalUsers = users.length;
            
            if (users.length > 0) {
                stats.topScore = users[0].totalScore;
                stats.averageScore = users.reduce((sum, user) => sum + user.totalScore, 0) / users.length;
            }
        }

        return stats;
    }

    // Generate leaderboard insights
    generateInsights() {
        const stats = this.getLeaderboardStats();
        const insights = [];

        if (authManager.currentUser) {
            const userRank = this.leaderboardData.global?.leaderboard?.findIndex(
                user => user._id === authManager.currentUser.id
            );

            if (userRank !== undefined && userRank !== -1) {
                const rank = userRank + 1;
                const percentile = Math.round(((stats.totalUsers - rank) / stats.totalUsers) * 100);
                
                insights.push({
                    type: 'rank',
                    message: `You're in the top ${percentile}% of learners!`,
                    icon: '🎯'
                });

                if (rank <= 10) {
                    insights.push({
                        type: 'achievement',
                        message: 'Amazing! You\'re in the top 10!',
                        icon: '🏆'
                    });
                } else if (rank <= 50) {
                    insights.push({
                        type: 'achievement',
                        message: 'Great job! You\'re in the top 50!',
                        icon: '⭐'
                    });
                }
            }

            // Score comparison
            if (authManager.currentUser.totalScore > stats.averageScore) {
                insights.push({
                    type: 'score',
                    message: `Your score is ${Math.round(((authManager.currentUser.totalScore - stats.averageScore) / stats.averageScore) * 100)}% above average!`,
                    icon: '📈'
                });
            }
        }

        return insights;
    }

    // Display insights
    displayInsights() {
        const insights = this.generateInsights();
        const insightsContainer = document.querySelector('.leaderboard-insights');
        
        if (!insightsContainer) return;

        if (insights.length === 0) {
            insightsContainer.innerHTML = `
                <div class="no-insights">
                    <p>Complete more lessons to see your insights!</p>
                </div>
            `;
            return;
        }

        insightsContainer.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <span class="insight-message">${insight.message}</span>
            </div>
        `).join('');
    }

    // Initialize leaderboard
    async init() {
        await this.loadUserRank();
        await this.loadLeaderboard('global');
        this.displayInsights();
    }
}

// Global leaderboard manager instance
const leaderboardManager = new LeaderboardManager();

// Global functions for leaderboard
function showLeaderboardTab(tab) {
    leaderboardManager.showLeaderboardTab(tab);
}

function loadLeaderboard() {
    leaderboardManager.init();
}
