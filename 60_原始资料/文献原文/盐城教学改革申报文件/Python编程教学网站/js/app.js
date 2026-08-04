/**
 * app.js - 主应用控制器
 * Python编程教学网站核心控制器
 * 负责页面初始化、路由管理、全局状态、Toast通知等
 */

// ============================================================
// 全局应用状态
// ============================================================
const AppState = {
    // 当前课时ID
    currentLessonId: null,
    // 当前模块ID
    currentModuleId: null,
    // Pyodide加载状态
    pyodideReady: false,
    pyodideLoading: false,
    // 侧边栏展开状态
    sidebarExpanded: true,
    // 移动端侧边栏状态
    mobileSidebarOpen: false,
    // Toast通知队列
    toastQueue: [],
    toastTimer: null,
    // 页面路由历史
    routeHistory: [],
    // 编辑器实例引用
    editorInstance: null,
    // 3D可视化实例引用
    visualizerInstance: null,
    // 用户偏好设置
    preferences: {
        fontSize: 14,
        theme: 'light',
        autoRun: false,
        soundEnabled: true
    }
};

// ============================================================
// 初始化入口
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] Python编程教学网站初始化...');
    initApp();
});

/**
 * 初始化应用
 */
async function initApp() {
    try {
        // 1. 从localStorage恢复用户进度
        loadUserProgress();
        console.log('[App] 用户进度已恢复');

        // 2. 渲染侧边栏课程目录
        renderSidebar();
        console.log('[App] 侧边栏已渲染');

        // 3. 初始化导航系统
        initNavigation();
        console.log('[App] 导航系统已初始化');

        // 4. 初始化侧边栏
        initSidebar();
        console.log('[App] 侧边栏已初始化');

        // 4. 初始化路由系统
        initRouter();
        console.log('[App] 路由系统已初始化');

        // 5. 初始化代码编辑器
        initCodeEditor();
        console.log('[App] 代码编辑器已初始化');

        // 6. 初始化Toast通知容器
        initToastContainer();
        console.log('[App] Toast通知已初始化');

        // 7. 初始化滚动动画
        initScrollAnimations();
        console.log('[App] 滚动动画已初始化');

        // 8. 初始化所有子系统
        initSubsystems();
        console.log('[App] 子系统已初始化');

        // 9. 加载Pyodide（异步）
        initPyodideAsync();

        // 10. 初始化响应式适配
        initResponsive();
        console.log('[App] 响应式适配已初始化');

        // 11. 显示欢迎Toast
        showToast('欢迎来到Python编程教学网站！', 'success');

        console.log('[App] 初始化完成');
    } catch (error) {
        console.error('[App] 初始化失败:', error);
        showToast('网站初始化失败，请刷新页面重试', 'error');
    }
}

// ============================================================
// 用户进度管理
// ============================================================

/**
 * 从localStorage加载用户进度
 */
function loadUserProgress() {
    try {
        const saved = localStorage.getItem('python_learning_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            AppState.currentLessonId = progress.currentLessonId || null;
            AppState.currentModuleId = progress.currentModuleId || null;
            AppState.preferences = { ...AppState.preferences, ...progress.preferences };
            console.log('[App] 已恢复进度:', progress);
        }
    } catch (e) {
        console.warn('[App] 恢复用户进度失败:', e);
    }
}

/**
 * 保存用户进度到localStorage
 */
function saveUserProgress() {
    try {
        const progress = {
            currentLessonId: AppState.currentLessonId,
            currentModuleId: AppState.currentModuleId,
            preferences: AppState.preferences
        };
        localStorage.setItem('python_learning_progress', JSON.stringify(progress));
    } catch (e) {
        console.warn('[App] 保存用户进度失败:', e);
    }
}

/**
 * 更新当前课时
 */
function setCurrentLesson(lessonId) {
    AppState.currentLessonId = lessonId;
    // 根据课时ID推断模块
    if (typeof LESSONS_DATA !== 'undefined' && LESSONS_DATA.length > 0) {
        const lesson = LESSONS_DATA.find(l => l.id === lessonId);
        if (lesson) {
            AppState.currentModuleId = lesson.module;
        }
    }
    saveUserProgress();
    // 更新导航高亮
    updateNavHighlight(lessonId);
}

// ============================================================
// 导航系统
// ============================================================

/**
 * 初始化导航
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            if (target) {
                navigateTo(target);
            }
        });
    });

    // 模块导航折叠
    const moduleHeaders = document.querySelectorAll('.module-header');
    moduleHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            if (content) {
                content.classList.toggle('collapsed');
                header.classList.toggle('expanded');
            }
        });
    });
}

/**
 * 页面导航
 */
function navigateTo(target) {
    // 更新hash路由
    window.location.hash = target;
    // 关闭移动端侧边栏
    closeMobileSidebar();
}

/**
 * 更新导航高亮状态
 */
function updateNavHighlight(lessonId) {
    // 移除所有高亮
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    // 添加当前高亮
    const activeLink = document.querySelector(`.nav-link[data-lesson="${lessonId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        // 确保父级模块展开
        const moduleContent = activeLink.closest('.module-content');
        if (moduleContent) {
            moduleContent.classList.remove('collapsed');
            const header = moduleContent.previousElementSibling;
            if (header) {
                header.classList.add('expanded');
            }
        }
    }
}

// ============================================================
// 侧边栏管理
// ============================================================

/**
 * 初始化侧边栏
 */
function initSidebar() {
    // 侧边栏折叠按钮
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }

    // 移动端菜单按钮
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', toggleMobileSidebar);
    }

    // 移动端遮罩层
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeMobileSidebar);
    }

    // 恢复侧边栏状态
    if (window.innerWidth < 768) {
        AppState.sidebarExpanded = false;
    }
    updateSidebarState();
}

/**
 * 切换侧边栏展开/折叠
 */
function toggleSidebar() {
    AppState.sidebarExpanded = !AppState.sidebarExpanded;
    updateSidebarState();
}

/**
 * 更新侧边栏视觉状态
 */
function updateSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    if (sidebar && mainContent) {
        if (AppState.sidebarExpanded) {
            sidebar.classList.remove('collapsed');
            sidebar.classList.add('expanded');
            mainContent.classList.remove('full-width');
            mainContent.classList.add('with-sidebar');
        } else {
            sidebar.classList.remove('expanded');
            sidebar.classList.add('collapsed');
            mainContent.classList.remove('with-sidebar');
            mainContent.classList.add('full-width');
        }
    }
}

/**
 * 切换移动端侧边栏
 */
function toggleMobileSidebar() {
    AppState.mobileSidebarOpen = !AppState.mobileSidebarOpen;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) {
        sidebar.classList.toggle('mobile-open', AppState.mobileSidebarOpen);
    }
    if (overlay) {
        overlay.classList.toggle('visible', AppState.mobileSidebarOpen);
    }
    // 阻止背景滚动
    document.body.style.overflow = AppState.mobileSidebarOpen ? 'hidden' : '';
}

/**
 * 关闭移动端侧边栏
 */
function closeMobileSidebar() {
    AppState.mobileSidebarOpen = false;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) {
        sidebar.classList.remove('mobile-open');
    }
    if (overlay) {
        overlay.classList.remove('visible');
    }
    document.body.style.overflow = '';
}

/**
 * 渲染侧边栏课程目录
 */
function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    if (typeof LESSONS_DATA === 'undefined') return;

    // 按模块分组
    const modules = {};
    LESSONS_DATA.forEach(lesson => {
        if (!modules[lesson.module]) {
            modules[lesson.module] = {
                id: lesson.module,
                title: lesson.module_title || `模块${lesson.module}`,
                lessons: []
            };
        }
        modules[lesson.module].lessons.push(lesson);
    });

    // 构建HTML
    let html = `
        <div class="sidebar-header">
            <h2 class="sidebar-title">课程目录</h2>
            <button class="sidebar-toggle-btn" id="sidebar-toggle" title="折叠/展开">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
        <nav class="sidebar-nav">
    `;

    Object.values(modules).forEach(module => {
        html += `
            <div class="sidebar-module">
                <div class="module-header expanded" data-module="${module.id}">
                    <span class="module-icon">M${module.id}</span>
                    <span class="module-title">${module.title}</span>
                    <span class="module-count">${module.lessons.length}课</span>
                </div>
                <ul class="module-content">
        `;
        module.lessons.forEach(lesson => {
            html += `
                    <li>
                        <a href="#lesson/${lesson.id}" class="nav-link" data-lesson="${lesson.id}" data-target="lesson/${lesson.id}">
                            <span class="lesson-num">第${lesson.lesson_number}课</span>
                            <span class="lesson-title-text">${lesson.title}</span>
                        </a>
                    </li>
            `;
        });
        html += `</ul></div>`;
    });

    html += `
        </nav>
        <div class="sidebar-footer">
            <a href="#progress" class="nav-link sidebar-progress-link" data-target="progress">
                <span>学习进度</span>
            </a>
        </div>
    `;

    sidebar.innerHTML = html;

    // 重新绑定导航事件
    initNavigation();
}

// ============================================================
// 路由系统（Hash路由）
// ============================================================

/**
 * 初始化路由
 */
function initRouter() {
    // 监听hash变化
    window.addEventListener('hashchange', handleRouteChange);

    // 初始路由处理
    handleRouteChange();
}

/**
 * 处理路由变化
 */
function handleRouteChange() {
    const hash = window.location.hash.slice(1); // 去掉#号
    console.log('[App] 路由变化:', hash);

    if (!hash || hash === '' || hash === '/') {
        // 默认首页
        showHomePage();
        return;
    }

    if (hash.startsWith('lesson/')) {
        // 课时页面: #lesson/1
        const lessonId = parseInt(hash.split('/')[1]);
        if (!isNaN(lessonId)) {
            loadLessonPage(lessonId);
            return;
        }
    }

    if (hash === 'progress') {
        showProgressPage();
        return;
    }

    if (hash === 'about') {
        showAboutPage();
        return;
    }

    if (hash === 'admin') {
        if (typeof TeacherAdmin !== 'undefined') {
            TeacherAdmin.showAdminPage();
        } else {
            show404Page();
        }
        return;
    }

    if (hash === 'exam') {
        if (typeof QuizSystem !== 'undefined') {
            QuizSystem.showStudentExamList();
        } else {
            show404Page();
        }
        return;
    }

    // 未匹配路由
    show404Page();
}

/**
 * 显示首页
 */
function showHomePage() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
        <div class="page-home animate-fade-in">
            <section class="hero-section">
                <h1>Python编程学习平台</h1>
                <p class="hero-subtitle">在浏览器中学习Python，实时查看3D可视化效果</p>
                <div class="hero-actions">
                    <button class="btn btn-primary btn-lg" onclick="navigateTo('lesson/1')">
                        开始学习
                    </button>
                    <button class="btn btn-outline btn-lg" onclick="navigateTo('progress')">
                        查看进度
                    </button>
                </div>
            </section>

            <section class="features-section">
                <h2>平台特色</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">💻</div>
                        <h3>在线编程</h3>
                        <p>无需安装任何软件，在浏览器中直接编写和运行Python代码</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🧊</div>
                        <h3>3D可视化</h3>
                        <p>代码运行结果实时映射为3D模型，直观理解参数化建模</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🤖</div>
                        <h3>智能诊断</h3>
                        <p>自动识别代码错误，给出中文提示和修复建议</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🏆</div>
                        <h3>成就系统</h3>
                        <p>完成任务获得积分和徽章，激发学习动力</p>
                    </div>
                </div>
            </section>

            <section class="modules-overview">
                <h2>课程大纲</h2>
                <div class="modules-list" id="home-modules-list">
                    <!-- 由renderHomeModules动态填充 -->
                </div>
            </section>
        </div>
    `;

    // 渲染模块概览
    renderHomeModules();
    // 触发滚动动画
    initScrollAnimations();
}

/**
 * 渲染首页模块列表
 */
function renderHomeModules() {
    const container = document.getElementById('home-modules-list');
    if (!container || typeof LESSONS_DATA === 'undefined') return;

    const modules = {};
    LESSONS_DATA.forEach(lesson => {
        if (!modules[lesson.module]) {
            modules[lesson.module] = {
                id: lesson.module,
                title: lesson.module_title,
                lessons: []
            };
        }
        modules[lesson.module].lessons.push(lesson);
    });

    container.innerHTML = Object.values(modules).map(mod => `
        <div class="module-card">
            <div class="module-card-header">
                <h3>${mod.title}</h3>
                <span class="lesson-count">${mod.lessons.length}课时</span>
            </div>
            <ul class="module-lessons-list">
                ${mod.lessons.map(l => `
                    <li>
                        <a href="#lesson/${l.id}" class="lesson-link">
                            <span class="lesson-number">第${l.lesson_number}课</span>
                            <span class="lesson-title">${l.title}</span>
                        </a>
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('');
}

/**
 * 加载课时页面
 */
function loadLessonPage(lessonId) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // 查找课时数据
    const lesson = typeof LESSONS_DATA !== 'undefined'
        ? LESSONS_DATA.find(l => l.id === lessonId)
        : null;

    if (!lesson) {
        show404Page();
        return;
    }

    // 更新状态
    setCurrentLesson(lessonId);

    // 获取相邻课时
    const currentIndex = LESSONS_DATA.findIndex(l => l.id === lessonId);
    const prevLesson = currentIndex > 0 ? LESSONS_DATA[currentIndex - 1] : null;
    const nextLesson = currentIndex < LESSONS_DATA.length - 1 ? LESSONS_DATA[currentIndex + 1] : null;

    // 渲染课时页面
    mainContent.innerHTML = `
        <div class="page-lesson animate-fade-in">
            <!-- 课时头部 -->
            <div class="lesson-header">
                <div class="lesson-breadcrumb">
                    <a href="#" onclick="navigateTo('');return false;">首页</a>
                    <span class="breadcrumb-sep">/</span>
                    <span>${lesson.module_title || '课程'}</span>
                    <span class="breadcrumb-sep">/</span>
                    <span class="breadcrumb-current">第${lesson.lesson_number}课</span>
                </div>
                <h1 class="lesson-title">${lesson.title}</h1>
                <p class="lesson-description">${lesson.description}</p>
                <div class="lesson-meta">
                    <span class="difficulty-badge difficulty-${lesson.difficulty}">
                        难度：${'★'.repeat(lesson.difficulty)}${'☆'.repeat(5 - lesson.difficulty)}
                    </span>
                </div>
            </div>

            <!-- 知识点 -->
            <div class="lesson-section knowledge-section">
                <h2>知识点</h2>
                <div class="knowledge-tags">
                    ${lesson.knowledge_points.map(kp => `
                        <span class="knowledge-tag">${kp}</span>
                    `).join('')}
                </div>
            </div>

            <!-- 教学内容区 -->
            <div class="lesson-content-area">
                <!-- 左侧：代码编辑器 -->
                <div class="editor-panel">
                    <div class="panel-header">
                        <h3>代码编辑器</h3>
                        <div class="editor-actions">
                            <button class="btn btn-sm btn-outline" id="btn-reset-code" title="重置代码">
                                重置
                            </button>
                            <button class="btn btn-sm btn-outline" id="btn-format-code" title="格式化代码">
                                格式化
                            </button>
                        </div>
                    </div>
                    <div class="code-editor-wrapper">
                        <div class="line-numbers" id="line-numbers"></div>
                        <textarea
                            id="code-editor"
                            class="code-editor"
                            spellcheck="false"
                            placeholder="在这里编写Python代码..."
                        >${escapeHtml(lesson.starter_code)}</textarea>
                    </div>
                    <div class="editor-footer">
                        <button class="btn btn-primary" id="btn-run-code" ${!AppState.pyodideReady ? 'disabled' : ''}>
                            <span class="btn-icon">▶</span>
                            <span>${AppState.pyodideReady ? '运行代码' : '正在加载Python环境...'}</span>
                        </button>
                        <button class="btn btn-success" id="btn-run-3d" ${!AppState.pyodideReady ? 'disabled' : ''}>
                            <span class="btn-icon">🧊</span>
                            <span>3D预览</span>
                        </button>
                        <div class="run-status" id="run-status"></div>
                    </div>
                </div>

                <!-- 右侧：输出和可视化 -->
                <div class="output-panel">
                    <!-- 输出区域 -->
                    <div class="output-section">
                        <div class="panel-header">
                            <h3>运行输出</h3>
                            <button class="btn btn-sm btn-outline" id="btn-clear-output">清空</button>
                        </div>
                        <div class="output-content" id="output-content">
                            <div class="output-placeholder">
                                点击"运行代码"按钮查看输出结果
                            </div>
                        </div>
                    </div>

                    <!-- 3D可视化区域 -->
                    <div class="visualizer-section" id="visualizer-section" style="display:none;">
                        <div class="panel-header">
                            <h3>3D可视化</h3>
                            <div class="visualizer-actions">
                                <button class="btn btn-sm btn-outline" id="btn-rotate-toggle">
                                    自动旋转
                                </button>
                                <button class="btn btn-sm btn-outline" id="btn-screenshot">
                                    截图
                                </button>
                                <button class="btn btn-sm btn-outline" id="btn-fullscreen">
                                    全屏
                                </button>
                            </div>
                        </div>
                        <div class="threejs-container" id="threejs-container"></div>
                        <!-- 参数滑块区 -->
                        <div class="parameter-sliders" id="parameter-sliders"></div>
                    </div>

                    <!-- 练习题区域 -->
                    <div class="exercise-section">
                        <div class="panel-header">
                            <h3>练习</h3>
                        </div>
                        <div class="exercise-content">
                            <p class="exercise-text">${lesson.exercise}</p>
                            <div class="hints-area">
                                <button class="btn btn-sm btn-outline" id="btn-show-hint">
                                    显示提示
                                </button>
                                <div class="hints-list" id="hints-list" style="display:none;">
                                    ${lesson.hints.map((hint, i) => `
                                        <div class="hint-item">
                                            <strong>提示${i + 1}：</strong>${hint}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 常见错误提醒 -->
                    <div class="common-errors-section">
                        <div class="panel-header">
                            <h3>常见错误</h3>
                        </div>
                        <div class="common-errors-list">
                            ${lesson.common_errors.map(err => `
                                <div class="error-item">
                                    <span class="error-type-badge">${err.type}</span>
                                    <span class="error-desc">${err.description}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部导航 -->
            <div class="lesson-navigation">
                ${prevLesson ? `
                    <a href="#lesson/${prevLesson.id}" class="btn btn-outline nav-prev">
                        ← 第${prevLesson.lesson_number}课：${prevLesson.title}
                    </a>
                ` : '<div></div>'}
                ${nextLesson ? `
                    <a href="#lesson/${nextLesson.id}" class="btn btn-primary nav-next">
                        第${nextLesson.lesson_number}课：${nextLesson.title} →
                    </a>
                ` : `
                    <a href="#" class="btn btn-success nav-next" onclick="showToast('恭喜你完成了所有课程！', 'success'); return false;">
                        完成全部课程！
                    </a>
                `}
            </div>
        </div>
    `;

    // 绑定课时页面事件
    bindLessonEvents(lesson);
    // 初始化代码编辑器
    initCodeEditor();
    // 初始化3D可视化
    initLessonVisualizer(lesson);
    // 更新进度条
    updateProgressIndicator(lessonId);
    // 触发滚动动画
    initScrollAnimations();
}

/**
 * 绑定课时页面事件
 */
function bindLessonEvents(lesson) {
    // 运行代码按钮
    const runBtn = document.getElementById('btn-run-code');
    if (runBtn) {
        runBtn.addEventListener('click', handleRunCode);
    }

    // 3D预览按钮
    const run3dBtn = document.getElementById('btn-run-3d');
    if (run3dBtn) {
        run3dBtn.addEventListener('click', handleRun3D);
    }

    // 重置代码按钮
    const resetBtn = document.getElementById('btn-reset-code');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const editor = document.getElementById('code-editor');
            if (editor) {
                editor.value = lesson.starter_code;
                updateLineNumbers();
                showToast('代码已重置为初始代码', 'info');
                // 评价系统记录
                if (typeof EvaluationSystem !== 'undefined') {
                    EvaluationSystem.recordAction('reset_code', lesson.id);
                }
            }
        });
    }

    // 格式化代码按钮
    const formatBtn = document.getElementById('btn-format-code');
    if (formatBtn) {
        formatBtn.addEventListener('click', formatCode);
    }

    // 清空输出按钮
    const clearBtn = document.getElementById('btn-clear-output');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const output = document.getElementById('output-content');
            if (output) {
                output.innerHTML = '<div class="output-placeholder">输出已清空</div>';
            }
        });
    }

    // 显示提示按钮
    const hintBtn = document.getElementById('btn-show-hint');
    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            const hintsList = document.getElementById('hints-list');
            if (hintsList) {
                hintsList.style.display = hintsList.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    // 3D可视化按钮
    const rotateBtn = document.getElementById('btn-rotate-toggle');
    if (rotateBtn) {
        rotateBtn.addEventListener('click', () => {
            rotateBtn.classList.toggle('active');
            if (typeof Visualizer3D !== 'undefined') {
                Visualizer3D.toggleAutoRotate();
            }
        });
    }

    const screenshotBtn = document.getElementById('btn-screenshot');
    if (screenshotBtn) {
        screenshotBtn.addEventListener('click', () => {
            if (typeof Visualizer3D !== 'undefined') {
                Visualizer3D.takeScreenshot();
            }
        });
    }

    const fullscreenBtn = document.getElementById('btn-fullscreen');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const container = document.getElementById('threejs-container');
            if (container) {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    container.requestFullscreen();
                }
            }
        });
    }

    // Tab键支持
    const editor = document.getElementById('code-editor');
    if (editor) {
        editor.addEventListener('keydown', handleEditorKeyDown);
        editor.addEventListener('input', updateLineNumbers);
        editor.addEventListener('scroll', syncLineNumbersScroll);
    }
}

/**
 * 处理代码运行
 */
async function handleRunCode() {
    const editor = document.getElementById('code-editor');
    const output = document.getElementById('output-content');
    const runStatus = document.getElementById('run-status');

    if (!editor || !output) return;

    const code = editor.value.trim();
    if (!code) {
        showToast('请先输入代码', 'warning');
        return;
    }

    // 检查Pyodide是否就绪
    if (!AppState.pyodideReady) {
        showToast('Python环境正在加载中，请稍候...', 'warning');
        return;
    }

    // 显示运行状态
    if (runStatus) {
        runStatus.className = 'run-status running';
        runStatus.textContent = '运行中...';
    }

    try {
        // 预诊断：检查常见错误
        if (typeof ErrorDiagnosis !== 'undefined') {
            const preDiagnosis = ErrorDiagnosis.preCheck(code);
            if (preDiagnosis.hasError) {
                // 显示预诊断警告，但仍允许运行
                preDiagnosis.warnings.forEach(warning => {
                    appendOutput(output, `⚠ 预检查警告: ${warning.message}`, 'warning');
                });
            }
        }

        // 执行代码
        const result = await PyodideRunner.runCode(code, 'exec');

        if (result.success) {
            // 输出结果
            if (result.stdout) {
                result.stdout.split('\n').forEach(line => {
                    if (line.trim()) {
                        appendOutput(output, line, 'output');
                    }
                });
            }

            // 如果有matplotlib图片
            if (result.images && result.images.length > 0) {
                result.images.forEach(img => {
                    const imgEl = document.createElement('img');
                    imgEl.src = `data:image/png;base64,${img}`;
                    imgEl.className = 'output-image';
                    output.appendChild(imgEl);
                });
            }

            // 评价系统记录
            if (typeof EvaluationSystem !== 'undefined') {
                EvaluationSystem.recordAction('run_code_success', AppState.currentLessonId, {
                    code: code,
                    output: result.stdout
                });
            }

            if (runStatus) {
                runStatus.className = 'run-status success';
                runStatus.textContent = '运行成功';
            }
        } else {
            // 错误输出
            appendOutput(output, result.stderr, 'error');

            // 错误诊断
            if (typeof ErrorDiagnosis !== 'undefined') {
                const diagnosis = ErrorDiagnosis.diagnose(result.stderr, code);
                if (diagnosis) {
                    appendOutput(output, '\n--- 错误诊断 ---', 'diagnosis');
                    appendOutput(output, `错误类型: ${diagnosis.errorType}`, 'diagnosis');
                    appendOutput(output, `原因分析: ${diagnosis.reason}`, 'diagnosis');
                    appendOutput(output, `修复建议: ${diagnosis.suggestion}`, 'diagnosis');
                    if (diagnosis.example) {
                        appendOutput(output, `示例代码:`, 'diagnosis');
                        appendOutput(output, diagnosis.example, 'code-example');
                    }
                }
            }

            // 评价系统记录错误
            if (typeof EvaluationSystem !== 'undefined') {
                EvaluationSystem.recordAction('run_code_error', AppState.currentLessonId, {
                    error: result.stderr,
                    code: code
                });
            }

            if (runStatus) {
                runStatus.className = 'run-status error';
                runStatus.textContent = '运行失败';
            }
        }
    } catch (error) {
        appendOutput(output, `系统错误: ${error.message}`, 'error');
        if (runStatus) {
            runStatus.className = 'run-status error';
            runStatus.textContent = '系统错误';
        }
    }
}

/**
 * 处理3D预览运行
 */
async function handleRun3D() {
    const editor = document.getElementById('code-editor');
    const visualizerSection = document.getElementById('visualizer-section');

    if (!editor || !visualizerSection) return;

    const code = editor.value.trim();
    if (!code) {
        showToast('请先输入代码', 'warning');
        return;
    }

    if (!AppState.pyodideReady) {
        showToast('Python环境正在加载中，请稍候...', 'warning');
        return;
    }

    // 显示3D可视化区域
    visualizerSection.style.display = 'block';

    try {
        // 执行代码，使用eval模式以获取返回值
        const result = await PyodideRunner.runCode(code, 'eval');

        if (result.success && result.stdout) {
            // 尝试解析3D参数
            if (typeof Visualizer3D !== 'undefined') {
                Visualizer3D.parseAndVisualize(result.stdout, code);
            }
            showToast('3D可视化已更新', 'success');
        } else if (!result.success) {
            showToast('代码运行失败，请检查错误', 'error');
            if (result.stderr) {
                const output = document.getElementById('output-content');
                if (output) {
                    appendOutput(output, result.stderr, 'error');
                }
            }
        }
    } catch (error) {
        showToast('3D可视化生成失败: ' + error.message, 'error');
    }
}

/**
 * 初始化课时3D可视化
 */
function initLessonVisualizer(lesson) {
    if (lesson.three_d_demo && typeof Visualizer3D !== 'undefined') {
        const visualizerSection = document.getElementById('visualizer-section');
        if (visualizerSection) {
            visualizerSection.style.display = 'block';
            Visualizer3D.init('threejs-container', lesson.three_d_demo);
        }
    }
}

/**
 * 追加输出内容
 */
function appendOutput(container, text, className) {
    const line = document.createElement('div');
    line.className = `output-line ${className || ''}`;
    line.textContent = text;
    container.appendChild(line);
    // 自动滚动到底部
    container.scrollTop = container.scrollHeight;
}

/**
 * 显示进度页面
 */
function showProgressPage() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const stats = typeof EvaluationSystem !== 'undefined'
        ? EvaluationSystem.getStats()
        : { totalRuns: 0, errorsFixed: 0, exercisesCompleted: 0, badges: [], totalPoints: 0 };

    mainContent.innerHTML = `
        <div class="page-progress animate-fade-in">
            <h1>学习进度</h1>

            <div class="stats-overview">
                <div class="stat-card">
                    <div class="stat-value">${stats.totalRuns}</div>
                    <div class="stat-label">代码运行次数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.errorsFixed}</div>
                    <div class="stat-label">解决错误次数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.exercisesCompleted}</div>
                    <div class="stat-label">完成练习数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalPoints}</div>
                    <div class="stat-label">累计积分</div>
                </div>
            </div>

            <div class="progress-section">
                <h2>课程进度</h2>
                <div class="progress-bars" id="progress-bars">
                    <!-- 动态渲染 -->
                </div>
            </div>

            <div class="badges-section">
                <h2>获得徽章</h2>
                <div class="badges-grid" id="badges-grid">
                    <!-- 动态渲染 -->
                </div>
            </div>
        </div>
    `;

    renderProgressBars();
    renderBadges();
}

/**
 * 渲染进度条
 */
function renderProgressBars() {
    const container = document.getElementById('progress-bars');
    if (!container || typeof LESSONS_DATA === 'undefined') return;

    const completedLessons = typeof EvaluationSystem !== 'undefined'
        ? EvaluationSystem.getCompletedLessons()
        : [];

    const modules = {};
    LESSONS_DATA.forEach(lesson => {
        if (!modules[lesson.module]) {
            modules[lesson.module] = {
                title: lesson.module_title,
                total: 0,
                completed: 0
            };
        }
        modules[lesson.module].total++;
        if (completedLessons.includes(lesson.id)) {
            modules[lesson.module].completed++;
        }
    });

    container.innerHTML = Object.values(modules).map(mod => {
        const percent = Math.round((mod.completed / mod.total) * 100);
        return `
            <div class="progress-item">
                <div class="progress-info">
                    <span>${mod.title}</span>
                    <span>${mod.completed}/${mod.total}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${percent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 渲染徽章
 */
function renderBadges() {
    const container = document.getElementById('badges-grid');
    if (!container || typeof EvaluationSystem === 'undefined') return;

    const earnedBadges = EvaluationSystem.getEarnedBadges();
    const allBadges = EvaluationSystem.getAllBadges();

    container.innerHTML = allBadges.map(badge => {
        const earned = earnedBadges.includes(badge.id);
        return `
            <div class="badge-card ${earned ? 'earned' : 'locked'}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-desc">${badge.description}</div>
                ${earned ? '<div class="badge-date">已解锁</div>' : '<div class="badge-date">未解锁</div>'}
            </div>
        `;
    }).join('');
}

/**
 * 显示关于页面
 */
function showAboutPage() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
        <div class="page-about animate-fade-in">
            <h1>关于本平台</h1>
            <div class="about-content">
                <p>Python编程教学网站是面向高中信息技术课程的教学平台。</p>
                <p>本平台基于Pyodide技术，在浏览器中运行Python代码，结合Three.js实现3D可视化效果。</p>
                <h2>技术栈</h2>
                <ul>
                    <li>Pyodide - Python WebAssembly运行时</li>
                    <li>Three.js - 3D图形渲染</li>
                    <li>原生JavaScript - 无框架依赖</li>
                </ul>
            </div>
        </div>
    `;
}

/**
 * 显示404页面
 */
function show404Page() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
        <div class="page-404 animate-fade-in">
            <h1>404</h1>
            <p>页面未找到</p>
            <a href="#" class="btn btn-primary" onclick="navigateTo(''); return false;">返回首页</a>
        </div>
    `;
}

// ============================================================
// Pyodide加载管理
// ============================================================

/**
 * 异步初始化Pyodide
 */
async function initPyodideAsync() {
    if (AppState.pyodideLoading || AppState.pyodideReady) return;

    AppState.pyodideLoading = true;
    updateRunButtonState();

    showToast('正在加载Python运行环境，请稍候...', 'info');

    try {
        if (typeof PyodideRunner !== 'undefined') {
            await PyodideRunner.init();
            AppState.pyodideReady = true;
            AppState.pyodideLoading = false;
            updateRunButtonState();
            showToast('Python环境加载完成！', 'success');
            console.log('[App] Pyodide加载成功');
        } else {
            console.warn('[App] PyodideRunner未定义，跳过Pyodide加载');
            AppState.pyodideLoading = false;
        }
    } catch (error) {
        AppState.pyodideLoading = false;
        console.error('[App] Pyodide加载失败:', error);
        showToast('Python环境加载失败，请刷新页面重试', 'error');
    }
}

/**
 * 更新运行按钮状态
 */
function updateRunButtonState() {
    const runBtn = document.getElementById('btn-run-code');
    const run3dBtn = document.getElementById('btn-run-3d');

    if (runBtn) {
        if (AppState.pyodideLoading) {
            runBtn.disabled = true;
            runBtn.innerHTML = '<span class="btn-spinner"></span><span>加载中...</span>';
        } else if (AppState.pyodideReady) {
            runBtn.disabled = false;
            runBtn.innerHTML = '<span class="btn-icon">▶</span><span>运行代码</span>';
        } else {
            runBtn.disabled = true;
            runBtn.innerHTML = '<span class="btn-icon">▶</span><span>环境未就绪</span>';
        }
    }

    if (run3dBtn) {
        run3dBtn.disabled = !AppState.pyodideReady;
    }
}

// ============================================================
// 代码编辑器
// ============================================================

/**
 * 初始化代码编辑器
 */
function initCodeEditor() {
    const editor = document.getElementById('code-editor');
    if (!editor) return;

    // 设置字体大小
    editor.style.fontSize = AppState.preferences.fontSize + 'px';

    // 设置Tab大小
    editor.style.tabSize = '4';

    // 更新行号
    updateLineNumbers();
}

/**
 * 编辑器键盘事件处理
 */
function handleEditorKeyDown(e) {
    const editor = e.target;

    // Tab键 -> 插入4个空格
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const value = editor.value;

        if (e.shiftKey) {
            // Shift+Tab -> 减少缩进
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const line = value.substring(lineStart, end);
            if (line.startsWith('    ')) {
                editor.value = value.substring(0, lineStart) + line.substring(4) + value.substring(end);
                editor.selectionStart = Math.max(start - 4, lineStart);
                editor.selectionEnd = Math.max(end - 4, lineStart);
            }
        } else {
            // Tab -> 增加缩进
            editor.value = value.substring(0, start) + '    ' + value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 4;
        }
        updateLineNumbers();
    }

    // Enter键 -> 自动缩进
    if (e.key === 'Enter') {
        e.preventDefault();
        const start = editor.selectionStart;
        const value = editor.value;

        // 获取当前行的缩进
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLine = value.substring(lineStart, start);
        const indent = currentLine.match(/^\s*/)[0];

        // 如果行尾是冒号，增加缩进
        const extraIndent = currentLine.trimEnd().endsWith(':') ? '    ' : '';

        const insert = '\n' + indent + extraIndent;
        editor.value = value.substring(0, start) + insert + value.substring(start);
        editor.selectionStart = editor.selectionEnd = start + insert.length;
        updateLineNumbers();
    }

    // Ctrl+Enter / Cmd+Enter -> 运行代码
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
    }
}

/**
 * 更新行号显示
 */
function updateLineNumbers() {
    const editor = document.getElementById('code-editor');
    const lineNumbers = document.getElementById('line-numbers');
    if (!editor || !lineNumbers) return;

    const lines = editor.value.split('\n').length;
    lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) =>
        `<div class="line-number">${i + 1}</div>`
    ).join('');
}

/**
 * 同步行号滚动
 */
function syncLineNumbersScroll() {
    const editor = document.getElementById('code-editor');
    const lineNumbers = document.getElementById('line-numbers');
    if (editor && lineNumbers) {
        lineNumbers.scrollTop = editor.scrollTop;
    }
}

/**
 * 格式化代码（简单格式化）
 */
function formatCode() {
    const editor = document.getElementById('code-editor');
    if (!editor) return;

    try {
        // 使用Pyodide进行格式化（如果可用且加载了autopep8）
        // 简单的格式化：统一缩进
        let code = editor.value;
        // 去除行尾空白
        code = code.split('\n').map(line => line.trimEnd()).join('\n');
        // 去除多余空行
        code = code.replace(/\n{3,}/g, '\n\n');
        // 确保文件末尾有换行
        if (!code.endsWith('\n')) code += '\n';

        editor.value = code;
        updateLineNumbers();
        showToast('代码已格式化', 'info');
    } catch (error) {
        showToast('格式化失败', 'error');
    }
}

// ============================================================
// Toast通知系统
// ============================================================

/**
 * 初始化Toast容器
 */
function initToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

/**
 * 显示Toast通知
 * @param {string} message - 消息内容
 * @param {string} type - 类型：success/error/warning/info
 * @param {number} duration - 持续时间（毫秒）
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;

    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // 自动移除
    setTimeout(() => {
        toast.classList.add('animate-slide-out');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

// ============================================================
// 滚动动画
// ============================================================

/**
 * 初始化滚动动画
 */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ============================================================
// 进度指示器
// ============================================================

/**
 * 更新进度指示器
 */
function updateProgressIndicator(lessonId) {
    if (typeof LESSONS_DATA === 'undefined') return;

    const index = LESSONS_DATA.findIndex(l => l.id === lessonId);
    const total = LESSONS_DATA.length;
    const percent = Math.round(((index + 1) / total) * 100);

    // 更新顶部进度条
    const progressBar = document.getElementById('global-progress');
    if (progressBar) {
        progressBar.style.width = percent + '%';
    }

    // 更新进度文本
    const progressText = document.getElementById('global-progress-text');
    if (progressText) {
        progressText.textContent = `${index + 1}/${total}`;
    }
}

// ============================================================
// 子系统初始化
// ============================================================

/**
 * 初始化所有子系统
 */
function initSubsystems() {
    // 错误诊断系统
    if (typeof ErrorDiagnosis !== 'undefined') {
        ErrorDiagnosis.init();
        console.log('[App] 错误诊断系统已初始化');
    }

    // 评价激励系统
    if (typeof EvaluationSystem !== 'undefined') {
        EvaluationSystem.init();
        console.log('[App] 评价激励系统已初始化');
    }

    // AI助手
    if (typeof AIAssistant !== 'undefined') {
        AIAssistant.init();
        console.log('[App] AI助手已初始化');
    }

    // 教师管理后台
    if (typeof TeacherAdmin !== 'undefined') {
        TeacherAdmin.init();
        console.log('[App] 教师管理后台已初始化');
    }

    // 题库考试系统
    if (typeof QuizSystem !== 'undefined') {
        QuizSystem.init();
        console.log('[App] 题库考试系统已初始化');
    }
}

// ============================================================
// 响应式适配
// ============================================================

/**
 * 初始化响应式
 */
function initResponsive() {
    // 监听窗口大小变化
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth >= 768) {
            closeMobileSidebar();
        }
        if (typeof Visualizer3D !== 'undefined') {
            Visualizer3D.onResize();
        }
    }, 250));

    // 3D可视化容器resize
    const resizeObserver = new ResizeObserver(() => {
        if (typeof Visualizer3D !== 'undefined') {
            Visualizer3D.onResize();
        }
    });

    const threeContainer = document.getElementById('threejs-container');
    if (threeContainer) {
        resizeObserver.observe(threeContainer);
    }
}

// ============================================================
// 工具函数
// ============================================================

/**
 * 防抖函数
 */
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * HTML转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 获取当前课时数据
 */
function getCurrentLesson() {
    if (AppState.currentLessonId && typeof LESSONS_DATA !== 'undefined') {
        return LESSONS_DATA.find(l => l.id === AppState.currentLessonId);
    }
    return null;
}

/**
 * 导出模块
 */
window.AppState = AppState;
window.initApp = initApp;
window.navigateTo = navigateTo;
window.showToast = showToast;
window.handleRunCode = handleRunCode;
window.handleRun3D = handleRun3D;
window.getCurrentLesson = getCurrentLesson;
window.loadLessonPage = loadLessonPage;
