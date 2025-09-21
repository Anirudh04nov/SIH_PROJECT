// Learning and lesson management functionality
class LearningManager {
    constructor() {
        this.lessons = [];
        this.currentLesson = null;
        this.userProgress = {};
    }

    // Load lessons for a specific world and level
    async loadLessons(world, level) {
        try {
            const response = await fetch(`/api/learning/lessons/${world}/${level}`, {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.lessons = data.lessons;
                return data.lessons;
            } else {
                throw new Error('Failed to load lessons');
            }
        } catch (error) {
            console.error('Error loading lessons:', error);
            authManager.showMessage('Failed to load lessons', 'error');
            return [];
        }
    }

    // Get lesson content
    async getLessonContent(lessonId) {
        try {
            const response = await fetch(`/api/learning/lesson/${lessonId}`, {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.currentLesson = data.lesson;
                return data.lesson;
            } else {
                throw new Error('Failed to load lesson content');
            }
        } catch (error) {
            console.error('Error loading lesson content:', error);
            authManager.showMessage('Failed to load lesson content', 'error');
            return null;
        }
    }

    // Submit lesson answers
    async submitLessonAnswers(lessonId, answers) {
        try {
            const response = await fetch(`/api/learning/lesson/${lessonId}/submit`, {
                method: 'POST',
                headers: authManager.getAuthHeaders(),
                body: JSON.stringify({ answers })
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('Failed to submit lesson');
            }
        } catch (error) {
            console.error('Error submitting lesson:', error);
            authManager.showMessage('Failed to submit lesson', 'error');
            return null;
        }
    }

    // Get user's current levels
    async getUserLevels() {
        try {
            const response = await fetch('/api/learning/levels', {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                return data.levels;
            } else {
                throw new Error('Failed to load user levels');
            }
        } catch (error) {
            console.error('Error loading user levels:', error);
            return {};
        }
    }

    // Get available worlds
    async getWorlds() {
        try {
            const response = await fetch('/api/learning/worlds', {
                headers: authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                return data.worlds;
            } else {
                throw new Error('Failed to load worlds');
            }
        } catch (error) {
            console.error('Error loading worlds:', error);
            return [];
        }
    }

    // Add coins to user
    async addCoins(coins, world) {
        try {
            const response = await fetch('/api/user/add-coins', {
                method: 'POST',
                headers: authManager.getAuthHeaders(),
                body: JSON.stringify({ coins, world })
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('Failed to add coins');
            }
        } catch (error) {
            console.error('Error adding coins:', error);
            return null;
        }
    }

    // Calculate lesson difficulty
    calculateDifficulty(lesson) {
        const baseDifficulty = lesson.level;
        const questionCount = lesson.questions.length;
        const timeEstimate = lesson.estimatedTime;
        
        // Simple difficulty calculation
        let difficulty = baseDifficulty;
        if (questionCount > 5) difficulty += 1;
        if (timeEstimate > 15) difficulty += 1;
        
        return Math.min(difficulty, 10);
    }

    // Get lesson recommendations
    getLessonRecommendations(userProgress, completedLessons) {
        const recommendations = [];
        
        // Recommend lessons based on user's area of interest
        const interest = authManager.currentUser.areaOfInterest;
        
        if (interest === 'All' || interest === 'Science') {
            recommendations.push({
                world: 'Science',
                reason: 'Based on your interest in Science',
                priority: 'high'
            });
        }
        
        if (interest === 'All' || interest === 'Math') {
            recommendations.push({
                world: 'Math',
                reason: 'Based on your interest in Math',
                priority: 'high'
            });
        }
        
        // Add more recommendation logic based on progress
        return recommendations;
    }

    // Track learning session
    startLearningSession(lessonId) {
        const session = {
            lessonId,
            startTime: new Date(),
            world: this.currentLesson?.world
        };
        
        localStorage.setItem('currentSession', JSON.stringify(session));
    }

    // End learning session
    endLearningSession() {
        const sessionData = localStorage.getItem('currentSession');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            session.endTime = new Date();
            session.duration = session.endTime - new Date(session.startTime);
            
            // Store session data for analytics
            this.storeSessionData(session);
            localStorage.removeItem('currentSession');
        }
    }

    // Store session data
    storeSessionData(session) {
        const sessions = JSON.parse(localStorage.getItem('learningSessions') || '[]');
        sessions.push(session);
        localStorage.setItem('learningSessions', JSON.stringify(sessions));
    }

    // Get learning analytics
    getLearningAnalytics() {
        const sessions = JSON.parse(localStorage.getItem('learningSessions') || '[]');
        const analytics = {
            totalSessions: sessions.length,
            totalTime: sessions.reduce((total, session) => total + (session.duration || 0), 0),
            averageSessionTime: 0,
            worldBreakdown: {},
            dailyProgress: {}
        };

        if (sessions.length > 0) {
            analytics.averageSessionTime = analytics.totalTime / sessions.length;
            
            // Calculate world breakdown
            sessions.forEach(session => {
                const world = session.world;
                if (!analytics.worldBreakdown[world]) {
                    analytics.worldBreakdown[world] = { count: 0, time: 0 };
                }
                analytics.worldBreakdown[world].count++;
                analytics.worldBreakdown[world].time += session.duration || 0;
            });
        }

        return analytics;
    }

    // Generate learning streak
    calculateLearningStreak() {
        const sessions = JSON.parse(localStorage.getItem('learningSessions') || '[]');
        if (sessions.length === 0) return 0;

        // Sort sessions by date
        sessions.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Check if there's a session today
        const today = sessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === currentDate.getTime();
        });

        if (today.length > 0) {
            streak = 1;
            currentDate.setDate(currentDate.getDate() - 1);

            // Check consecutive days
            for (let i = 1; i < 30; i++) {
                const daySessions = sessions.filter(session => {
                    const sessionDate = new Date(session.startTime);
                    sessionDate.setHours(0, 0, 0, 0);
                    return sessionDate.getTime() === currentDate.getTime();
                });

                if (daySessions.length > 0) {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        return streak;
    }

    // Get next recommended lesson
    async getNextRecommendedLesson() {
        try {
            const levels = await this.getUserLevels();
            const worlds = await this.getWorlds();
            
            // Find the world with the lowest level
            let recommendedWorld = null;
            let lowestLevel = 10;
            
            Object.keys(levels).forEach(world => {
                if (levels[world] < lowestLevel) {
                    lowestLevel = levels[world];
                    recommendedWorld = world;
                }
            });

            if (recommendedWorld) {
                const lessons = await this.loadLessons(recommendedWorld, lowestLevel);
                const incompleteLessons = lessons.filter(lesson => !lesson.isCompleted);
                
                if (incompleteLessons.length > 0) {
                    return {
                        lesson: incompleteLessons[0],
                        world: recommendedWorld,
                        reason: `Continue your ${recommendedWorld} journey`
                    };
                }
            }

            return null;
        } catch (error) {
            console.error('Error getting recommended lesson:', error);
            return null;
        }
    }
}

// Global learning manager instance
const learningManager = new LearningManager();
