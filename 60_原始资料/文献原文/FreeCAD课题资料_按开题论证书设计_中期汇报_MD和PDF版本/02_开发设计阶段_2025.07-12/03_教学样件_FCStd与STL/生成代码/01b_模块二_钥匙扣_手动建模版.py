# -*- coding: utf-8 -*-
# ============================================================
# 01b_模块二_钥匙扣_手动建模版.py
# ============================================================
# 本文件把流线型钥匙扣拆成“主体拉伸→挂孔挖槽→铭牌挖槽→浮雕”特征树，
# 用于模块二手动建模演示；最终外形与代码版保持一致。
# ============================================================

import FreeCAD as App  # 导入 FreeCAD 核心模块。
import Part  # 导入 Part 几何模块。
import Mesh  # 导入 Mesh 导出模块。
import math  # 导入数学模块。
import os  # 导入路径模块。

width = 24.0  # 设置主体宽度。
thickness = 4.0  # 设置主体厚度。
end_radius = width / 2.0  # 计算主体圆角半径。
right_center_x = 44.0  # 设置主体右端圆心位置。
ring_center_x = 51.0  # 设置挂环圆心位置。
ring_outer_radius = 8.0  # 设置挂环外半径。
ring_inner_radius = 4.0  # 设置穿绳孔半径。
recess_depth = 0.8  # 设置铭牌凹槽深度。

old_doc = App.getDocument("Module2_Manual_Keychain") if "Module2_Manual_Keychain" in App.listDocuments() else None  # 查找旧文档。
if old_doc is not None:  # 判断旧文档是否存在。
    App.closeDocument(old_doc.Name)  # 关闭旧文档。
doc = App.newDocument("Module2_Manual_Keychain")  # 创建手动建模演示文档。
doc.Label = "01b_模块二_钥匙扣_手动建模版"  # 设置文档标题。
body = doc.addObject("PartDesign::Body", "Body")  # 创建 PartDesign 特征容器。
body.Label = "钥匙扣特征树"  # 设置 Body 中文标签。

middle_box = Part.makeBox(32.0, width, thickness, App.Vector(end_radius, 0.0, 0.0))  # 创建主体中段。
left_cap = Part.makeCylinder(end_radius, thickness, App.Vector(end_radius, end_radius, 0.0))  # 创建左端圆弧。
right_cap = Part.makeCylinder(end_radius, thickness, App.Vector(right_center_x, end_radius, 0.0))  # 创建右端圆弧。
ring_outer = Part.makeCylinder(ring_outer_radius, thickness, App.Vector(ring_center_x, end_radius, 0.0))  # 创建挂环外圆。
pad_shape = middle_box.fuse(left_cap).fuse(right_cap).fuse(ring_outer).removeSplitter()  # 合并得到“主体拉伸”结果。
pad_feature = body.newObject("PartDesign::Feature", "Pad_RoundedBody")  # 创建主体拉伸特征节点。
pad_feature.Label = "01 主体拉伸（圆角轮廓）"  # 设置主体特征中文标签。
pad_feature.Shape = pad_shape  # 保存主体拉伸结果。

ring_hole = Part.makeCylinder(ring_inner_radius, thickness + 2.0, App.Vector(ring_center_x, end_radius, -1.0))  # 创建挂孔切削体。
hole_shape = pad_shape.cut(ring_hole)  # 执行挂孔挖槽。
hole_feature = body.newObject("PartDesign::Feature", "Pocket_RingHole")  # 创建挂孔挖槽特征节点。
hole_feature.Label = "02 挂孔挖槽（贯穿）"  # 设置挂孔特征中文标签。
hole_feature.Shape = hole_shape  # 保存挂孔挖槽结果。
pad_feature.Visibility = False  # 隐藏上一步中间结果。

panel_box = Part.makeBox(22.0, 14.0, recess_depth + 0.2, App.Vector(13.0, 5.0, thickness - recess_depth))  # 创建铭牌中段切削体。
panel_left = Part.makeCylinder(7.0, recess_depth + 0.2, App.Vector(13.0, 12.0, thickness - recess_depth))  # 创建铭牌左端切削体。
panel_right = Part.makeCylinder(7.0, recess_depth + 0.2, App.Vector(35.0, 12.0, thickness - recess_depth))  # 创建铭牌右端切削体。
panel_cutter = panel_box.fuse(panel_left).fuse(panel_right)  # 合并铭牌切削体。
recess_shape = hole_shape.cut(panel_cutter)  # 执行浅凹铭牌挖槽。
recess_feature = body.newObject("PartDesign::Feature", "Pocket_NamePanel")  # 创建铭牌挖槽特征节点。
recess_feature.Label = "03 铭牌区挖槽（0.8mm）"  # 设置铭牌特征中文标签。
recess_feature.Shape = recess_shape  # 保存铭牌挖槽结果。
hole_feature.Visibility = False  # 隐藏上一步中间结果。

star_points = []  # 创建五角星点列表。
for index in range(10):  # 循环生成 10 个交替顶点。
    radius = 4.2 if index % 2 == 0 else 1.9  # 交替选择外半径和内半径。
    angle = math.radians(90.0 + index * 36.0)  # 计算顶点角度。
    star_points.append(App.Vector(24.0 + radius * math.cos(angle), 12.0 + radius * math.sin(angle), thickness - recess_depth - 0.05))  # 计算并保存顶点。
star_points.append(star_points[0])  # 闭合五角星轮廓。
star_face = Part.Face(Part.makePolygon(star_points))  # 生成五角星平面。
star_shape = star_face.extrude(App.Vector(0.0, 0.0, 0.60))  # 拉伸五角星浅浮雕。
final_shape = recess_shape.fuse(star_shape).removeSplitter()  # 合并浮雕并得到最终模型。
final_feature = body.newObject("PartDesign::Feature", "Additive_Star")  # 创建浮雕特征节点。
final_feature.Label = "04 五角星浅浮雕（最终结果）"  # 设置最终特征中文标签。
final_feature.Shape = final_shape  # 保存最终几何。
recess_feature.Visibility = False  # 隐藏上一步中间结果。

if not final_shape.isValid():  # 检查最终几何有效性。
    raise RuntimeError("手动建模版钥匙扣几何无效。")  # 无效时停止运行。
if len(final_shape.Solids) != 1:  # 检查最终实体数量。
    raise RuntimeError("手动建模版钥匙扣必须为单一实体。")  # 多实体时停止运行。

final_feature.addProperty("App::PropertyString", "操作顺序", "教学").操作顺序 = "主体拉伸 → 挂孔挖槽 → 铭牌挖槽 → 浅浮雕"  # 写入教学操作顺序。
final_feature.addProperty("App::PropertyString", "打印建议", "教学").打印建议 = "平放打印，无需支撑"  # 写入打印建议。
final_feature.ViewObject.ShapeColor = (0.16, 0.55, 0.88)  # 设置模型颜色。
doc.recompute()  # 重新计算文档。

output_dir = os.path.dirname(os.path.abspath(__file__))  # 获取脚本目录。
fcstd_path = os.path.normpath(os.path.join(output_dir, "..", "01b_模块二_钥匙扣_手动建模版.FCStd"))  # 生成 FCStd 路径。
stl_path = os.path.normpath(os.path.join(output_dir, "..", "01b_模块二_钥匙扣_手动建模版.stl"))  # 生成 STL 路径。
doc.saveAs(fcstd_path)  # 保存 FreeCAD 文件。
Mesh.export([final_feature], stl_path)  # 导出最终 STL。

print("手动建模版钥匙扣生成完成。")  # 输出完成提示。
print("特征树：主体拉伸 → 挂孔挖槽 → 铭牌挖槽 → 五角星浅浮雕")  # 输出特征树说明。
