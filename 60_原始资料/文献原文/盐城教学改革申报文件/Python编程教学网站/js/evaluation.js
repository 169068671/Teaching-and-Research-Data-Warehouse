/**
 * evaluation.js - 评价激励系统
 * 负责评分、积分、徽章、进度、鼓励、成就等
 */

const EvaluationSystem = {
    // ============================================================
    // 徽章定义（15+个徽章）
    // ============================================================
    badges: [
        {
            id: 'first_run',
            name: '初次运行',
            icon: '🚀',
            description: '第一次运行Python代码',
            condition: (stats) => stats.totalRuns >= 1,
            points: 10
        },
        {
            id: 'ten_runs',
            name: '勤奋练习',
            icon: '⭐',
            description: '运行代码达到10次',
            condition: (stats) => stats.totalRuns >= 10,
            points: 20
        },
        {
            id: 'fifty_runs',
            name: '代码达人',
            icon: '💫',
            description: '运行代码达到50次',
            condition: (stats) => stats.totalRuns >= 50,
            points: 50
        },
        {
            id: 'first_error_fixed',
            name: '除虫新手',
            icon: '🐛',
            description: '第一次修复代码错误',
            condition: (stats) => stats.errorsFixed >= 1,
            points: 10
        },
        {
            id: 'debug_master',
            name: '调试专家',
            icon: '🔧',
            description: '修复10个代码错误',
            condition: (stats) => stats.errorsFixed >= 10,
            points: 30
        },
        {
            id: 'first_exercise',
            name: '初露锋芒',
            icon: '📝',
            description: '完成第一个练习',
            condition: (stats) => stats.exercisesCompleted >= 1,
            points: 15
        },
        {
            id: 'five_exercises',
            name: '练习能手',
            icon: '📚',
            description: '完成5个练习',
            condition: (stats) => stats.exercisesCompleted >= 5,
            points: 25
        },
        {
            id: 'loop_master',
            name: '循环大师',
            icon: '🔄',
            description: '完成所有循环相关课时',
            condition: (stats) => stats.completedLessons.includes(4) && stats.completedLessons.includes(5),
            points: 40
        },
        {
            id: 'function_expert',
            name: '函数达人',
            icon: '⚙️',
            description: '完成所有函数相关课时',
            condition: (stats) => stats.completedLessons.includes(9) && stats.completedLessons.includes(10) && stats.completedLessons.includes(11),
            points: 40
        },
        {
            id: 'data_master',
            name: '数据大师',
            icon: '📊',
            description: '完成所有数据结构课时',
            condition: (stats) => stats.completedLessons.includes(6) && stats.completedLessons.includes(7) && stats.completedLessons.includes(8),
            points: 40
        },
        {
            id: 'algorithm_pro',
            name: '算法高手',
            icon: '🧮',
            description: '完成所有算法课时',
            condition: (stats) => stats.completedLessons.includes(12) && stats.completedLessons.includes(13) && stats.completedLessons.includes(14),
            points: 50
        },
        {
            id: 'three_d_pioneer',
            name: '3D先锋',
            icon: '🧊',
            description: '完成第一个3D建模课时',
            condition: (stats) => stats.completedLessons.includes(15),
            points: 30
        },
        {
            id: 'three_d_master',
            name: '3D建模师',
            icon: '🎨',
            description: '完成所有3D可视化课时',
            condition: (stats) => stats.completedLessons.includes(15) && stats.completedLessons.includes(16) && stats.completedLessons.includes(17),
            points: 60
        },
        {
            id: 'fast_learner',
            name: '速学者',
            icon: '⚡',
            description: '5分钟内完成一个课时',
            condition: (stats) => stats.fastCompletions >= 1,
            points: 25
        },
        {
            id: 'persistent',
            name: '坚持不懈',
            icon: '💪',
            description: '连续3天学习',
            condition: (stats) => stats.consecutiveDays >= 3,
            points: 35
        },
        {
            id: 'perfectionist',
            name: '完美主义',
            icon: '💎',
            description: '一次运行成功（无错误）达到10次',
            condition: (stats) => stats.perfectRuns >= 10,
            points: 45
        },
        {
            id: 'explorer',
            name: '探索者',
            icon: '🧭',
            description: '修改参数超过20次',
            condition: (stats) => stats.parameterChanges >= 20,
            points: 20
        },
        {
            id: 'course_complete',
            name: '课程毕业',
            icon: '🎓',
            description: '完成全部17个课时',
            condition: (stats) => stats.completedLessons.length >= 17,
            points: 100
        }
    ],

    // ============================================================
    // 鼓励语（根据表现分级）
    // ============================================================
    encouragements: {
        excellent: [
            '太棒了！完美执行！',
            '你是编程天才！',
            '代码写得太好了！',
            '继续保持，你是最棒的！',
            '这行代码很优雅！'
        ],
        good: [
            '做得不错！继续加油！',
            '进步很大！',
            '你越来越熟练了！',
            '这个思路很好！',
            '你正在掌握Python！'
        ],
        average: [
            '还行，可以做得更好！',
            '继续练习，你会进步的！',
            '尝试优化一下代码！',
            '思考一下有没有更好的方法？',
            '别灰心，多练几次就好了！'
        ],
        needsWork: [
            '没关系，错误是学习的机会！',
            '再试一次，你可以的！',
            '看看提示，或许有帮助！',
            '每个程序员都从错误中学习！',
            '坚持就是胜利！'
        ]
    },

    // ============================================================
    // 状态数据
    // ============================================================
    stats: null,
    storageKey: 'python_evaluation_stats',

    // ============================================================
    // 初始化
    // ============================================================
    init() {
        this.loadStats();
        this.checkConsecutiveDays();
        console.log('[EvaluationSystem] 评价激励系统初始化完成');
        console.log(`[EvaluationSystem] 当前积分：${this.stats.totalPoints}`);
        console.log(`[EvaluationSystem] 已获得徽章：${this.stats.earnedBadges.length}个`);
    },

    // ============================================================
    // 数据持久化
    // ============================================================

    /**
     * 加载统计数据
     */
    loadStats() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.stats = JSON.parse(saved);
                // 确保所有字段存在
                this.stats = this.mergeDefaultStats(this.stats);
            } else {
                this.stats = this.getDefaultStats();
            }
        } catch (e) {
            console.warn('[EvaluationSystem] 加载统计数据失败:', e);
            this.stats = this.getDefaultStats();
        }
    },

    /**
     * 保存统计数据
     */
    saveStats() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
        } catch (e) {
            console.warn('[EvaluationSystem] 保存统计数据失败:', e);
        }
    },

    /**
     * 获取默认统计数据
     */
    getDefaultStats() {
        return {
            // 代码运行统计
            totalRuns: 0,
            successfulRuns: 0,
            failedRuns: 0,
            perfectRuns: 0,        // 一次运行成功
            // 错误修复统计
            errorsEncountered: 0,
            errorsFixed: 0,
            // 练习完成统计
            exercisesCompleted: 0,
            completedLessons: [],
            // 参数修改统计
            parameterChanges: 0,
            // 快速完成统计
            fastCompletions: 0,
            // 积分
            totalPoints: 0,
            // 徽章
            earnedBadges: [],
            // 星级评定（每个课时）
            lessonStars: {},  // {lessonId: stars(1-5)}
            // 学习记录
            learningDates: [],  // 学习日期列表
            consecutiveDays: 0,
            lastLearningDate: null,
            // 课时开始时间（用于计算完成速度）
            lessonStartTimes: {},  // {lessonId: timestamp}
            // 评分历史
            scoreHistory: []
        };
    },

    /**
     * 合并默认统计数据
     */
    mergeDefaultStats(saved) {
        const defaults = this.getDefaultStats();
        return { ...defaults, ...saved };
    },

    // ============================================================
    // 记录操作
    // ============================================================

    /**
     * 记录用户操作
     * @param {string} actionType - 操作类型
     * @param {number} lessonId - 课时ID
     * @param {Object} data - 附加数据
     */
    recordAction(actionType, lessonId = null, data = {}) {
        if (!this.stats) this.loadStats();

        let pointsEarned = 0;
        let encouragement = '';

        switch (actionType) {
            case 'run_code_success':
                this.stats.totalRuns++;
                this.stats.successfulRuns++;
                pointsEarned = 5;

                // 检查是否一次成功（之前没有失败）
                if (data.firstAttempt) {
                    this.stats.perfectRuns++;
                    pointsEarned += 10;
                    encouragement = this.getRandomEncouragement('excellent');
                } else {
                    encouragement = this.getRandomEncouragement('good');
                }

                // 记录学习日期
                this.recordLearningDate();
                break;

            case 'run_code_error':
                this.stats.totalRuns++;
                this.stats.failedRuns++;
                this.stats.errorsEncountered++;
                pointsEarned = 2; // 尝试也有积分
                encouragement = this.getRandomEncouragement('needsWork');
                break;

            case 'error_fixed':
                this.stats.errorsFixed++;
                pointsEarned = 8;
                encouragement = this.getRandomEncouragement('good');
                break;

            case 'exercise_completed':
                if (!this.stats.completedLessons.includes(lessonId)) {
                    this.stats.completedLessons.push(lessonId);
                    this.stats.exercisesCompleted++;
                    pointsEarned = 20;

                    // 检查完成速度
                    const startTime = this.stats.lessonStartTimes[lessonId];
                    if (startTime) {
                        const duration = Date.now() - startTime;
                        if (duration < 5 * 60 * 1000) { // 5分钟内
                            this.stats.fastCompletions++;
                            pointsEarned += 15;
                        }
                    }

                    // 星级评定
                    const stars = this.calculateStars(lessonId, data);
                    this.stats.lessonStars[lessonId] = stars;

                    encouragement = this.getRandomEncouragement('excellent');
                }
                break;

            case 'parameter_changed':
                this.stats.parameterChanges++;
                pointsEarned = 1;
                encouragement = this.getRandomEncouragement('average');
                break;

            case 'reset_code':
                pointsEarned = 1;
                encouragement = '重新开始也是一种策略！';
                break;

            case 'lesson_started':
                this.stats.lessonStartTimes[lessonId] = Date.now();
                pointsEarned = 0;
                break;

            case 'hint_used':
                pointsEarned = 1;
                encouragement = '善用提示是聪明的做法！';
                break;

            case 'code_formatted':
                pointsEarned = 2;
                encouragement = '保持代码整洁是好习惯！';
                break;

            default:
                pointsEarned = 1;
        }

        // 增加积分
        this.stats.totalPoints += pointsEarned;

        // 记录评分历史
        this.stats.scoreHistory.push({
            action: actionType,
            lessonId: lessonId,
            points: pointsEarned,
            timestamp: Date.now()
        });

        // 只保留最近100条
        if (this.stats.scoreHistory.length > 100) {
            this.stats.scoreHistory = this.stats.scoreHistory.slice(-100);
        }

        // 保存
        this.saveStats();

        // 检查徽章解锁
        this.checkBadges();

        // 显示鼓励
        if (encouragement) {
            this.showEncouragement(encouragement, pointsEarned);
        }

        return { pointsEarned, encouragement };
    },

    // ============================================================
    // 星级评定
    // ============================================================

    /**
     * 计算星级（1-5星）
     */
    calculateStars(lessonId, data = {}) {
        let stars = 3; // 默认3星

        // 根据完成速度
        const startTime = this.stats.lessonStartTimes[lessonId];
        if (startTime) {
            const duration = Date.now() - startTime;
            if (duration < 3 * 60 * 1000) stars += 2;      // 3分钟内：+2星
            else if (duration < 10 * 60 * 1000) stars += 1; // 10分钟内：+1星
        }

        // 根据错误次数（越少星越多）
        // 这里简化处理，实际可以根据data中的错误次数计算
        if (data.errorCount === 0) stars += 1;
        else if (data.errorCount > 5) stars -= 1;

        // 限制在1-5星
        stars = Math.max(1, Math.min(5, stars));

        return stars;
    },

    /**
     * 获取课时星级
     */
    getLessonStars(lessonId) {
        return this.stats.lessonStars[lessonId] || 0;
    },

    /**
     * 获取平均星级
     */
    getAverageStars() {
        const stars = Object.values(this.stats.lessonStars);
        if (stars.length === 0) return 0;
        const sum = stars.reduce((a, b) => a + b, 0);
        return (sum / stars.length).toFixed(1);
    },

    // ============================================================
    // 徽章系统
    // ============================================================

    /**
     * 检查徽章解锁
     */
    checkBadges() {
        const newlyEarned = [];

        this.badges.forEach(badge => {
            // 已经获得则跳过
            if (this.stats.earnedBadges.includes(badge.id)) return;

            // 检查条件
            if (badge.condition(this.stats)) {
                this.stats.earnedBadges.push(badge.id);
                this.stats.totalPoints += badge.points;
                newlyEarned.push(badge);
            }
        });

        // 如果有新徽章，显示成就弹窗
        if (newlyEarned.length > 0) {
            this.saveStats();
            newlyEarned.forEach((badge, index) => {
                setTimeout(() => {
                    this.showBadgePopup(badge);
                }, index * 1500); // 依次弹出
            });
        }
    },

    /**
     * 显示徽章解锁弹窗
     */
    showBadgePopup(badge) {
        // 创建弹窗
        const popup = document.createElement('div');
        popup.className = 'badge-popup';
        popup.innerHTML = `
            <div class="badge-popup-content">
                <div class="badge-popup-confetti">🎉🎊✨🎈</div>
                <div class="badge-popup-icon animate-bounce">${badge.icon}</div>
                <div class="badge-popup-title">恭喜解锁新徽章！</div>
                <div class="badge-popup-name">${badge.name}</div>
                <div class="badge-popup-desc">${badge.description}</div>
                <div class="badge-popup-points">+${badge.points} 积分</div>
                <button class="badge-popup-btn" onclick="this.parentElement.parentElement.remove()">
                    太棒了！
                </button>
            </div>
        `;
        document.body.appendChild(popup);

        // 播放音效（如果启用）
        this.playSound('achievement');

        // 5秒后自动关闭
        setTimeout(() => {
            if (popup.parentElement) {
                popup.classList.add('fade-out');
                setTimeout(() => popup.remove(), 500);
            }
        }, 5000);
    },

    /**
     * 获取所有徽章
     */
    getAllBadges() {
        return this.badges;
    },

    /**
     * 获取已获得的徽章
     */
    getEarnedBadges() {
        return this.stats.earnedBadges;
    },

    // ============================================================
    // 鼓励系统
    // ============================================================

    /**
     * 获取随机鼓励语
     */
    getRandomEncouragement(level = 'good') {
        const encouragements = this.encouragements[level] || this.encouragements.good;
        return encouragements[Math.floor(Math.random() * encouragements.length)];
    },

    /**
     * 显示鼓励气泡
     */
    showEncouragement(message, points = 0) {
        // 创建鼓励气泡
        const bubble = document.createElement('div');
        bubble.className = 'encouragement-bubble animate-pop-in';
        bubble.innerHTML = `
            <div class="encouragement-text">${message}</div>
            ${points > 0 ? `<div class="encouragement-points">+${points} 积分</div>` : ''}
        `;

        // 添加到页面
        const container = document.getElementById('encouragement-container');
        if (container) {
            container.appendChild(bubble);
        } else {
            // 创建容器
            const newContainer = document.createElement('div');
            newContainer.id = 'encouragement-container';
            newContainer.className = 'encouragement-container';
            document.body.appendChild(newContainer);
            newContainer.appendChild(bubble);
        }

        // 3秒后移除
        setTimeout(() => {
            bubble.classList.add('animate-pop-out');
            setTimeout(() => bubble.remove(), 300);
        }, 3000);
    },

    // ============================================================
    // 学习日期统计
    // ============================================================

    /**
     * 记录学习日期
     */
    recordLearningDate() {
        const today = new Date().toDateString();

        if (!this.stats.learningDates.includes(today)) {
            this.stats.learningDates.push(today);

            // 只保留最近30天
            if (this.stats.learningDates.length > 30) {
                this.stats.learningDates = this.stats.learningDates.slice(-30);
            }

            // 检查连续天数
            this.checkConsecutiveDays();
        }
    },

    /**
     * 检查连续学习天数
     */
    checkConsecutiveDays() {
        const today = new Date();
        let consecutive = 0;

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toDateString();

            if (this.stats.learningDates.includes(dateStr)) {
                consecutive++;
            } else {
                break;
            }
        }

        this.stats.consecutiveDays = consecutive;
        this.stats.lastLearningDate = today.toDateString();
        this.saveStats();
    },

    // ============================================================
    // 进度计算
    // ============================================================

    /**
     * 获取完成进度百分比
     */
    getProgressPercent() {
        if (typeof LESSONS_DATA === 'undefined') return 0;
        const total = LESSONS_DATA.length;
        const completed = this.stats.completedLessons.length;
        return Math.round((completed / total) * 100);
    },

    /**
     * 获取已完成的课时列表
     */
    getCompletedLessons() {
        return this.stats.completedLessons;
    },

    /**
     * 检查课时是否完成
     */
    isLessonCompleted(lessonId) {
        return this.stats.completedLessons.includes(lessonId);
    },

    // ============================================================
    // 评分维度
    // ============================================================

    /**
     * 评价代码
     * @param {string} code - 代码内容
     * @param {boolean} success - 是否运行成功
     * @param {Object} options - 附加选项
     * @returns {Object} 评分结果
     */
    evaluateCode(code, success, options = {}) {
        const dimensions = {
            correctness: 0,      // 代码正确性
            style: 0,            // 代码规范性
            innovation: 0,       // 创新性
            speed: 0             // 完成速度
        };

        // 1. 正确性评分（0-100）
        if (success) {
            dimensions.correctness = 100;
            if (options.errorCount > 0) {
                dimensions.correctness -= Math.min(options.errorCount * 10, 50);
            }
        } else {
            dimensions.correctness = 30;
        }

        // 2. 规范性评分（0-100）
        dimensions.style = this.evaluateCodeStyle(code);

        // 3. 创新性评分（0-100）
        dimensions.innovation = this.evaluateInnovation(code, options);

        // 4. 完成速度评分（0-100）
        if (options.duration) {
            if (options.duration < 3 * 60 * 1000) dimensions.speed = 100;
            else if (options.duration < 10 * 60 * 1000) dimensions.speed = 80;
            else if (options.duration < 20 * 60 * 1000) dimensions.speed = 60;
            else dimensions.speed = 40;
        } else {
            dimensions.speed = 70;
        }

        // 总分
        const totalScore = Math.round(
            dimensions.correctness * 0.4 +
            dimensions.style * 0.2 +
            dimensions.innovation * 0.2 +
            dimensions.speed * 0.2
        );

        return {
            dimensions: dimensions,
            totalScore: totalScore,
            stars: this.scoreToStars(totalScore)
        };
    },

    /**
     * 评价代码规范性
     */
    evaluateCodeStyle(code) {
        let score = 100;
        const lines = code.split('\n');

        // 检查注释
        const hasComments = lines.some(line => line.trim().startsWith('#'));
        if (!hasComments) score -= 10;

        // 检查命名规范
        const variables = code.match(/\b[a-z_]\w*\s*=/gi) || [];
        const badNames = variables.filter(v => {
            const name = v.match(/\b(\w+)/)[1];
            return name.length === 1 && name !== 'i' && name !== 'j' && name !== 'k';
        });
        if (badNames.length > 0) score -= 10;

        // 检查行长度
        const longLines = lines.filter(line => line.length > 80);
        if (longLines.length > 0) score -= 5;

        // 检查空行
        if (lines.length > 10) {
            const hasBlankLines = lines.some((line, i) =>
                i > 0 && line.trim() === '' && lines[i - 1].trim() !== ''
            );
            if (!hasBlankLines) score -= 5;
        }

        return Math.max(0, score);
    },

    /**
     * 评价创新性
     */
    evaluateInnovation(code, options) {
        let score = 60; // 基础分

        // 使用了函数
        if (code.includes('def ')) score += 15;

        // 使用了循环
        if (code.includes('for ') || code.includes('while ')) score += 10;

        // 使用了条件
        if (code.includes('if ')) score += 5;

        // 使用了列表推导式
        if (code.match(/\[.*\sfor\s.*\sin\s.*\]/)) score += 10;

        // 使用了f-string
        if (code.includes("f'") || code.includes('f"')) score += 5;

        // 使用了模块
        if (code.includes('import ')) score += 10;

        // 参数修改（探索性）
        if (options.parameterChanges && options.parameterChanges > 3) score += 10;

        return Math.min(100, score);
    },

    /**
     * 分数转星级
     */
    scoreToStars(score) {
        if (score >= 90) return 5;
        if (score >= 75) return 4;
        if (score >= 60) return 3;
        if (score >= 40) return 2;
        return 1;
    },

    // ============================================================
    // 统计信息
    // ============================================================

    /**
     * 获取统计数据
     */
    getStats() {
        return {
            totalRuns: this.stats.totalRuns,
            successfulRuns: this.stats.successfulRuns,
            failedRuns: this.stats.failedRuns,
            perfectRuns: this.stats.perfectRuns,
            errorsFixed: this.stats.errorsFixed,
            exercisesCompleted: this.stats.exercisesCompleted,
            completedLessons: this.stats.completedLessons,
            totalPoints: this.stats.totalPoints,
            earnedBadges: this.stats.earnedBadges,
            consecutiveDays: this.stats.consecutiveDays,
            averageStars: this.getAverageStars(),
            progressPercent: this.getProgressPercent(),
            parameterChanges: this.stats.parameterChanges
        };
    },

    /**
     * 获取学习统计摘要
     */
    getSummary() {
        const stats = this.getStats();
        const accuracy = stats.totalRuns > 0
            ? Math.round((stats.successfulRuns / stats.totalRuns) * 100)
            : 0;

        return {
            总运行次数: stats.totalRuns,
            成功率: accuracy + '%',
            解决错误: stats.errorsFixed,
            完成练习: stats.exercisesCompleted,
            累计积分: stats.totalPoints,
            获得徽章: stats.earnedBadges.length,
            连续学习: stats.consecutiveDays + '天',
            平均星级: stats.averageStars + '星',
            课程进度: stats.progressPercent + '%'
        };
    },

    // ============================================================
    // 音效
    // ============================================================

    /**
     * 播放音效
     */
    playSound(type) {
        // 检查是否启用音效
        if (typeof AppState !== 'undefined' && !AppState.preferences.soundEnabled) {
            return;
        }

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            switch (type) {
                case 'achievement':
                    // 成就音效：上升音阶
                    this.playTone(audioContext, 523.25, 0, 0.1); // C5
                    this.playTone(audioContext, 659.25, 0.1, 0.1); // E5
                    this.playTone(audioContext, 783.99, 0.2, 0.2); // G5
                    this.playTone(audioContext, 1046.50, 0.4, 0.3); // C6
                    break;
                case 'success':
                    this.playTone(audioContext, 659.25, 0, 0.15); // E5
                    this.playTone(audioContext, 783.99, 0.15, 0.2); // G5
                    break;
                case 'error':
                    this.playTone(audioContext, 311.13, 0, 0.3); // Eb4
                    break;
            }
        } catch (e) {
            // 音频不可用时忽略
        }
    },

    /**
     * 播放单个音调
     */
    playTone(audioContext, frequency, startTime, duration) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + startTime + duration);

        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
    },

    // ============================================================
    // 重置
    // ============================================================

    /**
     * 重置所有进度（需确认）
     */
    reset() {
        if (confirm('确定要重置所有学习进度吗？此操作不可撤销！')) {
            this.stats = this.getDefaultStats();
            this.saveStats();
            if (typeof showToast === 'function') {
                showToast('学习进度已重置', 'info');
            }
        }
    }
};

// ============================================================
// 导出模块
// ============================================================
window.EvaluationSystem = EvaluationSystem;
