/**
 * pyodide-runner.js - Python代码执行引擎
 * 负责加载Pyodide、执行Python代码、捕获输出和错误
 * 支持：numpy、matplotlib、代码超时保护、图片捕获
 */

// ============================================================
// Pyodide运行器
// ============================================================
const PyodideRunner = {
    // Pyodide实例
    pyodide: null,
    // 加载状态
    isLoaded: false,
    isLoading: false,
    // 已加载的包
    loadedPackages: new Set(),
    // Pyodide CDN地址
    PYODIDE_CDN: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
    // 默认加载的包
    DEFAULT_PACKAGES: ['numpy', 'matplotlib'],
    // 超时时间（毫秒）
    TIMEOUT_MS: 10000,

    /**
     * 初始化Pyodide
     */
    async init() {
        if (this.isLoaded || this.isLoading) {
            return;
        }

        this.isLoading = true;
        console.log('[PyodideRunner] 开始加载Pyodide...');

        try {
            // 动态加载Pyodide脚本
            await this.loadPyodideScript();

            // 加载默认包
            await this.loadDefaultPackages();

            this.isLoaded = true;
            this.isLoading = false;
            console.log('[PyodideRunner] Pyodide加载完成');
        } catch (error) {
            this.isLoading = false;
            console.error('[PyodideRunner] Pyodide加载失败:', error);
            throw error;
        }
    },

    /**
     * 动态加载Pyodide脚本
     */
    loadPyodideScript() {
        return new Promise((resolve, reject) => {
            // 检查是否已加载
            if (window.loadPyodide) {
                this.initPyodideInstance().then(resolve).catch(reject);
                return;
            }

            const script = document.createElement('script');
            script.src = this.PYODIDE_CDN + 'pyodide.js';
            script.async = true;

            script.onload = async () => {
                console.log('[PyodideRunner] Pyodide脚本加载完成');
                try {
                    await this.initPyodideInstance();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            script.onerror = () => {
                reject(new Error('无法加载Pyodide脚本，请检查网络连接'));
            };

            document.head.appendChild(script);
        });
    },

    /**
     * 初始化Pyodide实例
     */
    async initPyodideInstance() {
        console.log('[PyodideRunner] 初始化Pyodide实例...');

        this.pyodide = await window.loadPyodide({
            indexURL: this.PYODIDE_CDN
        });

        console.log('[PyodideRunner] Pyodide实例创建成功');

        // 设置stdout/stderr重定向
        this.setupStdoutRedirect();
    },

    /**
     * 设置stdout/stderr重定向
     */
    setupStdoutRedirect() {
        // 使用batched模式捕获输出（每次flush时调用）
        this.pyodide.setStdout({
            batched: (text) => {
                this._stdoutBuffer += text;
            }
        });

        this.pyodide.setStderr({
            batched: (text) => {
                this._stderrBuffer += text;
            }
        });
    },

    /**
     * 加载默认包（numpy和matplotlib）
     */
    async loadDefaultPackages() {
        console.log('[PyodideRunner] 加载默认包:', this.DEFAULT_PACKAGES);

        for (const pkg of this.DEFAULT_PACKAGES) {
            try {
                await this.loadPackage(pkg);
            } catch (error) {
                console.warn(`[PyodideRunner] 加载包 ${pkg} 失败:`, error);
            }
        }

        // 配置matplotlib使用Agg后端（非交互式）
        if (this.loadedPackages.has('matplotlib')) {
            try {
                this.pyodide.runPython(`
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
print("[系统] numpy和matplotlib已就绪")
                `);
                console.log('[PyodideRunner] matplotlib后端已配置');
            } catch (error) {
                console.warn('[PyodideRunner] matplotlib配置失败:', error);
            }
        }
    },

    /**
     * 加载指定的Python包
     */
    async loadPackage(packageName) {
        if (this.loadedPackages.has(packageName)) {
            return;
        }

        console.log(`[PyodideRunner] 加载包: ${packageName}`);

        try {
            await this.pyodide.loadPackage(packageName);
            this.loadedPackages.add(packageName);
            console.log(`[PyodideRunner] 包 ${packageName} 加载成功`);
        } catch (error) {
            console.error(`[PyodideRunner] 包 ${packageName} 加载失败:`, error);
            throw error;
        }
    },

    /**
     * 执行Python代码
     * @param {string} code - Python代码
     * @param {string} mode - 执行模式：'exec' 或 'eval'
     * @returns {Promise<Object>} 执行结果 {success, stdout, stderr, images, error}
     */
    async runCode(code, mode = 'exec') {
        // 确保Pyodide已加载
        if (!this.isLoaded) {
            if (this.isLoading) {
                return {
                    success: false,
                    stdout: '',
                    stderr: 'Python环境正在加载中，请稍候...',
                    images: [],
                    error: 'Pyodide not ready'
                };
            }
            // 尝试初始化
            await this.init();
        }

        // 清空缓冲区
        this._stdoutBuffer = '';
        this._stderrBuffer = '';

        // 清理matplotlib图片
        this.clearMatplotlibFigures();

        try {
            // 使用超时保护执行代码
            const result = await this.runWithTimeout(code, mode);

            // 收集matplotlib图片
            const images = await this.captureMatplotlibFigures();

            return {
                success: true,
                stdout: this._stdoutBuffer.trim(),
                stderr: this._stderrBuffer.trim(),
                images: images,
                error: null
            };
        } catch (error) {
            // 判断是否超时
            const isTimeout = error.message && error.message.includes('timeout');

            return {
                success: false,
                stdout: this._stdoutBuffer.trim(),
                stderr: isTimeout
                    ? `执行超时（超过${this.TIMEOUT_MS / 1000}秒），请检查代码是否有无限循环。`
                    : this.formatError(error),
                images: [],
                error: isTimeout ? 'timeout' : error.constructor.name
            };
        }
    },

    /**
     * 带超时保护的代码执行
     */
    runWithTimeout(code, mode) {
        return new Promise((resolve, reject) => {
            // 创建超时定时器
            const timeoutId = setTimeout(() => {
                // 尝试中断执行
                try {
                    this.pyodide.runPython('raise KeyboardInterrupt');
                } catch (e) {
                    // 忽略中断错误
                }
                reject(new Error('timeout: 代码执行超过' + this.TIMEOUT_MS / 1000 + '秒'));
            }, this.TIMEOUT_MS);

            try {
                // 执行代码
                if (mode === 'eval') {
                    // eval模式：返回表达式的值
                    this.pyodide.runPython(code);
                } else {
                    // exec模式：执行语句
                    this.pyodide.runPython(code);
                }

                clearTimeout(timeoutId);
                resolve();
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    },

    /**
     * 格式化错误信息
     */
    formatError(error) {
        // Pyodide的Python错误通常有message属性
        let errorMessage = '';

        if (error.message) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else {
            errorMessage = String(error);
        }

        // 清理错误信息中的Pyodide内部信息
        errorMessage = errorMessage
            // 去除Pyodide内部堆栈信息
            .replace(/File "<exec>"/g, 'File "<stdin>"')
            .replace(/\s+PyodideError:\s*/g, '\n')
            .trim();

        return errorMessage;
    },

    /**
     * 清理matplotlib图形
     */
    clearMatplotlibFigures() {
        if (!this.loadedPackages.has('matplotlib')) return;

        try {
            this.pyodide.runPython(`
import matplotlib.pyplot as plt
plt.close('all')
            `);
        } catch (e) {
            // 忽略清理错误
        }
    },

    /**
     * 捕获matplotlib图形为base64图片
     */
    async captureMatplotlibFigures() {
        if (!this.loadedPackages.has('matplotlib')) {
            return [];
        }

        const images = [];

        try {
            // 检查是否有图形
            const figCount = this.pyodide.runPython(`
import matplotlib.pyplot as plt
len(plt.get_fignums())
            `);

            if (figCount === 0) {
                return [];
            }

            // 将所有图形转为base64
            for (let i = 0; i < figCount; i++) {
                const base64Data = this.pyodide.runPython(`
import matplotlib.pyplot as plt
import io
import base64

# 获取图形
fig = plt.figure(${i + 1})
buf = io.BytesIO()
fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
buf.seek(0)
base64.b64encode(buf.read()).decode('utf-8')
                `);

                if (base64Data) {
                    images.push(base64Data);
                }
            }

            // 关闭所有图形
            this.clearMatplotlibFigures();
        } catch (error) {
            console.warn('[PyodideRunner] 捕获matplotlib图形失败:', error);
        }

        return images;
    },

    /**
     * 执行表达式并返回值
     * @param {string} expression - Python表达式
     * @returns {any} 表达式结果
     */
    async evalExpression(expression) {
        if (!this.isLoaded) {
            await this.init();
        }

        try {
            // 清空缓冲区
            this._stdoutBuffer = '';
            this._stderrBuffer = '';

            const result = this.pyodide.runPython(expression);
            return {
                success: true,
                value: result,
                stdout: this._stdoutBuffer.trim(),
                stderr: this._stderrBuffer.trim()
            };
        } catch (error) {
            return {
                success: false,
                value: null,
                stdout: this._stdoutBuffer.trim(),
                stderr: this.formatError(error)
            };
        }
    },

    /**
     * 加载并运行Python文件内容
     */
    async runFile(fileContent, fileName = 'script.py') {
        return await this.runCode(fileContent, 'exec');
    },

    /**
     * 获取Python变量的值
     */
    getVariable(name) {
        if (!this.isLoaded) {
            return null;
        }

        try {
            const value = this.pyodide.globals.get(name);
            return value;
        } catch (error) {
            console.warn(`[PyodideRunner] 获取变量 ${name} 失败:`, error);
            return null;
        }
    },

    /**
     * 设置Python变量的值
     */
    setVariable(name, value) {
        if (!this.isLoaded) {
            return false;
        }

        try {
            this.pyodide.globals.set(name, value);
            return true;
        } catch (error) {
            console.warn(`[PyodideRunner] 设置变量 ${name} 失败:`, error);
            return false;
        }
    },

    /**
     * 注册Python函数供JavaScript调用
     */
    registerFunction(jsFuncName, pyFuncName) {
        if (!this.isLoaded) return false;

        try {
            const pyFunc = this.pyodide.globals.get(pyFuncName);
            if (pyFunc) {
                window[jsFuncName] = pyFunc;
                return true;
            }
        } catch (error) {
            console.warn(`[PyodideRunner] 注册函数 ${pyFuncName} 失败:`, error);
        }
        return false;
    },

    /**
     * 检查是否已加载特定包
     */
    hasPackage(packageName) {
        return this.loadedPackages.has(packageName);
    },

    /**
     * 获取Python版本信息
     */
    getPythonVersion() {
        if (!this.isLoaded) return null;

        try {
            return this.pyodide.runPython('import sys; sys.version');
        } catch (error) {
            return null;
        }
    },

    /**
     * 重置Python环境
     */
    async reset() {
        if (!this.isLoaded) return;

        try {
            // 清空所有变量（保留内置模块）
            this.pyodide.runPython(`
import sys
# 保留的模块
keep_modules = set(sys.builtin_module_names)
# 清理用户定义的变量
for name in list(globals().keys()):
    if name not in keep_modules and not name.startswith('_'):
        del globals()[name]
# 重新导入常用模块
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
            `);
            console.log('[PyodideRunner] Python环境已重置');
        } catch (error) {
            console.warn('[PyodideRunner] 重置Python环境失败:', error);
        }
    },

    /**
     * 获取已加载的包列表
     */
    getLoadedPackages() {
        return Array.from(this.loadedPackages);
    },

    /**
     * 执行代码并获取所有变量
     * 用于调试和可视化
     */
    async runCodeAndGetVars(code) {
        const result = await this.runCode(code, 'exec');

        if (!result.success) {
            return { ...result, variables: {} };
        }

        // 获取所有用户定义的变量
        try {
            const varsJson = this.pyodide.runPython(`
import json
user_vars = {}
for name, value in list(globals().items()):
    if name.startswith('_') or callable(value):
        continue
    try:
        # 尝试JSON序列化
        if isinstance(value, (int, float, str, bool, list, dict, tuple)):
            user_vars[name] = value
        elif hasattr(value, 'tolist'):
            # numpy数组
            user_vars[name] = value.tolist()
        else:
            user_vars[name] = str(value)
    except:
        user_vars[name] = str(value)
json.dumps(user_vars, ensure_ascii=False, default=str)
            `);

            result.variables = JSON.parse(varsJson);
        } catch (error) {
            console.warn('[PyodideRunner] 获取变量失败:', error);
            result.variables = {};
        }

        return result;
    },

    /**
     * 执行代码并提取3D参数
     * 用于3D可视化模块
     */
    async runCodeFor3D(code) {
        // 包装代码，提取3D相关参数
        const wrappedCode = `
${code}

# 提取3D参数
import json
params_3d = {}
for name, value in list(globals().items()):
    if name.startswith('_') or callable(value):
        continue
    if isinstance(value, (int, float)):
        params_3d[name] = float(value)
    elif isinstance(value, (str, bool)):
        params_3d[name] = value
    elif isinstance(value, (list, tuple)):
        params_3d[name] = list(value)
    elif isinstance(value, dict):
        params_3d[name] = value
    elif hasattr(value, 'tolist'):
        params_3d[name] = value.tolist()

# 输出3D参数（特殊标记）
print("___3D_PARAMS___")
print(json.dumps(params_3d, ensure_ascii=False, default=str))
print("___END_3D_PARAMS___")
        `;

        const result = await this.runCode(wrappedCode, 'exec');

        if (!result.success) {
            return result;
        }

        // 从输出中提取3D参数
        const output = result.stdout;
        const startMarker = '___3D_PARAMS___';
        const endMarker = '___END_3D_PARAMS___';

        const startIndex = output.indexOf(startMarker);
        const endIndex = output.indexOf(endMarker);

        if (startIndex !== -1 && endIndex !== -1) {
            const paramsJson = output.substring(startIndex + startMarker.length, endIndex).trim();
            try {
                result.params3D = JSON.parse(paramsJson);
                // 从stdout中移除3D参数标记
                result.stdout = output.substring(0, startIndex).trim() +
                    output.substring(endIndex + endMarker.length).trim();
            } catch (e) {
                console.warn('[PyodideRunner] 解析3D参数失败:', e);
            }
        }

        return result;
    },

    /**
     * 获取运行状态
     */
    getStatus() {
        return {
            isLoaded: this.isLoaded,
            isLoading: this.isLoading,
            loadedPackages: this.getLoadedPackages(),
            pythonVersion: this.getPythonVersion()
        };
    }
};

// ============================================================
// 导出模块
// ============================================================
window.PyodideRunner = PyodideRunner;
