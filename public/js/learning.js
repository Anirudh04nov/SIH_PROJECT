// Learning Manager
class LearningManager {
    constructor() {
        this.currentWorld = null;
        this.currentLesson = null;
        this.lessons = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add any learning-specific event listeners here
    }

    async loadWorlds() {
        try {
            const response = await authManager.makeRequest('/api/learning/worlds', 'GET');
            if (response.ok) {
                const worlds = await response.json();
                return worlds;
            }
        } catch (error) {
            console.error('Failed to load worlds:', error);
        }
        return [];
    }

    async loadLessons(world, level = 1) {
        try {
            const response = await authManager.makeRequest(`/api/learning/lessons/${world}/${level}`, 'GET');
            if (response.ok) {
                const lessons = await response.json();
                this.lessons = lessons;
                return lessons;
            }
        } catch (error) {
            console.error('Failed to load lessons:', error);
        }
        return [];
    }

    async loadLesson(lessonId) {
        try {
            const response = await authManager.makeRequest(`/api/learning/lesson/${lessonId}`, 'GET');
            if (response.ok) {
                const lesson = await response.json();
                this.currentLesson = lesson;
                return lesson;
            }
        } catch (error) {
            console.error('Failed to load lesson:', error);
        }
        return null;
    }

    async submitLesson(lessonId, answers) {
        try {
            const response = await authManager.makeRequest(
                `/api/learning/lesson/${lessonId}/submit`,
                'POST',
                { answers }
            );
            if (response.ok) {
                const result = await response.json();
                return result;
            }
        } catch (error) {
            console.error('Failed to submit lesson:', error);
        }
        return null;
    }

    async getUserLevels() {
        try {
            const response = await authManager.makeRequest('/api/learning/levels', 'GET');
            if (response.ok) {
                const levels = await response.json();
                return levels;
            }
        } catch (error) {
            console.error('Failed to load user levels:', error);
        }
        return {};
    }

    calculateScore(answers, questions) {
        let correct = 0;
        answers.forEach((answer, index) => {
            if (questions[index] && answer.answer === questions[index].correctAnswer) {
                correct++;
            }
        });
        return Math.round((correct / questions.length) * 100);
    }

    getDifficultyColor(difficulty) {
        const colors = {
            'Easy': '#4facfe',
            'Medium': '#f093fb',
            'Hard': '#f5576c'
        };
        return colors[difficulty] || colors['Easy'];
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    createProgressBar(progress, max = 100) {
        const percentage = Math.min((progress / max) * 100, 100);
        return `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
        `;
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
function startLesson(lessonId) {
    appManager.startLesson(lessonId);
}

function selectAnswer(optionIndex, answer) {
    appManager.selectAnswer(optionIndex, answer);
}

// Initialize learning manager
const learningManager = new LearningManager();
