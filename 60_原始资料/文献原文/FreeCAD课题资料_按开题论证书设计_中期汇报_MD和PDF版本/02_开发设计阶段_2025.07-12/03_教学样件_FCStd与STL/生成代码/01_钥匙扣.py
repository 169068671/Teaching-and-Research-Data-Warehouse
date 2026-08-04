# -*- coding: utf-8 -*-
# ============================================================
# 01_钥匙扣.py — 实践作业1：流线型个性钥匙扣（模块二）
# ============================================================
# 造型策略：圆角胶囊轮廓 + 一体挂环 + 内凹铭牌区 + 浅浮雕五角星。
# 教学重点：基本体、布尔并、布尔差、尺寸参数和可打印性检查。
# ============================================================

import FreeCAD as App  # 导入 FreeCAD 核心模块，并使用 App 作为简称。
import Part  # 导入 Part 几何模块，用于创建实体和布尔运算。
import Mesh  # 导入 Mesh 模块，用于导出 3D 打印所需的 STL。
import math  # 导入数学模块，用于计算五角星顶点。
import os  # 导入路径模块，用于生成跨平台输出路径。

tag_height = 24.0  # 设置钥匙扣主体宽度为 24 mm。
tag_thickness = 4.0  # 设置钥匙扣厚度为 4 mm，兼顾强度和打印时间。
left_radius = tag_height / 2.0  # 计算主体左端圆角半径。
right_center_x = 44.0  # 设置主体右端圆心的 X 坐标。
ring_center_x = 51.0  # 设置挂环圆心的 X 坐标。
ring_outer_radius = 8.0  # 设置挂环外半径为 8 mm。
ring_inner_radius = 4.0  # 设置穿绳孔半径为 4 mm。
panel_depth = 0.8  # 设置铭牌内凹深度为 0.8 mm。
star_outer_radius = 4.2  # 设置五角星外接圆半径。
star_inner_radius = 1.9  # 设置五角星内接圆半径。

old_doc = App.getDocument("Keychain") if "Keychain" in App.listDocuments() else None  # 查找是否已有同名文档。
if old_doc is not None:  # 判断同名文档是否存在。
    App.closeDocument(old_doc.Name)  # 关闭旧文档，避免重复运行脚本时名称冲突。
doc = App.newDocument("Keychain")  # 新建钥匙扣文档。
doc.Label = "01_流线型个性钥匙扣"  # 设置中文文档标题，便于教学识别。

middle_box = Part.makeBox(32.0, tag_height, tag_thickness, App.Vector(left_radius, 0.0, 0.0))  # 创建胶囊主体中间矩形。
left_cap = Part.makeCylinder(left_radius, tag_thickness, App.Vector(left_radius, left_radius, 0.0))  # 创建主体左端圆弧。
right_cap = Part.makeCylinder(left_radius, tag_thickness, App.Vector(right_center_x, left_radius, 0.0))  # 创建主体右端圆弧。
plate = middle_box.fuse(left_cap).fuse(right_cap)  # 合并矩形与两端圆弧，形成流线型主体。

ring_outer = Part.makeCylinder(ring_outer_radius, tag_thickness, App.Vector(ring_center_x, left_radius, 0.0))  # 创建挂环外圆柱。
tag_shape = plate.fuse(ring_outer)  # 将挂环外圆柱与主体合并为一体。
ring_hole = Part.makeCylinder(ring_inner_radius, tag_thickness + 2.0, App.Vector(ring_center_x, left_radius, -1.0))  # 创建贯穿挂环的切削圆柱。
tag_shape = tag_shape.cut(ring_hole)  # 切出穿绳孔。

panel_box = Part.makeBox(22.0, 14.0, panel_depth + 0.2, App.Vector(13.0, 5.0, tag_thickness - panel_depth))  # 创建内凹铭牌区中段。
panel_left = Part.makeCylinder(7.0, panel_depth + 0.2, App.Vector(13.0, 12.0, tag_thickness - panel_depth))  # 创建铭牌区左端圆弧。
panel_right = Part.makeCylinder(7.0, panel_depth + 0.2, App.Vector(35.0, 12.0, tag_thickness - panel_depth))  # 创建铭牌区右端圆弧。
panel_cutter = panel_box.fuse(panel_left).fuse(panel_right)  # 合并铭牌区切削体。
tag_shape = tag_shape.cut(panel_cutter)  # 在主体顶面切出浅凹铭牌区。

star_points = []  # 创建五角星顶点列表。
for index in range(10):  # 循环生成外点和内点，共 10 个顶点。
    radius = star_outer_radius if index % 2 == 0 else star_inner_radius  # 偶数点使用外半径，奇数点使用内半径。
    angle = math.radians(90.0 + index * 36.0)  # 计算当前顶点角度，使五角星朝上。
    x_value = 24.0 + radius * math.cos(angle)  # 计算当前顶点 X 坐标。
    y_value = 12.0 + radius * math.sin(angle)  # 计算当前顶点 Y 坐标。
    star_points.append(App.Vector(x_value, y_value, tag_thickness - panel_depth - 0.05))  # 把顶点加入列表并略微嵌入底面。
star_points.append(star_points[0])  # 将首点追加到末尾，使轮廓闭合。
star_wire = Part.makePolygon(star_points)  # 用顶点生成闭合五角星线框。
star_face = Part.Face(star_wire)  # 将线框转换为平面。
star_shape = star_face.extrude(App.Vector(0.0, 0.0, 0.60))  # 将五角星拉伸为低于外表面的浅浮雕。
tag_shape = tag_shape.fuse(star_shape).removeSplitter()  # 合并五角星并清理多余分割边。

if not tag_shape.isValid():  # 检查最终几何是否有效。
    raise RuntimeError("钥匙扣几何无效，请检查布尔运算参数。")  # 几何无效时停止并给出明确错误。
if len(tag_shape.Solids) != 1:  # 检查最终模型是否为单一实体。
    raise RuntimeError("钥匙扣必须保持为单一可打印实体。")  # 多实体时停止，避免导出错误 STL。

parameters = doc.addObject("App::FeaturePython", "DesignParameters")  # 新建参数说明对象。
parameters.Label = "设计参数（可修改）"  # 设置参数对象中文标签。
parameters.addProperty("App::PropertyLength", "主体宽度", "参数").主体宽度 = tag_height  # 写入主体宽度参数。
parameters.addProperty("App::PropertyLength", "整体厚度", "参数").整体厚度 = tag_thickness  # 写入整体厚度参数。
parameters.addProperty("App::PropertyLength", "挂孔直径", "参数").挂孔直径 = ring_inner_radius * 2.0  # 写入挂孔直径参数。
parameters.addProperty("App::PropertyLength", "铭牌凹深", "参数").铭牌凹深 = panel_depth  # 写入铭牌凹深参数。

object_result = doc.addObject("Part::Feature", "Keychain")  # 创建最终钥匙扣对象。
object_result.Label = "流线型钥匙扣（单一实体）"  # 设置最终对象中文标签。
object_result.Shape = tag_shape  # 将最终几何赋给对象。
object_result.addProperty("App::PropertyString", "教学重点", "课程").教学重点 = "布尔并、布尔差、参数化、可打印性"  # 写入课程说明。
object_result.addProperty("App::PropertyString", "打印建议", "课程").打印建议 = "平放；层高0.20mm；填充20%；无需支撑"  # 写入打印建议。
object_result.ViewObject.ShapeColor = (0.16, 0.55, 0.88)  # 设置清爽蓝色外观。
parameters.ViewObject.Visibility = False  # 在三维视图中隐藏无几何的参数对象。
doc.recompute()  # 重新计算文档。

output_dir = os.path.dirname(os.path.abspath(__file__))  # 获取当前代码文件所在目录。
fcstd_path = os.path.normpath(os.path.join(output_dir, "..", "01_钥匙扣.FCStd"))  # 生成 FCStd 输出路径。
stl_path = os.path.normpath(os.path.join(output_dir, "..", "01_钥匙扣.stl"))  # 生成 STL 输出路径。
doc.saveAs(fcstd_path)  # 保存可编辑的 FreeCAD 源文件。
Mesh.export([object_result], stl_path)  # 导出单一实体 STL。

print("钥匙扣生成完成。")  # 输出完成提示。
print("有效几何：", tag_shape.isValid())  # 输出几何有效性。
print("实体数量：", len(tag_shape.Solids))  # 输出实体数量。
print("外形尺寸：%.1f × %.1f × %.1f mm" % (tag_shape.BoundBox.XLength, tag_shape.BoundBox.YLength, tag_shape.BoundBox.ZLength))  # 输出外形尺寸。
