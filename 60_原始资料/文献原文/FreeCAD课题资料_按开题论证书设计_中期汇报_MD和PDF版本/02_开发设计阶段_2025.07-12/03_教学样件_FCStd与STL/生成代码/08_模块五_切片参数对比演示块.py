# -*- coding: utf-8 -*-  # 使用 UTF-8 保存中文注释。
# 08_模块五_切片参数对比演示块.py  # 标明脚本名称。
# 教学目标：用一个可打印单实体比较悬空桥、45°斜面与立柱的切片表现。  # 说明用途。

import os  # 导入路径处理模块。
import FreeCAD as App  # 导入 FreeCAD 核心模块。
import Part  # 导入实体建模模块。
import Mesh  # 导入 STL 导出模块。

base_length = 70.0  # 设置基座长度，单位为毫米。
base_width = 42.0  # 设置基座宽度，单位为毫米。
base_height = 4.0  # 设置基座厚度，单位为毫米。
column_size = 6.0  # 设置桥墩截面尺寸，单位为毫米。
column_height = 20.0  # 设置桥墩高度，单位为毫米。
deck_thickness = 4.0  # 设置桥面厚度，单位为毫米。
ramp_length = 20.0  # 设置45°斜面水平长度，单位为毫米。
ramp_height = 20.0  # 设置45°斜面高度，单位为毫米。
ramp_width = 14.0  # 设置斜面宽度，单位为毫米。

doc = App.newDocument("Module5_SliceDemo")  # 新建教学演示文档。

base = Part.makeBox(base_length, base_width, base_height)  # 创建连续基座。
left_column = Part.makeBox(column_size, 14.0, column_height, App.Vector(8.0, 5.0, base_height))  # 创建左桥墩并与基座相接。
right_column = Part.makeBox(column_size, 14.0, column_height, App.Vector(34.0, 5.0, base_height))  # 创建右桥墩并与基座相接。
bridge_deck = Part.makeBox(32.0, 14.0, deck_thickness, App.Vector(8.0, 5.0, base_height + column_height))  # 创建跨越两桥墩的水平桥面。

ramp_points = [  # 定义斜面端部的闭合三角形。
    App.Vector(0.0, 0.0, 0.0),  # 定义三角形左下点。
    App.Vector(ramp_length, 0.0, 0.0),  # 定义三角形右下点。
    App.Vector(ramp_length, 0.0, ramp_height),  # 定义三角形右上点，使坡度为45°。
    App.Vector(0.0, 0.0, 0.0),  # 回到起点并闭合轮廓。
]  # 结束端部轮廓列表。
ramp_wire = Part.makePolygon(ramp_points)  # 把点连接成闭合线框。
ramp_face = Part.Face(ramp_wire)  # 把线框转为平面，避免旧版仅生成壳体。
ramp = ramp_face.extrude(App.Vector(0.0, ramp_width, 0.0))  # 将平面拉伸成真正的三维实体。
ramp.translate(App.Vector(47.0, 5.0, base_height))  # 把斜面移动到基座右侧并与基座接触。

model_shape = base.fuse(left_column)  # 将左桥墩与基座融合。
model_shape = model_shape.fuse(right_column)  # 将右桥墩与已有结构融合。
model_shape = model_shape.fuse(bridge_deck)  # 将桥面与两桥墩融合。
model_shape = model_shape.fuse(ramp)  # 将45°斜面与基座融合。
model_shape = model_shape.removeSplitter()  # 清理共面分割边，提高切片稳定性。

model = doc.addObject("PartDesign::Feature", "SliceDemo")  # 创建单一可打印特征对象。
model.Label = "切片参数对比演示块（单实体）"  # 设置中文显示名称。
model.Shape = model_shape  # 写入最终融合实体。
model.addProperty("App::PropertyString", "TeachingFocus", "教学说明")  # 添加教学用途字段。
model.TeachingFocus = "水平悬空桥、45°自支撑斜面、立柱与连续底座"  # 写入教学观察重点。
model.addProperty("App::PropertyString", "PrintCheck", "教学说明")  # 添加打印检查字段。
model.PrintCheck = "单一连通实体；比较开启和关闭支撑时的切片差异"  # 写入打印检查要求。

doc.recompute()  # 重新计算文档。

default_script_path = "/Users/wangzirui/教科研补件汇总/FreeCAD课题资料_按开题论证书设计/02_开发设计阶段_2025.07-12/03_教学样件_FCStd与STL/生成代码/08_模块五_切片参数对比演示块.py"  # 提供 GUI 桥无 __file__ 时的兼容路径。
script_path = globals().get("__file__", default_script_path)  # 优先读取实际脚本路径，否则采用兼容路径。
script_dir = os.path.dirname(os.path.abspath(script_path))  # 获取脚本所在目录。
fcstd_path = os.path.normpath(os.path.join(script_dir, "..", "08_模块五_切片参数对比演示块.FCStd"))  # 生成 FCStd 输出路径。
stl_path = os.path.normpath(os.path.join(script_dir, "..", "08_模块五_切片参数对比演示块.stl"))  # 生成 STL 输出路径。
doc.saveAs(fcstd_path)  # 保存可编辑的 FreeCAD 文件。
Mesh.export([model], stl_path)  # 仅导出最终单实体，避免重叠网格。

print("切片参数对比演示块生成完成")  # 输出完成提示。
print("VALID=%s SOLIDS=%d" % (model.Shape.isValid(), len(model.Shape.Solids)))  # 输出实体有效性与实体数量。
print("FCSTD=" + fcstd_path)  # 输出 FCStd 文件位置。
print("STL=" + stl_path)  # 输出 STL 文件位置。
