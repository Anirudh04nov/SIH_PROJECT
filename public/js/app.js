// Main Application Manager
class AppManager {
    constructor() {
        this.currentWorld = null;
        this.currentLesson = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Navigation events
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action]')) {
                const action = e.target.getAttribute('data-action');
                this.handleAction(action, e.target);
            }
        });
    }

    handleAction(action, element) {
        switch (action) {
            case 'enter-world':
                const world = element.getAttribute('data-world');
                this.enterWorld(world);
                break;
            case 'start-lesson':
                const lessonId = element.getAttribute('data-lesson-id');
                this.startLesson(lessonId);
                break;
        }
    }

    async loadInitialData() {
        if (authManager.currentUser) {
            await this.loadUserProgress();
            await this.loadChallenges();
        }
    }

    async loadUserProgress() {
        try {
            const response = await authManager.makeRequest('/api/user/progress', 'GET');
            if (response.ok) {
                const progress = await response.json();
                this.updateProgressUI(progress);
            }
        } catch (error) {
            console.error('Failed to load user progress:', error);
        }
    }

    updateProgressUI(progress) {
        // Update world levels
        const worldLevels = {
            science: progress.scienceLevel || 1,
            math: progress.mathLevel || 1,
            history: progress.historyLevel || 1,
            lifeSkills: progress.lifeSkillsLevel || 1
        };

        Object.keys(worldLevels).forEach(world => {
            const levelElements = document.querySelectorAll(`#${world}-level, #profile-${world}-level`);
            levelElements.forEach(el => el.textContent = worldLevels[world]);
        });

        // Update coins
        const coinsElements = document.querySelectorAll('#user-coins, #profile-coins');
        coinsElements.forEach(el => el.textContent = `${progress.coins || 0} 🪙`);

        // Update total score
        const scoreElements = document.querySelectorAll('#profile-score');
        scoreElements.forEach(el => el.textContent = progress.totalScore || 0);
    }

    async loadChallenges() {
        try {
            // For demo purposes, show some sample challenges
            if (authManager.currentUser && authManager.currentUser._id === 'demo-user-123') {
                const demoChallenges = [
                    {
                        icon: '🔬',
                        title: 'Science Explorer',
                        description: 'Complete 3 science lessons today',
                        reward: 50
                    },
                    {
                        icon: '🧮',
                        title: 'Math Master',
                        description: 'Solve 10 math problems correctly',
                        reward: 75
                    },
                    {
                        icon: '🏛️',
                        title: 'History Buff',
                        description: 'Learn about Indian history',
                        reward: 40
                    },
                    {
                        icon: '🌟',
                        title: 'Life Skills Champion',
                        description: 'Complete a life skills lesson',
                        reward: 30
                    }
                ];
                this.displayChallenges(demoChallenges);
                return;
            }

            const response = await authManager.makeRequest('/api/learning/challenges', 'GET');
            if (response.ok) {
                const challenges = await response.json();
                this.displayChallenges(challenges);
            }
        } catch (error) {
            console.error('Failed to load challenges:', error);
        }
    }

    displayChallenges(challenges) {
        const container = document.getElementById('challenges-grid');
        if (!container) return;

        container.innerHTML = challenges.map(challenge => `
            <div class="challenge-card">
                <div class="challenge-icon">${challenge.icon}</div>
                <h3>${challenge.title}</h3>
                <p>${challenge.description}</p>
                <div class="challenge-reward">+${challenge.reward} 🪙</div>
            </div>
        `).join('');
    }

    async enterWorld(worldName) {
        this.currentWorld = worldName;
        
        // Show world page
        authManager.hideAllPages();
        document.getElementById('world-page').classList.add('active');
        
        // Update world title
        const worldTitle = document.getElementById('world-title');
        if (worldTitle) {
            worldTitle.textContent = this.getWorldDisplayName(worldName);
        }

        // Load lessons for this world
        await this.loadWorldLessons(worldName);
    }

    getWorldDisplayName(worldName) {
        const names = {
            science: 'Science World',
            math: 'Math World',
            history: 'Indian History World',
            lifeSkills: 'Life Skills World'
        };
        return names[worldName] || worldName;
    }

    async loadWorldLessons(worldName) {
        try {
            // For demo purposes, show sample lessons
            if (authManager.currentUser && authManager.currentUser._id === 'demo-user-123') {
                const demoLessons = this.getDemoLessons(worldName);
                this.displayLessons(demoLessons);
                return;
            }

            const response = await authManager.makeRequest(`/api/learning/lessons/${worldName}/1`, 'GET');
            if (response.ok) {
                const lessons = await response.json();
                this.displayLessons(lessons);
            } else {
                this.showMessage('Failed to load lessons', 'error');
            }
        } catch (error) {
            console.error('Failed to load lessons:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    getDemoLessons(worldName) {
        const demoLessons = {
            science: [
                {
                    _id: 'demo-science-1',
                    title: 'The Solar System',
                    description: 'Learn about planets and their characteristics',
                    icon: '🪐',
                    difficulty: 'Easy',
                    reward: 25,
                    progress: 0
                },
                {
                    _id: 'demo-science-2',
                    title: 'Photosynthesis',
                    description: 'Discover how plants make their food',
                    icon: '🌱',
                    difficulty: 'Medium',
                    reward: 35,
                    progress: 50
                },
                {
                    _id: 'demo-science-3',
                    title: 'States of Matter',
                    description: 'Explore solid, liquid, and gas',
                    icon: '🧊',
                    difficulty: 'Easy',
                    reward: 30,
                    progress: 100
                }
            ],
            math: [
                {
                    _id: 'demo-math-1',
                    title: 'Addition and Subtraction',
                    description: 'Master basic arithmetic operations',
                    icon: '➕',
                    difficulty: 'Easy',
                    reward: 20,
                    progress: 0
                },
                {
                    _id: 'demo-math-2',
                    title: 'Multiplication Tables',
                    description: 'Learn times tables from 1 to 10',
                    icon: '✖️',
                    difficulty: 'Medium',
                    reward: 40,
                    progress: 75
                },
                {
                    _id: 'demo-math-3',
                    title: 'Fractions',
                    description: 'Understand parts of a whole',
                    icon: '🍕',
                    difficulty: 'Hard',
                    reward: 50,
                    progress: 25
                }
            ],
            history: [
                {
                    _id: 'demo-history-1',
                    title: 'Ancient India',
                    description: 'Explore the Indus Valley Civilization',
                    icon: '🏛️',
                    difficulty: 'Easy',
                    reward: 30,
                    progress: 0
                },
                {
                    _id: 'demo-history-2',
                    title: 'Freedom Fighters',
                    description: 'Learn about India\'s independence heroes',
                    icon: '🦸',
                    difficulty: 'Medium',
                    reward: 45,
                    progress: 60
                }
            ],
            lifeSkills: [
                {
                    _id: 'demo-life-1',
                    title: 'Personal Hygiene',
                    description: 'Learn the importance of cleanliness',
                    icon: '🧼',
                    difficulty: 'Easy',
                    reward: 25,
                    progress: 0
                },
                {
                    _id: 'demo-life-2',
                    title: 'Time Management',
                    description: 'Organize your daily activities',
                    icon: '⏰',
                    difficulty: 'Medium',
                    reward: 35,
                    progress: 40
                }
            ]
        };
        return demoLessons[worldName] || [];
    }

    displayLessons(lessons) {
        const container = document.getElementById('lessons-grid');
        if (!container) return;

        container.innerHTML = lessons.map(lesson => `
            <div class="lesson-card" onclick="appManager.startLesson('${lesson._id}')">
                <div class="lesson-icon">${lesson.icon || '📚'}</div>
                <h3>${lesson.title}</h3>
                <p>${lesson.description}</p>
                <div class="lesson-meta">
                    <span class="lesson-difficulty">${lesson.difficulty || 'Easy'}</span>
                    <span class="lesson-reward">+${lesson.reward || 10} 🪙</span>
                </div>
                <div class="lesson-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${lesson.progress || 0}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async startLesson(lessonId) {
        try {
            const response = await authManager.makeRequest(`/api/learning/lesson/${lessonId}`, 'GET');
            if (response.ok) {
                const lesson = await response.json();
                this.currentLesson = lesson;
                this.currentQuestionIndex = 0;
                this.userAnswers = [];
                this.showLesson(lesson);
            } else {
                this.showMessage('Failed to load lesson', 'error');
            }
        } catch (error) {
            console.error('Failed to load lesson:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showLesson(lesson) {
        // Show lesson page
        authManager.hideAllPages();
        document.getElementById('lesson-page').classList.add('active');
        
        // Update lesson title
        const lessonTitle = document.getElementById('lesson-title');
        if (lessonTitle) {
            lessonTitle.textContent = lesson.title;
        }

        // Display lesson content
        this.displayLessonContent(lesson);
    }

    displayLessonContent(lesson) {
        const descriptionEl = document.getElementById('lesson-description');
        const quizContainer = document.getElementById('quiz-container');
        
        if (descriptionEl) {
            descriptionEl.innerHTML = `
                <h3>${lesson.title}</h3>
                <p>${lesson.description}</p>
                <div class="lesson-info">
                    <span class="difficulty">Difficulty: ${lesson.difficulty || 'Easy'}</span>
                    <span class="reward">Reward: +${lesson.reward || 10} 🪙</span>
                </div>
            `;
        }

        if (quizContainer && lesson.questions && lesson.questions.length > 0) {
            this.displayQuestion(lesson.questions[0], 0, lesson.questions.length);
        }
    }

    displayQuestion(question, questionIndex, totalQuestions) {
        const quizContainer = document.getElementById('quiz-container');
        const progressText = document.getElementById('lesson-progress-text');
        
        if (progressText) {
            progressText.textContent = `Question ${questionIndex + 1} of ${totalQuestions}`;
        }

        if (quizContainer) {
            quizContainer.innerHTML = `
                <div class="question-card">
                    <h3>${question.question}</h3>
                    <div class="options">
                        ${question.options.map((option, index) => `
                            <button class="option-btn" onclick="appManager.selectAnswer(${index}, '${option}')">
                                ${String.fromCharCode(65 + index)}. ${option}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    selectAnswer(optionIndex, answer) {
        // Store the answer
        this.userAnswers[this.currentQuestionIndex] = {
            questionIndex: this.currentQuestionIndex,
            answer: answer,
            optionIndex: optionIndex
        };

        // Show feedback
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach((btn, index) => {
            btn.disabled = true;
            if (index === optionIndex) {
                btn.classList.add('selected');
            }
        });

        // Show next question button or submit button
        const nextBtn = document.getElementById('next-question-btn');
        const submitBtn = document.getElementById('submit-lesson-btn');
        
        if (this.currentQuestionIndex < this.currentLesson.questions.length - 1) {
            if (nextBtn) nextBtn.style.display = 'block';
        } else {
            if (submitBtn) submitBtn.style.display = 'block';
        }
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        const question = this.currentLesson.questions[this.currentQuestionIndex];
        this.displayQuestion(question, this.currentQuestionIndex, this.currentLesson.questions.length);
        
        // Hide buttons
        document.getElementById('next-question-btn').style.display = 'none';
        document.getElementById('submit-lesson-btn').style.display = 'none';
    }

    async submitLesson() {
        try {
            const response = await authManager.makeRequest(
                `/api/learning/lesson/${this.currentLesson._id}/submit`,
                'POST',
                { answers: this.userAnswers }
            );
            
            if (response.ok) {
                const result = await response.json();
                this.showMessage(`Lesson completed! You earned ${result.coinsEarned} 🪙`, 'success');
                
                // Update user progress
                await this.loadUserProgress();
                
                // Go back to world
                this.showWorld();
            } else {
                const error = await response.json();
                this.showMessage(error.message || 'Failed to submit lesson', 'error');
            }
        } catch (error) {
            console.error('Failed to submit lesson:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    showWorld() {
        if (this.currentWorld) {
            this.enterWorld(this.currentWorld);
        } else {
            this.showHome();
        }
    }

    showHome() {
        authManager.hideAllPages();
        document.getElementById('home-page').classList.add('active');
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
}

// Global functions for HTML onclick handlers
function showHome() {
    appManager.showHome();
}

function showProfile() {
    authManager.hideAllPages();
    document.getElementById('profile-page').classList.add('active');
}

function showLeaderboard() {
    authManager.hideAllPages();
    document.getElementById('leaderboard-page').classList.add('active');
    if (window.leaderboardManager) {
        window.leaderboardManager.loadLeaderboard();
    }
}

function showParentCorner() {
    authManager.hideAllPages();
    document.getElementById('parent-corner-page').classList.add('active');
}

function enterWorld(worldName) {
    appManager.enterWorld(worldName);
}

function nextQuestion() {
    appManager.nextQuestion();
}

function submitLesson() {
    appManager.submitLesson();
}

// Initialize app manager
const appManager = new AppManager();