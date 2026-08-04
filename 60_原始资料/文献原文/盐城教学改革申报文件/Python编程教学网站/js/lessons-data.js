/**
 * lessons-data.js - 课程数据文件
 * 高中信息技术Python课程，6个模块，17个课时
 * 覆盖江苏省高中信息技术Python全部考点
 */

const LESSONS_DATA = [
    // ============================================================
    // 模块一：Python入门与计算思维（2课时）
    // ============================================================
    {
        id: 1,
        module: 1,
        module_title: '模块一：Python入门与计算思维',
        lesson_number: 1,
        title: '初识Python——变量与数据类型',
        description: '学习Python的基本语法，理解变量的概念和常用数据类型，编写第一个Python程序。',
        knowledge_points: [
            'Python简介与开发环境',
            '变量的概念与命名规则',
            '基本数据类型：整数(int)、浮点数(float)、字符串(str)、布尔值(bool)',
            '变量的赋值与使用',
            'type()函数查看数据类型',
            '类型转换：int()、float()、str()'
        ],
        starter_code: `# 第1课：变量与数据类型
# 在下面编写你的Python代码

# 定义变量
name = "张三"
age = 18
height = 1.75
is_student = True

# 输出变量
print("姓名:", name)
print("年龄:", age)
print("身高:", height)
print("是否学生:", is_student)

# 查看数据类型
print("name的类型:", type(name))
print("age的类型:", type(age))
`,
        expected_output: '姓名: 张三\n年龄: 18\n身高: 1.75\n是否学生: True',
        exercise: '定义三个变量：你的姓名、年龄和最喜欢的科目，然后输出它们的信息和类型。',
        hints: [
            '使用 = 进行变量赋值',
            '字符串需要用引号包裹，如 "张三"',
            '使用 type() 函数可以查看变量类型',
            '使用 print() 函数输出内容'
        ],
        common_errors: [
            { type: 'SyntaxError', description: '字符串引号不匹配，确保引号成对出现' },
            { type: 'NameError', description: '变量名拼写错误或未定义就使用' }
        ],
        difficulty: 1
    },
    {
        id: 2,
        module: 1,
        module_title: '模块一：Python入门与计算思维',
        lesson_number: 2,
        title: '输入输出与运算符',
        description: '学习使用input()获取用户输入，print()输出信息，掌握各种运算符的使用。',
        knowledge_points: [
            'input()函数获取用户输入',
            'print()函数的多种用法',
            '格式化输出：f-string',
            '算术运算符：+、-、*、/、//、%、**',
            '比较运算符：==、!=、>、<、>=、<=',
            '逻辑运算符：and、or、not',
            '运算符优先级'
        ],
        starter_code: `# 第2课：输入输出与运算符

# 获取用户输入
name = input("请输入你的姓名：")
age = int(input("请输入你的年龄："))

# 算术运算
a = 10
b = 3
print("加法:", a + b)
print("减法:", a - b)
print("乘法:", a * b)
print("除法:", a / b)
print("整除:", a // b)
print("取余:", a % b)
print("幂运算:", a ** b)

# 格式化输出
print(f"你好{name}，你今年{age}岁")
print(f"10年后你将{age + 10}岁")
`,
        expected_output: '加法: 13\n减法: 7\n乘法: 30\n除法: 3.333...',
        exercise: '编写一个简单的计算器：输入两个数字，输出它们的和、差、积、商。',
        hints: [
            '使用 int() 或 float() 将输入转换为数字',
            'input() 返回的是字符串类型',
            '使用 f"..." 进行格式化输出',
            '注意除法 / 和整除 // 的区别'
        ],
        common_errors: [
            { type: 'ValueError', description: '将非数字字符串转为int时出错' },
            { type: 'TypeError', description: '字符串和数字直接相加会报错' },
            { type: 'ZeroDivisionError', description: '除数不能为零' }
        ],
        difficulty: 1
    },

    // ============================================================
    // 模块二：程序控制结构（3课时）
    // ============================================================
    {
        id: 3,
        module: 2,
        module_title: '模块二：程序控制结构',
        lesson_number: 3,
        title: '分支结构（if/elif/else）',
        description: '学习条件判断语句，根据不同条件执行不同的代码分支。',
        knowledge_points: [
            'if语句的基本语法',
            'if-else双分支结构',
            'if-elif-else多分支结构',
            '条件表达式与布尔值',
            '嵌套if语句',
            '条件判断的应用场景'
        ],
        starter_code: `# 第3课：分支结构

# 成绩等级判断
score = 85

if score >= 90:
    grade = "优秀"
elif score >= 80:
    grade = "良好"
elif score >= 70:
    grade = "中等"
elif score >= 60:
    grade = "及格"
else:
    grade = "不及格"

print(f"成绩{score}分，等级：{grade}")

# 判断奇偶数
num = 7
if num % 2 == 0:
    print(f"{num}是偶数")
else:
    print(f"{num}是奇数")

# 判断闰年
year = 2024
if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):
    print(f"{year}年是闰年")
else:
    print(f"{year}年不是闰年")
`,
        expected_output: '成绩85分，等级：良好\n7是奇数\n2024年是闰年',
        exercise: '编写程序：输入一个年龄，判断属于哪个年龄段（儿童0-12、少年13-17、青年18-40、中年41-60、老年60以上）。',
        hints: [
            'if后面必须有冒号":"',
            '代码块必须缩进（4个空格）',
            'elif可以有多层',
            'else是可选的',
            '注意条件的顺序，从大到小或从小到大'
        ],
        common_errors: [
            { type: 'SyntaxError', description: 'if/elif/else后面忘记加冒号' },
            { type: 'IndentationError', description: '代码块没有正确缩进' },
            { type: 'SyntaxError', description: '使用=代替==进行比较' }
        ],
        difficulty: 2
    },
    {
        id: 4,
        module: 2,
        module_title: '模块二：程序控制结构',
        lesson_number: 4,
        title: '循环结构（for循环）',
        description: '学习for循环的使用，遍历序列和重复执行代码块。',
        knowledge_points: [
            'for循环基本语法',
            'range()函数的使用',
            '遍历列表、字符串',
            'break和continue语句',
            '循环中的else子句',
            '嵌套循环'
        ],
        starter_code: `# 第4课：for循环

# 使用range()循环
print("输出1-10:")
for i in range(1, 11):
    print(i, end=" ")
print()

# 计算1-100的和
total = 0
for i in range(1, 101):
    total += i
print(f"1到100的和：{total}")

# 遍历字符串
print("遍历字符串:")
for ch in "Python":
    print(ch, end=" ")
print()

# 打印九九乘法表
print("九九乘法表:")
for i in range(1, 10):
    for j in range(1, i + 1):
        print(f"{j}×{i}={i*j}", end="\\t")
    print()

# break和continue
print("找到第一个能被7整除的数:")
for i in range(1, 100):
    if i % 7 == 0:
        print(f"找到了：{i}")
        break
`,
        expected_output: '1到100的和：5050\n九九乘法表...',
        exercise: '编写程序：输出100以内所有3的倍数，并统计有多少个。',
        hints: [
            'range(n) 生成 0 到 n-1',
            'range(a, b) 生成 a 到 b-1',
            'range(a, b, step) 可以指定步长',
            'print(x, end=" ") 可以不换行输出',
            '用 break 跳出循环，continue 跳过本次'
        ],
        common_errors: [
            { type: 'SyntaxError', description: 'for语句忘记加冒号' },
            { type: 'IndentationError', description: '循环体没有正确缩进' },
            { type: 'TypeError', description: 'range()参数必须是整数' }
        ],
        difficulty: 2
    },
    {
        id: 5,
        module: 2,
        module_title: '模块二：程序控制结构',
        lesson_number: 5,
        title: '循环结构（while循环）与break/continue',
        description: '学习while循环的使用，掌握循环控制语句break和continue。',
        knowledge_points: [
            'while循环基本语法',
            'while与for的区别',
            'break跳出循环',
            'continue跳过本次',
            '无限循环与终止条件',
            '循环应用场景'
        ],
        starter_code: `# 第5课：while循环

# 基本while循环
print("倒数计数:")
count = 5
while count > 0:
    print(count)
    count -= 1
print("发射！")

# 计算2的幂直到超过1000
print("\\n2的幂:")
power = 1
result = 1
while result <= 1000:
    print(f"2^{power} = {result}")
    power += 1
    result *= 2

# 猜数字游戏
import random
target = random.randint(1, 100)
print("\\n猜数字游戏（1-100）:")
guess = 0
attempts = 0

while guess != target:
    guess = 50  # 模拟猜测
    attempts += 1
    if guess < target:
        print(f"{guess} 太小了")
        guess += 10
    elif guess > target:
        print(f"{guess} 太大了")
        guess -= 5
    else:
        print(f"猜对了！用了{attempts}次")
        break
`,
        expected_output: '5\n4\n3\n2\n1\n发射！',
        exercise: '编写程序：使用while循环计算斐波那契数列的前20项。',
        hints: [
            'while循环需要初始化变量',
            '必须有改变循环条件的语句，否则会死循环',
            'break可以跳出while循环',
            'continue跳过本次，继续下一次循环',
            'while True 创建无限循环，配合break使用'
        ],
        common_errors: [
            { type: 'NameError', description: '循环变量未初始化' },
            { type: 'IndentationError', description: '循环体缩进错误' },
            { type: 'RecursionError', description: '忘记更新循环变量导致死循环' }
        ],
        difficulty: 3
    },

    // ============================================================
    // 模块三：数据结构（3课时）
    // ============================================================
    {
        id: 6,
        module: 3,
        module_title: '模块三：数据结构',
        lesson_number: 6,
        title: '列表基础',
        description: '学习Python列表的创建、访问和基本操作。',
        knowledge_points: [
            '列表的创建与初始化',
            '通过索引访问元素',
            '列表切片',
            '修改列表元素',
            '列表常用方法：append、insert、remove、pop',
            'len()获取列表长度',
            'in运算符判断元素是否存在'
        ],
        starter_code: `# 第6课：列表基础

# 创建列表
fruits = ["苹果", "香蕉", "橙子", "葡萄", "西瓜"]
numbers = [10, 20, 30, 40, 50]
mixed = [1, "hello", 3.14, True]

# 访问元素
print("第一个水果:", fruits[0])
print("最后一个水果:", fruits[-1])
print("前三个水果:", fruits[0:3])

# 修改元素
fruits[0] = "红苹果"
print("修改后:", fruits)

# 添加元素
fruits.append("芒果")
print("添加后:", fruits)

# 删除元素
fruits.remove("香蕉")
print("删除后:", fruits)

# 列表长度
print("列表长度:", len(fruits))

# 判断元素是否存在
if "橙子" in fruits:
    print("橙子在列表中")

# 遍历列表
print("所有水果:")
for fruit in fruits:
    print("-", fruit)
`,
        expected_output: '第一个水果: 苹果\n最后一个水果: 西瓜',
        exercise: '创建一个包含你5个朋友姓名的列表，实现：添加一个新朋友、删除一个朋友、修改一个朋友的名字、输出所有朋友。',
        hints: [
            '使用方括号 [] 创建列表',
            '索引从0开始，-1表示最后一个',
            'append() 在末尾添加元素',
            'remove() 删除指定值的元素',
            '使用 for 循环遍历列表'
        ],
        common_errors: [
            { type: 'IndexError', description: '索引超出列表范围' },
            { type: 'ValueError', description: 'remove()删除不存在的元素' },
            { type: 'TypeError', description: '列表和字符串直接相加'
            }
        ],
        difficulty: 2
    },
    {
        id: 7,
        module: 3,
        module_title: '模块三：数据结构',
        lesson_number: 7,
        title: '列表进阶与遍历',
        description: '深入学习列表的高级操作，包括排序、推导式和多维列表。',
        knowledge_points: [
            '列表排序：sort()和sorted()',
            '列表反转：reverse()',
            '列表推导式（List Comprehension）',
            'enumerate()获取索引和值',
            '多维列表（嵌套列表）',
            '列表的复制与深浅拷贝',
            'zip()并行遍历多个列表'
        ],
        starter_code: `# 第7课：列表进阶

# 排序
scores = [85, 92, 78, 96, 88, 73]
print("原列表:", scores)

# sorted()返回新列表
sorted_scores = sorted(scores)
print("升序:", sorted_scores)
print("降序:", sorted(scores, reverse=True))

# sort()原地排序
scores.sort()
print("排序后:", scores)

# 列表推导式
squares = [x**2 for x in range(1, 11)]
print("平方数:", squares)

evens = [x for x in range(1, 21) if x % 2 == 0]
print("偶数:", evens)

# enumerate获取索引和值
print("带索引的遍历:")
for index, value in enumerate(fruits if 'fruits' in dir() else ["苹果","香蕉","橙子"]):
    print(f"  {index}: {value}")

# 多维列表
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
print("矩阵:")
for row in matrix:
    for val in row:
        print(val, end=" ")
    print()

# 矩阵转置
transposed = [[row[i] for row in matrix] for i in range(3)]
print("转置矩阵:", transposed)
`,
        expected_output: '原列表: [85, 92, 78, 96, 88, 73]\n升序: [73, 78, 85, 88, 92, 96]',
        exercise: '使用列表推导式生成1-100中所有能被3或5整除的数，并输出它们的和。',
        hints: [
            'sorted()返回新列表，sort()修改原列表',
            '列表推导式：[表达式 for 变量 in 序列 if 条件]',
            'enumerate()可以同时获取索引和值',
            '多维列表就是列表中的列表',
            '使用zip()可以同时遍历多个列表'
        ],
        common_errors: [
            { type: 'IndexError', description: '多维列表索引越界' },
            { type: 'TypeError', description: '列表推导式语法错误' },
            { type: 'AttributeError', description: '对sorted()结果调用sort()'
            }
        ],
        difficulty: 3
    },
    {
        id: 8,
        module: 3,
        module_title: '模块三：数据结构',
        lesson_number: 8,
        title: '字典与元组',
        description: '学习字典和元组这两种重要的数据结构。',
        knowledge_points: [
            '字典的创建与访问',
            '字典的增删改查',
            '字典常用方法：keys、values、items',
            '字典推导式',
            '元组的创建与使用',
            '元组与列表的区别',
            '集合(set)简介'
        ],
        starter_code: `# 第8课：字典与元组

# 字典
student = {
    "name": "张三",
    "age": 18,
    "grade": "高一",
    "scores": [85, 92, 78]
}

# 访问字典
print("姓名:", student["name"])
print("年龄:", student.get("age"))

# 修改和添加
student["age"] = 19
student["phone"] = "123456789"
print("更新后:", student)

# 删除
del student["phone"]
print("删除后:", student)

# 遍历字典
print("\\n遍历字典:")
for key, value in student.items():
    print(f"  {key}: {value}")

# 字典推导式
squares = {x: x**2 for x in range(1, 6)}
print("平方字典:", squares)

# 元组
point = (3, 4)
print(f"坐标: ({point[0]}, {point[1]})")

# 元组解包
x, y = point
print(f"x={x}, y={y}")

# 多返回值
def min_max(lst):
    return min(lst), max(lst)

nums = [3, 7, 1, 9, 4]
mn, mx = min_max(nums)
print(f"最小值: {mn}, 最大值: {mx}")

# 集合
colors = {"红", "绿", "蓝", "红"}  # 自动去重
print("集合:", colors)
print("交集:", {"红", "黄", "绿"} & colors)
print("并集:", {"红", "黄"} | colors)
`,
        expected_output: '姓名: 张三\n年龄: 19',
        exercise: '创建一个电话簿字典，存储3个联系人的姓名和电话，实现查找、添加、删除功能。',
        hints: [
            '字典用花括号{}创建，键值对用冒号:分隔',
            '使用 dict[key] 或 dict.get(key) 访问值',
            '元组用圆括号()创建，不可修改',
            '元组可以用于多返回值',
            '集合自动去重，支持交集(&)和并集(|)'
        ],
        common_errors: [
            { type: 'KeyError', description: '访问字典不存在的键' },
            { type: 'TypeError', description: '使用列表作为字典键（不可哈希）' },
            { type: 'AttributeError', description: '元组调用列表方法' }
        ],
        difficulty: 3
    },

    // ============================================================
    // 模块四：函数与模块化（3课时）
    // ============================================================
    {
        id: 9,
        module: 4,
        module_title: '模块四：函数与模块化',
        lesson_number: 9,
        title: '函数定义与调用',
        description: '学习如何定义和调用函数，理解函数的基本概念。',
        knowledge_points: [
            '函数的定义：def关键字',
            '函数的调用',
            '形参与实参',
            'return语句',
            '函数的文档字符串',
            '函数的作用域',
            'None返回值'
        ],
        starter_code: `# 第9课：函数定义与调用

# 定义简单函数
def greet(name):
    """向指定的人问好"""
    print(f"你好，{name}！欢迎学习Python！")

# 调用函数
greet("张三")
greet("李四")

# 带返回值的函数
def add(a, b):
    """返回两个数的和"""
    return a + b

result = add(3, 5)
print(f"3 + 5 = {result}")

# 计算圆的面积
def circle_area(radius):
    """计算圆的面积"""
    pi = 3.14159
    area = pi * radius ** 2
    return area

r = 5
print(f"半径{r}的圆面积：{circle_area(r):.2f}")

# 判断质数
def is_prime(n):
    """判断一个数是否为质数"""
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

# 输出100以内的质数
primes = [n for n in range(2, 101) if is_prime(n)]
print(f"100以内的质数：{primes}")
`,
        expected_output: '你好，张三！欢迎学习Python！\n3 + 5 = 8',
        exercise: '编写一个函数 calculate_bmi(weight, height) 计算BMI指数，并返回BMI值和体重等级。',
        hints: [
            '使用def关键字定义函数',
            '函数名后面要有圆括号和冒号',
            '函数体必须缩进',
            'return语句返回结果',
            '没有return的函数返回None',
            '使用三引号添加文档字符串'
        ],
        common_errors: [
            { type: 'SyntaxError', description: 'def语句忘记加冒号' },
            { type: 'IndentationError', description: '函数体缩进错误' },
            { type: 'NameError', description: '调用函数前未定义' }
        ],
        difficulty: 3
    },
    {
        id: 10,
        module: 4,
        module_title: '模块四：函数与模块化',
        lesson_number: 10,
        title: '函数参数与返回值',
        description: '深入学习函数的参数类型和返回值机制。',
        knowledge_points: [
            '位置参数',
            '默认参数',
            '关键字参数',
            '可变参数：*args',
            '关键字可变参数：**kwargs',
            '多返回值',
            '参数传递机制'
        ],
        starter_code: `# 第10课：函数参数与返回值

# 默认参数
def greet(name, message="你好"):
    print(f"{message}，{name}！")

greet("张三")           # 使用默认消息
greet("李四", "早上好")  # 自定义消息
greet(name="王五", message="晚上好")  # 关键字参数

# 可变参数 *args
def sum_all(*numbers):
    """计算任意数量数字的和"""
    total = 0
    for num in numbers:
        total += num
    return total

print(sum_all(1, 2, 3))
print(sum_all(10, 20, 30, 40, 50))
print(sum_all())  # 无参数返回0

# 关键字可变参数 **kwargs
def print_info(name, **info):
    """打印个人信息"""
    print(f"姓名：{name}")
    for key, value in info.items():
        print(f"  {key}：{value}")

print_info("张三", age=18, grade="高一", city="南京")

# 多返回值
def statistics(numbers):
    """返回列表的统计信息"""
    return min(numbers), max(numbers), sum(numbers), sum(numbers) / len(numbers)

scores = [85, 92, 78, 96, 88]
mn, mx, total, avg = statistics(scores)
print(f"最低分：{mn}")
print(f"最高分：{mx}")
print(f"总分：{total}")
print(f"平均分：{avg:.1f}")

# 参数解包
def add_three(a, b, c):
    return a + b + c

nums = [1, 2, 3]
print(f"列表解包：{add_three(*nums)}")
`,
        expected_output: '你好，张三！\n早上好，李四！',
        exercise: '编写一个函数可以接受任意数量的学生成绩，返回最高分、最低分和平均分。',
        hints: [
            '默认参数必须放在普通参数后面',
            '*args 接收任意数量的位置参数',
            '**kwargs 接收任意数量的关键字参数',
            'return可以返回多个值（实际是元组）',
            '使用 *列表 可以解包列表为参数'
        ],
        common_errors: [
            { type: 'SyntaxError', description: '默认参数放在了普通参数前面' },
            { type: 'TypeError', description: '参数数量不匹配' },
            { type: 'TypeError', description: '关键字参数拼写错误' }
        ],
        difficulty: 4
    },
    {
        id: 11,
        module: 4,
        module_title: '模块四：函数与模块化',
        lesson_number: 11,
        title: '常用内置函数与模块',
        description: '学习Python常用的内置函数和标准库模块的使用。',
        knowledge_points: [
            '数学函数：abs、max、min、sum、round、pow',
            '类型转换函数：int、float、str、list、dict',
            '序列函数：len、sorted、reversed、enumerate、zip',
            'map()和filter()函数',
            'import导入模块',
            'math模块',
            'random模块',
            'datetime模块'
        ],
        starter_code: `# 第11课：常用内置函数与模块

# 数学函数
print("abs(-5):", abs(-5))
print("max(1,2,3):", max(1, 2, 3))
print("min(1,2,3):", min(1, 2, 3))
print("sum([1,2,3]):", sum([1, 2, 3]))
print("round(3.7):", round(3.7))
print("pow(2,3):", pow(2, 3))

# map和filter
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
print("平方:", squared)

evens = list(filter(lambda x: x % 2 == 0, numbers))
print("偶数:", evens)

# math模块
import math
print("\\nmath模块:")
print("pi:", math.pi)
print("sqrt(16):", math.sqrt(16))
print("ceil(3.2):", math.ceil(3.2))
print("floor(3.8):", math.floor(3.8))
print("log(100,10):", math.log(100, 10))

# random模块
import random
print("\\nrandom模块:")
print("随机数1-6:", random.randint(1, 6))
print("随机浮点:", random.random())
print("随机选择:", random.choice(["石头", "剪刀", "布"]))

# 打乱列表
cards = list(range(1, 11))
random.shuffle(cards)
print("打乱后:", cards)

# datetime模块
from datetime import datetime, timedelta
now = datetime.now()
print(f"\\n当前时间: {now.strftime('%Y年%m月%d日 %H:%M:%S')}")
tomorrow = now + timedelta(days=1)
print(f"明天: {tomorrow.strftime('%Y-%m-%d')}")
`,
        expected_output: 'abs(-5): 5\nmax(1,2,3): 3',
        exercise: '使用random模块模拟掷两个骰子10000次，统计每个点数（2-12）出现的次数和概率。',
        hints: [
            'map(函数, 序列) 对每个元素应用函数',
            'filter(函数, 序列) 筛选满足条件的元素',
            '使用 import 模块名 导入模块',
            'from 模块 import 函数 可以导入特定函数',
            'math模块包含数学函数',
            'random模块用于生成随机数'
        ],
        common_errors: [
            { type: 'ModuleNotFoundError', description: '模块名拼写错误' },
            { type: 'AttributeError', description: '调用模块中不存在的方法' },
            { type: 'TypeError', description: 'map/filter返回的是迭代器，需要list()转换' }
        ],
        difficulty: 3
    },

    // ============================================================
    // 模块五：算法与数据处理（3课时）
    // ============================================================
    {
        id: 12,
        module: 5,
        module_title: '模块五：算法与数据处理',
        lesson_number: 12,
        title: '基本算法（累加、累乘、最值查找）',
        description: '学习基本的算法思想：累加、累乘和最值查找。',
        knowledge_points: [
            '累加算法',
            '累乘算法（阶乘）',
            '最大值查找算法',
            '最小值查找算法',
            '算法的效率分析',
            '边界条件处理'
        ],
        starter_code: `# 第12课：基本算法

# 累加：计算1+2+3+...+100
def sum_1_to_n(n):
    """计算1到n的和"""
    total = 0
    for i in range(1, n + 1):
        total += i
    return total

print(f"1到100的和：{sum_1_to_n(100)}")
print(f"1到1000的和：{sum_1_to_n(1000)}")

# 累乘：计算阶乘 n!
def factorial(n):
    """计算n的阶乘"""
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(f"5! = {factorial(5)}")
print(f"10! = {factorial(10)}")

# 查找最大值和最小值
def find_max_min(numbers):
    """找列表中的最大值和最小值"""
    if not numbers:
        return None, None

    max_val = numbers[0]
    min_val = numbers[0]

    for num in numbers[1:]:
        if num > max_val:
            max_val = num
        if num < min_val:
            min_val = num

    return max_val, min_val

scores = [85, 92, 78, 96, 88, 73, 95]
max_score, min_score = find_max_min(scores)
print(f"成绩列表：{scores}")
print(f"最高分：{max_score}")
print(f"最低分：{min_score}")

# 查找第二大值
def find_second_max(numbers):
    """找第二大值"""
    if len(numbers) < 2:
        return None
    sorted_nums = sorted(numbers, reverse=True)
    return sorted_nums[1]

print(f"第二高分：{find_second_max(scores)}")

# 计算平均值
def average(numbers):
    """计算平均值"""
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)

print(f"平均分：{average(scores):.1f}")
`,
        expected_output: '1到100的和：5050\n5! = 120',
        exercise: '编写程序：输入n个成绩，计算总分、平均分、最高分、最低分和及格率。',
        hints: [
            '累加器初始化为0，循环中 +=',
            '累乘器初始化为1，循环中 *=',
            '查找最值时，先假设第一个元素是最值',
            '注意处理空列表的情况',
            '第二大值可以先排序再取第二个'
        ],
        common_errors: [
            { type: 'IndexError', description: '空列表访问元素' },
            { type: 'TypeError', description: '累乘器初始化为0导致结果为0' },
            { type: 'ZeroDivisionError', description: '空列表求平均值时除以0' }
        ],
        difficulty: 3
    },
    {
        id: 13,
        module: 5,
        module_title: '模块五：算法与数据处理',
        lesson_number: 13,
        title: '数位分离与进制转换',
        description: '学习数字的数位分离和各种进制之间的转换。',
        knowledge_points: [
            '数位分离的方法',
            '字符串方法分离数位',
            '数学方法分离数位（%和//）',
            '十进制转二进制',
            '十进制转八进制、十六进制',
            '其他进制转十进制',
            '进制转换的原理'
        ],
        starter_code: `# 第13课：数位分离与进制转换

# 数位分离 - 字符串方法
def split_digits_string(n):
    """使用字符串分离各位数字"""
    digits = []
    for ch in str(n):
        digits.append(int(ch))
    return digits

num = 12345
print(f"{num}的各位数字：{split_digits_string(num)}")

# 数位分离 - 数学方法
def split_digits_math(n):
    """使用数学方法分离各位数字"""
    digits = []
    while n > 0:
        digits.append(n % 10)  # 取个位
        n = n // 10             # 去掉个位
    digits.reverse()            # 反转
    return digits

print(f"{num}的各位数字（数学法）：{split_digits_math(num)}")

# 数字反转
def reverse_number(n):
    """反转数字"""
    result = 0
    while n > 0:
        result = result * 10 + n % 10
        n = n // 10
    return result

print(f"{num}的反转：{reverse_number(num)}")

# 统计数字位数
def count_digits(n):
    """统计数字的位数"""
    count = 0
    while n > 0:
        count += 1
        n = n // 10
    return count

print(f"{num}是{count_digits(num)}位数")

# 进制转换
print("\\n进制转换：")
n = 255
print(f"十进制 {n}")
print(f"二进制: {bin(n)}")
print(f"八进制: {oct(n)}")
print(f"十六进制: {hex(n)}")

# 手动实现十进制转二进制
def to_binary(n):
    """手动将十进制转为二进制"""
    if n == 0:
        return "0"
    result = ""
    while n > 0:
        result = str(n % 2) + result
        n = n // 2
    return result

print(f"\\n手动转换：{n}的二进制是 {to_binary(n)}")

# 二进制转十进制
def binary_to_decimal(binary_str):
    """二进制转十进制"""
    decimal = 0
    for i, digit in enumerate(reversed(binary_str)):
        if digit == '1':
            decimal += 2 ** i
    return decimal

print(f"11111111的十进制是 {binary_to_decimal('11111111')}")

# 各位数字之和
def digit_sum(n):
    """计算各位数字之和"""
    total = 0
    while n > 0:
        total += n % 10
        n = n // 10
    return total

print(f"\\n{num}各位数字之和：{digit_sum(num)}")
`,
        expected_output: '12345的各位数字：[1, 2, 3, 4, 5]',
        exercise: '编写程序：输入一个正整数，判断是否为水仙花数（各位数字的立方和等于本身，如153=1³+5³+3³）。',
        hints: [
            '使用 % 10 获取个位数字',
            '使用 // 10 去掉个位',
            'bin()、oct()、hex() 可以快速转换进制',
            'int(字符串, 进制) 可以将其他进制转为十进制',
            '反转数字：result = result * 10 + n % 10'
        ],
        common_errors: [
            { type: 'ValueError', description: 'int()转换非数字字符串' },
            { type: 'TypeError', description: '对字符串使用数学运算符' },
            { type: 'IndexError', description: '字符串索引越界' }
        ],
        difficulty: 4
    },
    {
        id: 14,
        module: 5,
        module_title: '模块五：算法与数据处理',
        lesson_number: 14,
        title: '穷举法与简单排序',
        description: '学习穷举法的思想和简单的排序算法。',
        knowledge_points: [
            '穷举法的概念',
            '穷举法的应用场景',
            '冒泡排序算法',
            '选择排序算法',
            '插入排序简介',
            '排序算法的效率比较'
        ],
        starter_code: `# 第14课：穷举法与简单排序

# 穷举法：找100以内的质数
def find_primes(max_num):
    """使用穷举法找质数"""
    primes = []
    for n in range(2, max_num + 1):
        is_prime = True
        for i in range(2, int(n**0.5) + 1):
            if n % i == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(n)
    return primes

print("100以内的质数：")
print(find_primes(100))

# 穷举法：鸡兔同笼
print("\\n鸡兔同笼问题：")
# 鸡兔共35只，脚共94只
for chickens in range(36):
    rabbits = 35 - chickens
    if chickens * 2 + rabbits * 4 == 94:
        print(f"鸡{chickens}只，兔{rabbits}只")
        break

# 穷举法：百钱买百鸡
print("\\n百钱买百鸡：")
# 公鸡5元，母鸡3元，小鸡1元3只
for x in range(21):  # 公鸡最多20只
    for y in range(34):  # 母鸡最多33只
        z = 100 - x - y  # 小鸡数量
        if z >= 0 and z % 3 == 0 and 5*x + 3*y + z//3 == 100:
            print(f"公鸡{x}只，母鸡{y}只，小鸡{z}只")

# 冒泡排序
def bubble_sort(arr):
    """冒泡排序"""
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:  # 优化：如果没有交换说明已排序
            break
    return arr

nums = [64, 34, 25, 12, 22, 11, 90]
print(f"\\n冒泡排序：")
print(f"排序前：{nums}")
print(f"排序后：{bubble_sort(nums)}")

# 选择排序
def selection_sort(arr):
    """选择排序"""
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

nums2 = [64, 34, 25, 12, 22, 11, 90]
print(f"\\n选择排序：")
print(f"排序后：{selection_sort(nums2)}")
`,
        expected_output: '100以内的质数：[2, 3, 5, 7, 11, ...]',
        exercise: '使用穷举法解决：一个三位数，各位数字的立方和等于该数本身，找出所有这样的数（水仙花数）。',
        hints: [
            '穷举法就是列举所有可能，逐一验证',
            '冒泡排序：相邻元素比较，大的往后冒',
            '选择排序：每次找最小的放到前面',
            '排序可以用交换：a, b = b, a',
            '可以添加优化：如果一轮没有交换，说明已排好'
        ],
        common_errors: [
            { type: 'IndexError', description: '排序时数组索引越界' },
            { type: 'TypeError', description: '比较不同类型元素' },
            { type: 'NameError', description: '循环变量使用错误' }
        ],
        difficulty: 4
    },

    // ============================================================
    // 模块六：Python与三维可视化综合项目（3课时）
    // ============================================================
    {
        id: 15,
        module: 6,
        module_title: '模块六：Python与三维可视化综合项目',
        lesson_number: 15,
        title: 'Python三维建模入门——参数化几何体',
        description: '学习使用Python代码定义参数化几何体，并在3D场景中可视化展示。',
        knowledge_points: [
            '参数化建模的概念',
            '基本几何体的参数定义',
            '立方体的参数化',
            '球体的参数化',
            '圆柱体的参数化',
            '3D坐标系统',
            '颜色和材质参数'
        ],
        starter_code: `# 第15课：Python三维建模入门
# 定义参数化几何体，运行后点击"3D预览"查看效果

# 定义立方体参数
shape_type = "cube"
size = 2.0
color = "blue"
x = 0
y = 1
z = 0

print(f"创建{color}立方体")
print(f"尺寸: {size}")
print(f"位置: ({x}, {y}, {z})")

# 尝试修改参数，观察3D模型变化
# size = 3.0     # 改变大小
# color = "red"  # 改变颜色
# shape_type = "sphere"  # 改为球体
# shape_type = "cylinder"  # 改为圆柱体

# 参数化设计的好处：
# 1. 修改参数即可改变模型
# 2. 代码可重复使用
# 3. 便于批量生成不同变体
`,
        expected_output: '创建blue立方体\n尺寸: 2.0\n位置: (0, 1, 0)',
        exercise: '修改参数，分别创建：1) 红色球体（半径1.5）2) 绿色圆柱体（半径1，高度3）3) 黄色圆锥体（半径1.5，高度3）。观察3D效果。',
        hints: [
            '修改 shape_type 为 "sphere"、"cylinder"、"cone" 等可以改变几何体类型',
            'size 控制几何体大小',
            'color 控制颜色，可以是英文颜色名',
            'x, y, z 控制几何体在3D空间中的位置',
            '修改参数后重新点击"3D预览"按钮查看效果',
            '使用鼠标可以旋转、缩放3D模型'
        ],
        common_errors: [
            { type: 'NameError', description: '变量名拼写错误导致3D参数不识别' },
            { type: 'ValueError', description: '尺寸参数不是数字' },
            { type: 'TypeError', description: '颜色名称不正确' }
        ],
        three_d_demo: {
            type: 'cube',
            params: { size: 2, color: 'blue' },
            parameters: [
                { name: 'size', label: '尺寸', min: 0.5, max: 5, step: 0.1, default: 2 },
                { name: 'y', label: '高度位置', min: 0, max: 5, step: 0.1, default: 1 }
            ]
        },
        difficulty: 3
    },
    {
        id: 16,
        module: 6,
        module_title: '模块六：Python与三维可视化综合项目',
        lesson_number: 16,
        title: '用代码构建三维世界——组合体与变换',
        description: '学习使用Python代码构建组合体，理解3D变换（平移、旋转、缩放）。',
        knowledge_points: [
            '组合体的概念',
            '多个几何体的组合',
            '3D平移变换',
            '3D旋转变换',
            '3D缩放变换',
            '坐标系与变换矩阵',
            '参数化组合体设计'
        ],
        starter_code: `# 第16课：组合体与变换
# 构建一个简单的桌子模型

# 桌面参数
table_width = 4.0
table_depth = 2.0
table_thickness = 0.2
table_height = 1.5

# 桌腿参数
leg_size = 0.2
leg_height = table_height

# 输出桌子参数
print("=== 桌子参数 ===")
print(f"桌面: {table_width} x {table_depth} x {table_thickness}")
print(f"桌腿: {leg_size} x {leg_size} x {leg_height}")
print(f"桌子高度: {table_height}")

# 定义各部件位置
table_top = {
    "type": "box",
    "size": [table_width, table_thickness, table_depth],
    "position": [0, table_height, 0]
}

leg_positions = [
    [-table_width/2 + leg_size/2, 0, -table_depth/2 + leg_size/2],
    [table_width/2 - leg_size/2, 0, -table_depth/2 + leg_size/2],
    [-table_width/2 + leg_size/2, 0, table_depth/2 - leg_size/2],
    [table_width/2 - leg_size/2, 0, table_depth/2 - leg_size/2]
]

print("\\n=== 桌腿位置 ===")
for i, pos in enumerate(leg_positions):
    print(f"桌腿{i+1}: ({pos[0]:.1f}, {pos[1]:.1f}, {pos[2]:.1f})")

# 尝试修改参数：
# table_width = 6.0  # 更大的桌子
# table_height = 2.0  # 更高的桌子

# 参数化设计让我们可以：
# 1. 通过修改少量参数改变整个模型
# 2. 保持各部件的比例关系
# 3. 快速生成不同尺寸的家具
`,
        expected_output: '=== 桌子参数 ===\n桌面: 4.0 x 2.0 x 0.2',
        exercise: '设计一个参数化的书架：可以调节层数、宽度、高度。用代码定义所有部件的参数。',
        hints: [
            '组合体由多个基本几何体组成',
            '每个部件需要定义类型、尺寸和位置',
            '使用列表存储多个部件的信息',
            '修改参数后所有部件会自动更新',
            '注意各部件之间的位置关系',
            '可以通过循环生成重复的结构（如桌腿）'
        ],
        common_errors: [
            { type: 'NameError', description: '部件参数变量未定义' },
            { type: 'TypeError', description: '位置参数不是数字' },
            { type: 'IndexError', description: '列表索引越界' }
        ],
        three_d_demo: {
            type: 'building',
            params: { floors: 3, width: 4, floorHeight: 1.5 },
            parameters: [
                { name: 'floors', label: '层数', min: 1, max: 8, step: 1, default: 3 },
                { name: 'width', label: '宽度', min: 2, max: 8, step: 0.5, default: 4 },
                { name: 'floorHeight', label: '层高', min: 1, max: 3, step: 0.1, default: 1.5 }
            ]
        },
        difficulty: 4
    },
    {
        id: 17,
        module: 6,
        module_title: '模块六：Python与三维可视化综合项目',
        lesson_number: 17,
        title: '综合项目——我的参数化设计作品',
        description: '综合运用所学知识，完成一个参数化3D设计项目，类似FreeCAD课程中的笔筒或支架设计。',
        knowledge_points: [
            '参数化设计流程',
            '需求分析与参数定义',
            '组合体的参数化建模',
            '设计优化与迭代',
            '代码组织与注释',
            '项目展示与分享'
        ],
        starter_code: `# 第17课：综合项目——参数化笔筒设计
# 模仿FreeCAD课程中的笔筒设计

import math

# === 笔筒参数 ===
# 主体参数
outer_radius = 2.0       # 外半径
inner_radius = 1.8       # 内半径
height = 4.0             # 高度
wall_thickness = 0.2     # 壁厚
bottom_thickness = 0.2   # 底部厚度

# 装饰参数
has_pattern = True       # 是否有装饰图案
pattern_count = 8        # 装饰数量

# 颜色参数
main_color = "brown"     # 主体颜色
pattern_color = "gold"   # 装饰颜色

# === 计算派生参数 ===
volume_outer = math.pi * outer_radius**2 * height
volume_inner = math.pi * inner_radius**2 * (height - bottom_thickness)
material_volume = volume_outer - volume_inner

# === 输出设计信息 ===
print("=" * 40)
print("    参数化笔筒设计报告")
print("=" * 40)

print("\\n【基本参数】")
print(f"  外半径: {outer_radius}")
print(f"  内半径: {inner_radius}")
print(f"  高度: {height}")
print(f"  壁厚: {wall_thickness}")

print("\\n【装饰参数】")
print(f"  装饰数量: {pattern_count}")
print(f"  主体颜色: {main_color}")
print(f"  装饰颜色: {pattern_color}")

print("\\n【计算结果】")
print(f"  外体积: {volume_outer:.2f}")
print(f"  内体积: {volume_inner:.2f}")
print(f"  材料体积: {material_volume:.2f}")

print("\\n【3D模型参数】")
print(f"  shape_type: pen_holder")
print(f"  radius: {outer_radius}")
print(f"  height: {height}")
print(f"  color: {main_color}")

print("\\n" + "=" * 40)
print("  设计完成！点击'3D预览'查看效果")
print("=" * 40)

# === 尝试修改参数，观察变化 ===
# 1. 改变 outer_radius 和 height 看笔筒大小变化
# 2. 改变 pattern_count 看装饰变化
# 3. 改变颜色参数看外观变化

# === 扩展挑战 ===
# 1. 添加笔筒盖子参数
# 2. 设计不同形状的笔筒（方形、六边形）
# 3. 计算需要的材料成本
`,
        expected_output: '========================================\n    参数化笔筒设计报告\n========================================',
        exercise: '完成你自己的参数化设计作品：选择一个物品（笔筒、花瓶、支架等），用Python代码定义所有参数，生成3D模型。要求：至少5个可调参数，包含计算派生参数。',
        hints: [
            '先确定要设计的物品和需要哪些参数',
            '区分基本参数（用户输入）和派生参数（计算得出）',
            '使用数学公式计算体积、面积等',
            '为3D可视化模块输出正确的参数格式',
            '添加完整的注释说明每个参数的作用',
            '尝试不同的参数组合，确保设计合理',
            '可以参考FreeCAD课程中的设计思路'
        ],
        common_errors: [
            { type: 'NameError', description: '参数变量未定义就使用' },
            { type: 'TypeError', description: '参数类型不正确' },
            { type: 'ValueError', description: '数学计算参数不合法' },
            { type: 'AttributeError', description: 'math模块函数调用错误' }
        ],
        three_d_demo: {
            type: 'pen_holder',
            params: { radius: 2, height: 4, color: 'brown' },
            parameters: [
                { name: 'radius', label: '半径', min: 1, max: 4, step: 0.1, default: 2 },
                { name: 'height', label: '高度', min: 2, max: 8, step: 0.1, default: 4 }
            ]
        },
        difficulty: 5
    }
];

// ============================================================
// 模块信息汇总
// ============================================================
const MODULES_INFO = [
    {
        id: 1,
        title: '模块一：Python入门与计算思维',
        description: 'Python基础语法、变量、数据类型、输入输出',
        lessonCount: 2,
        lessonIds: [1, 2]
    },
    {
        id: 2,
        title: '模块二：程序控制结构',
        description: '条件判断、循环结构、break和continue',
        lessonCount: 3,
        lessonIds: [3, 4, 5]
    },
    {
        id: 3,
        title: '模块三：数据结构',
        description: '列表、字典、元组、集合的使用',
        lessonCount: 3,
        lessonIds: [6, 7, 8]
    },
    {
        id: 4,
        title: '模块四：函数与模块化',
        description: '函数定义、参数传递、内置函数、模块使用',
        lessonCount: 3,
        lessonIds: [9, 10, 11]
    },
    {
        id: 5,
        title: '模块五：算法与数据处理',
        description: '累加累乘、数位分离、进制转换、穷举法、排序',
        lessonCount: 3,
        lessonIds: [12, 13, 14]
    },
    {
        id: 6,
        title: '模块六：Python与三维可视化综合项目',
        description: '参数化建模、组合体设计、3D可视化综合应用',
        lessonCount: 3,
        lessonIds: [15, 16, 17]
    }
];

// ============================================================
// 辅助函数
// ============================================================

/**
 * 根据ID获取课时
 */
function getLessonById(id) {
    return LESSONS_DATA.find(lesson => lesson.id === id);
}

/**
 * 获取模块的所有课时
 */
function getLessonsByModule(moduleId) {
    return LESSONS_DATA.filter(lesson => lesson.module === moduleId);
}

/**
 * 获取模块信息
 */
function getModuleInfo(moduleId) {
    return MODULES_INFO.find(module => module.id === moduleId);
}

/**
 * 获取下一课时
 */
function getNextLesson(currentId) {
    const index = LESSONS_DATA.findIndex(lesson => lesson.id === currentId);
    if (index >= 0 && index < LESSONS_DATA.length - 1) {
        return LESSONS_DATA[index + 1];
    }
    return null;
}

/**
 * 获取上一课时
 */
function getPrevLesson(currentId) {
    const index = LESSONS_DATA.findIndex(lesson => lesson.id === currentId);
    if (index > 0) {
        return LESSONS_DATA[index - 1];
    }
    return null;
}

/**
 * 获取所有课时数量
 */
function getTotalLessons() {
    return LESSONS_DATA.length;
}

/**
 * 获取所有模块数量
 */
function getTotalModules() {
    return MODULES_INFO.length;
}

/**
 * 搜索课时
 */
function searchLessons(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return LESSONS_DATA.filter(lesson =>
        lesson.title.toLowerCase().includes(lowerKeyword) ||
        lesson.description.toLowerCase().includes(lowerKeyword) ||
        lesson.knowledge_points.some(kp => kp.toLowerCase().includes(lowerKeyword))
    );
}

// ============================================================
// 导出
// ============================================================
window.LESSONS_DATA = LESSONS_DATA;
window.MODULES_INFO = MODULES_INFO;
window.getLessonById = getLessonById;
window.getLessonsByModule = getLessonsByModule;
window.getModuleInfo = getModuleInfo;
window.getNextLesson = getNextLesson;
window.getPrevLesson = getPrevLesson;
window.getTotalLessons = getTotalLessons;
window.getTotalModules = getTotalModules;
window.searchLessons = searchLessons;
