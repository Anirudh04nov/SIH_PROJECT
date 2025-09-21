// Main application functionality
class AppManager {
    constructor() {
        this.currentWorld = null;
        this.currentLesson = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
    }

    // Initialize app
    init() {
        this.setupEventListeners();
        this.loadInitialData();
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation events
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action]')) {
                const action = e.target.getAttribute('data-action');
                this.handleAction(action, e.target);
            }
        });
    }

    // Handle actions
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

    // Load initial data
    async loadInitialData() {
        if (authManager.currentUser) {
            await this.loadUserProgress();
        }
    }

    // Load user progress
    async loadUserProgress() {
        try {
            const response = await fetch('/api/user/progress', {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.updateProgressUI(data);
            }
        } catch (error) {
            console.error('Error loading user progress:', error);
        }
    }

    // Update progress UI
    updateProgressUI(progressData) {
        // Update world levels
        Object.keys(progressData.progress).forEach(world => {
            const levelElement = document.getElementById(`${world}-level`);
            if (levelElement) {
                levelElement.textContent = progressData.progress[world].level;
            }
        });
    }

    // Enter world
    async enterWorld(world) {
        this.currentWorld = world;
        this.showWorldPage(world);
        await this.loadWorldLessons(world);
    }

    // Show world page
    showWorldPage(world) {
        authManager.hideAllPages();
        document.getElementById('world-page').classList.add('active');
        
        const worldNames = {
            'science': 'Science World',
            'math': 'Math World',
            'history': 'Indian History World',
            'lifeSkills': 'Life Skills World'
        };

        document.getElementById('world-title').textContent = worldNames[world];
        
        // Get current level for this world
        const levelKey = world === 'lifeSkills' ? 'lifeSkills' : world;
        const currentLevel = authManager.currentUser.level[levelKey];
        document.getElementById('current-world-level').textContent = currentLevel;
    }

    // Load world lessons
    async loadWorldLessons(world) {
        try {
            const level = authManager.currentUser.level[world === 'lifeSkills' ? 'lifeSkills' : world];
            const response = await fetch(`/api/learning/lessons/${world}/${level}`, {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.displayLessons(data.lessons);
            } else {
                authManager.showMessage('Failed to load lessons', 'error');
            }
        } catch (error) {
            console.error('Error loading lessons:', error);
            authManager.showMessage('Network error loading lessons', 'error');
        }
    }

    // Display lessons
    displayLessons(lessons) {
        const lessonsGrid = document.getElementById('lessons-grid');
        
        if (lessons.length === 0) {
            lessonsGrid.innerHTML = `
                <div class="no-lessons">
                    <h3>No lessons available for this level</h3>
                    <p>Complete more lessons to unlock higher levels!</p>
                </div>
            `;
            return;
        }

        lessonsGrid.innerHTML = lessons.map(lesson => `
            <div class="lesson-card ${lesson.isCompleted ? 'completed' : ''}" 
                 data-action="start-lesson" 
                 data-lesson-id="${lesson._id}">
                <h3>${lesson.title}</h3>
                <p>${lesson.description}</p>
                <div class="lesson-meta">
                    <span class="lesson-reward">${lesson.coinsReward} 🪙</span>
                    <span class="lesson-time">${lesson.estimatedTime} min</span>
                    ${lesson.isCompleted ? '<span class="lesson-status">Completed</span>' : '<span class="lesson-status pending">Start</span>'}
                </div>
            </div>
        `).join('');

        // Add click listeners
        lessonsGrid.addEventListener('click', (e) => {
            const lessonCard = e.target.closest('.lesson-card');
            if (lessonCard) {
                const lessonId = lessonCard.getAttribute('data-lesson-id');
                this.startLesson(lessonId);
            }
        });
    }

    // Start lesson
    async startLesson(lessonId) {
        try {
            const response = await fetch(`/api/learning/lesson/${lessonId}`, {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.currentLesson = data.lesson;
                this.currentQuestionIndex = 0;
                this.userAnswers = [];
                this.showLessonPage();
            } else {
                authManager.showMessage('Failed to load lesson', 'error');
            }
        } catch (error) {
            console.error('Error loading lesson:', error);
            authManager.showMessage('Network error loading lesson', 'error');
        }
    }

    // Show lesson page
    showLessonPage() {
        authManager.hideAllPages();
        document.getElementById('lesson-page').classList.add('active');
        
        document.getElementById('lesson-title').textContent = this.currentLesson.title;
        document.getElementById('lesson-description').innerHTML = `
            <h3>About this lesson:</h3>
            <p>${this.currentLesson.description}</p>
            <div class="lesson-info">
                <span class="info-item">🪙 ${this.currentLesson.coinsReward} coins reward</span>
                <span class="info-item">⏱️ ${this.currentLesson.estimatedTime} minutes</span>
                <span class="info-item">❓ ${this.currentLesson.questions.length} questions</span>
            </div>
        `;

        this.showQuestion(0);
    }

    // Show question
    showQuestion(questionIndex) {
        const question = this.currentLesson.questions[questionIndex];
        const quizContainer = document.getElementById('quiz-container');
        
        document.getElementById('lesson-progress-text').textContent = 
            `Question ${questionIndex + 1} of ${this.currentLesson.questions.length}`;

        quizContainer.innerHTML = `
            <div class="question-card">
                <h3>${question.question}</h3>
                <ul class="options-list">
                    ${question.options.map((option, index) => `
                        <li class="option-item">
                            <button class="option-btn" data-answer="${index}">
                                ${option}
                            </button>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        // Add click listeners to options
        quizContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('option-btn')) {
                this.selectAnswer(parseInt(e.target.getAttribute('data-answer')));
            }
        });

        // Show/hide navigation buttons
        const nextBtn = document.getElementById('next-question-btn');
        const submitBtn = document.getElementById('submit-lesson-btn');
        
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'none';
    }

    // Select answer
    selectAnswer(answerIndex) {
        // Remove previous selection
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add selection to clicked button
        document.querySelector(`[data-answer="${answerIndex}"]`).classList.add('selected');
        
        // Store answer
        this.userAnswers[this.currentQuestionIndex] = answerIndex;

        // Show next button
        const nextBtn = document.getElementById('next-question-btn');
        const submitBtn = document.getElementById('submit-lesson-btn');
        
        if (this.currentQuestionIndex < this.currentLesson.questions.length - 1) {
            nextBtn.style.display = 'inline-flex';
        } else {
            submitBtn.style.display = 'inline-flex';
        }
    }

    // Next question
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentLesson.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion(this.currentQuestionIndex);
        }
    }

    // Submit lesson
    async submitLesson() {
        if (this.userAnswers.length !== this.currentLesson.questions.length) {
            authManager.showMessage('Please answer all questions', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/learning/lesson/${this.currentLesson._id}/submit`, {
                method: 'POST',
                headers: authManager.getAuthHeaders(),
                body: JSON.stringify({
                    answers: this.userAnswers
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.showLessonResults(data);
            } else {
                authManager.showMessage('Failed to submit lesson', 'error');
            }
        } catch (error) {
            console.error('Error submitting lesson:', error);
            authManager.showMessage('Network error submitting lesson', 'error');
        }
    }

    // Show lesson results
    showLessonResults(results) {
        const quizContainer = document.getElementById('quiz-container');
        
        quizContainer.innerHTML = `
            <div class="results-card">
                <h2>🎉 Lesson Completed!</h2>
                <div class="results-stats">
                    <div class="stat">
                        <span class="stat-value">${results.score}</span>
                        <span class="stat-label">Score</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${results.coinsEarned}</span>
                        <span class="stat-label">Coins Earned</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${results.newCoins}</span>
                        <span class="stat-label">Total Coins</span>
                    </div>
                </div>
                ${results.levelUp ? '<div class="level-up">🎊 Level Up! 🎊</div>' : ''}
                
                <div class="question-results">
                    <h3>Question Review:</h3>
                    ${results.results.map((result, index) => `
                        <div class="question-result ${result.isCorrect ? 'correct' : 'incorrect'}">
                            <h4>Question ${index + 1}: ${result.question}</h4>
                            <p><strong>Your answer:</strong> ${result.userAnswer + 1}</p>
                            <p><strong>Correct answer:</strong> ${result.correctAnswer + 1}</p>
                            <p><strong>Explanation:</strong> ${result.explanation}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Update user info
        authManager.currentUser.coins = results.newCoins;
        authManager.currentUser.totalScore = results.totalScore;
        if (results.levelUp) {
            authManager.currentUser.level = results.newLevel;
        }
        authManager.updateUserInfo();

        // Show back button
        document.getElementById('next-question-btn').style.display = 'none';
        document.getElementById('submit-lesson-btn').style.display = 'none';
        
        // Add continue button
        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn btn-primary';
        continueBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to World';
        continueBtn.onclick = () => this.showWorldPage(this.currentWorld);
        
        document.querySelector('.lesson-actions').appendChild(continueBtn);
        
        authManager.showMessage('Lesson completed successfully!', 'success');
    }

    // Show world (go back to world from lesson)
    showWorld() {
        if (this.currentWorld) {
            this.showWorldPage(this.currentWorld);
        } else {
            authManager.showMainApp();
        }
    }
}

// Global app manager instance
const appManager = new AppManager();

// Global functions for navigation
function showHome() {
    authManager.hideAllPages();
    document.getElementById('home-page').classList.add('active');
}

function showProfile() {
    authManager.hideAllPages();
    document.getElementById('profile-page').classList.add('active');
}

function showLeaderboard() {
    authManager.hideAllPages();
    document.getElementById('leaderboard-page').classList.add('active');
    loadLeaderboard();
}

function showParentCorner() {
    authManager.hideAllPages();
    document.getElementById('parent-corner-page').classList.add('active');
}

function enterWorld(world) {
    appManager.enterWorld(world);
}

function showWorld() {
    appManager.showWorld();
}

function nextQuestion() {
    appManager.nextQuestion();
}

function submitLesson() {
    appManager.submitLesson();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    appManager.init();
});
