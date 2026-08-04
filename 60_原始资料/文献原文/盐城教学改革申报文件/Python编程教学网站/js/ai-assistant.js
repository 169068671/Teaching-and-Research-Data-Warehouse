/**
 * ai-assistant.js - AI提示小助手
 * 负责浮动按钮、聊天面板、预设问题库、智能匹配、代码解释、提示功能
 */

const AIAssistant = {
    // 面板是否打开
    isOpen: false,
    // 对话历史
    chatHistory: [],
    // 打字机定时器
    typewriterTimer: null,
    // 鼓励语索引
    encouragementIndex: 0,

    // ============================================================
    // 预设问题库（按课时分类，50+个常见问题）
    // ============================================================
    questionBank: {
        // ---------- 模块一：Python入门 ----------
        'module1': [
            {
                keywords: ['变量', 'variable', '赋值', '定义变量'],
                question: '什么是变量？如何定义变量？',
                answer: '变量是用来存储数据的容器。在Python中，使用等号=进行赋值即可定义变量。\n\n示例：\nname = "张三"    # 字符串变量\nage = 18         # 整数变量\nheight = 1.75    # 浮点数变量\n\n命名规则：\n1. 只能包含字母、数字、下划线\n2. 不能以数字开头\n3. 不能使用Python关键字\n4. 区分大小写'
            },
            {
                keywords: ['数据类型', 'type', 'int', 'str', 'float', 'bool'],
                question: 'Python有哪些基本数据类型？',
                answer: 'Python的基本数据类型包括：\n\n1. int - 整数：如 1, 100, -5\n2. float - 浮点数：如 3.14, -0.5\n3. str - 字符串：如 "hello", \'world\'\n4. bool - 布尔值：True 或 False\n\n使用 type() 函数查看类型：\nprint(type(42))      # <class \'int\'>\nprint(type("hello")) # <class \'str\'>'
            },
            {
                keywords: ['输入', 'input', '键盘', '读取'],
                question: '如何获取用户输入？',
                answer: '使用 input() 函数获取用户输入，返回值是字符串类型。\n\n示例：\nname = input("请输入姓名：")\nprint("你好，" + name)\n\n注意：input()返回的是字符串，如果需要数字，要转换：\nage = int(input("请输入年龄："))'
            },
            {
                keywords: ['输出', 'print', '打印', '显示'],
                question: '如何使用print输出内容？',
                answer: 'print()函数用于输出内容到控制台。\n\n基本用法：\nprint("Hello World")\n\n输出多个值（用逗号分隔）：\nprint("姓名：", name, "年龄：", age)\n\n格式化输出（f-string）：\nprint(f"姓名：{name}，年龄：{age}")\n\n不换行输出：\nprint("Hello", end="")'
            },
            {
                keywords: ['运算符', 'operator', '加减乘除', '运算'],
                question: 'Python有哪些运算符？',
                answer: 'Python常用运算符：\n\n算术运算符：\n+ 加    - 减    * 乘    / 除\n// 整除  % 取余  ** 幂\n\n比较运算符：\n== 等于   != 不等于\n> 大于    < 小于\n>= 大于等于  <= 小于等于\n\n逻辑运算符：\nand 与   or 或   not 非'
            },
            {
                keywords: ['字符串', 'string', 'str', '引号'],
                question: '如何处理字符串？',
                answer: '字符串可以用单引号或双引号表示：\n\ns1 = \'hello\'\ns2 = "world"\n\n常用操作：\ns = "Hello"\nlen(s)       # 长度：5\ns[0]         # 第一个字符：H\ns[1:4]       # 切片：ell\ns.upper()    # 转大写：HELLO\ns.lower()    # 转小写：hello\ns + "!"      # 拼接：Hello!\ns * 3        # 重复：HelloHelloHello'
            },
            {
                keywords: ['类型转换', 'int', 'str', 'float', '转换'],
                question: '如何进行类型转换？',
                answer: '使用类型转换函数：\n\nint() - 转为整数：\n  int("123") → 123\n  int(3.9) → 3\n\nfloat() - 转为浮点数：\n  float("3.14") → 3.14\n  float(5) → 5.0\n\nstr() - 转为字符串：\n  str(123) → "123"\n  str(3.14) → "3.14"\n\n注意：int("abc")会报错！'
            }
        ],

        // ---------- 模块二：控制结构 ----------
        'module2': [
            {
                keywords: ['if', 'else', 'elif', '分支', '条件', '判断'],
                question: '如何使用if条件判断？',
                answer: 'if语句用于条件判断：\n\n基本形式：\nif 条件:\n    执行代码\n\nif-else：\nif score >= 60:\n    print("及格")\nelse:\n    print("不及格")\n\nif-elif-else：\nif score >= 90:\n    print("优秀")\nelif score >= 80:\n    print("良好")\nelif score >= 60:\n    print("及格")\nelse:\n    print("不及格")\n\n注意：条件后面必须有冒号，代码块必须缩进！'
            },
            {
                keywords: ['for', '循环', 'range', '遍历'],
                question: '如何使用for循环？',
                answer: 'for循环用于遍历序列或重复执行：\n\n遍历列表：\nfor item in [1, 2, 3]:\n    print(item)\n\n使用range：\nfor i in range(5):      # 0,1,2,3,4\n    print(i)\nfor i in range(1, 6):   # 1,2,3,4,5\n    print(i)\nfor i in range(0, 10, 2):  # 0,2,4,6,8\n    print(i)\n\n遍历字符串：\nfor ch in "hello":\n    print(ch)'
            },
            {
                keywords: ['while', '循环', '条件循环'],
                question: 'while循环怎么用？',
                answer: 'while循环在条件为True时重复执行：\n\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1\n\n注意事项：\n1. 必须有改变条件的语句，否则会死循环\n2. 可以用break跳出循环\n3. 可以用continue跳过本次\n\nbreak示例：\nwhile True:\n    num = int(input())\n    if num == 0:\n        break'
            },
            {
                keywords: ['break', 'continue', '跳出', '跳过'],
                question: 'break和continue的区别？',
                answer: 'break - 跳出整个循环：\nfor i in range(10):\n    if i == 5:\n        break  # 循环结束\n    print(i)  # 输出0-4\n\ncontinue - 跳过本次，继续下一次：\nfor i in range(10):\n    if i % 2 == 0:\n        continue  # 跳过偶数\n    print(i)  # 输出1,3,5,7,9\n\n记忆：\nbreak = 打破循环（结束）\ncontinue = 继续下一次'
            },
            {
                keywords: ['嵌套', '循环嵌套', '多层循环'],
                question: '如何使用嵌套循环？',
                answer: '嵌套循环是循环中包含循环：\n\n打印九九乘法表：\nfor i in range(1, 10):\n    for j in range(1, i + 1):\n        print(f"{j}×{i}={i*j}", end="\\t")\n    print()  # 换行\n\n打印矩形星号：\nfor i in range(3):\n    for j in range(5):\n        print("*", end="")\n    print()\n\n输出：\n*****\n*****\n*****'
            }
        ],

        // ---------- 模块三：数据结构 ----------
        'module3': [
            {
                keywords: ['列表', 'list', '数组'],
                question: '什么是列表？如何使用？',
                answer: '列表是有序可变的集合：\n\n创建列表：\nnums = [1, 2, 3, 4, 5]\nnames = ["张三", "李四", "王五"]\nempty = []\n\n访问元素：\nnums[0]     # 第一个：1\nnums[-1]    # 最后一个：5\nnums[1:3]   # 切片：[2, 3]\n\n修改元素：\nnums[0] = 10\n\n常用方法：\nnums.append(6)     # 添加\nnums.insert(0, 0)  # 插入\nnums.remove(3)     # 删除元素\nnums.pop()         # 删除末尾\nlen(nums)          # 长度'
            },
            {
                keywords: ['列表', '遍历', 'list', 'iteration'],
                question: '如何遍历列表？',
                answer: '遍历列表的几种方式：\n\n方式1：直接遍历\nfor item in [1, 2, 3]:\n    print(item)\n\n方式2：使用索引\nnums = [10, 20, 30]\nfor i in range(len(nums)):\n    print(i, nums[i])\n\n方式3：同时获取索引和值\nfor index, value in enumerate(nums):\n    print(index, value)\n\n方式4：列表推导式\nsquares = [x**2 for x in range(5)]\n# [0, 1, 4, 9, 16]'
            },
            {
                keywords: ['字典', 'dict', 'dictionary', '键值对'],
                question: '什么是字典？',
                answer: '字典是键值对的集合：\n\n创建字典：\nstudent = {\n    "name": "张三",\n    "age": 18,\n    "grade": "高一"\n}\n\n访问值：\nstudent["name"]        # "张三"\nstudent.get("age")     # 18\nstudent.get("phone", "无")  # 不存在返回默认值\n\n添加/修改：\nstudent["phone"] = "123456"\nstudent["age"] = 19\n\n删除：\ndel student["phone"]\n\n遍历：\nfor key, value in student.items():\n    print(key, value)'
            },
            {
                keywords: ['元组', 'tuple'],
                question: '什么是元组？',
                answer: '元组是有序不可变的集合：\n\n创建元组：\npoint = (3, 4)\ncolors = ("red", "green", "blue")\nsingle = (42,)  # 单元素元组要有逗号\n\n访问：\npoint[0]    # 3\npoint[1]    # 4\n\n特点：\n1. 不可变，不能修改元素\n2. 可以作为字典的键\n3. 用于存储不变的数据\n\n常用场景：\n坐标点 = (x, y)\nRGB颜色 = (255, 128, 0)'
            },
            {
                keywords: ['列表', '排序', 'sort', 'sorted', 'sort'],
                question: '如何对列表排序？',
                answer: '两种排序方式：\n\nsorted() - 返回新列表，原列表不变：\nnums = [3, 1, 4, 1, 5]\nnew_nums = sorted(nums)\n# new_nums = [1, 1, 3, 4, 5]\n\n降序：\nnew_nums = sorted(nums, reverse=True)\n\nlist.sort() - 原地排序，修改原列表：\nnums.sort()\n# nums变为[1, 1, 3, 4, 5]\n\n自定义排序：\nwords = ["banana", "apple", "cherry"]\nwords.sort(key=len)  # 按长度排序\n# [\'apple\', \'banana\', \'cherry\']'
            }
        ],

        // ---------- 模块四：函数 ----------
        'module4': [
            {
                keywords: ['函数', 'def', 'function', '定义函数'],
                question: '如何定义和调用函数？',
                answer: '使用def关键字定义函数：\n\n定义函数：\ndef greet(name):\n    print(f"你好，{name}！")\n\n调用函数：\ngreet("张三")  # 输出：你好，张三！\n\n带返回值的函数：\ndef add(a, b):\n    return a + b\n\nresult = add(3, 5)\nprint(result)  # 8\n\n注意：\n1. def后面是函数名\n2. 括号内是参数\n3. 冒号不能少\n4. 函数体要缩进'
            },
            {
                keywords: ['参数', '返回值', 'return', 'argument', 'parameter'],
                question: '函数的参数和返回值？',
                answer: '函数参数类型：\n\n1. 位置参数：\ndef add(a, b):\n    return a + b\nadd(3, 5)\n\n2. 默认参数：\ndef greet(name, msg="你好"):\n    print(f"{msg}，{name}")\ngreet("张三")        # 你好，张三\ngreet("李四", "嗨")  # 嗨，李四\n\n3. 关键字参数：\ngreet(name="王五", msg="早上好")\n\n4. 可变参数：\ndef sum_all(*nums):\n    return sum(nums)\nsum_all(1, 2, 3, 4)  # 10\n\n返回值：\nreturn语句返回结果\n没有return则返回None\n可以返回多个值：return a, b'
            },
            {
                keywords: ['内置函数', 'built-in', '常用函数'],
                question: '有哪些常用的内置函数？',
                answer: 'Python常用内置函数：\n\n数学相关：\nabs(-5)      # 5 绝对值\nmax(1,2,3)   # 3 最大值\nmin(1,2,3)   # 1 最小值\nsum([1,2,3]) # 6 求和\nround(3.7)   # 4 四舍五入\npow(2, 3)    # 8 幂运算\n\n类型转换：\nint("123")   # 123\nfloat("3.14")# 3.14\nstr(123)     # "123"\nlist("abc")  # [\'a\',\'b\',\'c\']\n\n序列相关：\nlen([1,2,3]) # 3 长度\nsorted([3,1,2]) # [1,2,3]\nenumerate([10,20]) # [(0,10),(1,20)]\nrange(5)     # 0,1,2,3,4'
            },
            {
                keywords: ['模块', 'import', 'math', 'random', 'module'],
                question: '如何使用Python模块？',
                answer: '使用import导入模块：\n\n导入整个模块：\nimport math\nprint(math.pi)       # 3.14159...\nprint(math.sqrt(16)) # 4.0\n\n导入特定函数：\nfrom random import randint\ndice = randint(1, 6)  # 1-6随机数\n\n导入并起别名：\nimport numpy as np\n\n常用模块：\nmath    - 数学函数\nrandom  - 随机数\nos      - 操作系统\ndatetime- 日期时间\njson    - JSON处理'
            }
        ],

        // ---------- 模块五：算法 ----------
        'module5': [
            {
                keywords: ['累加', '求和', 'sum', '累加器'],
                question: '如何实现累加？',
                answer: '累加是将多个数相加的过程：\n\n方法1：使用循环\n total = 0\nfor i in range(1, 101):\n    total += i\nprint(total)  # 5050\n\n方法2：使用sum函数\n total = sum(range(1, 101))\nprint(total)  # 5050\n\n方法3：累加列表元素\nnums = [10, 20, 30, 40]\ntotal = 0\nfor num in nums:\n    total += num\nprint(total)  # 100\n\n累加器模式：\n1. 初始化总和为0\n2. 循环中不断累加\n3. 循环结束得到总和'
            },
            {
                keywords: ['累乘', '阶乘', 'product', 'factorial'],
                question: '如何实现累乘（阶乘）？',
                answer: '累乘是将多个数相乘：\n\n计算n的阶乘 n!：\ndef factorial(n):\n    result = 1\n    for i in range(1, n + 1):\n        result *= i\n    return result\n\nprint(factorial(5))  # 120 = 1×2×3×4×5\n\n累乘器模式：\n1. 初始化结果为1（不是0！）\n2. 循环中不断乘\n3. 注意0的阶乘是1\n\n使用math模块：\nimport math\nmath.factorial(5)  # 120'
            },
            {
                keywords: ['最大值', '最小值', '最值', '查找'],
                question: '如何找最大值和最小值？',
                answer: '找最值的几种方法：\n\n方法1：使用内置函数\nnums = [3, 7, 1, 9, 4]\nprint(max(nums))  # 9\nprint(min(nums))  # 1\n\n方法2：手动实现\nnums = [3, 7, 1, 9, 4]\nmax_val = nums[0]\nfor num in nums:\n    if num > max_val:\n        max_val = num\nprint(max_val)  # 9\n\n同时找最大最小：\nmax_val = min_val = nums[0]\nfor num in nums[1:]:\n    if num > max_val:\n        max_val = num\n    if num < min_val:\n        min_val = num'
            },
            {
                keywords: ['数位分离', '位数', 'digit', '分离'],
                question: '如何分离数字的各位？',
                answer: '数位分离是提取数字各位的方法：\n\n方法1：转换为字符串\nnum = 12345\nfor digit in str(num):\n    print(digit)  # 1 2 3 4 5\n\n方法2：数学方法（取余和整除）\nnum = 12345\n# 个位\nprint(num % 10)        # 5\n# 十位\nprint(num // 10 % 10)  # 4\n# 百位\nprint(num // 100 % 10) # 3\n\n反转数字：\nnum = 12345\nreversed_num = 0\nwhile num > 0:\n    reversed_num = reversed_num * 10 + num % 10\n    num = num // 10\nprint(reversed_num)  # 54321'
            },
            {
                keywords: ['进制', '转换', 'binary', 'hex', '十进制'],
                question: '如何进行进制转换？',
                answer: 'Python进制转换函数：\n\n十进制转其他：\nbin(10)   # \'0b1010\' 二进制\noct(10)   # \'0o12\'   八进制\nhex(255)  # \'0xff\'   十六进制\n\n其他转十进制：\nint("1010", 2)    # 10 二进制转十进制\nint("ff", 16)     # 255 十六进制转十进制\nint("777", 8)     # 511 八进制转十进制\n\n手动实现十进制转二进制：\ndef to_binary(n):\n    if n == 0:\n        return "0"\n    result = ""\n    while n > 0:\n        result = str(n % 2) + result\n        n = n // 2\n    return result'
            },
            {
                keywords: ['排序', 'sort', '冒泡', 'bubble'],
                question: '如何实现冒泡排序？',
                answer: '冒泡排序 - 相邻元素比较交换：\n\ndef bubble_sort(arr):\n    n = len(arr)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr\n\nnums = [64, 34, 25, 12, 22]\nprint(bubble_sort(nums))\n# [12, 22, 25, 34, 64]\n\n原理：\n1. 比较相邻元素\n2. 如果顺序错误就交换\n3. 每轮将最大的"冒泡"到末尾\n4. 重复n-1轮'
            },
            {
                keywords: ['穷举', '枚举', '暴力', '穷举法'],
                question: '什么是穷举法？',
                answer: '穷举法 - 列举所有可能，逐一验证：\n\n示例：找100以内3和5的公倍数\nfor i in range(1, 101):\n    if i % 3 == 0 and i % 5 == 0:\n        print(i)\n\n示例：鸡兔同笼\n# 鸡兔共35只，脚共94只\nfor chickens in range(36):\n    rabbits = 35 - chickens\n    if chickens * 2 + rabbits * 4 == 94:\n        print(f"鸡{chickens}只，兔{rabbits}只")\n        break\n\n特点：\n1. 简单直接\n2. 适合小范围问题\n3. 效率较低但可靠'
            }
        ],

        // ---------- 模块六：3D可视化 ----------
        'module6': [
            {
                keywords: ['3D', '三维', '可视化', 'three', '3d'],
                question: '什么是3D可视化？',
                answer: '3D可视化是将数据以三维图形展示的技术：\n\n在本平台中：\n1. 编写Python代码定义参数\n2. 代码运行后参数传递给3D引擎\n3. Three.js渲染3D模型\n4. 可以旋转、缩放查看\n\n支持的3D模型：\n- 基本几何体（立方体、球体等）\n- 参数化曲线（正弦波、螺旋线）\n- 数学曲面 z=f(x,y)\n- 简单建筑结构\n\n示例代码：\n# 定义立方体参数\nsize = 2\ncolor = "red"\nprint(f"创建{color}立方体，边长{size}")'
            },
            {
                keywords: ['参数化', '建模', 'parametric', 'model'],
                question: '什么是参数化建模？',
                answer: '参数化建模是通过参数控制模型形状：\n\n核心思想：\n用变量（参数）代替固定数值\n修改参数 → 模型自动更新\n\n示例：参数化圆柱\ndef create_cylinder(radius, height):\n    print(f"圆柱：半径={radius}，高度={height}")\n    # 3D引擎根据参数生成模型\n\ncreate_cylinder(2, 5)  # 半径2，高5\ncreate_cylinder(3, 10) # 半径3，高10\n\n优势：\n1. 一处修改，处处更新\n2. 便于设计和迭代\n3. 可以快速生成多种变体\n4. 类似FreeCAD中的参数化设计'
            },
            {
                keywords: ['three.js', 'threejs', 'webgl'],
                question: 'Three.js是什么？',
                answer: 'Three.js是JavaScript的3D图形库：\n\n特点：\n1. 基于WebGL，在浏览器中运行\n2. 无需安装插件\n3. 支持各种3D模型和效果\n4. 开源免费\n\n在本平台中的作用：\nPython代码 → 生成参数 → \nThree.js渲染 → 浏览器显示3D模型\n\n支持的功能：\n- 基本几何体（立方体、球体等）\n- 材质和纹理\n- 光照和阴影\n- 鼠标交互（旋转、缩放）\n- 动画效果'
            },
            {
                keywords: ['组合体', '装配', 'assembly', '组合'],
                question: '如何创建组合体？',
                answer: '组合体由多个基本体组成：\n\n示例：用代码定义组合体\n# 创建一个简单桌子\ntable_top = {\n    "type": "box",\n    "size": [4, 0.2, 2],\n    "position": [0, 1.5, 0]\n}\nleg1 = {\n    "type": "box",\n    "size": [0.2, 1.5, 0.2],\n    "position": [-1.8, 0.75, -0.8]\n}\n# ... 其他桌腿\n\n参数控制：\n- type: 几何体类型\n- size: 尺寸 [宽, 高, 深]\n- position: 位置 [x, y, z]\n- rotation: 旋转角度\n\n通过调整参数可以快速修改设计'
            }
        ],

        // ---------- 通用问题 ----------
        'general': [
            {
                keywords: ['错误', '报错', 'error', 'debug', '调试'],
                question: '代码报错了怎么办？',
                answer: '调试步骤：\n\n1. 查看错误类型\n   - SyntaxError: 语法错误\n   - NameError: 变量未定义\n   - TypeError: 类型错误\n   - IndexError: 索引越界\n\n2. 查看错误行号\n   错误信息中的"line N"指示出错位置\n\n3. 检查常见问题：\n   - 括号是否匹配\n   - 冒号是否遗漏\n   - 缩进是否正确\n   - 变量是否拼写正确\n\n4. 使用print调试\n   在关键位置添加print查看变量值\n\n5. 善用错误诊断系统\n   本平台会自动分析错误并给出建议'
            },
            {
                keywords: ['缩进', 'indent', '空格', 'tab'],
                question: 'Python缩进有什么规则？',
                answer: 'Python用缩进表示代码块：\n\n规则：\n1. 统一使用4个空格\n2. 不要混用空格和Tab\n3. 同一代码块缩进必须一致\n4. 冒号后面的代码要缩进\n\n正确示例：\nif x > 0:\n    print("正数")    # 4个空格\n    print("大于零")  # 同样4个空格\nelse:\n    print("非正数")\n\n常见错误：\n1. IndentationError: 缩进错误\n2. 混用空格和Tab\n3. 缩进空格数不一致\n\n提示：编辑器中按Tab键会自动插入4个空格'
            },
            {
                keywords: ['注释', 'comment', '#'],
                question: '如何写注释？',
                answer: 'Python注释用#号：\n\n单行注释：\n# 这是一个注释\nx = 10  # 行尾注释\n\n多行注释（用三个引号）：\n"""\n这是多行注释\n可以写很多行\n用于说明函数或类\n"""\n\n注释的作用：\n1. 解释代码功能\n2. 方便他人理解\n3. 调试时临时禁用代码\n4. 文档说明\n\n好的注释习惯：\n- 解释"为什么"而不是"是什么"\n- 保持注释与代码同步\n- 复杂逻辑一定要注释'
            },
            {
                keywords: ['快捷键', 'shortcut', '快捷'],
                question: '有哪些有用的快捷键？',
                answer: '编辑器快捷键：\n\n代码编辑：\nTab          - 插入缩进（4空格）\nShift+Tab    - 减少缩进\nEnter        - 自动缩进（冒号后）\nCtrl+Enter   - 运行代码\n\n常用操作：\nCtrl+A       - 全选\nCtrl+C       - 复制\nCtrl+V       - 粘贴\nCtrl+Z       - 撤销\nCtrl+Y       - 重做\n\n提示：\n- 在if/for/while行末按Enter\n  会自动添加缩进\n- Ctrl+Enter快速运行代码'
            },
            {
                keywords: ['学习', '方法', '建议', '入门'],
                question: '如何学好Python？',
                answer: '学习Python的建议：\n\n1. 多动手实践\n   - 每节课都跟着敲代码\n   - 修改参数看效果\n   - 尝试解决练习题\n\n2. 理解而非记忆\n   - 理解每个概念的原理\n   - 知道为什么这样写\n   - 而不是死记硬背\n\n3. 循序渐进\n   - 先掌握基础语法\n   - 再学习控制结构\n   - 最后接触算法和项目\n\n4. 善用工具\n   - 遇到错误看诊断提示\n   - 使用AI助手提问\n   - 查看示例代码\n\n5. 坚持练习\n   - 每天写一点代码\n   - 积少成多\n   - 完成所有课时获得徽章！'
            }
        ]
    },

    // ============================================================
    // 鼓励语库
    // ============================================================
    encouragements: [
        '加油！你正在进步！',
        '太棒了！继续努力！',
        '每一步都是成长！',
        '你已经掌握了关键知识！',
        '错误是学习的机会，别灰心！',
        '坚持就是胜利！',
        '你的代码越来越好了！',
        '尝试修改参数看看效果吧！',
        '编程就是不断试错的过程！',
        '你正在成为一名优秀的程序员！',
        '这个问题问得好！',
        '离完成又近了一步！',
        '多思考，多尝试！',
        '相信你可以做到！',
        '学习编程需要耐心，你已经很棒了！'
    ],

    // ============================================================
    // 初始化
    // ============================================================
    init() {
        this.createUI();
        this.bindEvents();
        this.loadChatHistory();
        console.log('[AIAssistant] AI助手初始化完成');
        console.log(`[AIAssistant] 预设问题库：${this.countQuestions()}个问题`);
    },

    /**
     * 统计问题数量
     */
    countQuestions() {
        let count = 0;
        Object.values(this.questionBank).forEach(questions => {
            count += questions.length;
        });
        return count;
    },

    // ============================================================
    // 创建UI
    // ============================================================
    createUI() {
        // 使用HTML中已有的浮动按钮
        const floatBtn = document.getElementById('ai-fab');
        if (floatBtn) {
            floatBtn.addEventListener('click', () => this.togglePanel());
        }

        // 创建聊天面板
        const panel = document.createElement('div');
        panel.id = 'ai-panel';
        panel.className = 'ai-panel';
        panel.innerHTML = `
            <div class="ai-panel-header">
                <div class="ai-title">
                    <span class="ai-avatar">🤖</span>
                    <span>AI学习助手</span>
                </div>
                <button class="ai-close-btn" id="ai-close-btn">×</button>
            </div>
            <div class="ai-chat-area" id="ai-chat-area">
                <div class="ai-message ai-bot">
                    <div class="ai-message-content">
                        你好！我是AI学习助手。有什么Python学习问题都可以问我！<br><br>
                        你可以：
                        <ul>
                            <li>点击下方的常见问题</li>
                            <li>输入关键词搜索</li>
                            <li>选中代码后点击"解释代码"</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="ai-quick-questions" id="ai-quick-questions">
                <!-- 快捷问题按钮 -->
            </div>
            <div class="ai-input-area">
                <div class="ai-action-buttons">
                    <button class="ai-action-btn" id="ai-explain-btn" title="解释选中的代码">
                        📖 解释代码
                    </button>
                    <button class="ai-action-btn" id="ai-hint-btn" title="获取提示">
                        💡 给我提示
                    </button>
                    <button class="ai-action-btn" id="ai-encourage-btn" title="鼓励一下">
                        🌟 鼓励我
                    </button>
                </div>
                <div class="ai-input-row">
                    <input type="text" id="ai-input" class="ai-input" placeholder="输入问题或关键词..." />
                    <button class="ai-send-btn" id="ai-send-btn">发送</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // 渲染快捷问题
        this.renderQuickQuestions();
    },

    /**
     * 渲染快捷问题
     */
    renderQuickQuestions() {
        const container = document.getElementById('ai-quick-questions');
        if (!container) return;

        const quickQuestions = [
            '什么是变量？',
            '如何使用if判断？',
            'for循环怎么用？',
            '什么是列表？',
            '如何定义函数？',
            '代码报错了怎么办？'
        ];

        container.innerHTML = quickQuestions.map(q => `
            <button class="ai-quick-q" onclick="AIAssistant.askQuestion('${q}')">${q}</button>
        `).join('');
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮
        const closeBtn = document.getElementById('ai-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePanel());
        }

        // 发送按钮
        const sendBtn = document.getElementById('ai-send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendUserMessage());
        }

        // 输入框回车
        const input = document.getElementById('ai-input');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.sendUserMessage();
                }
            });
        }

        // 解释代码按钮
        const explainBtn = document.getElementById('ai-explain-btn');
        if (explainBtn) {
            explainBtn.addEventListener('click', () => this.explainSelectedCode());
        }

        // 提示按钮
        const hintBtn = document.getElementById('ai-hint-btn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.giveHint());
        }

        // 鼓励按钮
        const encourageBtn = document.getElementById('ai-encourage-btn');
        if (encourageBtn) {
            encourageBtn.addEventListener('click', () => this.encourage());
        }
    },

    // ============================================================
    // 面板控制
    // ============================================================

    /**
     * 切换面板显示
     */
    togglePanel() {
        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    },

    /**
     * 打开面板
     */
    openPanel() {
        const panel = document.getElementById('ai-panel');
        const floatBtn = document.getElementById('ai-fab');
        if (panel) {
            panel.classList.add('open');
        }
        if (floatBtn) {
            floatBtn.classList.add('hidden');
        }
        this.isOpen = true;

        // 聚焦输入框
        setTimeout(() => {
            const input = document.getElementById('ai-input');
            if (input) input.focus();
        }, 300);
    },

    /**
     * 关闭面板
     */
    closePanel() {
        const panel = document.getElementById('ai-panel');
        const floatBtn = document.getElementById('ai-fab');
        if (panel) {
            panel.classList.remove('open');
        }
        if (floatBtn) {
            floatBtn.classList.remove('hidden');
        }
        this.isOpen = false;
    },

    // ============================================================
    // 消息处理
    // ============================================================

    /**
     * 发送用户消息
     */
    sendUserMessage() {
        const input = document.getElementById('ai-input');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // 添加用户消息
        this.addMessage('user', message);

        // 清空输入框
        input.value = '';

        // 匹配回答
        const answer = this.matchAnswer(message);

        // 显示回答（带打字机效果）
        setTimeout(() => {
            this.addMessageWithTypewriter('bot', answer);
        }, 300);
    },

    /**
     * 提问（从快捷问题调用）
     */
    askQuestion(question) {
        this.addMessage('user', question);

        const answer = this.matchAnswer(question);

        setTimeout(() => {
            this.addMessageWithTypewriter('bot', answer);
        }, 300);
    },

    /**
     * 智能匹配答案
     */
    matchAnswer(query) {
        // 转小写进行匹配
        const queryLower = query.toLowerCase();

        let bestMatch = null;
        let bestScore = 0;

        // 遍历所有问题
        Object.values(this.questionBank).forEach(questions => {
            questions.forEach(qa => {
                let score = 0;

                // 关键词匹配
                qa.keywords.forEach(keyword => {
                    if (queryLower.includes(keyword.toLowerCase())) {
                        score += keyword.length; // 关键词越长权重越高
                    }
                });

                // 问题文本匹配
                if (queryLower.includes(qa.question.toLowerCase().substring(0, 4))) {
                    score += 5;
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = qa;
                }
            });
        });

        if (bestMatch && bestScore > 0) {
            return bestMatch.answer;
        }

        // 未匹配到，返回默认回答
        return this.getDefaultAnswer(query);
    },

    /**
     * 获取默认回答
     */
    getDefaultAnswer(query) {
        const defaults = [
            `这是一个好问题！关于"${query}"，我还没有预设答案。\n\n建议你：\n1. 尝试用不同的关键词提问\n2. 查看课时的知识点\n3. 点击"给我提示"获取当前课时的提示`,
            `我还在学习中，暂时无法回答"${query}"。\n\n你可以尝试问一些常见问题，比如：\n- 什么是变量？\n- 如何使用循环？\n- 什么是列表？`,
            `关于"${query}"的问题，建议你：\n1. 查看右侧的"知识点"部分\n2. 点击"显示提示"获取帮助\n3. 尝试运行代码观察效果`
        ];
        return defaults[Math.floor(Math.random() * defaults.length)];
    },

    /**
     * 添加消息
     */
    addMessage(role, content) {
        const chatArea = document.getElementById('ai-chat-area');
        if (!chatArea) return;

        const messageEl = document.createElement('div');
        messageEl.className = `ai-message ai-${role}`;

        const contentEl = document.createElement('div');
        contentEl.className = 'ai-message-content';

        // 将换行符转换为<br>，保留代码格式
        contentEl.innerHTML = this.formatMessageContent(content);

        messageEl.appendChild(contentEl);
        chatArea.appendChild(messageEl);

        // 滚动到底部
        chatArea.scrollTop = chatArea.scrollHeight;

        // 保存到历史
        this.chatHistory.push({ role, content, timestamp: Date.now() });
        this.saveChatHistory();
    },

    /**
     * 带打字机效果添加消息
     */
    addMessageWithTypewriter(role, content) {
        const chatArea = document.getElementById('ai-chat-area');
        if (!chatArea) return;

        const messageEl = document.createElement('div');
        messageEl.className = `ai-message ai-${role}`;

        const contentEl = document.createElement('div');
        contentEl.className = 'ai-message-content';
        contentEl.innerHTML = '<span class="ai-typing">正在输入...</span>';

        messageEl.appendChild(contentEl);
        chatArea.appendChild(messageEl);
        chatArea.scrollTop = chatArea.scrollHeight;

        // 打字机效果
        let index = 0;
        const speed = 20; // 每字符20毫秒

        // 清除之前的定时器
        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
        }

        this.typewriterTimer = setInterval(() => {
            if (index < content.length) {
                const partial = content.substring(0, index + 1);
                contentEl.innerHTML = this.formatMessageContent(partial);
                chatArea.scrollTop = chatArea.scrollHeight;
                index++;
            } else {
                clearInterval(this.typewriterTimer);
                this.typewriterTimer = null;
            }
        }, speed);

        // 保存到历史
        this.chatHistory.push({ role, content, timestamp: Date.now() });
        this.saveChatHistory();
    },

    /**
     * 格式化消息内容
     */
    formatMessageContent(content) {
        // 转义HTML
        let html = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // 换行符
        html = html.replace(/\n/g, '<br>');

        // 代码块（```...```）
        html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="ai-code-block">$2</pre>');

        // 行内代码（`code`）
        html = html.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');

        return html;
    },

    // ============================================================
    // 代码解释功能
    // ============================================================

    /**
     * 解释选中的代码
     */
    explainSelectedCode() {
        const editor = document.getElementById('code-editor');
        if (!editor) {
            this.addMessage('bot', '未找到代码编辑器！');
            return;
        }

        const selectedText = editor.value.substring(
            editor.selectionStart,
            editor.selectionEnd
        ).trim();

        if (!selectedText) {
            this.addMessage('bot', '请先在代码编辑器中选中一段代码，然后点击"解释代码"。\n\n操作方法：用鼠标选中代码，或按住Shift+方向键选择。');
            return;
        }

        // 分析选中的代码
        const explanation = this.analyzeCode(selectedText);
        this.addMessageWithTypewriter('bot', explanation);
    },

    /**
     * 分析代码并生成解释
     */
    analyzeCode(code) {
        const lines = code.split('\n');
        let explanation = '📖 代码解释：\n\n';

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            // 变量赋值
            if (/^\w+\s*=/.test(trimmed)) {
                const varName = trimmed.match(/^(\w+)/)[1];
                explanation += `第${index + 1}行：定义变量 "${varName}"\n`;
            }
            // if语句
            else if (trimmed.startsWith('if ')) {
                explanation += `第${index + 1}行：if条件判断，如果条件成立则执行下面的代码\n`;
            }
            // for循环
            else if (trimmed.startsWith('for ')) {
                explanation += `第${index + 1}行：for循环，重复执行某段代码\n`;
            }
            // while循环
            else if (trimmed.startsWith('while ')) {
                explanation += `第${index + 1}行：while循环，当条件成立时重复执行\n`;
            }
            // 函数定义
            else if (trimmed.startsWith('def ')) {
                const funcName = trimmed.match(/def\s+(\w+)/);
                if (funcName) {
                    explanation += `第${index + 1}行：定义函数 "${funcName[1]}"\n`;
                }
            }
            // print语句
            else if (trimmed.startsWith('print')) {
                explanation += `第${index + 1}行：输出内容到屏幕\n`;
            }
            // return语句
            else if (trimmed.startsWith('return')) {
                explanation += `第${index + 1}行：函数返回值\n`;
            }
            // import语句
            else if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
                explanation += `第${index + 1}行：导入模块\n`;
            }
        });

        explanation += '\n💡 建议：修改代码中的参数，观察运行结果的变化。';

        return explanation;
    },

    // ============================================================
    // 提示功能
    // ============================================================

    /**
     * 给出提示
     */
    giveHint() {
        // 获取当前课时
        const lesson = typeof getCurrentLesson === 'function' ? getCurrentLesson() : null;

        if (!lesson) {
            this.addMessage('bot', '💡 请先选择一个课时，我可以给你相关的提示！');
            return;
        }

        if (lesson.hints && lesson.hints.length > 0) {
            // 随机选择一个提示
            const hintIndex = Math.floor(Math.random() * lesson.hints.length);
            const hint = lesson.hints[hintIndex];

            this.addMessageWithTypewriter('bot',
                `💡 提示（第${lesson.lesson_number}课：${lesson.title}）：\n\n${hint}\n\n` +
                `记住：提示只是方向，具体实现需要你自己思考！`
            );
        } else {
            this.addMessage('bot', '当前课时暂无提示。请尝试查看知识点和常见错误部分。');
        }
    },

    // ============================================================
    // 鼓励功能
    // ============================================================

    /**
     * 鼓励学生
     */
    encourage() {
        // 随机选择鼓励语
        const encouragement = this.encouragements[
            this.encouragementIndex % this.encouragements.length
        ];
        this.encouragementIndex++;

        this.addMessageWithTypewriter('bot', `🌟 ${encouragement}`);
    },

    // ============================================================
    // 对话历史
    // ============================================================

    /**
     * 保存对话历史
     */
    saveChatHistory() {
        try {
            // 只保存最近20条
            const recent = this.chatHistory.slice(-20);
            localStorage.setItem('ai_chat_history', JSON.stringify(recent));
        } catch (e) {
            console.warn('[AIAssistant] 保存对话历史失败:', e);
        }
    },

    /**
     * 加载对话历史
     */
    loadChatHistory() {
        try {
            const saved = localStorage.getItem('ai_chat_history');
            if (saved) {
                this.chatHistory = JSON.parse(saved);
                // 渲染历史消息
                this.chatHistory.forEach(msg => {
                    this.addMessage(msg.role, msg.content);
                });
            }
        } catch (e) {
            console.warn('[AIAssistant] 加载对话历史失败:', e);
            this.chatHistory = [];
        }
    },

    /**
     * 清空对话历史
     */
    clearHistory() {
        this.chatHistory = [];
        localStorage.removeItem('ai_chat_history');

        const chatArea = document.getElementById('ai-chat-area');
        if (chatArea) {
            chatArea.innerHTML = `
                <div class="ai-message ai-bot">
                    <div class="ai-message-content">
                        对话已清空。有什么问题尽管问我！
                    </div>
                </div>
            `;
        }
    }
};

// ============================================================
// 导出模块
// ============================================================
window.AIAssistant = AIAssistant;
