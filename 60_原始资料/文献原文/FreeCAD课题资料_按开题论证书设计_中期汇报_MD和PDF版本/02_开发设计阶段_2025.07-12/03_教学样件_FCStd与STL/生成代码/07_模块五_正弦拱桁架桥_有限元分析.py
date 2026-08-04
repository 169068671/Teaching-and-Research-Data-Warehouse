# -*- coding: utf-8 -*-
# ============================================================
# 07_模块五_正弦拱桁架桥_有限元分析.py
# ============================================================
# 教学闭环：数学函数生成拱线 → 桁架结构建模 → STL打印 → FEM承重验证。
# FEM方法：FreeCAD FEM 工作台对象 + CalculiX B31 梁单元。
# 材料假设：课堂演示用各向同性 PLA，E=3000 MPa，泊松比=0.35。
# 载荷工况：桥面内侧 10 个节点合计施加 100 N 竖直向下载荷。
# ============================================================

import FreeCAD as App  # 导入 FreeCAD 核心模块。
import Part  # 导入 Part 几何模块。
import Mesh  # 导入 Mesh 导出模块。
import Fem  # 导入 FreeCAD FEM 网格模块。
import ObjectsFem  # 导入 FreeCAD FEM 标准对象工厂。
import math  # 导入数学模块，用于正弦拱线计算。
import os  # 导入路径模块。
import subprocess  # 导入子进程模块，用于调用 CalculiX。
import json  # 导入 JSON 模块，用于保存分析摘要。

bridge_length = 120.0  # 设置桥梁跨度为 120 mm。
bridge_width = 30.0  # 设置桥梁总宽度为 30 mm。
deck_thickness = 4.0  # 设置桥面板厚度为 4 mm。
station_count = 7  # 设置沿跨度方向的节点站位数量。
arch_end_height = 16.0  # 设置拱肋端部中心高度。
arch_rise = 26.0  # 设置正弦拱肋矢高。
main_member_radius = 2.0  # 设置主体桁架杆件半径。
cross_member_radius = 1.6  # 设置横向联系杆半径。
main_equivalent_square = math.sqrt(math.pi) * main_member_radius  # 计算与主体圆杆面积相等的方形梁边长。
cross_equivalent_square = math.sqrt(math.pi) * cross_member_radius  # 计算与横向圆杆面积相等的方形梁边长。
pla_elastic_modulus = 3000.0  # 设置 PLA 弹性模量为 3000 MPa。
pla_poisson_ratio = 0.35  # 设置 PLA 泊松比为 0.35。
total_load = 100.0  # 设置桥面总竖向载荷为 100 N。

def beam_between(point_a, point_b, radius_value):  # 定义在两个点之间创建圆杆的函数。
    direction = point_b.sub(point_a)  # 计算从起点到终点的方向向量。
    length_value = direction.Length  # 计算杆件长度。
    if length_value <= 0.001:  # 判断杆件长度是否异常。
        raise RuntimeError("检测到零长度桥梁杆件。")  # 零长度时停止运行。
    return Part.makeCylinder(radius_value, length_value, point_a, direction)  # 沿方向向量创建圆柱杆件。

old_doc = App.getDocument("Module5_SineArchBridge") if "Module5_SineArchBridge" in App.listDocuments() else None  # 查找旧桥梁文档。
if old_doc is not None:  # 判断旧文档是否存在。
    App.closeDocument(old_doc.Name)  # 关闭旧桥梁文档。
doc = App.newDocument("Module5_SineArchBridge")  # 创建桥梁文档。
doc.Label = "07_模块五_正弦拱桁架桥_有限元分析"  # 设置中文文档标题。

station_x_values = []  # 创建站位 X 坐标列表。
for station_index in range(station_count):  # 循环生成 7 个等距站位。
    station_x = bridge_length * station_index / (station_count - 1)  # 计算当前站位 X 坐标。
    station_x_values.append(station_x)  # 保存当前站位 X 坐标。

bottom_points = {0: [], 1: []}  # 创建两侧桥面弦杆节点字典。
top_points = {0: [], 1: []}  # 创建两侧正弦拱肋节点字典。
side_y_values = [2.0, bridge_width - 2.0]  # 设置左右两侧桁架的 Y 坐标。
for side_index in range(2):  # 循环生成左右两侧节点。
    side_y = side_y_values[side_index]  # 读取当前侧的 Y 坐标。
    for station_index, station_x in enumerate(station_x_values):  # 循环当前侧的全部站位。
        normalized_x = station_x / bridge_length  # 将 X 坐标归一化到 0 到 1。
        arch_z = arch_end_height + arch_rise * math.sin(math.pi * normalized_x)  # 用正弦函数计算拱肋高度。
        bottom_points[side_index].append(App.Vector(station_x, side_y, deck_thickness))  # 保存桥面弦杆节点。
        top_points[side_index].append(App.Vector(station_x, side_y, arch_z))  # 保存正弦拱肋节点。

visual_members = []  # 创建可打印杆件形状列表。
for side_index in range(2):  # 循环处理左右两侧桁架。
    for station_index in range(station_count - 1):  # 循环生成相邻站位之间的杆件。
        visual_members.append(beam_between(bottom_points[side_index][station_index], bottom_points[side_index][station_index + 1], main_member_radius))  # 添加下弦杆。
        visual_members.append(beam_between(top_points[side_index][station_index], top_points[side_index][station_index + 1], main_member_radius))  # 添加正弦拱肋段。
        visual_members.append(beam_between(bottom_points[side_index][station_index], top_points[side_index][station_index + 1], cross_member_radius))  # 添加第一方向斜腹杆。
        visual_members.append(beam_between(bottom_points[side_index][station_index + 1], top_points[side_index][station_index], cross_member_radius))  # 添加第二方向斜腹杆。
    for station_index in range(station_count):  # 循环生成竖腹杆。
        visual_members.append(beam_between(bottom_points[side_index][station_index], top_points[side_index][station_index], cross_member_radius))  # 添加当前竖腹杆。

for station_index in range(station_count):  # 循环生成横向联系杆。
    visual_members.append(beam_between(bottom_points[0][station_index], bottom_points[1][station_index], cross_member_radius))  # 添加桥面横梁。
    visual_members.append(beam_between(top_points[0][station_index], top_points[1][station_index], cross_member_radius))  # 添加拱顶横向联系杆。

for station_index in range(station_count - 1):  # 循环生成桥面平面交叉支撑。
    visual_members.append(beam_between(bottom_points[0][station_index], bottom_points[1][station_index + 1], 1.2))  # 添加第一方向桥面斜撑。
    visual_members.append(beam_between(bottom_points[1][station_index], bottom_points[0][station_index + 1], 1.2))  # 添加第二方向桥面斜撑。

deck_shape = Part.makeBox(bridge_length, bridge_width, deck_thickness, App.Vector(0.0, 0.0, 0.0))  # 创建桥面板。
left_foot = Part.makeBox(8.0, bridge_width, 6.0, App.Vector(0.0, 0.0, -6.0))  # 创建左侧支承脚。
right_foot = Part.makeBox(8.0, bridge_width, 6.0, App.Vector(bridge_length - 8.0, 0.0, -6.0))  # 创建右侧支承脚。
bridge_shape = deck_shape.fuse(left_foot).fuse(right_foot)  # 合并桥面板与两端支承脚。
for member_shape in visual_members:  # 循环处理全部杆件。
    bridge_shape = bridge_shape.fuse(member_shape)  # 将当前杆件与桥梁主体合并。
bridge_shape = bridge_shape.removeSplitter()  # 清理布尔合并产生的多余分割边。

if not bridge_shape.isValid():  # 检查桥梁几何是否有效。
    raise RuntimeError("桥梁可打印几何无效。")  # 无效时停止运行。
if len(bridge_shape.Solids) != 1:  # 检查桥梁是否为单一连续实体。
    raise RuntimeError("桥梁打印模型必须为单一实体。")  # 多实体时停止运行。

parameter_object = doc.addObject("App::FeaturePython", "BridgeParameters")  # 创建桥梁参数对象。
parameter_object.Label = "正弦拱桥参数"  # 设置参数对象标题。
parameter_object.addProperty("App::PropertyLength", "跨度", "几何").跨度 = bridge_length  # 保存桥梁跨度。
parameter_object.addProperty("App::PropertyLength", "宽度", "几何").宽度 = bridge_width  # 保存桥梁宽度。
parameter_object.addProperty("App::PropertyLength", "拱肋矢高", "几何").拱肋矢高 = arch_rise  # 保存拱肋矢高。
parameter_object.addProperty("App::PropertyString", "拱线函数", "数学").拱线函数 = "z = 16 + 26 × sin(πx/120)"  # 保存正弦拱线表达式。
parameter_object.addProperty("App::PropertyForce", "总载荷", "FEM").总载荷 = total_load  # 保存 FEM 总载荷。

bridge_object = doc.addObject("Part::Feature", "PrintableBridge")  # 创建桥梁打印对象。
bridge_object.Label = "正弦拱桁架桥（单一打印实体）"  # 设置桥梁对象标题。
bridge_object.Shape = bridge_shape  # 赋予最终桥梁几何。
bridge_object.addProperty("App::PropertyString", "STEM闭环", "课程").STEM闭环 = "函数建模 → 结构设计 → 有限元分析 → 切片打印 → 承重对比"  # 写入课程闭环。
bridge_object.addProperty("App::PropertyString", "打印建议", "课程").打印建议 = "桥面平放；层高0.16mm；填充25%；树状支撑仅用于拱肋下方"  # 写入打印建议。
bridge_object.ViewObject.ShapeColor = (0.83, 0.32, 0.16)  # 设置桥梁橙红色外观。
parameter_object.ViewObject.Visibility = False  # 隐藏无几何参数对象。

fem_nodes = {}  # 创建 FEM 节点坐标字典。
node_lookup = {}  # 创建按侧别、层别、站位查询节点编号的字典。
next_node_id = 1  # 初始化 FEM 节点编号。
for side_index in range(2):  # 循环两侧桁架。
    for level_name, point_collection in (("bottom", bottom_points), ("top", top_points)):  # 循环下弦和上弦两层节点。
        for station_index in range(station_count):  # 循环全部站位。
            point_value = point_collection[side_index][station_index]  # 读取当前节点坐标。
            fem_nodes[next_node_id] = point_value  # 保存节点编号与坐标。
            node_lookup[(side_index, level_name, station_index)] = next_node_id  # 保存组合索引到节点编号的映射。
            next_node_id += 1  # 节点编号递增。

side_elements = []  # 创建侧向桁架梁单元列表。
cross_elements = []  # 创建横向联系梁单元列表。
for side_index in range(2):  # 循环两侧桁架。
    for station_index in range(station_count - 1):  # 循环相邻站位。
        side_elements.append((node_lookup[(side_index, "bottom", station_index)], node_lookup[(side_index, "bottom", station_index + 1)]))  # 添加下弦梁单元。
        side_elements.append((node_lookup[(side_index, "top", station_index)], node_lookup[(side_index, "top", station_index + 1)]))  # 添加上弦梁单元。
        side_elements.append((node_lookup[(side_index, "bottom", station_index)], node_lookup[(side_index, "top", station_index + 1)]))  # 添加第一方向斜腹杆单元。
        side_elements.append((node_lookup[(side_index, "bottom", station_index + 1)], node_lookup[(side_index, "top", station_index)]))  # 添加第二方向斜腹杆单元。
    for station_index in range(station_count):  # 循环添加竖腹杆单元。
        side_elements.append((node_lookup[(side_index, "bottom", station_index)], node_lookup[(side_index, "top", station_index)]))  # 添加竖腹杆单元。

for station_index in range(station_count):  # 循环添加横向联系单元。
    cross_elements.append((node_lookup[(0, "bottom", station_index)], node_lookup[(1, "bottom", station_index)]))  # 添加桥面横梁单元。
    cross_elements.append((node_lookup[(0, "top", station_index)], node_lookup[(1, "top", station_index)]))  # 添加拱顶横梁单元。
for station_index in range(station_count - 1):  # 循环添加桥面交叉支撑单元。
    cross_elements.append((node_lookup[(0, "bottom", station_index)], node_lookup[(1, "bottom", station_index + 1)]))  # 添加第一方向桥面斜撑单元。
    cross_elements.append((node_lookup[(1, "bottom", station_index)], node_lookup[(0, "bottom", station_index + 1)]))  # 添加第二方向桥面斜撑单元。

fem_mesh = Fem.FemMesh()  # 创建 FreeCAD FEM 边线网格。
for node_id, point_value in fem_nodes.items():  # 循环添加全部 FEM 节点。
    fem_mesh.addNode(point_value.x, point_value.y, point_value.z, node_id)  # 将当前节点写入 FEM 网格。
next_element_id = 1  # 初始化 FEM 单元编号。
for node_a, node_b in side_elements + cross_elements:  # 循环添加全部梁单元。
    fem_mesh.addEdge([node_a, node_b], next_element_id)  # 将当前二节点梁单元写入 FEM 网格。
    next_element_id += 1  # 单元编号递增。

analysis = ObjectsFem.makeAnalysis(doc, "Analysis")  # 使用 FreeCAD FEM 工厂创建标准分析容器。
analysis.Label = "桥梁静力有限元分析（CalculiX）"  # 设置分析容器标题。
solver = ObjectsFem.makeSolverCalculiXCcxTools(doc, "SolverCalculiX")  # 创建 FreeCAD 标准 CalculiX 求解器对象。
solver.Label = "CalculiX 静力求解器"  # 设置求解器对象标题。
analysis.addObject(solver)  # 将求解器加入分析容器。

material = ObjectsFem.makeMaterialSolid(doc, "MaterialPLA")  # 创建 FreeCAD 标准固体材料对象。
material.Label = "PLA教学材料（各向同性近似）"  # 设置材料对象标题。
material_map = {}  # 创建材料属性字典。
material_map["Name"] = "PLA_Educational"  # 设置材料名称。
material_map["CardName"] = "PLA_Educational"  # 设置材料卡名称。
material_map["StandardCode"] = "Classroom assumption"  # 标记为课堂假设参数。
material_map["YoungsModulus"] = "3000 MPa"  # 设置弹性模量。
material_map["PoissonRatio"] = "0.35"  # 设置泊松比。
material_map["Density"] = "1.24 g/cm^3"  # 设置材料密度。
material.Material = material_map  # 把材料属性写入 FreeCAD 材料对象。
analysis.addObject(material)  # 将材料对象加入分析容器。

fixed_constraint = ObjectsFem.makeConstraintFixed(doc, "ConstraintFixed")  # 创建 FreeCAD 标准固定约束对象。
fixed_constraint.Label = "左端固定支座（FEM节点1、8）"  # 设置固定约束标题。
fixed_constraint.addProperty("App::PropertyString", "节点集", "FEM说明").节点集 = "左端两侧下弦节点；自由度1-6固定"  # 写入节点约束说明。
analysis.addObject(fixed_constraint)  # 将固定约束加入分析容器。

force_constraint = ObjectsFem.makeConstraintForce(doc, "ConstraintForce")  # 创建 FreeCAD 标准力约束对象。
force_constraint.Label = "桥面均布等效载荷（合计100N）"  # 设置力约束标题。
force_constraint.Force = total_load  # 设置力对象总载荷。
force_constraint.addProperty("App::PropertyString", "加载节点", "FEM说明").加载节点 = "两侧下弦内侧10节点，每节点-10N，Z方向"  # 写入加载节点说明。
analysis.addObject(force_constraint)  # 将力约束加入分析容器。

mesh_object = doc.addObject("Fem::FemMeshObject", "BeamMesh")  # 创建 FreeCAD 标准 FEM 网格对象。
mesh_object.Label = "B31梁单元网格（28节点）"  # 设置网格对象标题。
mesh_object.FemMesh = fem_mesh  # 将边线网格赋给网格对象。
analysis.addObject(mesh_object)  # 将网格对象加入分析容器。
if hasattr(mesh_object.ViewObject, "LineColor"):  # 判断当前 FreeCAD 版本是否提供网格线颜色属性。
    mesh_object.ViewObject.LineColor = (0.10, 0.30, 0.95)  # 设置 FEM 网格蓝色显示。
if hasattr(mesh_object.ViewObject, "PointColor"):  # 判断当前 FreeCAD 版本是否提供节点颜色属性。
    mesh_object.ViewObject.PointColor = (0.95, 0.10, 0.10)  # 设置 FEM 节点红色显示。
if hasattr(mesh_object.ViewObject, "PointSize"):  # 判断当前 FreeCAD 版本是否提供节点大小属性。
    mesh_object.ViewObject.PointSize = 5.0  # 设置 FEM 节点显示大小。
mesh_object.ViewObject.Visibility = False  # 默认隐藏 FEM 网格，先显示实体桥梁。

output_dir = os.path.dirname(os.path.abspath(__file__))  # 获取脚本所在目录。
model_dir = os.path.normpath(os.path.join(output_dir, ".."))  # 获取教学样件目录。
analysis_dir = os.path.join(model_dir, "桥梁有限元分析")  # 生成 FEM 结果归档目录。
os.makedirs(analysis_dir, exist_ok=True)  # 创建 FEM 结果目录。
job_name = "bridge_b31_100N_v2"  # 设置 CalculiX 作业名称，并保留首版失败结果用于教学对比。
inp_path = os.path.join(analysis_dir, job_name + ".inp")  # 生成 CalculiX 输入文件路径。

inp_lines = []  # 创建 CalculiX 输入文件行列表。
inp_lines.append("*HEADING")  # 写入标题关键字。
inp_lines.append("Module 5 sine-arch truss bridge, PLA, total load 100 N")  # 写入作业说明。
inp_lines.append("*NODE, NSET=NALL")  # 开始节点定义。
for node_id, point_value in fem_nodes.items():  # 循环写入全部节点。
    inp_lines.append("%d, %.6f, %.6f, %.6f" % (node_id, point_value.x, point_value.y, point_value.z))  # 写入当前节点编号和坐标。
inp_lines.append("*ELEMENT, TYPE=B31, ELSET=SIDE_MEMBERS")  # 开始侧向杆件单元定义。
element_id = 1  # 重置单元编号用于写入 INP。
for node_a, node_b in side_elements:  # 循环写入侧向杆件单元。
    inp_lines.append("%d, %d, %d" % (element_id, node_a, node_b))  # 写入当前侧向梁单元。
    element_id += 1  # 单元编号递增。
inp_lines.append("*ELEMENT, TYPE=B31, ELSET=CROSS_MEMBERS")  # 开始横向联系单元定义。
for node_a, node_b in cross_elements:  # 循环写入横向联系单元。
    inp_lines.append("%d, %d, %d" % (element_id, node_a, node_b))  # 写入当前横向梁单元。
    element_id += 1  # 单元编号递增。
inp_lines.append("*MATERIAL, NAME=PLA")  # 开始 PLA 材料定义。
inp_lines.append("*ELASTIC")  # 写入线弹性材料关键字。
inp_lines.append("%.1f, %.2f" % (pla_elastic_modulus, pla_poisson_ratio))  # 写入弹性模量和泊松比。
inp_lines.append("*BEAM SECTION, ELSET=SIDE_MEMBERS, MATERIAL=PLA, SECTION=RECT")  # 定义侧向等面积方形梁截面，兼容线性B31单元。
inp_lines.append("%.3f, %.3f" % (main_equivalent_square, main_equivalent_square))  # 写入侧向等面积方形截面尺寸。
inp_lines.append("0.0, 1.0, 0.0")  # 设置侧向梁截面方向向量。
inp_lines.append("*BEAM SECTION, ELSET=CROSS_MEMBERS, MATERIAL=PLA, SECTION=RECT")  # 定义横向等面积方形梁截面，兼容线性B31单元。
inp_lines.append("%.3f, %.3f" % (cross_equivalent_square, cross_equivalent_square))  # 写入横向等面积方形截面尺寸。
inp_lines.append("0.0, 0.0, 1.0")  # 设置横向梁截面方向向量。
inp_lines.append("*STEP, INC=100")  # 开始线性静力加载步。
inp_lines.append("*STATIC")  # 指定静力分析。
inp_lines.append("0.1, 1.0")  # 设置初始增量和总步长。
inp_lines.append("*BOUNDARY")  # 开始边界条件定义。
left_node_a = node_lookup[(0, "bottom", 0)]  # 读取左端第一侧支座节点编号。
left_node_b = node_lookup[(1, "bottom", 0)]  # 读取左端第二侧支座节点编号。
right_node_a = node_lookup[(0, "bottom", station_count - 1)]  # 读取右端第一侧支座节点编号。
right_node_b = node_lookup[(1, "bottom", station_count - 1)]  # 读取右端第二侧支座节点编号。
inp_lines.append("%d, 1, 6, 0.0" % left_node_a)  # 固定左端第一侧节点全部自由度。
inp_lines.append("%d, 1, 6, 0.0" % left_node_b)  # 固定左端第二侧节点全部自由度。
inp_lines.append("%d, 2, 6, 0.0" % right_node_a)  # 固定右端第一侧节点除 X 平移外的自由度。
inp_lines.append("%d, 2, 6, 0.0" % right_node_b)  # 固定右端第二侧节点除 X 平移外的自由度。
inp_lines.append("*CLOAD")  # 开始集中力定义。
load_node_ids = []  # 创建加载节点列表。
for side_index in range(2):  # 循环两侧桥面。
    for station_index in range(1, station_count - 1):  # 循环内侧 5 个站位。
        load_node_id = node_lookup[(side_index, "bottom", station_index)]  # 读取当前加载节点编号。
        load_node_ids.append(load_node_id)  # 保存加载节点编号。
        inp_lines.append("%d, 3, %.6f" % (load_node_id, -total_load / 10.0))  # 在当前节点施加 Z 向下分力。
inp_lines.append("*NODE FILE, OUTPUT=3D")  # 设置节点结果输出。
inp_lines.append("U")  # 请求输出位移。
inp_lines.append("*EL FILE")  # 设置单元结果输出。
inp_lines.append("S, E")  # 请求输出应力和应变。
inp_lines.append("*NODE PRINT, NSET=NALL")  # 设置文本节点结果输出。
inp_lines.append("U")  # 请求文本位移。
inp_lines.append("*END STEP")  # 结束静力分析步。

with open(inp_path, "w", encoding="utf-8") as inp_file:  # 以 UTF-8 打开 CalculiX 输入文件。
    inp_file.write("\n".join(inp_lines) + "\n")  # 写入完整 INP 内容。

ccx_candidates = ["/Users/wangzirui/Applications/FreeCAD.app/Contents/Resources/bin/ccx", "/Applications/FreeCAD.app/Contents/Resources/bin/ccx"]  # 定义 CalculiX 候选路径。
ccx_path = next((candidate for candidate in ccx_candidates if os.path.exists(candidate)), None)  # 选择第一个存在的 CalculiX。
if ccx_path is None:  # 判断是否找到 CalculiX。
    raise RuntimeError("未找到 FreeCAD 自带的 CalculiX 求解器。")  # 未找到时停止运行。

solver_process = subprocess.run([ccx_path, "-i", job_name], cwd=analysis_dir, capture_output=True, text=True, timeout=120)  # 执行 CalculiX 静力求解。
stdout_path = os.path.join(analysis_dir, job_name + "_stdout.log")  # 按版本生成独立求解器日志路径，避免覆盖旧结果。
with open(stdout_path, "w", encoding="utf-8") as stdout_file:  # 打开求解器日志文件。
    stdout_file.write(solver_process.stdout)  # 写入标准输出。
    stdout_file.write("\n--- STDERR ---\n")  # 写入标准错误分隔标题。
    stdout_file.write(solver_process.stderr)  # 写入标准错误。
    stdout_file.write("\nCCX_EXIT_CODE=%d\n" % solver_process.returncode)  # 写入求解器退出码。

frd_path = os.path.join(analysis_dir, job_name + ".frd")  # 生成 FRD 结果文件路径。
sta_path = os.path.join(analysis_dir, job_name + ".sta")  # 生成 STA 收敛文件路径。
if solver_process.returncode != 0:  # 检查 CalculiX 退出码。
    raise RuntimeError("CalculiX 求解失败，退出码为 %d。" % solver_process.returncode)  # 非零退出码时停止运行。
if not os.path.exists(frd_path):  # 检查 FRD 结果文件是否存在。
    raise RuntimeError("CalculiX 未生成 FRD 结果文件。")  # 未生成结果时停止运行。

from feminout import importCcxFrdResults  # 导入 FreeCAD CalculiX 结果读取器。
importCcxFrdResults.importFrd(frd_path, analysis, "Bridge_")  # 把 FRD 结果作为标准 FEM 结果对象导入当前文档。
doc.recompute()  # 重新计算文档以更新结果对象。

result_objects = [item for item in doc.Objects if hasattr(item, "DisplacementLengths") and len(item.DisplacementLengths) > 0]  # 筛选含位移数据的结果对象。
if not result_objects:  # 检查是否找到有效结果对象。
    raise RuntimeError("FRD 已生成，但 FreeCAD 未读到位移结果。")  # 未读到结果时停止运行。
final_result = result_objects[-1]  # 选取最后一个加载步结果。
max_displacement = max(final_result.DisplacementLengths)  # 计算最大位移。
max_von_mises = max(final_result.vonMises) if len(final_result.vonMises) > 0 else 0.0  # 计算最大等效应力。

status_text = ""  # 初始化 STA 文件文本。
if os.path.exists(sta_path):  # 判断 STA 文件是否存在。
    with open(sta_path, "r", encoding="utf-8", errors="ignore") as sta_file:  # 打开 STA 收敛文件。
        status_text = sta_file.read()  # 读取收敛状态文本。
unconverged_marker = " U " in status_text  # 检查是否存在未收敛增量标记。
solver_ok = solver_process.returncode == 0 and not unconverged_marker  # 综合判断求解是否收敛。

summary_object = doc.addObject("App::FeaturePython", "FEMSummary")  # 创建 FEM 结果摘要对象。
summary_object.Label = "FEM结果摘要（100N静力）"  # 设置摘要对象标题。
summary_object.addProperty("App::PropertyBool", "求解收敛", "结果").求解收敛 = solver_ok  # 保存收敛结论。
summary_object.addProperty("App::PropertyLength", "最大位移", "结果").最大位移 = max_displacement  # 保存最大位移。
summary_object.addProperty("App::PropertyPressure", "最大等效应力", "结果").最大等效应力 = max_von_mises  # 保存最大等效应力。
summary_object.addProperty("App::PropertyForce", "总载荷", "工况").总载荷 = total_load  # 保存总载荷。
summary_object.addProperty("App::PropertyString", "支座模型", "工况").支座模型 = "左端固定；右端滚动（释放X平移）"  # 保存支座模型说明。
summary_object.addProperty("App::PropertyString", "材料假设", "工况").材料假设 = "各向同性PLA：E=3000MPa，ν=0.35"  # 保存材料假设说明。
summary_object.addProperty("App::PropertyString", "结果目录", "文件").结果目录 = analysis_dir  # 保存结果目录。

summary_data = {  # 创建 JSON 摘要数据。
    "job": job_name,  # 保存作业名称。
    "solver": "CalculiX",  # 保存求解器名称。
    "exit_code": solver_process.returncode,  # 保存退出码。
    "converged": solver_ok,  # 保存收敛状态。
    "node_count": len(fem_nodes),  # 保存节点数量。
    "element_count": len(side_elements) + len(cross_elements),  # 保存梁单元数量。
    "total_load_N": total_load,  # 保存总载荷。
    "max_displacement_mm": max_displacement,  # 保存最大位移。
    "max_von_mises_MPa": max_von_mises,  # 保存最大等效应力。
    "material_assumption": {"name": "PLA", "E_MPa": pla_elastic_modulus, "nu": pla_poisson_ratio},  # 保存材料假设。
    "support_model": "left fixed; right roller in X",  # 保存支座模型。
}  # 结束 JSON 摘要数据。
summary_path = os.path.join(analysis_dir, "FEM结果摘要.json")  # 生成 JSON 摘要路径。
with open(summary_path, "w", encoding="utf-8") as summary_file:  # 打开 JSON 摘要文件。
    json.dump(summary_data, summary_file, ensure_ascii=False, indent=2)  # 写入格式化 JSON。

fcstd_path = os.path.join(model_dir, "07_模块五_正弦拱桁架桥_有限元分析.FCStd")  # 生成桥梁 FCStd 路径。
stl_path = os.path.join(model_dir, "07_模块五_正弦拱桁架桥_有限元分析.stl")  # 生成桥梁 STL 路径。
bridge_object.ViewObject.Visibility = True  # 保证保存时显示实体桥梁。
mesh_object.ViewObject.Visibility = False  # 隐藏 FEM 网格以免遮挡实体桥梁。
for result_object in result_objects:  # 循环处理全部结果对象。
    result_object.ViewObject.Visibility = False  # 默认隐藏结果对象，用户可在 FEM 工作台中打开。
doc.recompute()  # 重新计算文档。
doc.saveAs(fcstd_path)  # 保存包含几何、FEM对象和结果的 FreeCAD 文件。
Mesh.export([bridge_object], stl_path)  # 导出单一实体桥梁 STL。

print("正弦拱桁架桥与有限元分析生成完成。")  # 输出完成提示。
print("CalculiX退出码：", solver_process.returncode)  # 输出 CalculiX 退出码。
print("收敛：", solver_ok)  # 输出收敛状态。
print("节点/单元：%d / %d" % (len(fem_nodes), len(side_elements) + len(cross_elements)))  # 输出 FEM 规模。
print("最大位移：%.6f mm" % max_displacement)  # 输出最大位移。
print("最大等效应力：%.6f MPa" % max_von_mises)  # 输出最大等效应力。
