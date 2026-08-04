/**
 * teacher-admin.js - 教师管理后台系统
 * 功能：超级账号登录、批量导入学生账号、学生管理
 * 超级账号：王华军、吴海燕
 */

const TeacherAdmin = {
    // 超级账号配置
    superAccounts: [
        { username: '王华军', password: 'admin123', role: 'super_admin', name: '王华军' },
        { username: '吴海燕', password: 'admin123', role: 'super_admin', name: '吴海燕' }
    ],

    // 当前登录状态
    currentUser: null,
    isLoggedIn: false,

    // 存储键
    STORAGE_KEY: 'pycraft_teacher_admin',
    STUDENTS_KEY: 'pycraft_students',

    // ============================================================
    // 初始化
    // ============================================================
    init() {
        this.loadSession();
        console.log('[TeacherAdmin] 教师管理后台初始化完成');
        console.log(`[TeacherAdmin] 登录状态: ${this.isLoggedIn ? '已登录' : '未登录'}`);
    },

    // ============================================================
    // 会话管理
    // ============================================================

    /**
     * 加载会话
     */
    loadSession() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const session = JSON.parse(saved);
                this.currentUser = session.currentUser;
                this.isLoggedIn = session.isLoggedIn;
            }
        } catch (e) {
            console.warn('[TeacherAdmin] 加载会话失败:', e);
        }
    },

    /**
     * 保存会话
     */
    saveSession() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                currentUser: this.currentUser,
                isLoggedIn: this.isLoggedIn
            }));
        } catch (e) {
            console.warn('[TeacherAdmin] 保存会话失败:', e);
        }
    },

    /**
     * 登出
     */
    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem(this.STORAGE_KEY);
        if (typeof showToast === 'function') {
            showToast('已退出登录', 'info');
        }
        this.showLoginPage();
    },

    // ============================================================
    // 登录系统
    // ============================================================

    /**
     * 验证登录
     */
    login(username, password) {
        const account = this.superAccounts.find(
            acc => acc.username === username && acc.password === password
        );

        if (account) {
            this.currentUser = account;
            this.isLoggedIn = true;
            this.saveSession();
            if (typeof showToast === 'function') {
                showToast(`欢迎回来，${account.name}老师！`, 'success');
            }
            this.showDashboard();
            return true;
        }

        if (typeof showToast === 'function') {
            showToast('用户名或密码错误', 'error');
        }
        return false;
    },

    // ============================================================
    // 学生管理
    // ============================================================

    /**
     * 获取所有学生
     */
    getAllStudents() {
        try {
            const saved = localStorage.getItem(this.STUDENTS_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('[TeacherAdmin] 获取学生列表失败:', e);
        }
        return [];
    },

    /**
     * 保存学生列表
     */
    saveStudents(students) {
        try {
            localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(students));
            return true;
        } catch (e) {
            console.warn('[TeacherAdmin] 保存学生列表失败:', e);
            return false;
        }
    },

    /**
     * 批量导入学生（从文本解析）
     * 支持格式：
     * - 每行一个学生：姓名,班级  或  姓名\t班级
     * - Excel粘贴格式：姓名\t班级\t学号
     */
    batchImport(text) {
        const lines = text.trim().split('\n');
        const students = this.getAllStudents();
        let imported = 0;
        let skipped = 0;
        const errors = [];

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('姓名')) {
                skipped++;
                return;
            }

            // 支持多种分隔符：逗号、制表符、空格
            const parts = trimmed.split(/[\t,，\s]+/).filter(p => p.trim());

            if (parts.length === 0) {
                errors.push(`第${index + 1}行：格式错误`);
                return;
            }

            const name = parts[0].trim();
            const className = parts[1] ? parts[1].trim() : '未分班';
            const studentId = parts[2] ? parts[2].trim() : `S${Date.now()}${index}`;

            // 检查是否已存在
            const exists = students.find(s => s.name === name && s.className === className);
            if (exists) {
                skipped++;
                return;
            }

            // 生成学生账号
            const username = this.generateUsername(name, className, students.length + imported);
            const password = this.generatePassword();

            students.push({
                id: `stu_${Date.now()}_${index}`,
                name: name,
                username: username,
                password: password,
                className: className,
                studentId: studentId,
                createdAt: new Date().toISOString(),
                progress: {
                    completedLessons: [],
                    totalRuns: 0,
                    totalPoints: 0
                }
            });
            imported++;
        });

        this.saveStudents(students);

        return {
            success: true,
            imported: imported,
            skipped: skipped,
            errors: errors,
            total: students.length
        };
    },

    /**
     * 生成学生用户名
     */
    generateUsername(name, className, count) {
        // 简单拼音首字母 + 班级 + 序号
        const classNum = className.replace(/[^0-9]/g, '') || '00';
        return `s${classNum}${String(count + 1).padStart(3, '0')}`;
    },

    /**
     * 生成随机密码
     */
    generatePassword() {
        return Math.random().toString(36).substring(2, 8);
    },

    /**
     * 删除学生
     */
    deleteStudent(studentId) {
        const students = this.getAllStudents();
        const filtered = students.filter(s => s.id !== studentId);
        this.saveStudents(filtered);
        return students.length !== filtered.length;
    },

    /**
     * 清空所有学生
     */
    clearAllStudents() {
        localStorage.removeItem(this.STUDENTS_KEY);
        if (typeof showToast === 'function') {
            showToast('所有学生数据已清空', 'info');
        }
    },

    /**
     * 导出学生列表为CSV
     */
    exportToCSV() {
        const students = this.getAllStudents();
        if (students.length === 0) {
            if (typeof showToast === 'function') {
                showToast('没有学生数据可导出', 'warning');
            }
            return;
        }

        const header = '姓名,用户名,密码,班级,学号,创建时间\n';
        const rows = students.map(s =>
            `${s.name},${s.username},${s.password},${s.className},${s.studentId},${s.createdAt}`
        ).join('\n');

        const csv = '\uFEFF' + header + rows; // BOM for Excel
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `学生账号列表_${new Date().toLocaleDateString()}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        if (typeof showToast === 'function') {
            showToast(`已导出${students.length}条学生数据`, 'success');
        }
    },

    // ============================================================
    // 页面渲染
    // ============================================================

    /**
     * 显示管理后台页面
     */
    showAdminPage() {
        if (this.isLoggedIn) {
            this.showDashboard();
        } else {
            this.showLoginPage();
        }
    },

    /**
     * 显示登录页面
     */
    showLoginPage() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="page-admin animate-fade-in">
                <div class="admin-login-container">
                    <div class="admin-login-card">
                        <div class="admin-login-header">
                            <div class="admin-login-icon">🔐</div>
                            <h1>教师管理后台</h1>
                            <p>请使用教师账号登录</p>
                        </div>
                        <div class="admin-login-form">
                            <div class="form-group">
                                <label for="admin-username">用户名</label>
                                <input
                                    type="text"
                                    id="admin-username"
                                    class="admin-input"
                                    placeholder="请输入用户名"
                                    autocomplete="off"
                                >
                            </div>
                            <div class="form-group">
                                <label for="admin-password">密码</label>
                                <input
                                    type="password"
                                    id="admin-password"
                                    class="admin-input"
                                    placeholder="请输入密码"
                                    autocomplete="off"
                                >
                            </div>
                            <button class="btn btn-primary btn-block" id="admin-login-btn">
                                登录
                            </button>
                        </div>
                        <div class="admin-login-footer">
                            <p>提示：默认账号为教师姓名，密码为 admin123</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 绑定登录事件
        const loginBtn = document.getElementById('admin-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const username = document.getElementById('admin-username').value.trim();
                const password = document.getElementById('admin-password').value.trim();
                if (!username || !password) {
                    showToast('请输入用户名和密码', 'warning');
                    return;
                }
                this.login(username, password);
            });
        }

        // 回车登录
        const passwordInput = document.getElementById('admin-password');
        if (passwordInput) {
            passwordInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('admin-login-btn').click();
                }
            });
        }
    },

    /**
     * 显示管理后台仪表板
     */
    showDashboard() {
        if (!this.isLoggedIn) {
            this.showLoginPage();
            return;
        }

        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        const students = this.getAllStudents();

        mainContent.innerHTML = `
            <div class="page-admin animate-fade-in">
                <!-- 管理后台头部 -->
                <div class="admin-header">
                    <div class="admin-header-left">
                        <h1>教师管理后台</h1>
                        <span class="admin-welcome">欢迎，${this.currentUser.name}老师</span>
                    </div>
                    <div class="admin-header-right">
                        <button class="btn btn-outline" onclick="navigateTo('')">返回首页</button>
                        <button class="btn btn-outline" id="admin-logout-btn">退出登录</button>
                    </div>
                </div>

                <!-- 统计卡片 -->
                <div class="admin-stats">
                    <div class="admin-stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <div class="stat-value">${students.length}</div>
                            <div class="stat-label">学生总数</div>
                        </div>
                    </div>
                    <div class="admin-stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <div class="stat-value">${new Set(students.map(s => s.className)).size}</div>
                            <div class="stat-label">班级数</div>
                        </div>
                    </div>
                    <div class="admin-stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-info">
                            <div class="stat-value">${students.filter(s => s.progress && s.progress.completedLessons && s.progress.completedLessons.length > 0).length}</div>
                            <div class="stat-label">已开始学习</div>
                        </div>
                    </div>
                    <div class="admin-stat-card">
                        <div class="stat-icon">🎓</div>
                        <div class="stat-info">
                            <div class="stat-value">${students.filter(s => s.progress && s.progress.completedLessons && s.progress.completedLessons.length >= 17).length}</div>
                            <div class="stat-label">已完成全部</div>
                        </div>
                    </div>
                </div>

                <!-- 功能选项卡 -->
                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="import">
                        📥 批量导入学生
                    </button>
                    <button class="admin-tab" data-tab="list">
                        📋 学生列表
                    </button>
                    <button class="admin-tab" data-tab="progress">
                        📈 学习进度
                    </button>
                    <button class="admin-tab" data-tab="quiz">
                        📝 题库考试
                    </button>
                </div>

                <!-- 选项卡内容 -->
                <div class="admin-tab-content">
                    <!-- 批量导入 -->
                    <div class="tab-pane active" id="tab-import">
                        <div class="import-section">
                            <h2>批量导入学生账号</h2>
                            <p class="import-hint">
                                请输入学生信息，每行一个学生。格式：<strong>姓名,班级,学号</strong>（用逗号、制表符或空格分隔）<br>
                                也支持直接从Excel复制粘贴（姓名列、班级列、学号列）。
                            </p>

                            <div class="import-textarea-wrapper">
                                <textarea
                                    id="import-textarea"
                                    class="import-textarea"
                                    rows="12"
                                    placeholder="姓名,班级,学号&#10;张三,高一1班,2024001&#10;李四,高一1班,2024002&#10;王五,高一2班,2024003&#10;..."
                                ></textarea>
                            </div>

                            <div class="import-actions">
                                <button class="btn btn-primary" id="btn-import-students">
                                    📥 导入学生
                                </button>
                                <button class="btn btn-outline" id="btn-import-sample">
                                    填充示例数据
                                </button>
                                <button class="btn btn-outline" id="btn-import-clear">
                                    清空
                                </button>
                            </div>

                            <div class="import-result" id="import-result" style="display:none;">
                                <!-- 导入结果显示 -->
                            </div>
                        </div>
                    </div>

                    <!-- 学生列表 -->
                    <div class="tab-pane" id="tab-list" style="display:none;">
                        <div class="student-list-section">
                            <div class="student-list-header">
                                <h2>学生列表</h2>
                                <div class="student-list-actions">
                                    <button class="btn btn-outline" id="btn-export-csv">
                                        📄 导出CSV
                                    </button>
                                    <button class="btn btn-danger" id="btn-clear-all">
                                        🗑️ 清空全部
                                    </button>
                                </div>
                            </div>
                            <div class="student-search">
                                <input
                                    type="text"
                                    id="student-search"
                                    class="admin-input"
                                    placeholder="搜索姓名、班级或用户名..."
                                >
                            </div>
                            <div class="student-table-wrapper">
                                <table class="student-table">
                                    <thead>
                                        <tr>
                                            <th>序号</th>
                                            <th>姓名</th>
                                            <th>用户名</th>
                                            <th>密码</th>
                                            <th>班级</th>
                                            <th>学号</th>
                                            <th>创建时间</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody id="student-table-body">
                                        <!-- 动态填充 -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- 学习进度 -->
                    <div class="tab-pane" id="tab-progress" style="display:none;">
                        <div class="progress-section">
                            <h2>学生学习进度</h2>
                            <div class="progress-overview" id="progress-overview">
                                <!-- 动态填充 -->
                            </div>
                        </div>
                    </div>

                    <!-- 题库考试管理 -->
                    ${typeof QuizSystem !== 'undefined' ? QuizSystem.renderTeacherPanel() : '<div class="tab-pane" id="tab-quiz" style="display:none;"><p>题库系统加载中...</p></div>'}
                </div>
            </div>
        `;

        // 绑定事件
        this.bindDashboardEvents();
        // 渲染学生列表
        this.renderStudentTable();
        // 渲染进度
        this.renderProgressOverview();
        // 初始化题库系统
        if (typeof QuizSystem !== 'undefined') {
            QuizSystem.bindTeacherEvents();
        }
    },

    /**
     * 绑定仪表板事件
     */
    bindDashboardEvents() {
        // 退出登录
        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // 选项卡切换
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有active
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => {
                    p.classList.remove('active');
                    p.style.display = 'none';
                });
                // 添加当前active
                tab.classList.add('active');
                const tabId = tab.getAttribute('data-tab');
                const pane = document.getElementById(`tab-${tabId}`);
                if (pane) {
                    pane.classList.add('active');
                    pane.style.display = 'block';
                }
            });
        });

        // 导入学生
        const importBtn = document.getElementById('btn-import-students');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.handleImport());
        }

        // 填充示例
        const sampleBtn = document.getElementById('btn-import-sample');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => {
                const textarea = document.getElementById('import-textarea');
                if (textarea) {
                    textarea.value = '张三,高一1班,2024001\n李四,高一1班,2024002\n王五,高一1班,2024003\n赵六,高一2班,2024004\n钱七,高一2班,2024005\n孙八,高一2班,2024006\n周九,高一3班,2024007\n吴十,高一3班,2024008\n郑十一,高一3班,2024009\n王十二,高一3班,2024010';
                }
            });
        }

        // 清空输入
        const clearBtn = document.getElementById('btn-import-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const textarea = document.getElementById('import-textarea');
                if (textarea) textarea.value = '';
                const result = document.getElementById('import-result');
                if (result) result.style.display = 'none';
            });
        }

        // 导出CSV
        const exportBtn = document.getElementById('btn-export-csv');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCSV());
        }

        // 清空全部
        const clearAllBtn = document.getElementById('btn-clear-all');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                if (confirm('确定要清空所有学生数据吗？此操作不可撤销！')) {
                    this.clearAllStudents();
                    this.renderStudentTable();
                    this.showDashboard(); // 刷新统计
                }
            });
        }

        // 搜索
        const searchInput = document.getElementById('student-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderStudentTable(searchInput.value));
        }
    },

    /**
     * 处理导入
     */
    handleImport() {
        const textarea = document.getElementById('import-textarea');
        if (!textarea || !textarea.value.trim()) {
            showToast('请先输入学生数据', 'warning');
            return;
        }

        const result = this.batchImport(textarea.value);
        const resultDiv = document.getElementById('import-result');
        if (resultDiv) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="import-result-card ${result.success ? 'success' : 'error'}">
                    <h3>导入完成</h3>
                    <div class="import-result-stats">
                        <div class="result-stat">
                            <span class="result-stat-value">${result.imported}</span>
                            <span class="result-stat-label">成功导入</span>
                        </div>
                        <div class="result-stat">
                            <span class="result-stat-value">${result.skipped}</span>
                            <span class="result-stat-label">跳过</span>
                        </div>
                        <div class="result-stat">
                            <span class="result-stat-value">${result.total}</span>
                            <span class="result-stat-label">总学生数</span>
                        </div>
                    </div>
                    ${result.errors.length > 0 ? `
                        <div class="import-errors">
                            <strong>错误信息：</strong>
                            <ul>
                                ${result.errors.map(e => `<li>${e}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        if (result.success && result.imported > 0) {
            showToast(`成功导入${result.imported}名学生！`, 'success');
            this.renderStudentTable();
            this.renderProgressOverview();
            this.refreshStats();
        }
    },

    /**
     * 刷新统计卡片
     */
    refreshStats() {
        const students = this.getAllStudents();
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 4) {
            statValues[0].textContent = students.length;
            statValues[1].textContent = new Set(students.map(s => s.className)).size;
            statValues[2].textContent = students.filter(s => s.progress && s.progress.completedLessons && s.progress.completedLessons.length > 0).length;
            statValues[3].textContent = students.filter(s => s.progress && s.progress.completedLessons && s.progress.completedLessons.length >= 17).length;
        }
    },

    /**
     * 渲染学生表格
     */
    renderStudentTable(searchQuery = '') {
        const tbody = document.getElementById('student-table-body');
        if (!tbody) return;

        let students = this.getAllStudents();

        // 搜索过滤
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            students = students.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.className.toLowerCase().includes(query) ||
                s.username.toLowerCase().includes(query)
            );
        }

        if (students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-row">
                        <div class="empty-message">
                            <div class="empty-icon">📭</div>
                            <p>暂无学生数据</p>
                            <p class="empty-hint">请前往"批量导入"选项卡导入学生</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = students.map((student, index) => `
            <tr>
                <td>${index + 1}</td>
                <td class="student-name">${student.name}</td>
                <td class="student-username">${student.username}</td>
                <td class="student-password">${student.password}</td>
                <td>${student.className}</td>
                <td>${student.studentId}</td>
                <td class="student-date">${new Date(student.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="TeacherAdmin.deleteStudentById('${student.id}')">
                        删除
                    </button>
                </td>
            </tr>
        `).join('');
    },

    /**
     * 删除学生（带UI刷新）
     */
    deleteStudentById(studentId) {
        if (confirm('确定要删除这名学生吗？')) {
            if (this.deleteStudent(studentId)) {
                showToast('学生已删除', 'success');
                this.renderStudentTable();
                this.renderProgressOverview();
                this.refreshStats();
            } else {
                showToast('删除失败', 'error');
            }
        }
    },

    /**
     * 渲染进度概览
     */
    renderProgressOverview() {
        const container = document.getElementById('progress-overview');
        if (!container) return;

        const students = this.getAllStudents();

        if (students.length === 0) {
            container.innerHTML = '<p class="empty-hint">暂无学生数据</p>';
            return;
        }

        // 按班级分组
        const classGroups = {};
        students.forEach(s => {
            if (!classGroups[s.className]) {
                classGroups[s.className] = [];
            }
            classGroups[s.className].push(s);
        });

        container.innerHTML = Object.entries(classGroups).map(([className, classStudents]) => {
            const totalLessons = 17;
            const avgProgress = classStudents.reduce((sum, s) => {
                const completed = s.progress && s.progress.completedLessons ? s.progress.completedLessons.length : 0;
                return sum + (completed / totalLessons * 100);
            }, 0) / classStudents.length;

            return `
                <div class="class-progress-card">
                    <div class="class-progress-header">
                        <h3>${className}</h3>
                        <span class="class-student-count">${classStudents.length}人</span>
                    </div>
                    <div class="class-progress-bar">
                        <div class="progress-fill" style="width:${Math.round(avgProgress)}%"></div>
                        <span class="progress-text">${Math.round(avgProgress)}%</span>
                    </div>
                    <div class="class-student-progress">
                        ${classStudents.map(s => {
                            const completed = s.progress && s.progress.completedLessons ? s.progress.completedLessons.length : 0;
                            const percent = Math.round(completed / totalLessons * 100);
                            return `
                                <div class="student-progress-item">
                                    <span class="student-progress-name">${s.name}</span>
                                    <div class="student-progress-bar">
                                        <div class="progress-fill" style="width:${percent}%"></div>
                                    </div>
                                    <span class="student-progress-text">${completed}/${totalLessons}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
};

// ============================================================
// 导出模块
// ============================================================
window.TeacherAdmin = TeacherAdmin;
