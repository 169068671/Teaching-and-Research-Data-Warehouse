# -*- coding: utf-8 -*-
# ============================================================
# 02_笔筒.py — 实践作业2：十二边参数化笔筒（模块三）
# ============================================================
# 造型策略：十二边形轻微外扩，上口更开阔，保留完整筒底。
# 教学重点：参数、函数、列表、循环、放样和布尔差。
# ============================================================

import FreeCAD as App  # 导入 FreeCAD 核心模块。
import Part  # 导入 Part 几何模块。
import Mesh  # 导入 Mesh 导出模块。
import math  # 导入数学模块。
import os  # 导入路径模块。

side_count = 12  # 设置横截面边数为 12。
height = 82.0  # 设置笔筒总高度为 82 mm。
bottom_thickness = 3.5  # 设置筒底厚度为 3.5 mm。
outer_radius_bottom = 29.0  # 设置外轮廓底部外接圆半径。
outer_radius_top = 30.5  # 设置外轮廓顶部外接圆半径，形成轻微外扩。
wall_thickness = 3.2  # 设置平均壁厚为 3.2 mm。
inner_radius_bottom = outer_radius_bottom - wall_thickness  # 计算内轮廓底部半径。
inner_radius_top = outer_radius_top - wall_thickness  # 计算内轮廓顶部半径。

def make_polygon_wire(radius_value, z_value):  # 定义生成正多边形闭合线框的函数。
    points = []  # 创建顶点列表。
    for index in range(side_count):  # 按边数循环生成顶点。
        angle = 2.0 * math.pi * index / side_count + math.pi / side_count  # 计算当前顶点角度并旋转半个分段。
        x_value = radius_value * math.cos(angle)  # 计算顶点 X 坐标。
        y_value = radius_value * math.sin(angle)  # 计算顶点 Y 坐标。
        points.append(App.Vector(x_value, y_value, z_value))  # 将顶点加入列表。
    points.append(points[0])  # 追加首点，使轮廓闭合。
    return Part.makePolygon(points)  # 返回闭合多边形线框。

old_doc = App.getDocument("PenHolder") if "PenHolder" in App.listDocuments() else None  # 查找旧笔筒文档。
if old_doc is not None:  # 判断旧文档是否存在。
    App.closeDocument(old_doc.Name)  # 关闭旧文档。
doc = App.newDocument("PenHolder")  # 创建新笔筒文档。
doc.Label = "02_十二边参数化笔筒"  # 设置文档标题。

outer_bottom_wire = make_polygon_wire(outer_radius_bottom, 0.0)  # 生成外轮廓底部线框。
outer_top_wire = make_polygon_wire(outer_radius_top, height)  # 生成外轮廓顶部线框。
outer_solid = Part.makeLoft([outer_bottom_wire, outer_top_wire], True, False)  # 放样生成略微外扩的外部实体。

inner_bottom_wire = make_polygon_wire(inner_radius_bottom, bottom_thickness)  # 生成从筒底上方开始的内轮廓。
inner_top_wire = make_polygon_wire(inner_radius_top, height + 1.0)  # 生成略高于筒口的内轮廓，确保贯穿。
inner_solid = Part.makeLoft([inner_bottom_wire, inner_top_wire], True, False)  # 放样生成内部切削实体。
holder_shape = outer_solid.cut(inner_solid).removeSplitter()  # 从外部实体中减去内部实体并清理分割边。

if not holder_shape.isValid():  # 检查笔筒几何是否有效。
    raise RuntimeError("笔筒几何无效，请检查参数。")  # 无效时停止运行。
if len(holder_shape.Solids) != 1:  # 检查笔筒是否为单一实体。
    raise RuntimeError("笔筒必须为一个连续实体。")  # 多实体时停止运行。

parameters = doc.addObject("App::FeaturePython", "Parameters")  # 创建可见参数对象。
parameters.Label = "参数表（修改代码后重建）"  # 设置参数对象标题。
parameters.addProperty("App::PropertyInteger", "边数", "参数").边数 = side_count  # 保存边数。
parameters.addProperty("App::PropertyLength", "高度", "参数").高度 = height  # 保存高度。
parameters.addProperty("App::PropertyLength", "壁厚", "参数").壁厚 = wall_thickness  # 保存壁厚。
parameters.addProperty("App::PropertyLength", "底厚", "参数").底厚 = bottom_thickness  # 保存底厚。
parameters.addProperty("App::PropertyLength", "底部外半径", "参数").底部外半径 = outer_radius_bottom  # 保存底部外半径。
parameters.addProperty("App::PropertyLength", "顶部外半径", "参数").顶部外半径 = outer_radius_top  # 保存顶部外半径。

holder_object = doc.addObject("Part::Feature", "PenHolder")  # 创建笔筒最终对象。
holder_object.Label = "十二边参数化笔筒（单一实体）"  # 设置笔筒对象标签。
holder_object.Shape = holder_shape  # 赋予笔筒最终几何。
holder_object.addProperty("App::PropertyString", "参数化关系", "课程").参数化关系 = "内半径 = 外半径 - 壁厚"  # 写入参数关系。
holder_object.addProperty("App::PropertyString", "打印建议", "课程").打印建议 = "开口向上；层高0.20mm；填充15%；无需支撑"  # 写入打印建议。
holder_object.ViewObject.ShapeColor = (0.95, 0.55, 0.18)  # 设置暖橙色外观。
parameters.ViewObject.Visibility = False  # 隐藏无几何的参数对象。
doc.recompute()  # 重新计算文档。

output_dir = os.path.dirname(os.path.abspath(__file__))  # 获取代码目录。
fcstd_path = os.path.normpath(os.path.join(output_dir, "..", "02_笔筒.FCStd"))  # 生成 FCStd 输出路径。
stl_path = os.path.normpath(os.path.join(output_dir, "..", "02_笔筒.stl"))  # 生成 STL 输出路径。
doc.saveAs(fcstd_path)  # 保存 FreeCAD 源文件。
Mesh.export([holder_object], stl_path)  # 导出笔筒 STL。

print("十二边参数化笔筒生成完成。")  # 输出完成提示。
print("有效几何：", holder_shape.isValid())  # 输出几何有效性。
print("实体数量：", len(holder_shape.Solids))  # 输出实体数量。
print("壁厚：%.1f mm；底厚：%.1f mm" % (wall_thickness, bottom_thickness))  # 输出关键参数。
