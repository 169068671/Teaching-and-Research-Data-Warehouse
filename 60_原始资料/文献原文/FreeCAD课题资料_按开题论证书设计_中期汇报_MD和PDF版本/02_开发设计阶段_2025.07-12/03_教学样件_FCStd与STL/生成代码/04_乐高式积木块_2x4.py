# -*- coding: utf-8 -*-
# ============================================================
# 04_乐高式积木块_2x4.py — 实践作业3：标准积木结构（模块三）
# ============================================================
# 结构：2×4 顶部凸点 + 中空底部 + 3 根底部加强管。
# 教学重点：双重循环、列表、函数、阵列、布尔并与布尔差。
# 说明：这是兼容式教学积木，不使用商业商标作为作品名称。
# ============================================================

import FreeCAD as App  # 导入 FreeCAD 核心模块。
import Part  # 导入 Part 几何模块。
import Mesh  # 导入 Mesh 导出模块。
import os  # 导入路径模块。

pitch = 8.0  # 设置积木单位间距为 8 mm。
column_count = 4  # 设置长度方向凸点数量为 4。
row_count = 2  # 设置宽度方向凸点数量为 2。
brick_length = column_count * pitch - 0.2  # 计算积木长度并预留装配间隙。
brick_width = row_count * pitch - 0.2  # 计算积木宽度并预留装配间隙。
brick_height = 9.6  # 设置积木主体高度。
stud_radius = 2.45  # 设置顶部凸点半径。
stud_height = 1.8  # 设置顶部凸点高度。
wall_thickness = 1.2  # 设置侧壁厚度。
roof_thickness = 1.6  # 设置顶部板厚度。
tube_outer_radius = 3.25  # 设置底部加强管外半径。
tube_inner_radius = 2.40  # 设置底部加强管内半径。

old_doc = App.getDocument("LegoBrick") if "LegoBrick" in App.listDocuments() else None  # 查找旧积木文档。
if old_doc is not None:  # 判断旧文档是否存在。
    App.closeDocument(old_doc.Name)  # 关闭旧文档。
doc = App.newDocument("LegoBrick")  # 创建积木文档。
doc.Label = "04_2x4兼容式积木块"  # 设置中文文档标题。

outer_box = Part.makeBox(brick_length, brick_width, brick_height, App.Vector(0.0, 0.0, 0.0))  # 创建完整外壳。
inner_length = brick_length - 2.0 * wall_thickness  # 计算底部空腔长度。
inner_width = brick_width - 2.0 * wall_thickness  # 计算底部空腔宽度。
inner_height = brick_height - roof_thickness + 0.2  # 计算底部空腔高度并略微穿入顶板。
inner_box = Part.makeBox(inner_length, inner_width, inner_height, App.Vector(wall_thickness, wall_thickness, -0.1))  # 创建底部空腔切削体。
brick_shape = outer_box.cut(inner_box)  # 切出中空底部并保留侧壁和顶板。

stud_objects = []  # 创建凸点形状列表。
for column_index in range(column_count):  # 循环 4 个长度方向位置。
    for row_index in range(row_count):  # 循环 2 个宽度方向位置。
        center_x = pitch / 2.0 + column_index * pitch - 0.1  # 计算当前凸点 X 坐标。
        center_y = pitch / 2.0 + row_index * pitch - 0.1  # 计算当前凸点 Y 坐标。
        stud = Part.makeCylinder(stud_radius, stud_height, App.Vector(center_x, center_y, brick_height))  # 创建当前顶部凸点。
        stud_objects.append(stud)  # 把当前凸点加入列表。
        brick_shape = brick_shape.fuse(stud)  # 把当前凸点与积木主体合并。

tube_objects = []  # 创建底部加强管列表。
for tube_index in range(column_count - 1):  # 循环生成 3 根位于凸点列之间的加强管。
    center_x = pitch + tube_index * pitch - 0.1  # 计算加强管 X 坐标。
    center_y = brick_width / 2.0  # 计算加强管 Y 坐标。
    tube_outer = Part.makeCylinder(tube_outer_radius, brick_height - roof_thickness + 0.1, App.Vector(center_x, center_y, 0.0))  # 创建加强管外圆柱。
    tube_inner = Part.makeCylinder(tube_inner_radius, brick_height - roof_thickness + 0.3, App.Vector(center_x, center_y, -0.1))  # 创建加强管内孔切削体。
    tube = tube_outer.cut(tube_inner)  # 得到底部空心加强管。
    tube_objects.append(tube)  # 把加强管加入列表。
    brick_shape = brick_shape.fuse(tube)  # 把加强管与积木顶板合并。

brick_shape = brick_shape.removeSplitter()  # 清理布尔运算产生的多余分割边。
if not brick_shape.isValid():  # 检查积木几何有效性。
    raise RuntimeError("积木几何无效，请检查空腔或加强管参数。")  # 无效时停止运行。
if len(brick_shape.Solids) != 1:  # 检查积木是否为单一实体。
    raise RuntimeError("积木必须保持为单一可打印实体。")  # 多实体时停止运行。

parameters = doc.addObject("App::FeaturePython", "LoopParameters")  # 创建循环参数对象。
parameters.Label = "循环与标准尺寸参数"  # 设置参数对象标题。
parameters.addProperty("App::PropertyInteger", "列数", "循环").列数 = column_count  # 保存列数。
parameters.addProperty("App::PropertyInteger", "行数", "循环").行数 = row_count  # 保存行数。
parameters.addProperty("App::PropertyLength", "间距", "循环").间距 = pitch  # 保存阵列间距。
parameters.addProperty("App::PropertyInteger", "凸点总数", "循环").凸点总数 = len(stud_objects)  # 保存凸点总数。
parameters.addProperty("App::PropertyInteger", "加强管总数", "循环").加强管总数 = len(tube_objects)  # 保存加强管总数。

brick_object = doc.addObject("Part::Feature", "Brick_2x4")  # 创建积木最终对象。
brick_object.Label = "2×4兼容式积木（含底部结构）"  # 设置最终对象标签。
brick_object.Shape = brick_shape  # 赋予最终几何。
brick_object.addProperty("App::PropertyString", "循环逻辑", "课程").循环逻辑 = "2×4 双重循环生成 8 个凸点；单循环生成 3 根加强管"  # 写入循环逻辑。
brick_object.addProperty("App::PropertyString", "打印建议", "课程").打印建议 = "凸点向上；层高0.16mm；无需支撑；先校准尺寸补偿"  # 写入打印建议。
brick_object.ViewObject.ShapeColor = (0.92, 0.18, 0.18)  # 设置经典红色外观。
parameters.ViewObject.Visibility = False  # 隐藏无几何的参数对象。
doc.recompute()  # 重新计算文档。

output_dir = os.path.dirname(os.path.abspath(__file__))  # 获取代码目录。
fcstd_path = os.path.normpath(os.path.join(output_dir, "..", "04_乐高式积木块_2x4.FCStd"))  # 生成 FCStd 路径。
stl_path = os.path.normpath(os.path.join(output_dir, "..", "04_乐高式积木块_2x4.stl"))  # 生成 STL 路径。
doc.saveAs(fcstd_path)  # 保存 FreeCAD 源文件。
Mesh.export([brick_object], stl_path)  # 导出最终 STL。

print("2×4兼容式积木生成完成。")  # 输出完成提示。
print("顶部凸点：%d；底部加强管：%d" % (len(stud_objects), len(tube_objects)))  # 输出循环生成数量。
print("有效几何：%s；实体数量：%d" % (brick_shape.isValid(), len(brick_shape.Solids)))  # 输出几何检查结果。
