/**
 * error-diagnosis.js - 错误诊断系统
 * 负责解析Python错误、生成中文提示、预判常见问题
 * 包含30+种常见错误的映射数据库
 */

const ErrorDiagnosis = {
    // ============================================================
    // 错误映射数据库（30+种常见错误）
    // ============================================================
    errorDatabase: {
        // ---------- 语法错误 ----------
        'SyntaxError': {
            patterns: [
                {
                    // 缺少冒号
                    match: /invalid syntax.*\n.*\n.*\^|expected ':'/,
                    cause: '语法错误：可能缺少冒号（:）',
                    reason: '在Python中，if、for、while、def、class等语句的末尾必须加冒号":"。冒号表示一个代码块的开始。',
                    suggestion: '请检查报错行末尾是否遗漏了冒号":"。',
                    example: '# 错误\nif x > 0\n    print(x)\n\n# 正确\nif x > 0:\n    print(x)',
                    severity: 'error'
                },
                {
                    // 括号不匹配
                    match: /unexpected EOF while parsing|closing parenthesis|'\)' was never closed|'\(' was never closed|'\[' was never closed|'\]' was never closed/,
                    cause: '语法错误：括号不匹配',
                    reason: '代码中的括号（圆括号()、方括号[]、花括号{}）没有成对出现。',
                    suggestion: '请检查所有括号是否都正确配对，确保每个左括号都有对应的右括号。',
                    example: '# 错误\nprint("hello"\n\n# 正确\nprint("hello")',
                    severity: 'error'
                },
                {
                    // 字符串引号不匹配
                    match: /EOL while scanning string literal|unterminated string literal/,
                    cause: '语法错误：字符串引号不匹配',
                    reason: '字符串的引号没有闭合，可能使用了不同类型的引号或忘记闭合。',
                    suggestion: '请检查字符串是否以相同的引号（单引号或双引号）闭合。',
                    example: '# 错误\nprint("hello)\n\n# 正确\nprint("hello")',
                    severity: 'error'
                },
                {
                    // 赋值给字面量
                    match: /cannot assign to literal|can't assign to literal/,
                    cause: '语法错误：不能给字面量赋值',
                    reason: '赋值语句的左边必须是一个变量名，不能是数字或字符串等字面量。',
                    suggestion: '请确保赋值语句（=）左边是一个有效的变量名。',
                    example: '# 错误\n5 = x\n\n# 正确\nx = 5',
                    severity: 'error'
                },
                {
                    // 关键字作为标识符
                    match: /invalid syntax|expected/,
                    cause: '语法错误：使用了无效的语法',
                    reason: '代码中可能使用了Python关键字作为变量名，或者语句格式不正确。',
                    suggestion: '请检查是否使用了Python关键字（如if、for、class等）作为变量名。',
                    example: '# 错误\nclass = 10\n\n# 正确\nclass_name = 10',
                    severity: 'error'
                }
            ],
            defaultCause: '语法错误',
            defaultReason: '代码中存在语法错误，可能是拼写错误、缺少符号或语句格式不正确。',
            defaultSuggestion: '请仔细检查报错行附近的代码，确保语法正确。',
            defaultExample: '# 常见语法错误：\n# 1. 缺少冒号\n# 2. 括号不匹配\n# 3. 引号不匹配\n# 4. 缩进错误',
            defaultSeverity: 'error'
        },

        // ---------- 缩进错误 ----------
        'IndentationError': {
            patterns: [
                {
                    match: /unexpected indent/,
                    cause: '缩进错误：出现了不期望的缩进',
                    reason: '代码行出现了多余的缩进，但上一行不是以冒号结尾的语句。',
                    suggestion: '请删除报错行前面的多余空格，使其与上一行对齐。',
                    example: '# 错误\nx = 1\n  y = 2  # 不应该缩进\n\n# 正确\nx = 1\ny = 2',
                    severity: 'error'
                },
                {
                    match: /expected an indented block/,
                    cause: '缩进错误：缺少缩进',
                    reason: '在冒号后面（如if、for、while、def之后）必须有缩进的代码块。',
                    suggestion: '请在冒号后面的行添加4个空格的缩进。',
                    example: '# 错误\nif x > 0:\nprint(x)\n\n# 正确\nif x > 0:\n    print(x)',
                    severity: 'error'
                },
                {
                    match: /unindent does not match any outer indentation level/,
                    cause: '缩进错误：缩进级别不一致',
                    reason: '代码使用了混合的缩进（空格和Tab混用），或缩进空格数不一致。',
                    suggestion: '请统一使用4个空格进行缩进，不要混用空格和Tab。',
                    example: '# 错误（混用空格和Tab）\nif x > 0:\n    print(x)\n\tprint(y)\n\n# 正确（统一使用空格）\nif x > 0:\n    print(x)\n    print(y)',
                    severity: 'error'
                }
            ],
            defaultCause: '缩进错误',
            defaultReason: '代码的缩进不正确，Python使用缩进来表示代码块。',
            defaultSuggestion: '请检查报错行的缩进，确保使用4个空格，且不要混用空格和Tab。',
            defaultExample: '# Python使用4个空格缩进\nif x > 0:\n    print("正数")\nelse:\n    print("非正数")',
            defaultSeverity: 'error'
        },

        // ---------- 名称错误 ----------
        'NameError': {
            patterns: [
                {
                    match: /name '(\w+)' is not defined/,
                    cause: '名称错误：变量 "{var}" 未定义',
                    reason: '使用了一个尚未定义的变量名。可能是拼写错误、忘记赋值或作用域问题。',
                    suggestion: '请检查变量名是否拼写正确，并确保在使用前已经赋值。',
                    example: '# 错误\nprint(naem)  # "naem"拼写错误\n\n# 正确\nname = "张三"\nprint(name)',
                    severity: 'error'
                },
                {
                    match: /name '(\w+)' is not defined.*built-in/,
                    cause: '名称错误：可能使用了不存在的内置函数',
                    reason: '使用了一个不存在的函数名，可能是拼写错误。',
                    suggestion: '请检查函数名是否拼写正确，或使用dir(__builtins__)查看所有内置函数。',
                    example: '# 错误\nprnit("hello")  # 拼写错误\n\n# 正确\nprint("hello")',
                    severity: 'error'
                }
            ],
            defaultCause: '名称错误',
            defaultReason: '使用了一个未定义的名称（变量或函数）。',
            defaultSuggestion: '请检查变量/函数名是否拼写正确，并确保在使用前已定义。',
            defaultExample: '# 错误\nprint(age)  # age未定义\n\n# 正确\nage = 18\nprint(age)',
            defaultSeverity: 'error'
        },

        // ---------- 类型错误 ----------
        'TypeError': {
            patterns: [
                {
                    match: /unsupported operand type\(s\) for (.+): '(\w+)' and '(\w+)'/,
                    cause: '类型错误：不支持的操作类型',
                    reason: '尝试对不兼容的数据类型进行运算。例如字符串和数字相加。',
                    suggestion: '请检查运算符两边的类型是否兼容，必要时使用类型转换函数（如int()、str()）。',
                    example: '# 错误\nresult = "年龄：" + 18  # 字符串和整数不能直接相加\n\n# 正确\nresult = "年龄：" + str(18)\n# 或者\nresult = f"年龄：{18}"',
                    severity: 'error'
                },
                {
                    match: /'(\w+)' object is not callable/,
                    cause: '类型错误：对象不可调用',
                    reason: '尝试调用一个不是函数的对象。可能是变量名和函数名冲突。',
                    suggestion: '请检查是否将变量名和函数名混淆，避免使用内置函数名作为变量名。',
                    example: '# 错误\nlist = [1, 2, 3]  # 覆盖了内置list\nx = list("abc")  # 无法调用\n\n# 正确\nmy_list = [1, 2, 3]\nx = list("abc")',
                    severity: 'error'
                },
                {
                    match: /(\w+)\(\) takes (\d+) positional arguments but (\d+) were given|missing (\d+) required positional argument/,
                    cause: '类型错误：函数参数数量不匹配',
                    reason: '调用函数时传入的参数数量与函数定义不匹配。',
                    suggestion: '请检查函数定义，确保传入的参数数量正确。',
                    example: '# 错误\ndef add(a, b):\n    return a + b\nadd(1)  # 缺少参数b\n\n# 正确\nadd(1, 2)',
                    severity: 'error'
                },
                {
                    match: /object is not subscriptable/,
                    cause: '类型错误：对象不支持索引操作',
                    reason: '尝试对一个不支持索引的对象（如整数、None）使用方括号[]访问。',
                    suggestion: '请检查对象类型，确保它是列表、字典或字符串等可索引类型。',
                    example: '# 错误\nx = 10\nprint(x[0])  # 整数不支持索引\n\n# 正确\nx = [10]\nprint(x[0])',
                    severity: 'error'
                }
            ],
            defaultCause: '类型错误',
            defaultReason: '对不兼容的数据类型进行了操作。',
            defaultSuggestion: '请检查操作数的类型，必要时进行类型转换。',
            defaultExample: '# 常见类型转换\nint("123")   # 字符串转整数\nstr(123)    # 整数转字符串\nfloat("3.14") # 字符串转浮点数\nlist("abc") # 字符串转列表',
            defaultSeverity: 'error'
        },

        // ---------- 索引错误 ----------
        'IndexError': {
            patterns: [
                {
                    match: /list index out of range/,
                    cause: '索引错误：列表索引越界',
                    reason: '尝试访问列表中不存在的索引位置。',
                    suggestion: '请检查索引值是否在有效范围内（0到len(列表)-1）。可以使用len()查看列表长度。',
                    example: '# 错误\nnums = [1, 2, 3]\nprint(nums[3])  # 最大索引是2\n\n# 正确\nprint(nums[2])  # 输出3',
                    severity: 'error'
                },
                {
                    match: /string index out of range/,
                    cause: '索引错误：字符串索引越界',
                    reason: '尝试访问字符串中不存在的字符位置。',
                    suggestion: '请检查索引值是否在字符串长度范围内。',
                    example: '# 错误\ns = "abc"\nprint(s[5])  # 字符串长度为3\n\n# 正确\nprint(s[2])  # 输出c',
                    severity: 'error'
                }
            ],
            defaultCause: '索引错误',
            defaultReason: '使用了超出范围的索引访问序列。',
            defaultSuggestion: '请使用len()函数检查序列长度，确保索引在有效范围内。',
            defaultExample: '# 安全访问列表元素\nnums = [1, 2, 3]\nif len(nums) > 5:\n    print(nums[5])\nelse:\n    print("索引超出范围")',
            defaultSeverity: 'error'
        },

        // ---------- 值错误 ----------
        'ValueError': {
            patterns: [
                {
                    match: /invalid literal for int\(\) with base 10: '([^']+)'/,
                    cause: '值错误：无法将字符串转换为整数',
                    reason: '尝试将一个非数字字符串转换为整数。',
                    suggestion: '请确保字符串只包含数字字符，或先检查字符串内容。',
                    example: '# 错误\nx = int("abc")  # 无法转换\n\n# 正确\nx = int("123")  # 转换为123',
                    severity: 'error'
                },
                {
                    match: /could not convert string to float: '([^']+)'/,
                    cause: '值错误：无法将字符串转换为浮点数',
                    reason: '尝试将一个非数字字符串转换为浮点数。',
                    suggestion: '请确保字符串是有效的数字格式。',
                    example: '# 错误\nx = float("hello")\n\n# 正确\nx = float("3.14")',
                    severity: 'error'
                },
                {
                    match: /not enough values to unpack|too many values to unpack/,
                    cause: '值错误：解包值数量不匹配',
                    reason: '尝试将序列解包到变量时，变量数量与值的数量不匹配。',
                    suggestion: '请确保变量数量与序列中的元素数量一致。',
                    example: '# 错误\na, b = [1, 2, 3]  # 3个值，2个变量\n\n# 正确\na, b, c = [1, 2, 3]\n# 或者\na, *b = [1, 2, 3]  # a=1, b=[2,3]',
                    severity: 'error'
                }
            ],
            defaultCause: '值错误',
            defaultReason: '传入了类型正确但值不合法的参数。',
            defaultSuggestion: '请检查传入函数的值是否在有效范围内。',
            defaultExample: '# 常见值错误\nint("abc")        # 无法转换为整数\nfloat("hello")   # 无法转换为浮点数\nint("3.14")      # 需要先转float再转int',
            defaultSeverity: 'error'
        },

        // ---------- 键错误 ----------
        'KeyError': {
            patterns: [
                {
                    match: /KeyError: (.+)/,
                    cause: '键错误：字典中不存在该键',
                    reason: '尝试访问字典中不存在的键。',
                    suggestion: '请使用in关键字检查键是否存在，或使用dict.get()方法安全访问。',
                    example: '# 错误\nd = {"name": "张三"}\nprint(d["age"])  # "age"不存在\n\n# 正确\n# 方法1：使用get\nprint(d.get("age", "未设置"))\n# 方法2：检查键是否存在\nif "age" in d:\n    print(d["age"])',
                    severity: 'error'
                }
            ],
            defaultCause: '键错误',
            defaultReason: '尝试访问字典中不存在的键。',
            defaultSuggestion: '请使用dict.get(key, default)方法安全访问，避免KeyError。',
            defaultExample: '# 安全访问字典\nd = {"name": "张三"}\n# 使用get方法，不存在时返回默认值\nage = d.get("age", 0)\nprint(age)  # 输出0',
            defaultSeverity: 'error'
        },

        // ---------- 属性错误 ----------
        'AttributeError': {
            patterns: [
                {
                    match: /'(\w+)' object has no attribute '(\w+)'/,
                    cause: '属性错误：对象没有该属性',
                    reason: '尝试访问对象不存在的属性或方法。可能是拼写错误或类型不匹配。',
                    suggestion: '请检查属性/方法名是否拼写正确，并使用type()确认对象类型。',
                    example: '# 错误\ns = "hello"\ns.apend("!")  # 字符串没有append方法\n\n# 正确\ns = s + "!"  # 字符串拼接\n# 或者\nlst = ["hello"]\nlst.append("!")  # 列表有append方法',
                    severity: 'error'
                },
                {
                    match: /'NoneType' object has no attribute/,
                    cause: '属性错误：None对象没有属性',
                    reason: '尝试访问None对象的属性，通常是因为函数没有返回值但被使用了返回值。',
                    suggestion: '请检查函数是否有return语句，或变量是否被正确赋值。',
                    example: '# 错误\ndef get_name():\n    pass  # 没有return\nname = get_name()\nprint(name.upper())  # name是None\n\n# 正确\ndef get_name():\n    return "张三"\nname = get_name()\nprint(name.upper())',
                    severity: 'error'
                }
            ],
            defaultCause: '属性错误',
            defaultReason: '尝试访问对象不存在的属性或方法。',
            defaultSuggestion: '请使用dir(对象)查看所有可用属性和方法，或使用type()确认对象类型。',
            defaultExample: '# 查看对象类型和属性\nx = [1, 2, 3]\nprint(type(x))  # <class \'list\'>\nprint(dir(x))   # 查看所有方法',
            defaultSeverity: 'error'
        },

        // ---------- 除零错误 ----------
        'ZeroDivisionError': {
            patterns: [
                {
                    match: /division by zero|integer division or modulo by zero/,
                    cause: '除零错误：除数为零',
                    reason: '尝试用零作为除数进行除法或取模运算。',
                    suggestion: '请在除法前检查除数是否为零。',
                    example: '# 错误\nresult = 10 / 0\n\n# 正确\nif b != 0:\n    result = 10 / b\nelse:\n    print("除数不能为零")',
                    severity: 'error'
                }
            ],
            defaultCause: '除零错误',
            defaultReason: '除法运算的除数为零。',
            defaultSuggestion: '请在除法运算前检查除数是否为零。',
            defaultExample: '# 安全除法\ndef safe_divide(a, b):\n    if b == 0:\n        return "错误：除数不能为零"\n    return a / b',
            defaultSeverity: 'error'
        },

        // ---------- 导入错误 ----------
        'ImportError': {
            patterns: [
                {
                    match: /No module named '(\w+)'/,
                    cause: '导入错误：模块不存在',
                    reason: '尝试导入一个不存在的模块。',
                    suggestion: '请检查模块名是否拼写正确，或使用pip安装该模块。',
                    example: '# 错误\nimport numpi  # 拼写错误\n\n# 正确\nimport numpy',
                    severity: 'error'
                },
                {
                    match: /cannot import name '(\w+)' from '(\w+)'/,
                    cause: '导入错误：无法从模块导入该名称',
                    reason: '尝试从模块导入不存在的名称。',
                    suggestion: '请检查导入的名称是否存在，或使用dir(模块名)查看可用名称。',
                    example: '# 错误\nfrom math import pii  # math中没有pii\n\n# 正确\nfrom math import pi',
                    severity: 'error'
                }
            ],
            defaultCause: '导入错误',
            defaultReason: '无法导入指定的模块或名称。',
            defaultSuggestion: '请检查模块名和导入的名称是否正确。',
            defaultExample: '# 查看模块内容\nimport math\nprint(dir(math))  # 查看math模块的所有内容',
            defaultSeverity: 'error'
        },

        'ModuleNotFoundError': {
            patterns: [
                {
                    match: /No module named '(\w+)'/,
                    cause: '模块未找到错误',
                    reason: '尝试导入一个未安装或拼错的模块。',
                    suggestion: '请检查模块名拼写，或在终端执行 pip install 模块名 安装。',
                    example: '# 错误\nimport pandas  # 未安装\n\n# 解决：在终端执行\n# pip install pandas',
                    severity: 'error'
                }
            ],
            defaultCause: '模块未找到错误',
            defaultReason: '指定的模块未安装或不存在。',
            defaultSuggestion: '请安装该模块：pip install 模块名',
            defaultExample: '# 安装第三方模块\n# 在命令行中执行：\n# pip install requests\n\n# 然后在代码中使用\n# import requests',
            defaultSeverity: 'error'
        },

        // ---------- 文件未找到错误 ----------
        'FileNotFoundError': {
            patterns: [
                {
                    match: /No such file or directory/,
                    cause: '文件未找到错误',
                    reason: '尝试打开一个不存在的文件。',
                    suggestion: '请检查文件路径是否正确，或使用os.path.exists()检查文件是否存在。',
                    example: '# 错误\nf = open("不存在的文件.txt")\n\n# 正确\nimport os\nif os.path.exists("data.txt"):\n    f = open("data.txt")\nelse:\n    print("文件不存在")',
                    severity: 'error'
                }
            ],
            defaultCause: '文件未找到错误',
            defaultReason: '尝试访问不存在的文件。',
            defaultSuggestion: '请检查文件路径，或使用try-except捕获异常。',
            defaultExample: '# 安全的文件操作\ntry:\n    with open("data.txt", "r") as f:\n        content = f.read()\nexcept FileNotFoundError:\n    print("文件不存在，请检查路径")',
            defaultSeverity: 'error'
        },

        // ---------- 运行时错误 ----------
        'RuntimeError': {
            patterns: [
                {
                    match: /maximum recursion depth exceeded/,
                    cause: '运行时错误：递归深度超过限制',
                    reason: '递归函数没有正确的终止条件，导致无限递归。',
                    suggestion: '请检查递归函数是否有正确的终止条件（base case）。',
                    example: '# 错误：没有终止条件\ndef countdown(n):\n    print(n)\n    countdown(n - 1)\n\n# 正确：有终止条件\ndef countdown(n):\n    if n <= 0:\n        return\n    print(n)\n    countdown(n - 1)',
                    severity: 'error'
                }
            ],
            defaultCause: '运行时错误',
            defaultReason: '程序运行时出现了错误。',
            defaultSuggestion: '请检查程序的逻辑，确保没有无限循环或递归。',
            defaultExample: '# 递归必须有终止条件\ndef factorial(n):\n    if n <= 1:  # 终止条件\n        return 1\n    return n * factorial(n - 1)',
            defaultSeverity: 'error'
        },

        // ---------- 停止迭代 ----------
        'StopIteration': {
            defaultCause: '迭代停止',
            defaultReason: '迭代器没有更多元素了。',
            defaultSuggestion: '请检查迭代器是否还有元素，或使用for循环代替手动迭代。',
            defaultExample: '# 使用for循环自动处理迭代\nfor item in [1, 2, 3]:\n    print(item)',
            defaultSeverity: 'warning'
        },

        // ---------- 断言错误 ----------
        'AssertionError': {
            patterns: [
                {
                    match: /AssertionError/,
                    cause: '断言错误',
                    reason: 'assert语句的条件为False。',
                    suggestion: '请检查assert语句的条件是否满足。',
                    example: '# 错误：x不大于5\nx = 3\nassert x > 5, "x必须大于5"\n\n# 正确\nx = 10\nassert x > 5, "x必须大于5"',
                    severity: 'warning'
                }
            ],
            defaultCause: '断言错误',
            defaultReason: '断言条件不满足。',
            defaultSuggestion: '请检查assert语句的条件。',
            defaultExample: '# assert用于调试\nage = 18\nassert age >= 0, "年龄不能为负数"',
            defaultSeverity: 'warning'
        },

        // ---------- 键盘中断 ----------
        'KeyboardInterrupt': {
            defaultCause: '键盘中断',
            defaultReason: '程序被用户中断（按了Ctrl+C）。',
            defaultSuggestion: '如果程序运行时间过长，请检查是否有死循环。',
            defaultExample: '# 捕获键盘中断\ntry:\n    while True:\n        pass\nexcept KeyboardInterrupt:\n    print("程序被中断")',
            defaultSeverity: 'warning'
        },

        // ---------- 未实现错误 ----------
        'NotImplementedError': {
            defaultCause: '未实现错误',
            defaultReason: '调用了尚未实现的方法。',
            defaultSuggestion: '请完成该方法的实现。',
            defaultExample: '# 子类需要实现父类的抽象方法\nclass Animal:\n    def speak(self):\n        raise NotImplementedError("子类必须实现此方法")\n\nclass Dog(Animal):\n    def speak(self):\n        return "汪汪"',
            defaultSeverity: 'warning'
        },

        // ---------- 类型错误 - 不可哈希 ----------
        'TypeError_unhashable': {
            patterns: [
                {
                    match: /unhashable type: '(\w+)'/,
                    cause: '类型错误：不可哈希类型',
                    reason: '尝试将不可哈希的类型（如列表、字典）作为字典的键或集合的元素。',
                    suggestion: '请使用可哈希类型（如字符串、数字、元组）作为键。',
                    example: '# 错误\nd = {[1, 2]: "value"}  # 列表不能作为键\n\n# 正确\nd = {(1, 2): "value"}  # 元组可以作为键',
                    severity: 'error'
                }
            ],
            defaultCause: '类型错误：不可哈希',
            defaultReason: '使用了不可哈希的类型作为字典键或集合元素。',
            defaultSuggestion: '请将列表转为元组后再使用。',
            defaultExample: '# 可哈希类型：int, float, str, tuple\n# 不可哈希类型：list, dict, set\n\nd = {"name": "张三"}  # 字符串键\ns = {1, 2, 3}        # 数字集合',
            defaultSeverity: 'error'
        },

        // ---------- 内存错误 ----------
        'MemoryError': {
            defaultCause: '内存错误',
            defaultReason: '程序内存不足。',
            defaultSuggestion: '请检查是否创建了过大的数据结构，或优化算法减少内存使用。',
            defaultExample: '# 避免创建过大的列表\n# 错误：x = list(range(100000000))\n# 正确：使用生成器\nx = range(100000000)',
            defaultSeverity: 'error'
        },

        // ---------- 溢出错误 ----------
        'OverflowError': {
            defaultCause: '溢出错误',
            defaultReason: '数值运算结果超出了可表示的范围。',
            defaultSuggestion: '请检查数值是否过大，或使用decimal模块处理大数。',
            defaultExample: 'import decimal\nx = decimal.Decimal("1e1000")',
            defaultSeverity: 'warning'
        },

        // ---------- 系统退出 ----------
        'SystemExit': {
            defaultCause: '系统退出',
            defaultReason: '调用了sys.exit()或exit()。',
            defaultSuggestion: '如果这不是预期的，请检查代码中是否有exit()调用。',
            defaultExample: 'import sys\nsys.exit(0)  # 正常退出',
            defaultSeverity: 'info'
        },

        // ---------- Tab错误 ----------
        'TabError': {
            patterns: [
                {
                    match: /inconsistent use of tabs and spaces in indentation/,
                    cause: 'Tab错误：混用了Tab和空格缩进',
                    reason: '代码中同时使用了Tab和空格进行缩进。',
                    suggestion: '请统一使用4个空格进行缩进，不要使用Tab。',
                    example: '# 错误（Tab和空格混用）\nif True:\n    print("a")\n\tprint("b")\n\n# 正确（统一使用空格）\nif True:\n    print("a")\n    print("b")',
                    severity: 'error'
                }
            ],
            defaultCause: 'Tab错误',
            defaultReason: '代码缩进混用了Tab和空格。',
            defaultSuggestion: '请在编辑器中设置将Tab转换为4个空格。',
            defaultExample: '# 编辑器设置：\n# "tab_size": 4\n# "translate_tabs_to_spaces": true',
            defaultSeverity: 'error'
        },

        // ---------- Unicode错误 ----------
        'UnicodeDecodeError': {
            defaultCause: 'Unicode解码错误',
            defaultReason: '尝试用错误的编码解码字符串。',
            defaultSuggestion: '请指定正确的编码（如utf-8）。',
            defaultExample: '# 正确读取文件\nwith open("file.txt", encoding="utf-8") as f:\n    content = f.read()',
            defaultSeverity: 'error'
        },

        'UnicodeEncodeError': {
            defaultCause: 'Unicode编码错误',
            defaultReason: '尝试用不支持某些字符的编码编码字符串。',
            defaultSuggestion: '请使用utf-8编码，或处理特殊字符。',
            defaultExample: '# 正确编码\ns = "你好"\nencoded = s.encode("utf-8")',
            defaultSeverity: 'error'
        },

        // ---------- 超时错误 ----------
        'TimeoutError': {
            defaultCause: '执行超时',
            defaultReason: '代码执行时间超过了限制（10秒）。',
            defaultSuggestion: '请检查代码是否有死循环或效率过低的算法。',
            defaultExample: '# 检查循环条件\n# 错误：i永远不会达到10\ni = 0\nwhile i > 10:  # 应该是 i < 10\n    i += 1',
            defaultSeverity: 'error'
        },

        // ---------- 算术错误 ----------
        'ArithmeticError': {
            defaultCause: '算术错误',
            defaultReason: '数值运算出错。',
            defaultSuggestion: '请检查运算操作数是否合法。',
            defaultExample: '# 常见算术错误：除以零、溢出等',
            defaultSeverity: 'error'
        },

        // ---------- 浮点错误 ----------
        'FloatingPointError': {
            defaultCause: '浮点错误',
            defaultReason: '浮点运算失败。',
            defaultSuggestion: '请检查浮点运算的精度问题。',
            defaultExample: '# 浮点精度问题\n# 0.1 + 0.2 != 0.3\n# 使用round处理：\nresult = round(0.1 + 0.2, 10)',
            defaultSeverity: 'warning'
        },

        // ---------- 引用错误 ----------
        'ReferenceError': {
            defaultCause: '引用错误',
            defaultReason: '引用了已经被回收的对象。',
            defaultSuggestion: '请确保对象引用仍然有效。',
            defaultExample: '# 避免使用弱引用已回收的对象',
            defaultSeverity: 'error'
        },

        // ---------- 系统错误 ----------
        'SystemError': {
            defaultCause: '系统错误',
            defaultReason: 'Python解释器内部错误。',
            defaultSuggestion: '请尝试重启Python环境或简化代码。',
            defaultExample: '# 如果出现系统错误，请简化代码后重试',
            defaultSeverity: 'error'
        },

        // ---------- 类型注解错误 ----------
        'TypeError_annotation': {
            defaultCause: '类型错误',
            defaultReason: '参数类型与函数定义的类型注解不匹配。',
            defaultSuggestion: '请检查传入参数的类型是否符合要求。',
            defaultExample: 'def greet(name: str) -> str:\n    return f"Hello, {name}"\n\ngreet("张三")  # 正确\ngreet(123)    # 类型不匹配',
            defaultSeverity: 'warning'
        },

        // ---------- 生成器错误 ----------
        'GeneratorExit': {
            defaultCause: '生成器退出',
            defaultReason: '生成器被关闭。',
            defaultSuggestion: '这是正常的生成器关闭行为，通常不需要处理。',
            defaultExample: '# 生成器示例\ndef counter():\n    n = 0\n    while True:\n        yield n\n        n += 1',
            defaultSeverity: 'info'
        },

        // ---------- 递归错误 ----------
        'RecursionError': {
            patterns: [
                {
                    match: /maximum recursion depth exceeded/,
                    cause: '递归错误：超过最大递归深度',
                    reason: '递归调用层次过深，可能没有正确的终止条件。',
                    suggestion: '请添加或修正递归的终止条件（base case）。',
                    example: '# 错误：没有终止条件\ndef factorial(n):\n    return n * factorial(n - 1)\n\n# 正确：有终止条件\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)',
                    severity: 'error'
                }
            ],
            defaultCause: '递归错误',
            defaultReason: '递归调用超过了最大深度限制。',
            defaultSuggestion: '请检查递归终止条件，或考虑改用循环实现。',
            defaultExample: '# 用循环代替递归\ndef factorial(n):\n    result = 1\n    for i in range(1, n + 1):\n        result *= i\n    return result',
            defaultSeverity: 'error'
        },

        // ---------- EOF错误 ----------
        'EOFError': {
            defaultCause: '输入结束错误',
            defaultReason: 'input()函数读取到了EOF（文件结束）。',
            defaultSuggestion: '请确保有输入数据，或捕获EOFError。',
            defaultExample: 'try:\n    name = input("请输入姓名：")\nexcept EOFError:\n    print("输入结束")',
            defaultSeverity: 'warning'
        },

        // ---------- 连接错误 ----------
        'ConnectionError': {
            defaultCause: '连接错误',
            defaultReason: '网络连接失败。',
            defaultSuggestion: '请检查网络连接是否正常。',
            defaultExample: 'import requests\ntry:\n    r = requests.get("https://example.com")\nexcept requests.ConnectionError:\n    print("网络连接失败")',
            defaultSeverity: 'error'
        },

        // ---------- 超时异常 ----------
        'TimeoutException': {
            defaultCause: '超时异常',
            defaultReason: '操作超时。',
            defaultSuggestion: '请增加超时时间或优化操作。',
            defaultExample: '# 设置合理的超时时间',
            defaultSeverity: 'warning'
        }
    },

    // ============================================================
    // 初始化
    // ============================================================
    init() {
        console.log('[ErrorDiagnosis] 错误诊断系统初始化完成');
        console.log(`[ErrorDiagnosis] 已加载 ${Object.keys(this.errorDatabase).length} 种错误类型`);
    },

    // ============================================================
    // 错误诊断主函数
    // ============================================================

    /**
     * 诊断错误
     * @param {string} errorText - 错误信息文本
     * @param {string} code - 原始代码
     * @returns {Object} 诊断结果
     */
    diagnose(errorText, code = '') {
        if (!errorText) {
            return null;
        }

        // 提取错误类型
        const errorType = this.extractErrorType(errorText);
        if (!errorType) {
            return {
                errorType: '未知错误',
                reason: errorText,
                suggestion: '请检查代码语法和逻辑。',
                example: '',
                severity: 'error',
                lineNumber: null
            };
        }

        // 提取错误行号
        const lineNumber = this.extractLineNumber(errorText);

        // 在错误数据库中查找
        const errorInfo = this.errorDatabase[errorType];
        if (!errorInfo) {
            return {
                errorType: errorType,
                reason: errorText,
                suggestion: '请查看错误信息并检查相关代码。',
                example: '',
                severity: 'error',
                lineNumber: lineNumber
            };
        }

        // 尝试匹配具体模式
        let matchedPattern = null;
        let varName = null;

        if (errorInfo.patterns) {
            for (const pattern of errorInfo.patterns) {
                const match = errorText.match(pattern.match);
                if (match) {
                    matchedPattern = pattern;
                    // 提取变量名（如果有）
                    if (match[1]) {
                        varName = match[1];
                    }
                    break;
                }
            }
        }

        // 构建诊断结果
        const result = {
            errorType: errorType,
            cause: matchedPattern
                ? this.replaceVar(matchedPattern.cause, varName)
                : (errorInfo.defaultCause || errorType),
            reason: matchedPattern
                ? matchedPattern.reason
                : (errorInfo.defaultReason || '未知原因'),
            suggestion: matchedPattern
                ? matchedPattern.suggestion
                : (errorInfo.defaultSuggestion || '请检查代码。'),
            example: matchedPattern
                ? matchedPattern.example
                : (errorInfo.defaultExample || ''),
            severity: matchedPattern
                ? matchedPattern.severity
                : (errorInfo.defaultSeverity || 'error'),
            lineNumber: lineNumber,
            errorLine: lineNumber ? this.getCodeLine(code, lineNumber) : null
        };

        return result;
    },

    /**
     * 替换变量名占位符
     */
    replaceVar(text, varName) {
        if (!varName) return text;
        return text.replace('{var}', varName);
    },

    /**
     * 从错误信息中提取错误类型
     */
    extractErrorType(errorText) {
        // 尝试匹配 Python 错误类型
        const match = errorText.match(/(?:^|\n)([A-Z][a-zA-Z]+(?:Error|Exception|Warning)):/);
        if (match) {
            return match[1];
        }

        // 特殊匹配
        if (errorText.includes('timeout') || errorText.includes('Timeout')) {
            return 'TimeoutError';
        }

        if (errorText.includes('maximum recursion')) {
            return 'RecursionError';
        }

        if (errorText.includes('unhashable')) {
            return 'TypeError_unhashable';
        }

        return null;
    },

    /**
     * 从错误信息中提取行号
     */
    extractLineNumber(errorText) {
        // 匹配 "line N" 或 "line N," 模式
        const patterns = [
            /line (\d+)/,
            /line\s+(\d+)/,
            /File "<stdin>", line (\d+)/,
            /File "<exec>", line (\d+)/
        ];

        for (const pattern of patterns) {
            const match = errorText.match(pattern);
            if (match) {
                return parseInt(match[1]);
            }
        }

        return null;
    },

    /**
     * 获取代码的指定行
     */
    getCodeLine(code, lineNumber) {
        if (!code || !lineNumber) return null;

        const lines = code.split('\n');
        if (lineNumber >= 1 && lineNumber <= lines.length) {
            return lines[lineNumber - 1];
        }
        return null;
    },

    // ============================================================
    // 预判系统：代码执行前扫描常见问题
    // ============================================================

    /**
     * 预检查代码
     * @param {string} code - 代码文本
     * @returns {Object} 检查结果 {hasError, warnings}
     */
    preCheck(code) {
        const warnings = [];
        const lines = code.split('\n');

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // 1. 检查中文括号
            const chineseBrackets = this.checkChineseBrackets(line);
            if (chineseBrackets) {
                warnings.push({
                    line: lineNum,
                    type: 'chinese_bracket',
                    message: `第${lineNum}行：检测到中文括号 "${chineseBrackets}"，请使用英文括号 ()`,
                    severity: 'warning'
                });
            }

            // 2. 检查中文引号
            const chineseQuotes = this.checkChineseQuotes(line);
            if (chineseQuotes) {
                warnings.push({
                    line: lineNum,
                    type: 'chinese_quote',
                    message: `第${lineNum}行：检测到中文引号 "${chineseQuotes}"，请使用英文引号 '' 或 ""`,
                    severity: 'warning'
                });
            }

            // 3. 检查中文冒号
            if (this.checkChineseColon(line)) {
                warnings.push({
                    line: lineNum,
                    type: 'chinese_colon',
                    message: `第${lineNum}行：检测到中文冒号 "："，请使用英文冒号 :`,
                    severity: 'warning'
                });
            }

            // 4. 检查中文逗号
            if (this.checkChineseComma(line)) {
                warnings.push({
                    line: lineNum,
                    type: 'chinese_comma',
                    message: `第${lineNum}行：检测到中文逗号 "，"，请使用英文逗号 ,`,
                    severity: 'warning'
                });
            }

            // 5. 检查缺少冒号（if/for/while/def/class 后）
            const missingColon = this.checkMissingColon(line);
            if (missingColon) {
                warnings.push({
                    line: lineNum,
                    type: 'missing_colon',
                    message: `第${lineNum}行：${missingColon} 语句末尾可能缺少冒号 ":"`,
                    severity: 'warning'
                });
            }

            // 6. 检查混用Tab和空格
            if (this.checkMixedIndent(line)) {
                warnings.push({
                    line: lineNum,
                    type: 'mixed_indent',
                    message: `第${lineNum}行：混用了Tab和空格缩进，请统一使用空格`,
                    severity: 'warning'
                });
            }

            // 7. 检查使用内置函数名作为变量
            const builtinOverride = this.checkBuiltinOverride(line);
            if (builtinOverride) {
                warnings.push({
                    line: lineNum,
                    type: 'builtin_override',
                    message: `第${lineNum}行：变量名 "${builtinOverride}" 与内置函数冲突，建议改名`,
                    severity: 'info'
                });
            }

            // 8. 检查 == 写成 =
            const assignmentInCondition = this.checkAssignmentInCondition(line);
            if (assignmentInCondition) {
                warnings.push({
                    line: lineNum,
                    type: 'assignment_in_condition',
                    message: `第${lineNum}行：条件判断中可能误用 "=" 代替 "=="`,
                    severity: 'warning'
                });
            }

            // 9. 检查 print 拼写错误
            const printTypo = this.checkPrintTypo(line);
            if (printTypo) {
                warnings.push({
                    line: lineNum,
                    type: 'print_typo',
                    message: `第${lineNum}行：可能将 print 拼写为 "${printTypo}"`,
                    severity: 'warning'
                });
            }

            // 10. 检查未闭合的括号
            const unclosedBracket = this.checkUnclosedBrackets(line);
            if (unclosedBracket) {
                warnings.push({
                    line: lineNum,
                    type: 'unclosed_bracket',
                    message: `第${lineNum}行：括号 "${unclosedBracket}" 可能未闭合`,
                    severity: 'warning'
                });
            }
        });

        return {
            hasError: warnings.length > 0,
            warnings: warnings
        };
    },

    // ============================================================
    // 预检查辅助方法
    // ============================================================

    /**
     * 检查中文括号
     */
    checkChineseBrackets(line) {
        const chineseBrackets = ['（', '）', '【', '】', '｛', '｝'];
        for (const bracket of chineseBrackets) {
            if (line.includes(bracket)) {
                return bracket;
            }
        }
        return null;
    },

    /**
     * 检查中文引号
     */
    checkChineseQuotes(line) {
        const chineseQuotes = ['「', '」', '『', '』', '“', '”', '‘', '’'];
        for (const quote of chineseQuotes) {
            if (line.includes(quote)) {
                return quote;
            }
        }
        return null;
    },

    /**
     * 检查中文冒号
     */
    checkChineseColon(line) {
        // 排除在字符串中的情况
        const inString = false; // 简化处理
        return line.includes('：') && !inString;
    },

    /**
     * 检查中文逗号
     */
    checkChineseComma(line) {
        return line.includes('，');
    },

    /**
     * 检查缺少冒号
     */
    checkMissingColon(line) {
        const keywords = ['if', 'elif', 'else', 'for', 'while', 'def', 'class', 'try', 'except', 'finally', 'with'];
        const trimmed = line.trim();

        for (const keyword of keywords) {
            // 匹配 "if condition" 或 "for x in y" 等模式
            const pattern = new RegExp(`^${keyword}\\b`);
            if (pattern.test(trimmed) && !trimmed.endsWith(':')) {
                // 排除注释行
                if (!trimmed.startsWith('#')) {
                    return keyword;
                }
            }
        }
        return null;
    },

    /**
     * 检查混用Tab和空格
     */
    checkMixedIndent(line) {
        const leadingWhitespace = line.match(/^\s*/)[0];
        return leadingWhitespace.includes('\t') && leadingWhitespace.includes(' ');
    },

    /**
     * 检查内置函数名覆盖
     */
    checkBuiltinOverride(line) {
        const builtins = ['list', 'dict', 'set', 'tuple', 'str', 'int', 'float', 'bool', 'print', 'len', 'range', 'type', 'input', 'sum', 'max', 'min', 'abs', 'round', 'sorted', 'enumerate', 'zip', 'map', 'filter', 'open', 'id', 'dir', 'vars', 'format'];
        const match = line.match(/^(\w+)\s*=/);
        if (match && builtins.includes(match[1])) {
            return match[1];
        }
        return null;
    },

    /**
     * 检查条件中误用赋值
     */
    checkAssignmentInCondition(line) {
        // 匹配 if (x = 5) 或 while (x = 5) 模式
        const match = line.match(/\b(if|while|elif)\s.*[^=!<>]=[^=]/);
        if (match && !line.includes('==') && !line.includes('<=') && !line.includes('>=')) {
            return true;
        }
        return false;
    },

    /**
     * 检查 print 拼写错误
     */
    checkPrintTypo(line) {
        const typos = ['prnit', 'prnt', 'pritn', 'pint', 'Print', 'PRINT', 'prin'];
        const match = line.match(/\b(prnit|prnt|pritn|pint|Print|PRINT|prin)\s*\(/);
        if (match) {
            return match[1];
        }
        return null;
    },

    /**
     * 检查未闭合的括号
     */
    checkUnclosedBrackets(line) {
        // 简单检查：统计括号数量
        const opens = (line.match(/[\(\[\{]/g) || []).length;
        const closes = (line.match(/[\)\]\}]/g) || []).length;

        // 排除在字符串中的括号（简化处理）
        if (opens > closes) {
            const diff = opens - closes;
            if (diff > 0) {
                return '括号';
            }
        }
        return null;
    },

    // ============================================================
    // 格式化错误显示
    // ============================================================

    /**
     * 格式化错误信息为HTML
     */
    formatErrorHtml(diagnosis) {
        if (!diagnosis) return '';

        const severityColors = {
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#17a2b8'
        };

        const color = severityColors[diagnosis.severity] || severityColors.error;

        return `
            <div class="error-diagnosis" style="border-left: 4px solid ${color}; padding: 12px; margin: 8px 0; background: #f8f9fa;">
                <div class="error-type" style="color: ${color}; font-weight: bold; margin-bottom: 8px;">
                    ${diagnosis.errorType}
                    ${diagnosis.lineNumber ? `(第${diagnosis.lineNumber}行)` : ''}
                </div>
                <div class="error-cause" style="margin-bottom: 8px;">
                    <strong>原因：</strong>${diagnosis.cause}
                </div>
                <div class="error-reason" style="margin-bottom: 8px;">
                    <strong>分析：</strong>${diagnosis.reason}
                </div>
                <div class="error-suggestion" style="margin-bottom: 8px;">
                    <strong>建议：</strong>${diagnosis.suggestion}
                </div>
                ${diagnosis.example ? `
                    <div class="error-example">
                        <strong>示例：</strong>
                        <pre style="background: #e9ecef; padding: 8px; border-radius: 4px; margin-top: 4px;">${diagnosis.example}</pre>
                    </div>
                ` : ''}
                ${diagnosis.errorLine ? `
                    <div class="error-line" style="margin-top: 8px;">
                        <strong>错误行：</strong>
                        <code style="background: #ffebee; padding: 4px; border-radius: 4px;">${diagnosis.errorLine}</code>
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * 获取所有支持的错误类型
     */
    getSupportedErrors() {
        return Object.keys(this.errorDatabase);
    },

    /**
     * 获取错误统计
     */
    getErrorStats() {
        let total = Object.keys(this.errorDatabase).length;
        let withPatterns = 0;
        let totalPatterns = 0;

        Object.values(this.errorDatabase).forEach(error => {
            if (error.patterns) {
                withPatterns++;
                totalPatterns += error.patterns.length;
            }
        });

        return {
            totalErrorTypes: total,
            errorsWithPatterns: withPatterns,
            totalPatterns: totalPatterns
        };
    }
};

// ============================================================
// 导出模块
// ============================================================
window.ErrorDiagnosis = ErrorDiagnosis;
