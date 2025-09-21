// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Login OTP form
        const loginOtpForm = document.getElementById('login-otp-form');
        if (loginOtpForm) {
            loginOtpForm.addEventListener('submit', (e) => this.handleLoginOtp(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Register OTP form
        const registerOtpForm = document.getElementById('register-otp-form');
        if (registerOtpForm) {
            registerOtpForm.addEventListener('submit', (e) => this.handleRegisterOtp(e));
        }
    }

    async checkAuthStatus() {
        if (this.token) {
            try {
                const response = await this.makeRequest('/api/user/profile', 'GET');
                if (response.ok) {
                    const user = await response.json();
                    this.currentUser = user;
                    this.showAuthenticatedUI();
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                this.logout();
            }
        } else {
            this.showLoginUI();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');

        try {
            this.showLoading(e.target);
            const response = await this.makeRequest('/api/auth/send-login-otp', 'POST', { email });
            const result = await response.json();

            if (response.ok) {
                this.showMessage('OTP sent to your email!', 'success');
                this.showLoginOtpForm();
            } else {
                this.showMessage(result.message || 'Failed to send OTP', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading(e.target);
        }
    }

    async handleLoginOtp(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const otp = formData.get('otp');

        try {
            this.showLoading(e.target);
            const response = await this.makeRequest('/api/auth/verify-login-otp', 'POST', { otp });
            const result = await response.json();

            if (response.ok) {
                this.token = result.token;
                this.currentUser = result.user;
                localStorage.setItem('token', this.token);
                this.showMessage('Login successful!', 'success');
                this.showAuthenticatedUI();
            } else {
                this.showMessage(result.message || 'Invalid OTP', 'error');
            }
        } catch (error) {
            console.error('Login OTP error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading(e.target);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name'),
            age: parseInt(formData.get('age')),
            email: formData.get('email'),
            areaOfInterest: formData.get('areaOfInterest'),
            parentEmail: formData.get('parentEmail') || null
        };

        try {
            this.showLoading(e.target);
            const response = await this.makeRequest('/api/auth/send-registration-otp', 'POST', userData);
            const result = await response.json();

            if (response.ok) {
                this.showMessage('Verification code sent to your email!', 'success');
                this.showRegisterOtpForm();
            } else {
                this.showMessage(result.message || 'Failed to send verification code', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading(e.target);
        }
    }

    async handleRegisterOtp(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const otp = formData.get('otp');

        try {
            this.showLoading(e.target);
            const response = await this.makeRequest('/api/auth/verify-registration-otp', 'POST', { otp });
            const result = await response.json();

            if (response.ok) {
                this.token = result.token;
                this.currentUser = result.user;
                localStorage.setItem('token', this.token);
                this.showMessage('Registration successful! Welcome to Learning World!', 'success');
                this.showAuthenticatedUI();
            } else {
                this.showMessage(result.message || 'Invalid verification code', 'error');
            }
        } catch (error) {
            console.error('Registration OTP error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading(e.target);
        }
    }

    async makeRequest(url, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        return fetch(url, options);
    }

    showLoginUI() {
        this.hideAllPages();
        document.getElementById('login-page').classList.add('active');
        document.getElementById('navbar').style.display = 'none';
    }

    showAuthenticatedUI() {
        this.hideAllPages();
        document.getElementById('home-page').classList.add('active');
        document.getElementById('navbar').style.display = 'block';
        this.updateUserInfo();
        if (window.appManager) {
            window.appManager.loadUserProgress();
        }
    }

    showLoginOtpForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('login-otp-form').style.display = 'block';
    }

    showLoginForm() {
        document.getElementById('login-otp-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    }

    showRegisterOtpForm() {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('register-otp-form').style.display = 'block';
    }

    showRegisterForm() {
        document.getElementById('register-otp-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    }

    hideAllPages() {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
    }

    updateUserInfo() {
        if (this.currentUser) {
            // Update user name
            const userNameElements = document.querySelectorAll('#user-name, #profile-name');
            userNameElements.forEach(el => el.textContent = this.currentUser.name);

            // Update user email
            const userEmailElements = document.querySelectorAll('#profile-email');
            userEmailElements.forEach(el => el.textContent = this.currentUser.email);

            // Update coins
            const coinsElements = document.querySelectorAll('#user-coins, #profile-coins');
            coinsElements.forEach(el => el.textContent = `${this.currentUser.coins || 0} 🪙`);

            // Update level
            const levelElements = document.querySelectorAll('#user-level');
            levelElements.forEach(el => el.textContent = `Level ${this.currentUser.level || 1}`);
        }
    }

    logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('token');
        this.showLoginUI();
        this.showMessage('Logged out successfully', 'success');
    }

    showLoading(element) {
        element.classList.add('loading');
        const buttons = element.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        });
    }

    hideLoading(element) {
        element.classList.remove('loading');
        const buttons = element.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.disabled = false;
            // Reset button text based on button type
            if (btn.type === 'submit') {
                if (element.id === 'login-form') {
                    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Login Code';
                } else if (element.id === 'login-otp-form') {
                    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                } else if (element.id === 'register-form') {
                    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Verification Code';
                } else if (element.id === 'register-otp-form') {
                    btn.innerHTML = '<i class="fas fa-check"></i> Complete Registration';
                }
            }
        });
    }

    showMessage(message, type = 'success') {
        const container = document.getElementById('message-container');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }

    // Demo login function
    async demoLogin() {
        try {
            this.showMessage('Logging in with demo account...', 'success');
            
            // Create a demo user object
            const demoUser = {
                _id: 'demo-user-123',
                name: 'Demo Student',
                email: 'demo@learningworld.com',
                age: 10,
                areaOfInterest: 'All',
                coins: 150,
                level: 3,
                totalScore: 1250,
                scienceLevel: 2,
                mathLevel: 3,
                historyLevel: 1,
                lifeSkillsLevel: 2,
                achievements: [
                    { name: 'First Lesson', description: 'Completed your first lesson!', icon: '🎉' },
                    { name: 'Science Explorer', description: 'Completed 5 science lessons', icon: '🔬' },
                    { name: 'Math Master', description: 'Completed 10 math lessons', icon: '🧮' }
                ]
            };

            // Create a demo token
            const demoToken = 'demo-token-' + Date.now();
            
            // Set user and token
            this.currentUser = demoUser;
            this.token = demoToken;
            localStorage.setItem('token', demoToken);
            
            // Show success message
            this.showMessage('Demo login successful! Welcome to Learning World!', 'success');
            
            // Show authenticated UI
            this.showAuthenticatedUI();
            
        } catch (error) {
            console.error('Demo login error:', error);
            this.showMessage('Demo login failed. Please try again.', 'error');
        }
    }
}

// Global functions for HTML onclick handlers
function showLogin() {
    authManager.hideAllPages();
    document.getElementById('login-page').classList.add('active');
}

function showRegister() {
    authManager.hideAllPages();
    document.getElementById('register-page').classList.add('active');
}

function showLoginForm() {
    authManager.showLoginForm();
}

function showRegisterForm() {
    authManager.showRegisterForm();
}

function logout() {
    authManager.logout();
}

function demoLogin() {
    authManager.demoLogin();
}

// Initialize auth manager
const authManager = new AuthManager();