// Authentication functionality
class AuthManager {
    constructor() {
        console.log('AuthManager: Initializing...');
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.tempUserData = null;
        console.log('AuthManager: Token found:', !!this.token);
    }

    // Initialize authentication
    async init() {
        try {
            if (this.token) {
                try {
                    await this.validateToken();
                    this.showMainApp();
                } catch (error) {
                    console.log('Token validation failed, showing login');
                    this.logout();
                }
            } else {
                console.log('No token found, showing login');
                this.showLogin();
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            // Fallback: show login page
            this.showLogin();
        }
    }

    // Validate token and get user data
    async validateToken() {
        const response = await fetch('/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) {
            throw new Error('Invalid token');
        }

        const data = await response.json();
        this.currentUser = data.user;
        this.updateUserInfo();
    }

    // Show login page
    showLogin() {
        this.hideLoadingScreen();
        this.hideAllPages();
        document.getElementById('login-page').classList.add('active');
        document.getElementById('navbar').style.display = 'none';
        document.getElementById('main-content').style.display = 'none';
    }

    // Show register page
    showRegister() {
        this.hideAllPages();
        document.getElementById('register-page').classList.add('active');
    }

    // Show main application
    showMainApp() {
        this.hideLoadingScreen();
        this.hideAllPages();
        document.getElementById('home-page').classList.add('active');
        document.getElementById('navbar').style.display = 'block';
        document.getElementById('main-content').style.display = 'block';
        this.loadHomeData();
    }

    // Hide loading screen
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    // Hide all pages
    hideAllPages() {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
    }

    // Update user info in UI
    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('user-name').textContent = this.currentUser.name;
            document.getElementById('user-coins').textContent = `${this.currentUser.coins} 🪙`;
            
            // Update profile page
            document.getElementById('profile-name').textContent = this.currentUser.name;
            document.getElementById('profile-email').textContent = this.currentUser.email;
            document.getElementById('profile-coins').textContent = this.currentUser.coins;
            document.getElementById('profile-score').textContent = this.currentUser.totalScore;
            
            // Update world levels
            document.getElementById('science-level').textContent = this.currentUser.level.science;
            document.getElementById('math-level').textContent = this.currentUser.level.math;
            document.getElementById('history-level').textContent = this.currentUser.level.history;
            document.getElementById('life-skills-level').textContent = this.currentUser.level.lifeSkills;
            
            // Update profile levels
            document.getElementById('profile-science-level').textContent = this.currentUser.level.science;
            document.getElementById('profile-math-level').textContent = this.currentUser.level.math;
            document.getElementById('profile-history-level').textContent = this.currentUser.level.history;
            document.getElementById('profile-life-skills-level').textContent = this.currentUser.level.lifeSkills;
        }
    }

    // Send registration OTP
    async sendRegistrationOTP(formData) {
        try {
            const response = await fetch('/api/auth/send-registration-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                this.tempUserData = formData;
                this.showMessage('OTP sent to your email!', 'success');
                this.showRegistrationOTPForm();
            } else {
                this.showMessage(data.message || 'Failed to send OTP', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    // Verify registration OTP
    async verifyRegistrationOTP(otp) {
        try {
            const response = await fetch('/api/auth/verify-registration-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...this.tempUserData,
                    otp: otp
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.showMessage('Registration successful! Welcome to Learning World!', 'success');
                this.showMainApp();
            } else {
                this.showMessage(data.message || 'Invalid OTP', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    // Send login OTP
    async sendLoginOTP(email) {
        try {
            const response = await fetch('/api/auth/send-login-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.tempUserData = { email };
                this.showMessage('OTP sent to your email!', 'success');
                this.showLoginOTPForm();
            } else {
                this.showMessage(data.message || 'Failed to send OTP', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    // Verify login OTP
    async verifyLoginOTP(otp) {
        try {
            const response = await fetch('/api/auth/verify-login-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.tempUserData.email,
                    otp: otp
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.showMessage('Login successful! Welcome back!', 'success');
                this.showMainApp();
            } else {
                this.showMessage(data.message || 'Invalid OTP', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    // Show registration OTP form
    showRegistrationOTPForm() {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('register-otp-form').style.display = 'block';
    }

    // Show registration form
    showRegistrationForm() {
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('register-otp-form').style.display = 'none';
    }

    // Show login OTP form
    showLoginOTPForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('login-otp-form').style.display = 'block';
    }

    // Show login form
    showLoginForm() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('login-otp-form').style.display = 'none';
    }

    // Logout
    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        this.showLogin();
        this.showMessage('Logged out successfully', 'info');
    }

    // Load home data
    async loadHomeData() {
        try {
            // Load user progress
            const progressResponse = await fetch('/api/user/progress', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                this.updateProgressDisplay(progressData);
            }

            // Load today's challenges
            this.loadTodayChallenges();
        } catch (error) {
            console.error('Error loading home data:', error);
        }
    }

    // Update progress display
    updateProgressDisplay(progressData) {
        // Update world levels based on progress
        Object.keys(progressData.progress).forEach(world => {
            const levelElement = document.getElementById(`${world}-level`);
            if (levelElement) {
                levelElement.textContent = progressData.progress[world].level;
            }
        });
    }

    // Load today's challenges
    loadTodayChallenges() {
        const challengesGrid = document.getElementById('challenges-grid');
        const challenges = [
            { title: 'Complete 1 Science Lesson', icon: '🔬', completed: false },
            { title: 'Earn 10 Coins', icon: '🪙', completed: false },
            { title: 'Solve 5 Math Problems', icon: '🧮', completed: false },
            { title: 'Learn about Indian History', icon: '🏛️', completed: false }
        ];

        challengesGrid.innerHTML = challenges.map(challenge => `
            <div class="challenge-item ${challenge.completed ? 'completed' : ''}">
                <div class="challenge-icon">${challenge.icon}</div>
                <div class="challenge-title">${challenge.title}</div>
            </div>
        `).join('');
    }

    // Show message
    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('message-container');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        messageElement.innerHTML = `
            <span>${icon}</span>
            <span>${message}</span>
        `;

        messageContainer.appendChild(messageElement);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 5000);
    }

    // Get auth headers
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

// Global auth manager instance
const authManager = new AuthManager();

// Form event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Registration form
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        await authManager.sendRegistrationOTP(data);
    });

    // Registration OTP form
    document.getElementById('register-otp-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = document.getElementById('register-otp').value;
        await authManager.verifyRegistrationOTP(otp);
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        await authManager.sendLoginOTP(email);
    });

    // Login OTP form
    document.getElementById('login-otp-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = document.getElementById('login-otp').value;
        await authManager.verifyLoginOTP(otp);
    });

    // Hide loading screen after 3 seconds as fallback
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.log('Fallback: Hiding loading screen after timeout');
            loadingScreen.style.display = 'none';
            // Show login page if nothing else is shown
            if (!document.querySelector('.page.active')) {
                authManager.showLogin();
            }
        }
    }, 3000);

    // Initialize auth
    authManager.init();
});

// Global functions for navigation
function showLogin() {
    authManager.showLogin();
}

function showRegister() {
    authManager.showRegister();
}

function logout() {
    authManager.logout();
}

// Skip loading screen function
function skipLoading() {
    console.log('Skipping loading screen...');
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    // Show login page
    authManager.showLogin();
}
