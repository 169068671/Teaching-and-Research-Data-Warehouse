/**
 * quiz-system.js - 题库与考试系统
 * 功能：
 *   教师端：创建/编辑/删除题目、组卷发布考试、查看成绩统计
 *   学生端：查看考试列表、答题、查看成绩与解析
 * 考试类型：课堂练习、单元练习、期中考试、期末考试
 * 题型：选择题、填空题、判断题、编程题
 */

const QuizSystem = {
    // 存储键
    QUESTIONS_KEY: 'pycraft_quiz_questions',
    EXAMS_KEY: 'pycraft_exams',
    RESULTS_KEY: 'pycraft_exam_results',

    // 考试类型
    examTypes: {
        'classroom':  { label: '课堂练习', icon: '📝', color: '#58a6ff' },
        'unit':       { label: '单元练习', icon: '📚', color: '#3fb950' },
        'midterm':    { label: '期中考试', icon: '🎯', color: '#d29922' },
        'final':      { label: '期末考试', icon: '🏆', color: '#f78166' }
    },

    // 题型
    questionTypes: {
        'choice':   { label: '选择题', icon: '🔘' },
        'fill':     { label: '填空题', icon: '✏️' },
        'judge':    { label: '判断题', icon: '✅' },
        'coding':   { label: '编程题', icon: '💻' }
    },

    // ============================================================
    // 初始化
    // ============================================================
    init() {
        this.initDefaultQuestions();
        console.log('[QuizSystem] 题库系统初始化完成');
        console.log(`[QuizSystem] 题目数量: ${this.getAllQuestions().length}`);
    },

    // ============================================================
    // 数据层 - 题目管理
    // ============================================================

    /**
     * 初始化默认题库（内置30道题覆盖各模块）
     */
    initDefaultQuestions() {
        const existing = this.getAllQuestions();
        if (existing.length > 0) return;

        const defaults = this.getDefaultQuestions();
        this.saveQuestions(defaults);
    },

    /**
     * 内置题库
     */
    getDefaultQuestions() {
        return [
            // ---- 模块一：Python入门 ----
            {
                id: 'q_001', module: 1, type: 'choice', difficulty: 1,
                question: '在Python中，以下哪个是合法的变量名？',
                options: ['2name', 'name_2', 'class', 'my-name'],
                answer: 'B',
                explanation: '变量名不能以数字开头，不能使用关键字，不能包含连字符。',
                tags: ['变量', '命名规则'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_002', module: 1, type: 'choice', difficulty: 1,
                question: '执行 print(type(3.14)) 的输出结果是？',
                options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'bool'>"],
                answer: 'B',
                explanation: '3.14 是浮点数，类型为 float。',
                tags: ['数据类型', 'type()'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_003', module: 1, type: 'fill', difficulty: 1,
                question: '将字符串 "123" 转换为整数的函数是 ____()。',
                answer: 'int',
                explanation: 'int() 函数可以将字符串转换为整数，如 int("123") 返回 123。',
                tags: ['类型转换', 'int()'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_004', module: 1, type: 'judge', difficulty: 1,
                question: '在Python中，变量名区分大小写，Name和name是不同的变量。',
                answer: '对',
                explanation: 'Python变量名严格区分大小写，Name和name是两个不同的变量。',
                tags: ['变量', '命名规则'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_005', module: 1, type: 'coding', difficulty: 2,
                question: '编写Python代码：定义变量name存储你的姓名，age存储你的年龄，然后使用f-string输出"我叫XX，今年X岁"。',
                starterCode: '# 在此编写代码\n',
                expectedOutput: '我叫张三，今年18岁',
                answer: 'name = "张三"\nage = 18\nprint(f"我叫{name}，今年{age}岁")',
                explanation: '使用f-string格式化输出，在字符串前加f，用{}嵌入变量。',
                tags: ['变量', 'f-string', 'print'],
                createdAt: new Date().toISOString()
            },

            // ---- 模块二：控制结构 ----
            {
                id: 'q_006', module: 2, type: 'choice', difficulty: 2,
                question: '以下代码的输出是什么？\n```\nx = 5\nif x > 3:\n    print("A")\nelif x > 4:\n    print("B")\nelse:\n    print("C")\n```',
                options: ['A', 'B', 'C', 'AB'],
                answer: 'A',
                explanation: 'x=5满足第一个条件x>3，执行print("A")后不再检查elif。',
                tags: ['if-elif-else', '条件判断'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_007', module: 2, type: 'choice', difficulty: 2,
                question: 'range(1, 10, 2) 生成的数字序列是？',
                options: ['1,3,5,7,9', '1,2,3,4,5', '2,4,6,8,10', '1,3,5,7,9,10'],
                answer: 'A',
                explanation: 'range(起始, 结束, 步长)，包含起始不包含结束，步长为2。',
                tags: ['range', 'for循环'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_008', module: 2, type: 'fill', difficulty: 2,
                question: '在循环中使用 ____ 语句可以跳出当前循环。',
                answer: 'break',
                explanation: 'break语句用于跳出当前整个循环，continue用于跳过本次循环。',
                tags: ['break', '循环控制'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_009', module: 2, type: 'judge', difficulty: 2,
                question: 'while循环的条件为True时，如果没有break语句，会形成无限循环。',
                answer: '对',
                explanation: 'while True如果没有break或其他跳出机制，确实是无限循环（死循环）。',
                tags: ['while', '死循环'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_010', module: 2, type: 'coding', difficulty: 3,
                question: '编写代码：使用for循环和range输出1到100之间所有3的倍数。',
                starterCode: '# 在此编写代码\n',
                expectedOutput: '3\n6\n9\n12\n...',
                answer: 'for i in range(3, 101, 3):\n    print(i)',
                explanation: '使用range(3, 101, 3)直接生成3的倍数序列，步长为3。',
                tags: ['for循环', 'range', '倍数'],
                createdAt: new Date().toISOString()
            },

            // ---- 模块三：数据结构 ----
            {
                id: 'q_011', module: 3, type: 'choice', difficulty: 2,
                question: '以下代码的输出是什么？\n```\nnums = [1, 2, 3, 4, 5]\nprint(nums[1:3])\n```',
                options: ['[1, 2]', '[2, 3]', '[1, 2, 3]', '[2, 3, 4]'],
                answer: 'B',
                explanation: '切片[1:3]表示从索引1开始到索引3之前（不含3），即nums[1]和nums[2]。',
                tags: ['列表', '切片'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_012', module: 3, type: 'choice', difficulty: 2,
                question: '以下哪个方法可以在列表末尾添加一个元素？',
                options: ['insert()', 'add()', 'append()', 'push()'],
                answer: 'C',
                explanation: 'append()方法在列表末尾添加一个元素，insert()在指定位置插入。',
                tags: ['列表', 'append()'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_013', module: 3, type: 'fill', difficulty: 2,
                question: '获取列表nums的长度的函数是 ____()。',
                answer: 'len',
                explanation: 'len()函数返回列表（或字符串、元组等）的长度。',
                tags: ['列表', 'len()'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_014', module: 3, type: 'judge', difficulty: 2,
                question: '字典中的键必须是不可变类型（如字符串、数字、元组），列表不能作为字典的键。',
                answer: '对',
                explanation: '字典的键必须是可哈希的（不可变类型），列表是可变的，不能作为键。',
                tags: ['字典', '键'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_015', module: 3, type: 'coding', difficulty: 3,
                question: '编写代码：创建一个字典存储学生信息（姓名：张三，年龄：18，班级：高一1班），然后遍历输出所有键值对。',
                starterCode: '# 在此编写代码\n',
                expectedOutput: '姓名 张三\n年龄 18\n班级 高一1班',
                answer: 'student = {"姓名": "张三", "年龄": 18, "班级": "高一1班"}\nfor key, value in student.items():\n    print(key, value)',
                explanation: '使用dict.items()方法可以同时获取键和值进行遍历。',
                tags: ['字典', '遍历', 'items()'],
                createdAt: new Date().toISOString()
            },

            // ---- 模块四：函数 ----
            {
                id: 'q_016', module: 4, type: 'choice', difficulty: 2,
                question: '定义函数使用的关键字是？',
                options: ['function', 'def', 'func', 'define'],
                answer: 'B',
                explanation: 'Python使用def关键字定义函数，如 def greet(name):。',
                tags: ['函数', 'def'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_017', module: 4, type: 'choice', difficulty: 3,
                question: '以下代码的输出是什么？\n```\ndef f(a, b=2):\n    return a + b\nprint(f(3))\n```',
                options: ['3', '5', '2', '报错'],
                answer: 'B',
                explanation: 'b有默认值2，调用f(3)时a=3，b使用默认值2，结果为3+2=5。',
                tags: ['函数', '默认参数'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_018', module: 4, type: 'fill', difficulty: 2,
                question: '函数中用于返回结果的语句是 ____。',
                answer: 'return',
                explanation: 'return语句将函数的计算结果返回给调用者，没有return则返回None。',
                tags: ['函数', 'return'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_019', module: 4, type: 'judge', difficulty: 2,
                question: '一个函数可以有多个return语句，但执行到第一个return后会立即退出函数。',
                answer: '对',
                explanation: '函数执行到return语句就立即返回并退出，后续代码不再执行。',
                tags: ['函数', 'return'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_020', module: 4, type: 'coding', difficulty: 3,
                question: '编写一个函数is_even(n)，判断n是否为偶数，返回True或False。然后调用print(is_even(6))输出结果。',
                starterCode: '# 在此编写代码\n',
                expectedOutput: 'True',
                answer: 'def is_even(n):\n    return n % 2 == 0\n\nprint(is_even(6))',
                explanation: '使用取余运算n%2==0判断偶数，返回布尔值。',
                tags: ['函数', '判断', '取余'],
                createdAt: new Date().toISOString()
            },

            // ---- 模块五：算法 ----
            {
                id: 'q_021', module: 5, type: 'choice', difficulty: 3,
                question: '计算1+2+3+...+100的累加结果，以下哪种方法效率最高？',
                options: ['for循环累加', 'while循环累加', 'sum(range(1,101))', '递归'],
                answer: 'C',
                explanation: 'sum(range(1,101))利用内置函数，底层用C实现，效率最高。',
                tags: ['累加', 'sum()', '算法效率'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_022', module: 5, type: 'choice', difficulty: 3,
                question: '冒泡排序中，如果有n个元素，最多需要比较多少轮？',
                options: ['n', 'n-1', 'n*n', 'n+1'],
                answer: 'B',
                explanation: '冒泡排序最多需要n-1轮比较，每轮将最大的元素冒泡到末尾。',
                tags: ['冒泡排序', '排序算法'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_023', module: 5, type: 'fill', difficulty: 3,
                question: '5的阶乘5! = ____。',
                answer: '120',
                explanation: '5! = 1×2×3×4×5 = 120。累乘的初始值应设为1。',
                tags: ['阶乘', '累乘'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_024', module: 5, type: 'judge', difficulty: 3,
                question: '穷举法（枚举法）适合解决所有规模的问题，效率不受影响。',
                answer: '错',
                explanation: '穷举法简单但效率低，数据规模大时耗时很长，不适合大规模问题。',
                tags: ['穷举法', '算法效率'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_025', module: 5, type: 'coding', difficulty: 4,
                question: '编写代码：使用for循环计算1到100所有偶数的和，输出结果。',
                starterCode: '# 在此编写代码\n',
                expectedOutput: '2550',
                answer: 'total = 0\nfor i in range(2, 101, 2):\n    total += i\nprint(total)',
                explanation: '使用range(2, 101, 2)生成偶数序列，累加得到2550。',
                tags: ['累加', '偶数', '循环'],
                createdAt: new Date().toISOString()
            },

            // ---- 模块六：3D可视化 ----
            {
                id: 'q_026', module: 6, type: 'choice', difficulty: 2,
                question: '参数化建模的核心思想是什么？',
                options: ['用固定数值定义模型', '用变量参数控制模型形状', '只能使用一种建模方式', '模型不能修改'],
                answer: 'B',
                explanation: '参数化建模通过变量参数控制模型，修改参数即可更新模型，类似FreeCAD的设计思路。',
                tags: ['参数化建模', '3D可视化'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_027', module: 6, type: 'choice', difficulty: 3,
                question: '在3D可视化中，Three.js主要用于做什么？',
                options: ['后端数据处理', '浏览器中渲染3D图形', '数据库管理', '网络通信'],
                answer: 'B',
                explanation: 'Three.js是一个JavaScript 3D库，用于在浏览器中创建和渲染3D场景。',
                tags: ['Three.js', '3D渲染'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_028', module: 6, type: 'fill', difficulty: 2,
                question: '在三维坐标系中，x轴通常表示 ____ 方向。',
                answer: '水平',
                explanation: '在标准三维坐标系中，x轴表示水平方向，y轴表示垂直方向，z轴表示深度方向。',
                tags: ['三维坐标', '坐标系'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_029', module: 6, type: 'judge', difficulty: 2,
                question: '3D可视化可以帮助学生更直观地理解数学函数和几何体的空间关系。',
                answer: '对',
                explanation: '3D可视化将抽象数据转化为直观图形，有助于理解空间关系和函数变化。',
                tags: ['3D可视化', '教学应用'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'q_030', module: 6, type: 'coding', difficulty: 4,
                question: '编写代码：定义函数create_box(w, h, d)，输出一个长方体的体积。然后调用create_box(3, 4, 5)输出结果。',
                starterCode: '# 在此编写代码\n',
                expectedOutput: '60',
                answer: 'def create_box(w, h, d):\n    volume = w * h * d\n    return volume\n\nprint(create_box(3, 4, 5))',
                explanation: '长方体体积=长×宽×高，参数化函数接收三个维度参数计算体积。',
                tags: ['参数化', '函数', '体积计算'],
                createdAt: new Date().toISOString()
            }
        ];
    },

    /**
     * 获取所有题目
     */
    getAllQuestions() {
        try {
            const saved = localStorage.getItem(this.QUESTIONS_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn('[QuizSystem] 获取题目失败:', e);
        }
        return [];
    },

    /**
     * 保存题目列表
     */
    saveQuestions(questions) {
        try {
            localStorage.setItem(this.QUESTIONS_KEY, JSON.stringify(questions));
            return true;
        } catch (e) {
            console.warn('[QuizSystem] 保存题目失败:', e);
            return false;
        }
    },

    /**
     * 添加题目
     */
    addQuestion(question) {
        const questions = this.getAllQuestions();
        question.id = 'q_' + Date.now();
        question.createdAt = new Date().toISOString();
        questions.push(question);
        this.saveQuestions(questions);
        return question;
    },

    /**
     * 更新题目
     */
    updateQuestion(id, updates) {
        const questions = this.getAllQuestions();
        const index = questions.findIndex(q => q.id === id);
        if (index !== -1) {
            questions[index] = { ...questions[index], ...updates };
            this.saveQuestions(questions);
            return true;
        }
        return false;
    },

    /**
     * 删除题目
     */
    deleteQuestion(id) {
        const questions = this.getAllQuestions();
        const filtered = questions.filter(q => q.id !== id);
        this.saveQuestions(filtered);
        return questions.length !== filtered.length;
    },

    /**
     * 按模块筛选题目
     */
    getQuestionsByModule(module) {
        return this.getAllQuestions().filter(q => q.module === module);
    },

    /**
     * 按题型筛选题目
     */
    getQuestionsByType(type) {
        return this.getAllQuestions().filter(q => q.type === type);
    },

    // ============================================================
    // 数据层 - 考试管理
    // ============================================================

    /**
     * 获取所有考试
     */
    getAllExams() {
        try {
            const saved = localStorage.getItem(this.EXAMS_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn('[QuizSystem] 获取考试失败:', e);
        }
        return [];
    },

    /**
     * 保存考试列表
     */
    saveExams(exams) {
        try {
            localStorage.setItem(this.EXAMS_KEY, JSON.stringify(exams));
            return true;
        } catch (e) {
            console.warn('[QuizSystem] 保存考试失败:', e);
            return false;
        }
    },

    /**
     * 创建考试
     */
    createExam(examData) {
        const exams = this.getAllExams();
        const exam = {
            id: 'exam_' + Date.now(),
            title: examData.title,
            type: examData.type,           // classroom / unit / midterm / final
            module: examData.module || 0,   // 关联模块（0=综合）
            questionIds: examData.questionIds || [],
            duration: examData.duration || 45, // 考试时长（分钟）
            totalScore: examData.totalScore || 100,
            passingScore: examData.passingScore || 60,
            status: 'draft',                // draft / published / closed
            createdAt: new Date().toISOString(),
            publishedAt: null,
            createdBy: examData.createdBy || '未知'
        };
        exams.push(exam);
        this.saveExams(exams);
        return exam;
    },

    /**
     * 更新考试
     */
    updateExam(id, updates) {
        const exams = this.getAllExams();
        const index = exams.findIndex(e => e.id === id);
        if (index !== -1) {
            exams[index] = { ...exams[index], ...updates };
            this.saveExams(exams);
            return true;
        }
        return false;
    },

    /**
     * 删除考试
     */
    deleteExam(id) {
        const exams = this.getAllExams();
        const filtered = exams.filter(e => e.id !== id);
        this.saveExams(filtered);
        return exams.length !== filtered.length;
    },

    /**
     * 发布考试
     */
    publishExam(id) {
        return this.updateExam(id, {
            status: 'published',
            publishedAt: new Date().toISOString()
        });
    },

    /**
     * 关闭考试
     */
    closeExam(id) {
        return this.updateExam(id, { status: 'closed' });
    },

    /**
     * 获取已发布的考试（学生可见）
     */
    getPublishedExams() {
        return this.getAllExams().filter(e => e.status === 'published');
    },

    /**
     * 获取考试详情（含题目）
     */
    getExamWithQuestions(examId) {
        const exam = this.getAllExams().find(e => e.id === examId);
        if (!exam) return null;
        const allQuestions = this.getAllQuestions();
        exam.questions = exam.questionIds.map(qid => allQuestions.find(q => q.id === qid)).filter(Boolean);
        return exam;
    },

    // ============================================================
    // 数据层 - 成绩管理
    // ============================================================

    /**
     * 获取所有成绩
     */
    getAllResults() {
        try {
            const saved = localStorage.getItem(this.RESULTS_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn('[QuizSystem] 获取成绩失败:', e);
        }
        return [];
    },

    /**
     * 保存成绩
     */
    saveResult(result) {
        const results = this.getAllResults();
        result.id = 'result_' + Date.now();
        result.submittedAt = new Date().toISOString();
        results.push(result);
        try {
            localStorage.setItem(this.RESULTS_KEY, JSON.stringify(results));
        } catch (e) {
            console.warn('[QuizSystem] 保存成绩失败:', e);
        }
        return result;
    },

    /**
     * 获取某次考试的所有成绩
     */
    getResultsByExam(examId) {
        return this.getAllResults().filter(r => r.examId === examId);
    },

    /**
     * 获取某学生的所有成绩
     */
    getResultsByStudent(studentUsername) {
        return this.getAllResults().filter(r => r.studentUsername === studentUsername);
    },

    // ============================================================
    // 自动判分
    // ============================================================

    /**
     * 判断一道题的答案是否正确
     */
    gradeQuestion(question, studentAnswer) {
        if (!question || !studentAnswer) return false;

        switch (question.type) {
            case 'choice':
                return studentAnswer.toUpperCase() === question.answer.toUpperCase();

            case 'judge':
                const normalized = String(studentAnswer).trim();
                return normalized === question.answer;

            case 'fill':
                const filled = String(studentAnswer).trim().toLowerCase();
                return filled === String(question.answer).trim().toLowerCase();

            case 'coding':
                // 编程题：比较输出或代码逻辑（简化版：比较预期输出）
                if (question.expectedOutput) {
                    return String(studentAnswer).trim() === String(question.expectedOutput).trim();
                }
                // 如果没有预期输出，比较代码相似度（简化处理）
                return false;

            default:
                return false;
        }
    },

    /**
     * 批改整份试卷
     */
    gradeExam(exam, answers) {
        let correctCount = 0;
        let totalQuestions = exam.questions.length;
        const details = [];

        exam.questions.forEach((question, index) => {
            const studentAnswer = answers[index] || '';
            const isCorrect = this.gradeQuestion(question, studentAnswer);
            if (isCorrect) correctCount++;
            details.push({
                questionId: question.id,
                question: question.question,
                studentAnswer: studentAnswer,
                correctAnswer: question.answer,
                isCorrect: isCorrect,
                explanation: question.explanation || ''
            });
        });

        const score = Math.round((correctCount / totalQuestions) * exam.totalScore);
        const passed = score >= exam.passingScore;

        return {
            correctCount,
            totalQuestions,
            score,
            totalScore: exam.totalScore,
            passed,
            details: details
        };
    },

    // ============================================================
    // 教师端 UI 渲染
    // ============================================================

    /**
     * 渲染教师题库管理面板（嵌入到管理后台选项卡中）
     */
    renderTeacherPanel() {
        return `
            <div class="tab-pane" id="tab-quiz" style="display:none;">
                <div class="quiz-section">
                    <h2>题库与考试管理</h2>

                    <!-- 子选项卡 -->
                    <div class="quiz-sub-tabs">
                        <button class="quiz-sub-tab active" data-subtab="questions">📋 题库管理</button>
                        <button class="quiz-sub-tab" data-subtab="exams">📝 考试管理</button>
                        <button class="quiz-sub-tab" data-subtab="results">📊 成绩统计</button>
                    </div>

                    <!-- 题库管理 -->
                    <div class="quiz-sub-pane active" id="quiz-sub-questions">
                        <div class="quiz-toolbar">
                            <div class="quiz-filter-bar">
                                <select id="quiz-filter-module" class="quiz-select">
                                    <option value="0">全部模块</option>
                                    <option value="1">模块一：Python入门</option>
                                    <option value="2">模块二：控制结构</option>
                                    <option value="3">模块三：数据结构</option>
                                    <option value="4">模块四：函数</option>
                                    <option value="5">模块五：算法</option>
                                    <option value="6">模块六：3D可视化</option>
                                </select>
                                <select id="quiz-filter-type" class="quiz-select">
                                    <option value="">全部题型</option>
                                    <option value="choice">选择题</option>
                                    <option value="fill">填空题</option>
                                    <option value="judge">判断题</option>
                                    <option value="coding">编程题</option>
                                </select>
                                <input type="text" id="quiz-search" class="quiz-search-input" placeholder="搜索题目...">
                            </div>
                            <button class="btn btn-primary" id="btn-add-question">➕ 新增题目</button>
                        </div>
                        <div class="quiz-table-wrapper">
                            <table class="quiz-table" id="quiz-table">
                                <thead>
                                    <tr>
                                        <th><input type="checkbox" id="quiz-select-all"></th>
                                        <th>题目</th>
                                        <th>模块</th>
                                        <th>题型</th>
                                        <th>难度</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody id="quiz-table-body"></tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 考试管理 -->
                    <div class="quiz-sub-pane" id="quiz-sub-exams" style="display:none;">
                        <div class="quiz-toolbar">
                            <h3>考试列表</h3>
                            <button class="btn btn-primary" id="btn-create-exam">➕ 创建考试</button>
                        </div>
                        <div id="exam-list-container"></div>
                    </div>

                    <!-- 成绩统计 -->
                    <div class="quiz-sub-pane" id="quiz-sub-results" style="display:none;">
                        <div class="quiz-toolbar">
                            <h3>成绩统计</h3>
                            <select id="results-filter-exam" class="quiz-select">
                                <option value="">选择考试</option>
                            </select>
                        </div>
                        <div id="results-container"></div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 渲染题目表格
     */
    renderQuestionTable(filterModule = 0, filterType = '', searchQuery = '') {
        const tbody = document.getElementById('quiz-table-body');
        if (!tbody) return;

        let questions = this.getAllQuestions();

        // 筛选
        if (filterModule > 0) {
            questions = questions.filter(q => q.module === filterModule);
        }
        if (filterType) {
            questions = questions.filter(q => q.type === filterType);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            questions = questions.filter(q =>
                q.question.toLowerCase().includes(query) ||
                (q.tags && q.tags.some(t => t.toLowerCase().includes(query)))
            );
        }

        if (questions.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="6" class="empty-row">
                    <div class="empty-message">
                        <div class="empty-icon">📝</div>
                        <p>暂无题目</p>
                        <p class="empty-hint">点击"新增题目"添加题目</p>
                    </div>
                </td></tr>
            `;
            return;
        }

        const moduleNames = {
            1: '一·入门', 2: '二·控制', 3: '三·数据',
            4: '四·函数', 5: '五·算法', 6: '六·3D'
        };

        tbody.innerHTML = questions.map(q => {
            const typeName = this.questionTypes[q.type] ? this.questionTypes[q.type].label : q.type;
            const typeIcon = this.questionTypes[q.type] ? this.questionTypes[q.type].icon : '';
            const stars = '★'.repeat(q.difficulty || 1) + '☆'.repeat(5 - (q.difficulty || 1));
            const shortQ = q.question.length > 50 ? q.question.substring(0, 50) + '...' : q.question;

            return `
                <tr>
                    <td><input type="checkbox" class="quiz-checkbox" value="${q.id}"></td>
                    <td class="quiz-question-cell" title="${q.question.replace(/"/g, '&quot;')}">${shortQ}</td>
                    <td><span class="badge badge-module">${moduleNames[q.module] || 'M' + q.module}</span></td>
                    <td><span class="badge badge-type">${typeIcon} ${typeName}</span></td>
                    <td><span class="quiz-difficulty">${stars}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="QuizSystem.showEditQuestion('${q.id}')">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="QuizSystem.handleDeleteQuestion('${q.id}')">删除</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * 显示新增/编辑题目弹窗
     */
    showAddQuestion() {
        this.showQuestionModal(null);
    },

    /**
     * 显示编辑题目弹窗
     */
    showEditQuestion(questionId) {
        const question = this.getAllQuestions().find(q => q.id === questionId);
        if (question) {
            this.showQuestionModal(question);
        }
    },

    /**
     * 题目编辑弹窗
     */
    showQuestionModal(question) {
        const isEdit = !!question;
        const q = question || {
            module: 1, type: 'choice', difficulty: 1,
            question: '', options: ['', '', '', ''], answer: '',
            explanation: '', tags: [], starterCode: '', expectedOutput: ''
        };

        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'quiz-modal-overlay';
        modal.id = 'quiz-modal';

        const optionsHtml = q.type === 'choice' ? `
            <div class="form-group">
                <label>选项（A-D）</label>
                <input type="text" class="admin-input quiz-option-input" data-option="A" value="${q.options[0] || ''}" placeholder="选项A">
                <input type="text" class="admin-input quiz-option-input" data-option="B" value="${q.options[1] || ''}" placeholder="选项B">
                <input type="text" class="admin-input quiz-option-input" data-option="C" value="${q.options[2] || ''}" placeholder="选项C">
                <input type="text" class="admin-input quiz-option-input" data-option="D" value="${q.options[3] || ''}" placeholder="选项D">
            </div>
            <div class="form-group">
                <label>正确答案</label>
                <select class="admin-input" id="modal-answer-choice">
                    <option value="A" ${q.answer === 'A' ? 'selected' : ''}>A</option>
                    <option value="B" ${q.answer === 'B' ? 'selected' : ''}>B</option>
                    <option value="C" ${q.answer === 'C' ? 'selected' : ''}>C</option>
                    <option value="D" ${q.answer === 'D' ? 'selected' : ''}>D</option>
                </select>
            </div>
        ` : '';

        const fillAnswerHtml = q.type === 'fill' ? `
            <div class="form-group">
                <label>正确答案</label>
                <input type="text" class="admin-input" id="modal-answer-fill" value="${q.answer || ''}" placeholder="填空答案">
            </div>
        ` : '';

        const judgeAnswerHtml = q.type === 'judge' ? `
            <div class="form-group">
                <label>正确答案</label>
                <select class="admin-input" id="modal-answer-judge">
                    <option value="对" ${q.answer === '对' ? 'selected' : ''}>对</option>
                    <option value="错" ${q.answer === '错' ? 'selected' : ''}>错</option>
                </select>
            </div>
        ` : '';

        const codingHtml = q.type === 'coding' ? `
            <div class="form-group">
                <label>起始代码</label>
                <textarea class="import-textarea" id="modal-starter-code" rows="3" placeholder="学生看到的起始代码">${q.starterCode || ''}</textarea>
            </div>
            <div class="form-group">
                <label>预期输出</label>
                <input type="text" class="admin-input" id="modal-expected-output" value="${q.expectedOutput || ''}" placeholder="程序预期输出">
            </div>
            <div class="form-group">
                <label>参考答案</label>
                <textarea class="import-textarea" id="modal-answer-coding" rows="4" placeholder="参考代码">${q.answer || ''}</textarea>
            </div>
        ` : '';

        modal.innerHTML = `
            <div class="quiz-modal">
                <div class="quiz-modal-header">
                    <h3>${isEdit ? '编辑题目' : '新增题目'}</h3>
                    <button class="quiz-modal-close" onclick="document.getElementById('quiz-modal').remove()">×</button>
                </div>
                <div class="quiz-modal-body">
                    <div class="form-group">
                        <label>题型</label>
                        <select class="admin-input" id="modal-type" onchange="QuizSystem.updateModalByType()">
                            <option value="choice" ${q.type === 'choice' ? 'selected' : ''}>选择题</option>
                            <option value="fill" ${q.type === 'fill' ? 'selected' : ''}>填空题</option>
                            <option value="judge" ${q.type === 'judge' ? 'selected' : ''}>判断题</option>
                            <option value="coding" ${q.type === 'coding' ? 'selected' : ''}>编程题</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>所属模块</label>
                        <select class="admin-input" id="modal-module">
                            <option value="1" ${q.module === 1 ? 'selected' : ''}>模块一：Python入门</option>
                            <option value="2" ${q.module === 2 ? 'selected' : ''}>模块二：控制结构</option>
                            <option value="3" ${q.module === 3 ? 'selected' : ''}>模块三：数据结构</option>
                            <option value="4" ${q.module === 4 ? 'selected' : ''}>模块四：函数</option>
                            <option value="5" ${q.module === 5 ? 'selected' : ''}>模块五：算法</option>
                            <option value="6" ${q.module === 6 ? 'selected' : ''}>模块六：3D可视化</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>难度（1-5）</label>
                        <select class="admin-input" id="modal-difficulty">
                            <option value="1" ${q.difficulty === 1 ? 'selected' : ''}>★ 简单</option>
                            <option value="2" ${q.difficulty === 2 ? 'selected' : ''}>★★ 较易</option>
                            <option value="3" ${q.difficulty === 3 ? 'selected' : ''}>★★★ 中等</option>
                            <option value="4" ${q.difficulty === 4 ? 'selected' : ''}>★★★★ 较难</option>
                            <option value="5" ${q.difficulty === 5 ? 'selected' : ''}>★★★★★ 困难</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>题干</label>
                        <textarea class="import-textarea" id="modal-question" rows="4" placeholder="输入题目内容">${q.question}</textarea>
                    </div>
                    <div id="modal-dynamic-area">
                        ${optionsHtml}${fillAnswerHtml}${judgeAnswerHtml}${codingHtml}
                    </div>
                    <div class="form-group">
                        <label>解析（可选）</label>
                        <textarea class="import-textarea" id="modal-explanation" rows="3" placeholder="答案解析">${q.explanation || ''}</textarea>
                    </div>
                </div>
                <div class="quiz-modal-footer">
                    <button class="btn btn-outline" onclick="document.getElementById('quiz-modal').remove()">取消</button>
                    <button class="btn btn-primary" id="modal-save-btn">${isEdit ? '保存修改' : '添加题目'}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 保存当前编辑的题目ID
        this._editingQuestionId = isEdit ? question.id : null;

        // 绑定保存按钮
        const saveBtn = document.getElementById('modal-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSaveQuestion());
        }
    },

    /**
     * 根据题型动态更新弹窗内容
     */
    updateModalByType() {
        const typeSelect = document.getElementById('modal-type');
        const dynamicArea = document.getElementById('modal-dynamic-area');
        if (!typeSelect || !dynamicArea) return;

        const type = typeSelect.value;

        if (type === 'choice') {
            dynamicArea.innerHTML = `
                <div class="form-group">
                    <label>选项（A-D）</label>
                    <input type="text" class="admin-input quiz-option-input" data-option="A" placeholder="选项A">
                    <input type="text" class="admin-input quiz-option-input" data-option="B" placeholder="选项B">
                    <input type="text" class="admin-input quiz-option-input" data-option="C" placeholder="选项C">
                    <input type="text" class="admin-input quiz-option-input" data-option="D" placeholder="选项D">
                </div>
                <div class="form-group">
                    <label>正确答案</label>
                    <select class="admin-input" id="modal-answer-choice">
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </select>
                </div>
            `;
        } else if (type === 'fill') {
            dynamicArea.innerHTML = `
                <div class="form-group">
                    <label>正确答案</label>
                    <input type="text" class="admin-input" id="modal-answer-fill" placeholder="填空答案">
                </div>
            `;
        } else if (type === 'judge') {
            dynamicArea.innerHTML = `
                <div class="form-group">
                    <label>正确答案</label>
                    <select class="admin-input" id="modal-answer-judge">
                        <option value="对">对</option>
                        <option value="错">错</option>
                    </select>
                </div>
            `;
        } else if (type === 'coding') {
            dynamicArea.innerHTML = `
                <div class="form-group">
                    <label>起始代码</label>
                    <textarea class="import-textarea" id="modal-starter-code" rows="3" placeholder="学生看到的起始代码"></textarea>
                </div>
                <div class="form-group">
                    <label>预期输出</label>
                    <input type="text" class="admin-input" id="modal-expected-output" placeholder="程序预期输出">
                </div>
                <div class="form-group">
                    <label>参考答案</label>
                    <textarea class="import-textarea" id="modal-answer-coding" rows="4" placeholder="参考代码"></textarea>
                </div>
            `;
        }
    },

    /**
     * 处理保存题目
     */
    handleSaveQuestion() {
        const type = document.getElementById('modal-type').value;
        const module = parseInt(document.getElementById('modal-module').value);
        const difficulty = parseInt(document.getElementById('modal-difficulty').value);
        const question = document.getElementById('modal-question').value.trim();
        const explanation = document.getElementById('modal-explanation').value.trim();

        if (!question) {
            if (typeof showToast === 'function') showToast('请输入题干内容', 'warning');
            return;
        }

        const questionData = {
            module, type, difficulty, question, explanation,
            tags: []
        };

        // 根据题型收集答案
        if (type === 'choice') {
            const options = [];
            document.querySelectorAll('.quiz-option-input').forEach(input => {
                options.push(input.value.trim());
            });
            if (options.some(o => !o)) {
                if (typeof showToast === 'function') showToast('请填写所有选项', 'warning');
                return;
            }
            questionData.options = options;
            questionData.answer = document.getElementById('modal-answer-choice').value;
        } else if (type === 'fill') {
            questionData.answer = document.getElementById('modal-answer-fill').value.trim();
            if (!questionData.answer) {
                if (typeof showToast === 'function') showToast('请输入正确答案', 'warning');
                return;
            }
        } else if (type === 'judge') {
            questionData.answer = document.getElementById('modal-answer-judge').value;
        } else if (type === 'coding') {
            questionData.starterCode = document.getElementById('modal-starter-code').value;
            questionData.expectedOutput = document.getElementById('modal-expected-output').value.trim();
            questionData.answer = document.getElementById('modal-answer-coding').value.trim();
        }

        if (this._editingQuestionId) {
            this.updateQuestion(this._editingQuestionId, questionData);
            if (typeof showToast === 'function') showToast('题目已更新', 'success');
        } else {
            this.addQuestion(questionData);
            if (typeof showToast === 'function') showToast('题目已添加', 'success');
        }

        // 关闭弹窗并刷新
        document.getElementById('quiz-modal').remove();
        this.renderQuestionTable();
    },

    /**
     * 处理删除题目
     */
    handleDeleteQuestion(questionId) {
        if (confirm('确定要删除这道题目吗？')) {
            if (this.deleteQuestion(questionId)) {
                if (typeof showToast === 'function') showToast('题目已删除', 'success');
                this.renderQuestionTable();
            }
        }
    },

    // ============================================================
    // 考试管理 UI
    // ============================================================

    /**
     * 渲染考试列表
     */
    renderExamList() {
        const container = document.getElementById('exam-list-container');
        if (!container) return;

        const exams = this.getAllExams();

        if (exams.length === 0) {
            container.innerHTML = `
                <div class="empty-message" style="padding:48px;">
                    <div class="empty-icon">📝</div>
                    <p>暂无考试</p>
                    <p class="empty-hint">点击"创建考试"新建一份考试</p>
                </div>
            `;
            return;
        }

        container.innerHTML = exams.map(exam => {
            const typeInfo = this.examTypes[exam.type] || this.examTypes['classroom'];
            const questionCount = exam.questionIds.length;
            const statusClass = exam.status === 'published' ? 'published' : (exam.status === 'closed' ? 'closed' : 'draft');
            const statusText = exam.status === 'published' ? '已发布' : (exam.status === 'closed' ? '已关闭' : '草稿');

            return `
                <div class="exam-card ${statusClass}">
                    <div class="exam-card-header">
                        <div class="exam-card-title">
                            <span class="exam-type-badge" style="background:${typeInfo.color}">${typeInfo.icon} ${typeInfo.label}</span>
                            <h3>${exam.title}</h3>
                        </div>
                        <span class="exam-status-badge status-${exam.status}">${statusText}</span>
                    </div>
                    <div class="exam-card-body">
                        <div class="exam-meta">
                            <span>📊 ${questionCount}题</span>
                            <span>⏱️ ${exam.duration}分钟</span>
                            <span>💯 满分${exam.totalScore}分</span>
                            <span>✅ 及格${exam.passingScore}分</span>
                        </div>
                        <div class="exam-card-actions">
                            ${exam.status === 'draft' ? `
                                <button class="btn btn-sm btn-primary" onclick="QuizSystem.publishExamUI('${exam.id}')">发布</button>
                            ` : ''}
                            ${exam.status === 'published' ? `
                                <button class="btn btn-sm btn-outline" onclick="QuizSystem.closeExamUI('${exam.id}')">关闭</button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline" onclick="QuizSystem.previewExam('${exam.id}')">预览</button>
                            <button class="btn btn-sm btn-outline" onclick="QuizSystem.showExamResults('${exam.id}')">成绩</button>
                            <button class="btn btn-sm btn-danger" onclick="QuizSystem.handleDeleteExam('${exam.id}')">删除</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * 显示创建考试弹窗
     */
    showCreateExamModal() {
        const questions = this.getAllQuestions();

        const modal = document.createElement('div');
        modal.className = 'quiz-modal-overlay';
        modal.id = 'exam-modal';

        const moduleNames = {
            1: '模块一·入门', 2: '模块二·控制', 3: '模块三·数据',
            4: '模块四·函数', 5: '模块五·算法', 6: '模块六·3D'
        };

        modal.innerHTML = `
            <div class="quiz-modal quiz-modal-large">
                <div class="quiz-modal-header">
                    <h3>创建考试</h3>
                    <button class="quiz-modal-close" onclick="document.getElementById('exam-modal').remove()">×</button>
                </div>
                <div class="quiz-modal-body">
                    <div class="form-group">
                        <label>考试名称</label>
                        <input type="text" class="admin-input" id="exam-title" placeholder="如：Python第一次课堂练习">
                    </div>
                    <div class="form-row">
                        <div class="form-group form-col">
                            <label>考试类型</label>
                            <select class="admin-input" id="exam-type">
                                <option value="classroom">📝 课堂练习</option>
                                <option value="unit">📚 单元练习</option>
                                <option value="midterm">🎯 期中考试</option>
                                <option value="final">🏆 期末考试</option>
                            </select>
                        </div>
                        <div class="form-group form-col">
                            <label>关联模块</label>
                            <select class="admin-input" id="exam-module">
                                <option value="0">综合（跨模块）</option>
                                <option value="1">${moduleNames[1]}</option>
                                <option value="2">${moduleNames[2]}</option>
                                <option value="3">${moduleNames[3]}</option>
                                <option value="4">${moduleNames[4]}</option>
                                <option value="5">${moduleNames[5]}</option>
                                <option value="6">${moduleNames[6]}</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group form-col">
                            <label>考试时长（分钟）</label>
                            <input type="number" class="admin-input" id="exam-duration" value="45" min="5" max="180">
                        </div>
                        <div class="form-group form-col">
                            <label>满分</label>
                            <input type="number" class="admin-input" id="exam-total-score" value="100" min="10" max="200">
                        </div>
                        <div class="form-group form-col">
                            <label>及格分</label>
                            <input type="number" class="admin-input" id="exam-passing-score" value="60" min="10" max="200">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>选择题目（勾选要加入试卷的题目）</label>
                        <div class="exam-question-picker" id="exam-question-picker">
                            ${questions.map(q => {
                                const typeName = this.questionTypes[q.type] ? this.questionTypes[q.type].label : '';
                                const typeIcon = this.questionTypes[q.type] ? this.questionTypes[q.type].icon : '';
                                const shortQ = q.question.length > 60 ? q.question.substring(0, 60) + '...' : q.question;
                                return `
                                    <label class="exam-question-item">
                                        <input type="checkbox" value="${q.id}" class="exam-q-checkbox">
                                        <span class="exam-q-info">
                                            <span class="exam-q-type">${typeIcon} ${typeName}</span>
                                            <span class="exam-q-text">${shortQ}</span>
                                            <span class="exam-q-module">M${q.module}</span>
                                        </span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                        <div class="exam-picker-actions">
                            <button class="btn btn-sm btn-outline" onclick="QuizSystem.selectAllQuestions(true)">全选</button>
                            <button class="btn btn-sm btn-outline" onclick="QuizSystem.selectAllQuestions(false)">取消全选</button>
                            <span id="exam-selected-count" class="exam-selected-count">已选 0 题</span>
                        </div>
                    </div>
                </div>
                <div class="quiz-modal-footer">
                    <button class="btn btn-outline" onclick="document.getElementById('exam-modal').remove()">取消</button>
                    <button class="btn btn-primary" id="exam-save-btn">创建考试</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定保存
        document.getElementById('exam-save-btn').addEventListener('click', () => this.handleCreateExam());

        // 绑定题目计数
        document.querySelectorAll('.exam-q-checkbox').forEach(cb => {
            cb.addEventListener('change', () => this.updateSelectedCount());
        });
    },

    /**
     * 全选/取消全选题目
     */
    selectAllQuestions(selectAll) {
        document.querySelectorAll('.exam-q-checkbox').forEach(cb => {
            cb.checked = selectAll;
        });
        this.updateSelectedCount();
    },

    /**
     * 更新已选题目数
     */
    updateSelectedCount() {
        const count = document.querySelectorAll('.exam-q-checkbox:checked').length;
        const countEl = document.getElementById('exam-selected-count');
        if (countEl) countEl.textContent = `已选 ${count} 题`;
    },

    /**
     * 处理创建考试
     */
    handleCreateExam() {
        const title = document.getElementById('exam-title').value.trim();
        if (!title) {
            if (typeof showToast === 'function') showToast('请输入考试名称', 'warning');
            return;
        }

        const selectedIds = Array.from(document.querySelectorAll('.exam-q-checkbox:checked')).map(cb => cb.value);
        if (selectedIds.length === 0) {
            if (typeof showToast === 'function') showToast('请至少选择一道题目', 'warning');
            return;
        }

        const examData = {
            title,
            type: document.getElementById('exam-type').value,
            module: parseInt(document.getElementById('exam-module').value),
            duration: parseInt(document.getElementById('exam-duration').value),
            totalScore: parseInt(document.getElementById('exam-total-score').value),
            passingScore: parseInt(document.getElementById('exam-passing-score').value),
            questionIds: selectedIds,
            createdBy: (typeof TeacherAdmin !== 'undefined' && TeacherAdmin.currentUser) ? TeacherAdmin.currentUser.name : '未知'
        };

        this.createExam(examData);
        document.getElementById('exam-modal').remove();
        if (typeof showToast === 'function') showToast('考试创建成功！', 'success');
        this.renderExamList();
    },

    /**
     * 发布考试
     */
    publishExamUI(examId) {
        if (confirm('确定要发布这份考试吗？发布后学生即可看到并开始答题。')) {
            this.publishExam(examId);
            if (typeof showToast === 'function') showToast('考试已发布，学生可以开始答题了', 'success');
            this.renderExamList();
        }
    },

    /**
     * 关闭考试
     */
    closeExamUI(examId) {
        if (confirm('确定要关闭这份考试吗？关闭后学生将无法继续答题。')) {
            this.closeExam(examId);
            if (typeof showToast === 'function') showToast('考试已关闭', 'info');
            this.renderExamList();
        }
    },

    /**
     * 预览考试
     */
    previewExam(examId) {
        const exam = this.getExamWithQuestions(examId);
        if (!exam) return;

        const modal = document.createElement('div');
        modal.className = 'quiz-modal-overlay';
        modal.id = 'preview-modal';

        const typeInfo = this.examTypes[exam.type] || this.examTypes['classroom'];

        modal.innerHTML = `
            <div class="quiz-modal quiz-modal-large">
                <div class="quiz-modal-header">
                    <h3>${typeInfo.icon} ${exam.title} - 预览</h3>
                    <button class="quiz-modal-close" onclick="document.getElementById('preview-modal').remove()">×</button>
                </div>
                <div class="quiz-modal-body">
                    <div class="exam-preview-info">
                        <span>📊 ${exam.questions.length}题</span>
                        <span>⏱️ ${exam.duration}分钟</span>
                        <span>💯 满分${exam.totalScore}分</span>
                    </div>
                    ${exam.questions.map((q, i) => {
                        const typeName = this.questionTypes[q.type] ? this.questionTypes[q.type].label : '';
                        let answerHtml = '';

                        if (q.type === 'choice') {
                            answerHtml = q.options.map((opt, idx) => {
                                const letter = String.fromCharCode(65 + idx);
                                const isCorrect = letter === q.answer;
                                return `<div class="preview-option ${isCorrect ? 'correct' : ''}">${letter}. ${opt} ${isCorrect ? '✓' : ''}</div>`;
                            }).join('');
                        } else if (q.type === 'fill') {
                            answerHtml = `<div class="preview-answer">答案：${q.answer}</div>`;
                        } else if (q.type === 'judge') {
                            answerHtml = `<div class="preview-answer">答案：${q.answer}</div>`;
                        } else if (q.type === 'coding') {
                            answerHtml = `<div class="preview-answer"><pre>${q.answer}</pre></div>`;
                        }

                        return `
                            <div class="preview-question">
                                <div class="preview-question-header">
                                    <span class="preview-q-num">第${i + 1}题</span>
                                    <span class="badge badge-type">${typeName}</span>
                                </div>
                                <div class="preview-q-text">${q.question}</div>
                                <div class="preview-options">${answerHtml}</div>
                                ${q.explanation ? `<div class="preview-explanation">💡 ${q.explanation}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="quiz-modal-footer">
                    <button class="btn btn-outline" onclick="document.getElementById('preview-modal').remove()">关闭</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * 处理删除考试
     */
    handleDeleteExam(examId) {
        if (confirm('确定要删除这份考试吗？相关成绩也会被保留。')) {
            this.deleteExam(examId);
            if (typeof showToast === 'function') showToast('考试已删除', 'success');
            this.renderExamList();
        }
    },

    // ============================================================
    // 成绩统计 UI
    // ============================================================

    /**
     * 初始化成绩统计选项卡
     */
    initResultsTab() {
        const select = document.getElementById('results-filter-exam');
        if (!select) return;

        const exams = this.getAllExams();
        select.innerHTML = '<option value="">选择考试</option>' +
            exams.map(e => `<option value="${e.id}">${e.title}</option>`).join('');

        select.addEventListener('change', () => {
            this.renderResults(select.value);
        });
    },

    /**
     * 渲染成绩
     */
    renderResults(examId) {
        const container = document.getElementById('results-container');
        if (!container) return;

        if (!examId) {
            container.innerHTML = '<p class="empty-hint" style="padding:32px;text-align:center;">请选择考试查看成绩</p>';
            return;
        }

        const results = this.getResultsByExam(examId);
        const exam = this.getAllExams().find(e => e.id === examId);

        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-message" style="padding:48px;">
                    <div class="empty-icon">📊</div>
                    <p>暂无答题记录</p>
                    <p class="empty-hint">学生完成考试后这里会显示成绩</p>
                </div>
            `;
            return;
        }

        // 统计数据
        const scores = results.map(r => r.score);
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        const passCount = results.filter(r => r.passed).length;
        const passRate = Math.round(passCount / results.length * 100);

        container.innerHTML = `
            <div class="results-summary">
                <div class="result-stat-card">
                    <div class="result-stat-value">${results.length}</div>
                    <div class="result-stat-label">参考人数</div>
                </div>
                <div class="result-stat-card">
                    <div class="result-stat-value">${avgScore}</div>
                    <div class="result-stat-label">平均分</div>
                </div>
                <div class="result-stat-card">
                    <div class="result-stat-value">${maxScore}</div>
                    <div class="result-stat-label">最高分</div>
                </div>
                <div class="result-stat-card">
                    <div class="result-stat-value">${minScore}</div>
                    <div class="result-stat-label">最低分</div>
                </div>
                <div class="result-stat-card">
                    <div class="result-stat-value">${passRate}%</div>
                    <div class="result-stat-label">及格率</div>
                </div>
            </div>

            <div class="results-table-wrapper">
                <table class="student-table">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>学生</th>
                            <th>班级</th>
                            <th>得分</th>
                            <th>正确率</th>
                            <th>是否及格</th>
                            <th>提交时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.sort((a, b) => b.score - a.score).map((r, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td class="student-name">${r.studentName}</td>
                                <td>${r.studentClass || '-'}</td>
                                <td><span class="score-badge ${r.passed ? 'pass' : 'fail'}">${r.score}/${r.totalScore}</span></td>
                                <td>${r.correctCount}/${r.totalQuestions}</td>
                                <td>${r.passed ? '<span class="pass-text">✅ 及格</span>' : '<span class="fail-text">❌ 不及格</span>'}</td>
                                <td class="student-date">${new Date(r.submittedAt).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * 查看某考试的成绩（从考试列表点击）
     */
    showExamResults(examId) {
        // 切换到成绩统计选项卡
        document.querySelectorAll('.quiz-sub-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.quiz-sub-pane').forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none';
        });
        const resultsTab = document.querySelector('.quiz-sub-tab[data-subtab="results"]');
        const resultsPane = document.getElementById('quiz-sub-results');
        if (resultsTab) resultsTab.classList.add('active');
        if (resultsPane) {
            resultsPane.classList.add('active');
            resultsPane.style.display = 'block';
        }

        // 选择考试并渲染
        const select = document.getElementById('results-filter-exam');
        if (select) {
            select.value = examId;
        }
        this.renderResults(examId);
    },

    // ============================================================
    // 学生端 UI
    // ============================================================

    /**
     * 显示学生考试列表页面
     */
    showStudentExamList() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        const exams = this.getPublishedExams();
        const studentName = this.getCurrentStudentName();
        const studentResults = this.getResultsByStudent(this.getCurrentStudentUsername());

        mainContent.innerHTML = `
            <div class="page-exam-list animate-fade-in">
                <div class="exam-list-header">
                    <h1>📝 在线考试</h1>
                    <p class="exam-list-subtitle">参加老师发布的考试，检验你的Python学习成果</p>
                </div>

                ${exams.length === 0 ? `
                    <div class="empty-message" style="padding:64px;">
                        <div class="empty-icon">📭</div>
                        <p>当前没有进行中的考试</p>
                        <p class="empty-hint">请耐心等待老师发布考试</p>
                    </div>
                ` : `
                    <div class="exam-cards-grid">
                        ${exams.map(exam => {
                            const typeInfo = this.examTypes[exam.type] || this.examTypes['classroom'];
                            const myResult = studentResults.find(r => r.examId === exam.id);
                            const hasCompleted = !!myResult;
                            const questionCount = exam.questionIds.length;

                            return `
                                <div class="student-exam-card ${hasCompleted ? 'completed' : ''}">
                                    <div class="student-exam-type" style="background:${typeInfo.color}">
                                        ${typeInfo.icon} ${typeInfo.label}
                                    </div>
                                    <h3 class="student-exam-title">${exam.title}</h3>
                                    <div class="student-exam-meta">
                                        <span>📊 ${questionCount}题</span>
                                        <span>⏱️ ${exam.duration}分钟</span>
                                        <span>💯 满分${exam.totalScore}分</span>
                                    </div>
                                    ${hasCompleted ? `
                                        <div class="student-exam-result">
                                            <div class="my-score ${myResult.passed ? 'pass' : 'fail'}">
                                                ${myResult.score}<span>/${myResult.totalScore}</span>
                                            </div>
                                            <div class="my-result-info">
                                                <span>${myResult.passed ? '✅ 已及格' : '❌ 未及格'}</span>
                                                <span>正确 ${myResult.correctCount}/${myResult.totalQuestions}</span>
                                            </div>
                                        </div>
                                        <button class="btn btn-outline btn-block" onclick="QuizSystem.showExamReview('${exam.id}')">
                                            📋 查看解析
                                        </button>
                                    ` : `
                                        <button class="btn btn-primary btn-block" onclick="QuizSystem.startExam('${exam.id}')">
                                            🚀 开始答题
                                        </button>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}

                ${studentResults.length > 0 ? `
                    <div class="exam-history-section">
                        <h2>📈 历史成绩</h2>
                        <div class="exam-history-list">
                            ${studentResults.map(r => {
                                const exam = this.getAllExams().find(e => e.id === r.examId);
                                const examTitle = exam ? exam.title : '已删除的考试';
                                const typeInfo = exam ? (this.examTypes[exam.type] || this.examTypes['classroom']) : this.examTypes['classroom'];
                                return `
                                    <div class="history-item">
                                        <span class="history-type">${typeInfo.icon}</span>
                                        <span class="history-title">${examTitle}</span>
                                        <span class="history-score ${r.passed ? 'pass' : 'fail'}">${r.score}分</span>
                                        <span class="history-date">${new Date(r.submittedAt).toLocaleDateString()}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * 开始考试
     */
    startExam(examId) {
        const exam = this.getExamWithQuestions(examId);
        if (!exam || exam.questions.length === 0) {
            if (typeof showToast === 'function') showToast('考试题目加载失败', 'error');
            return;
        }

        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        const typeInfo = this.examTypes[exam.type] || this.examTypes['classroom'];

        mainContent.innerHTML = `
            <div class="page-exam-taking">
                <div class="exam-taking-header">
                    <div class="exam-taking-info">
                        <span class="exam-type-badge" style="background:${typeInfo.color}">${typeInfo.icon} ${typeInfo.label}</span>
                        <h1>${exam.title}</h1>
                    </div>
                    <div class="exam-timer" id="exam-timer">
                        <span class="timer-icon">⏱️</span>
                        <span class="timer-text" id="timer-text">${exam.duration}:00</span>
                    </div>
                </div>

                <div class="exam-taking-body">
                    <form id="exam-form" onsubmit="return false;">
                        ${exam.questions.map((q, i) => {
                            const typeName = this.questionTypes[q.type] ? this.questionTypes[q.type].label : '';
                            let answerHtml = '';

                            if (q.type === 'choice') {
                                answerHtml = q.options.map((opt, idx) => {
                                    const letter = String.fromCharCode(65 + idx);
                                    return `
                                        <label class="exam-answer-option">
                                            <input type="radio" name="q${i}" value="${letter}">
                                            <span class="option-letter">${letter}</span>
                                            <span class="option-text">${opt}</span>
                                        </label>
                                    `;
                                }).join('');
                            } else if (q.type === 'fill') {
                                answerHtml = `<input type="text" class="admin-input exam-fill-input" name="q${i}" placeholder="请输入答案">`;
                            } else if (q.type === 'judge') {
                                answerHtml = `
                                    <label class="exam-answer-option">
                                        <input type="radio" name="q${i}" value="对">
                                        <span class="option-letter">✓</span>
                                        <span class="option-text">对</span>
                                    </label>
                                    <label class="exam-answer-option">
                                        <input type="radio" name="q${i}" value="错">
                                        <span class="option-letter">✗</span>
                                        <span class="option-text">错</span>
                                    </label>
                                `;
                            } else if (q.type === 'coding') {
                                answerHtml = `
                                    <div class="exam-coding-area">
                                        <textarea class="import-textarea exam-coding-input" name="q${i}" rows="8" placeholder="在此编写Python代码">${q.starterCode || ''}</textarea>
                                        <p class="coding-hint">💡 预期输出：<code>${q.expectedOutput || '无'}</code></p>
                                    </div>
                                `;
                            }

                            // 处理题干中的代码块
                            const questionText = q.question.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="question-code-block">$2</pre>');

                            return `
                                <div class="exam-question-block">
                                    <div class="exam-question-header">
                                        <span class="exam-q-number">第${i + 1}题</span>
                                        <span class="badge badge-type">${typeName}</span>
                                        <span class="exam-q-score">${Math.round(exam.totalScore / exam.questions.length)}分</span>
                                    </div>
                                    <div class="exam-question-text">${questionText}</div>
                                    <div class="exam-answer-area">${answerHtml}</div>
                                </div>
                            `;
                        }).join('')}
                    </form>

                    <div class="exam-submit-area">
                        <button class="btn btn-outline btn-lg" onclick="QuizSystem.cancelExam()">放弃</button>
                        <button class="btn btn-primary btn-lg" id="exam-submit-btn">
                            ✅ 提交试卷
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 存储当前考试信息
        this._currentExam = exam;

        // 启动计时器
        this.startExamTimer(exam.duration);

        // 绑定提交
        document.getElementById('exam-submit-btn').addEventListener('click', () => this.submitExam());
    },

    /**
     * 考试计时器
     */
    startExamTimer(duration) {
        let totalSeconds = duration * 60;
        this._timerInterval = setInterval(() => {
            totalSeconds--;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const timerText = document.getElementById('timer-text');
            if (timerText) {
                timerText.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
                // 最后5分钟变红
                if (totalSeconds <= 300) {
                    timerText.style.color = '#f85149';
                }
            }
            if (totalSeconds <= 0) {
                clearInterval(this._timerInterval);
                if (typeof showToast === 'function') showToast('考试时间到，自动提交！', 'warning');
                this.submitExam();
            }
        }, 1000);
    },

    /**
     * 提交考试
     */
    submitExam() {
        if (!this._currentExam) return;

        if (this._timerInterval) {
            clearInterval(this._timerInterval);
        }

        const exam = this._currentExam;
        const answers = [];

        // 收集答案
        exam.questions.forEach((q, i) => {
            let answer = '';
            if (q.type === 'choice' || q.type === 'judge') {
                const checked = document.querySelector(`input[name="q${i}"]:checked`);
                answer = checked ? checked.value : '';
            } else if (q.type === 'fill') {
                const input = document.querySelector(`input[name="q${i}"]`);
                answer = input ? input.value.trim() : '';
            } else if (q.type === 'coding') {
                const textarea = document.querySelector(`textarea[name="q${i}"]`);
                answer = textarea ? textarea.value.trim() : '';
            }
            answers.push(answer);
        });

        // 判分
        const gradeResult = this.gradeExam(exam, answers);

        // 保存成绩
        const result = {
            examId: exam.id,
            examTitle: exam.title,
            examType: exam.type,
            studentName: this.getCurrentStudentName(),
            studentUsername: this.getCurrentStudentUsername(),
            studentClass: this.getCurrentStudentClass(),
            score: gradeResult.score,
            totalScore: gradeResult.totalScore,
            correctCount: gradeResult.correctCount,
            totalQuestions: gradeResult.totalQuestions,
            passed: gradeResult.passed,
            answers: answers,
            details: gradeResult.details
        };
        this.saveResult(result);

        // 显示成绩
        this.showExamResult(exam, gradeResult);
    },

    /**
     * 显示考试结果
     */
    showExamResult(exam, gradeResult) {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        const typeInfo = this.examTypes[exam.type] || this.examTypes['classroom'];

        mainContent.innerHTML = `
            <div class="page-exam-result animate-fade-in">
                <div class="result-hero ${gradeResult.passed ? 'pass' : 'fail'}">
                    <div class="result-hero-icon">${gradeResult.passed ? '🎉' : '💪'}</div>
                    <h1>${gradeResult.passed ? '恭喜通过！' : '继续努力！'}</h1>
                    <div class="result-big-score">
                        ${gradeResult.score}<span>/${gradeResult.totalScore}</span>
                    </div>
                    <div class="result-hero-info">
                        <span>✅ 正确 ${gradeResult.correctCount}/${gradeResult.totalQuestions}</span>
                        <span>📊 正确率 ${Math.round(gradeResult.correctCount / gradeResult.totalQuestions * 100)}%</span>
                    </div>
                </div>

                <div class="result-details-section">
                    <h2>📋 答题详情</h2>
                    ${gradeResult.details.map((d, i) => `
                        <div class="result-detail-item ${d.isCorrect ? 'correct' : 'wrong'}">
                            <div class="result-detail-header">
                                <span class="result-q-num">第${i + 1}题</span>
                                <span class="result-status">${d.isCorrect ? '✅ 正确' : '❌ 错误'}</span>
                            </div>
                            <div class="result-detail-question">${d.question}</div>
                            <div class="result-detail-answers">
                                <div class="result-your-answer">
                                    <span class="answer-label">你的答案：</span>
                                    <span class="answer-value">${d.studentAnswer || '(未作答)'}</span>
                                </div>
                                ${!d.isCorrect ? `
                                    <div class="result-correct-answer">
                                        <span class="answer-label">正确答案：</span>
                                        <span class="answer-value correct">${d.correctAnswer}</span>
                                    </div>
                                ` : ''}
                            </div>
                            ${d.explanation ? `<div class="result-explanation">💡 ${d.explanation}</div>` : ''}
                        </div>
                    `).join('')}
                </div>

                <div class="result-actions">
                    <button class="btn btn-primary btn-lg" onclick="QuizSystem.showStudentExamList()">
                        返回考试列表
                    </button>
                    <button class="btn btn-outline btn-lg" onclick="navigateTo('lesson/1')">
                        继续学习
                    </button>
                </div>
            </div>
        `;

        // 滚动到顶部
        window.scrollTo(0, 0);
    },

    /**
     * 查看历史考试解析
     */
    showExamReview(examId) {
        const exam = this.getExamWithQuestions(examId);
        if (!exam) return;

        const myResult = this.getResultsByStudent(this.getCurrentStudentUsername())
            .find(r => r.examId === examId);

        if (!myResult) {
            this.startExam(examId);
            return;
        }

        // 重用成绩展示页面
        const gradeResult = {
            correctCount: myResult.correctCount,
            totalQuestions: myResult.totalQuestions,
            score: myResult.score,
            totalScore: myResult.totalScore,
            passed: myResult.passed,
            details: myResult.details
        };
        this.showExamResult(exam, gradeResult);
    },

    /**
     * 取消考试
     */
    cancelExam() {
        if (this._timerInterval) clearInterval(this._timerInterval);
        if (confirm('确定要放弃本次考试吗？已答内容不会保存。')) {
            this.showStudentExamList();
        } else {
            // 恢复计时器
            if (this._currentExam) {
                const timerText = document.getElementById('timer-text');
                // 简化处理：从当前显示的时间恢复
            }
        }
    },

    // ============================================================
    // 学生身份辅助方法
    // ============================================================

    getCurrentStudentName() {
        const student = JSON.parse(localStorage.getItem('pycraft_current_student') || '{}');
        return student.name || '同学';
    },

    getCurrentStudentUsername() {
        const student = JSON.parse(localStorage.getItem('pycraft_current_student') || '{}');
        return student.username || 'guest';
    },

    getCurrentStudentClass() {
        const student = JSON.parse(localStorage.getItem('pycraft_current_student') || '{}');
        return student.className || '';
    },

    /**
     * 绑定教师端题库事件
     */
    bindTeacherEvents() {
        // 子选项卡切换
        document.querySelectorAll('.quiz-sub-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.quiz-sub-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.quiz-sub-pane').forEach(p => {
                    p.classList.remove('active');
                    p.style.display = 'none';
                });
                tab.classList.add('active');
                const subtab = tab.getAttribute('data-subtab');
                const pane = document.getElementById(`quiz-sub-${subtab}`);
                if (pane) {
                    pane.classList.add('active');
                    pane.style.display = 'block';
                }

                // 初始化对应面板
                if (subtab === 'questions') {
                    this.renderQuestionTable();
                } else if (subtab === 'exams') {
                    this.renderExamList();
                } else if (subtab === 'results') {
                    this.initResultsTab();
                }
            });
        });

        // 新增题目
        const addBtn = document.getElementById('btn-add-question');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddQuestion());
        }

        // 创建考试
        const createExamBtn = document.getElementById('btn-create-exam');
        if (createExamBtn) {
            createExamBtn.addEventListener('click', () => this.showCreateExamModal());
        }

        // 筛选
        const filterModule = document.getElementById('quiz-filter-module');
        if (filterModule) {
            filterModule.addEventListener('change', () => this.handleFilterChange());
        }

        const filterType = document.getElementById('quiz-filter-type');
        if (filterType) {
            filterType.addEventListener('change', () => this.handleFilterChange());
        }

        const searchInput = document.getElementById('quiz-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.handleFilterChange());
        }
    },

    /**
     * 处理筛选变化
     */
    handleFilterChange() {
        const module = document.getElementById('quiz-filter-module');
        const type = document.getElementById('quiz-filter-type');
        const search = document.getElementById('quiz-search');
        this.renderQuestionTable(
            module ? parseInt(module.value) : 0,
            type ? type.value : '',
            search ? search.value : ''
        );
    }
};

// ============================================================
// 导出模块
// ============================================================
window.QuizSystem = QuizSystem;
