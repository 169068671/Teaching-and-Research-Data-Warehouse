# -*- coding: utf-8 -*-
# ============================================================
# 10_结课综合项目_桌面学习站_参考.py — 模块六
# ============================================================
# 功能：笔具收纳 + 手机停放 + 小物浅盘 + 充电走线。
# 评价定位：只展示“需求—参数—结构—打印验证”闭环，不要求学生照抄。
# ============================================================

import FreeCAD as App  # 导入 FreeCAD 核心模块。
import Part  # 导入 Part 几何模块。
import Mesh  # 导入 Mesh 导出模块。
import math  # 导入数学模块。
import os  # 导入路径模块。

base_length = 120.0  # 设置底座长度。
base_width = 76.0  # 设置底座宽度。
base_height = 6.0  # 设置底座厚度。
corner_radius = 8.0  # 设置底座平面圆角半径。
cup_outer_radius = 18.0  # 设置笔筒外半径。
cup_inner_radius = 14.5  # 设置笔筒内半径。
cup_height = 52.0  # 设置笔筒高度。
cup_bottom = 3.5  # 设置笔筒底厚。
phone_width = 62.0  # 设置手机承托区宽度。
phone_gap = 13.0  # 设置手机槽净宽。
back_height = 48.0  # 设置手机背板高度。
back_tilt_angle = 12.0  # 设置手机背板后倾角。

def make_rounded_box(length_value, width_value, height_value, radius_value, origin):  # 定义生成平面圆角底座的函数。
    center_box = Part.makeBox(length_value - 2.0 * radius_value, width_value, height_value, App.Vector(origin.x + radius_value, origin.y, origin.z))  # 创建横向中段。
    side_box = Part.makeBox(length_value, width_value - 2.0 * radius_value, height_value, App.Vector(origin.x, origin.y + radius_value, origin.z))  # 创建纵向中段。
    shape_value = center_box.fuse(side_box)  # 合并两个中段。
    for x_value in (origin.x + radius_value, origin.x + length_value - radius_value):  # 循环左右两个圆心位置。
        for y_value in (origin.y + radius_value, origin.y + width_value - radius_value):  # 循环前后两个圆心位置。
            corner = Part.makeCylinder(radius_value, height_value, App.Vector(x_value, y_value, origin.z))  # 创建当前圆角柱。
            shape_value = shape_value.fuse(corner)  # 合并当前圆角柱。
    return shape_value.removeSplitter()  # 返回清理分割边后的圆角盒。

old_doc = App.getDocument("FinalProjectDeskStation") if "FinalProjectDeskStation" in App.listDocuments() else None  # 查找旧结课项目文档。
if old_doc is not None:  # 判断旧文档是否存在。
    App.closeDocument(old_doc.Name)  # 关闭旧文档。
doc = App.newDocument("FinalProjectDeskStation")  # 创建结课项目文档。
doc.Label = "10_结课综合项目_桌面学习站_参考"  # 设置中文文档标题。

base_shape = make_rounded_box(base_length, base_width, base_height, corner_radius, App.Vector(0.0, 0.0, 0.0))  # 创建圆角底座。
tray_outer = make_rounded_box(55.0, 20.0, 3.2, 5.0, App.Vector(56.0, 7.0, base_height - 3.0))  # 创建小物盘浅槽切削体。
base_shape = base_shape.cut(tray_outer)  # 从底座顶面切出 3 mm 深小物盘。

cup_center = App.Vector(27.0, 48.0, base_height - 0.2)  # 设置笔筒中心并略微嵌入底座。
cup_outer = Part.makeCylinder(cup_outer_radius, cup_height, cup_center)  # 创建笔筒外圆柱。
cup_inner_origin = App.Vector(cup_center.x, cup_center.y, cup_center.z + cup_bottom)  # 计算笔筒内腔起点。
cup_inner = Part.makeCylinder(cup_inner_radius, cup_height, cup_inner_origin)  # 创建笔筒内腔切削体。
cup_shape = cup_outer.cut(cup_inner)  # 切出有底笔筒。

phone_x = 53.0  # 设置手机区左边界 X 坐标。
lip_y = 31.0  # 设置手机前挡位置。
back_y = lip_y + phone_gap  # 根据手机厚度计算背板位置。
front_lip = Part.makeBox(phone_width, 5.0, 11.0, App.Vector(phone_x, lip_y, base_height - 0.2))  # 创建手机前挡。
back_plate = Part.makeBox(phone_width, 4.0, back_height, App.Vector(phone_x, back_y, base_height - 0.2))  # 创建未倾斜背板。
back_plate.rotate(App.Vector(phone_x, back_y, base_height), App.Vector(1.0, 0.0, 0.0), back_tilt_angle)  # 绕 X 轴旋转背板形成后倾。

left_gusset_points = [App.Vector(phone_x, back_y, base_height), App.Vector(phone_x, back_y + 13.0, base_height), App.Vector(phone_x, back_y + 3.0, base_height + 25.0), App.Vector(phone_x, back_y, base_height)]  # 定义左侧三角加强筋轮廓。
left_gusset_face = Part.Face(Part.makePolygon(left_gusset_points))  # 将左侧轮廓转为面。
left_gusset = left_gusset_face.extrude(App.Vector(4.0, 0.0, 0.0))  # 拉伸生成左侧加强筋。
right_gusset = left_gusset.copy()  # 复制左侧加强筋。
right_gusset.translate(App.Vector(phone_width - 4.0, 0.0, 0.0))  # 将复制体移动到手机区右侧。

cable_slot = Part.makeBox(12.0, phone_gap + 9.0, base_height + 2.0, App.Vector(phone_x + phone_width / 2.0 - 6.0, lip_y + 2.5, -1.0))  # 创建充电线穿槽切削体。

station_shape = base_shape.fuse(cup_shape)  # 将笔筒与底座合并。
station_shape = station_shape.fuse(front_lip)  # 合并手机前挡。
station_shape = station_shape.fuse(back_plate)  # 合并手机背板。
station_shape = station_shape.fuse(left_gusset).fuse(right_gusset)  # 合并两侧加强筋。
station_shape = station_shape.cut(cable_slot).removeSplitter()  # 切出充电线槽并清理分割边。

if not station_shape.isValid():  # 检查桌面学习站几何有效性。
    raise RuntimeError("结课项目参考模型几何无效。")  # 无效时停止运行。
if len(station_shape.Solids) != 1:  # 检查参考模型是否为单一实体。
    raise RuntimeError("结课项目参考模型必须为单一连续实体。")  # 多实体时停止运行。

parameters = doc.addObject("App::FeaturePython", "ProjectParameters")  # 创建项目参数对象。
parameters.Label = "需求与参数表"  # 设置参数对象标题。
parameters.addProperty("App::PropertyString", "用户需求", "项目").用户需求 = "收纳笔具、停放手机、暂存小物、支持充电"  # 写入需求说明。
parameters.addProperty("App::PropertyLength", "手机槽净宽", "项目").手机槽净宽 = phone_gap  # 保存手机槽净宽。
parameters.addProperty("App::PropertyAngle", "背板后倾角", "项目").背板后倾角 = back_tilt_angle  # 保存背板后倾角。
parameters.addProperty("App::PropertyLength", "笔筒壁厚", "项目").笔筒壁厚 = cup_outer_radius - cup_inner_radius  # 保存笔筒壁厚。
parameters.addProperty("App::PropertyString", "评价提醒", "项目").评价提醒 = "只示范闭环，学生不得以照抄替代自主需求分析"  # 写入评价提醒。

station_object = doc.addObject("Part::Feature", "DeskLearningStation")  # 创建最终项目对象。
station_object.Label = "桌面学习站（单一可打印实体）"  # 设置最终对象标签。
station_object.Shape = station_shape  # 赋予最终几何。
station_object.addProperty("App::PropertyString", "综合技术", "课程").综合技术 = "参数化、布尔运算、阵列思维、倾斜结构、加强筋、可打印性"  # 写入综合技术。
station_object.addProperty("App::PropertyString", "打印建议", "课程").打印建议 = "底座平放；层高0.20mm；填充20%；背板局部树状支撑"  # 写入打印建议。
station_object.ViewObject.ShapeColor = (0.20, 0.68, 0.55)  # 设置青绿色外观。
parameters.ViewObject.Visibility = False  # 隐藏无几何参数对象。
doc.recompute()  # 重新计算文档。

output_dir = os.path.dirname(os.path.abspath(__file__))  # 获取代码目录。
fcstd_path = os.path.normpath(os.path.join(output_dir, "..", "10_毕业项目_多功能桌面收纳站_参考.FCStd"))  # 保留原文件名以兼容既有链接。
stl_path = os.path.normpath(os.path.join(output_dir, "..", "10_毕业项目_多功能桌面收纳站_参考.stl"))  # 生成 STL 兼容路径。
doc.saveAs(fcstd_path)  # 保存 FreeCAD 源文件。
Mesh.export([station_object], stl_path)  # 导出单一实体 STL。

print("结课综合项目生成完成。")  # 输出完成提示。
print("功能区：笔具收纳、手机停放、小物浅盘、充电走线。")  # 输出功能说明。
print("有效几何：%s；实体数量：%d" % (station_shape.isValid(), len(station_shape.Solids)))  # 输出几何检查结果。
