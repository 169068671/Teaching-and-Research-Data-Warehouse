# -*- coding: utf-8 -*-
# ============================================================
# 03_手机支架.py — 实践作业4：一体化手机支架（模块四）
# ============================================================
# 坐标约定：
#   X：前后方向（0 为前端，80 为后端）
#   Y：左右方向（0～50）
#   Z：高度方向
#
# 关键修复：
#   1. 手机槽不再贯穿 10 mm 底座，保留 3 mm 连续承力层；
#   2. 充电线开口改为沿 X 方向从前端通往手机槽的居中通道；
#   3. 背板是向后倾斜的等厚 6 mm 平行四边形板，并向下嵌入底座；
#   4. 每次保存前强制验证 Shape 有效且只有一个 Solid。
# ============================================================

import math  # 导入三角函数模块，用于计算背板倾斜偏移。
import os  # 导入路径模块，用于生成可复现的输出路径。

import FreeCAD as App  # 导入 FreeCAD 核心 API。
import Mesh  # 导入网格模块，用于输出 STL。
import Part  # 导入 Part 几何内核，用于实体建模。

# ---- 参数定义 ----
base_L = 80.0       # 底座长度（mm）
base_W = 50.0       # 底座宽度（mm）
base_H = 10.0       # 底座厚度（mm）
back_H = 55.0       # 背板高出底座顶面的垂直高度（mm）
back_T = 6.0        # 背板厚度（mm）
back_angle = 25.0   # 背板相对竖直方向向后倾斜角（°）
slot_W = 15.0       # 手机槽前后宽度（mm）
slot_H = 10.0       # 课程给定槽深参数（mm）
cable_W = 20.0      # 充电线开口左右宽度（mm）
cable_H = 5.0       # 充电线开口高度（mm）

# 为保证底座不被手机槽切成两段，必须保留连续底层。
slot_floor = 3.0  # 规定槽底必须保留3毫米连续承力层。
slot_depth = min(slot_H, base_H - slot_floor)  # 将实际槽深限制在不切穿底座的范围内。

# 手机槽位于背板前方；充电通道从前端延伸到槽后缘。
slot_x = 46.0  # 把手机槽放在背板前方。
cable_y = (base_W - cable_W) / 2.0  # 计算充电通道的左右居中位置。
cable_L = slot_x + slot_W  # 让充电通道从前端一直延伸到手机槽后缘。

# 背板底端嵌入底座内部，形成真实体积重叠。
back_front_x = 70.0  # 设置背板前表面底端的X坐标。
back_embed_z = 4.0  # 让背板底端嵌入底座以形成真实体积重叠。
back_top_z = base_H + back_H  # 计算背板最高点的Z坐标。

def make_backrest():  # 定义倾斜背板实体生成函数。
    """创建向后倾斜、等厚且嵌入底座的背板实体。"""
    angle = math.radians(back_angle)  # 把角度制转换为弧度制。
    vertical_rise = back_top_z - back_embed_z  # 计算背板垂直方向的总高度。
    forward_offset = vertical_rise * math.tan(angle)  # 计算顶部向后退让的水平距离。

    # 背板顶端沿 +X（后方）退让；厚度沿斜面法线方向取值。
    normal_x = math.cos(angle) * back_T  # 计算板厚在X方向的分量。
    normal_z = -math.sin(angle) * back_T  # 计算板厚在Z方向的分量。

    p0 = App.Vector(back_front_x, 0.0, back_embed_z)  # 定义背板前下角。
    p1 = App.Vector(  # 定义背板后下角。
        back_front_x + normal_x,  # 写入后下角X坐标。
        0.0,  # 写入后下角Y坐标。
        back_embed_z + normal_z,  # 写入后下角Z坐标。
    )  # 完成后下角向量。
    p2 = App.Vector(  # 定义背板后上角。
        back_front_x + forward_offset + normal_x,  # 写入后上角X坐标。
        0.0,  # 写入后上角Y坐标。
        back_top_z + normal_z,  # 写入后上角Z坐标。
    )  # 完成后上角向量。
    p3 = App.Vector(  # 定义背板前上角。
        back_front_x + forward_offset,  # 写入前上角X坐标。
        0.0,  # 写入前上角Y坐标。
        back_top_z,  # 写入前上角Z坐标。
    )  # 完成前上角向量。

    wire = Part.makePolygon([p0, p1, p2, p3, p0])  # 连接四点并闭合背板侧面轮廓。
    return Part.Face(wire).extrude(App.Vector(0.0, base_W, 0.0))  # 沿Y方向拉伸成等厚背板实体。

def assert_single_solid(shape):  # 定义单实体质量门禁函数。
    """阻止无效或分体模型被保存、分发。"""
    if shape.isNull():  # 检查形状是否为空。
        raise RuntimeError("手机支架 Shape 为空")  # 空形状立即停止导出。
    if not shape.isValid():  # 检查B-Rep拓扑有效性。
        raise RuntimeError("手机支架 Shape 无效")  # 无效拓扑立即停止导出。
    if len(shape.Solids) != 1:  # 检查是否恰好为一个连通实体。
        raise RuntimeError(  # 分体时抛出带数量的错误。
            "手机支架不是一体件：检测到 %d 个 Solid" % len(shape.Solids)  # 记录实际实体数。
        )  # 完成异常构造。
    if float(shape.Volume) <= 0.0:  # 检查实体体积是否为正。
        raise RuntimeError("手机支架体积异常")  # 非实体结果立即停止导出。

# ---- 输出路径与文档准备 ----
default_script_path = "/Users/wangzirui/教科研补件汇总/FreeCAD课题资料_按开题论证书设计/02_开发设计阶段_2025.07-12/03_教学样件_FCStd与STL/生成代码/03_手机支架.py"  # 提供GUI桥无__file__时的兼容路径。
script_path = globals().get("__file__", default_script_path)  # 优先采用脚本自身路径。
script_dir = os.path.dirname(os.path.abspath(script_path))  # 获取生成代码目录。
out_dir = os.path.abspath(os.path.join(script_dir, ".."))  # 获取教学样件输出目录。
fcstd_path = os.path.join(out_dir, "03_手机支架.FCStd")  # 定义FCStd输出路径。
stl_path = os.path.join(out_dir, "03_手机支架.stl")  # 定义STL输出路径。

# 避免同一路径已在 GUI 中打开时覆盖失败。
for open_doc in list(App.listDocuments().values()):  # 遍历当前已打开文档。
    if os.path.abspath(getattr(open_doc, "FileName", "") or "") == fcstd_path:  # 判断是否已打开同一路径。
        App.closeDocument(open_doc.Name)  # 关闭旧文档，防止覆盖失败。

doc = App.newDocument("PhoneStand")  # 新建手机支架文档。

# ---- 1. 先合并底座与嵌入式倾斜背板 ----
base = Part.makeBox(base_L, base_W, base_H)  # 创建水平底座。
backrest = make_backrest()  # 创建向后倾斜且嵌入底座的背板。
body = base.fuse(backrest).removeSplitter()  # 融合底座与背板并清理共面分割边。

# ---- 2. 手机槽：贯穿左右方向，但保留 3 mm 连续底层 ----
slot = Part.makeBox(  # 创建横贯左右方向的手机槽切削体。
    slot_W,  # 写入手机槽前后宽度。
    base_W,  # 让手机槽横贯底座左右方向。
    slot_depth,  # 写入安全限制后的槽深。
    App.Vector(slot_x, 0.0, base_H - slot_depth),  # 将切削体放在底座顶面。
)  # 完成手机槽切削体。
body = body.cut(slot).removeSplitter()  # 从支架实体中切除手机槽。

# ---- 3. 充电线开口：前端居中，并延伸到手机槽下方 ----
cable = Part.makeBox(  # 创建前端充电线通道切削体。
    cable_L,  # 写入通道沿X方向的长度。
    cable_W,  # 写入通道左右宽度。
    cable_H,  # 写入通道高度。
    App.Vector(0.0, cable_y, 0.0),  # 把通道放在底座前端中央。
)  # 完成通道切削体。
body = body.cut(cable).removeSplitter()  # 从支架实体中切除充电线通道。

# ---- 4. 运行时拓扑验收 ----
assert_single_solid(body)  # 保存前执行单实体质量门禁。

# ---- 5. 写入文档并设置显示 ----
obj = doc.addObject("Part::Feature", "PhoneStand")  # 创建最终特征对象。
obj.Label = "一体化手机支架"  # 设置中文对象名称。
obj.Shape = body  # 写入最终单实体形状。
obj.addProperty("App::PropertyString", "DesignSummary", "设计参数")  # 添加设计摘要属性。
obj.DesignSummary = "80×50×10底座；25°倾斜背板；手机槽；充电线开口"  # 写入主要设计参数。
obj.addProperty("App::PropertyInteger", "SolidCount", "验证")  # 添加实体数量属性。
obj.SolidCount = len(body.Solids)  # 写入实体数量。
obj.addProperty("App::PropertyBool", "IsSingleSolid", "验证")  # 添加单实体验证属性。
obj.IsSingleSolid = len(body.Solids) == 1 and body.isValid()  # 写入单实体检查结果。
obj.addProperty("App::PropertyLength", "SlotDepth", "设计参数")  # 添加手机槽深度属性。
obj.SlotDepth = slot_depth  # 写入实际槽深。
obj.addProperty("App::PropertyLength", "SlotFloor", "设计参数")  # 添加连续槽底厚度属性。
obj.SlotFloor = slot_floor  # 写入槽底厚度。
obj.ViewObject.ShapeColor = (0.25, 0.60, 0.88)  # 设置主体颜色。
obj.ViewObject.LineColor = (0.12, 0.20, 0.28)  # 设置边线颜色。
doc.recompute()  # 重新计算文档。

# ---- 6. 保存 FCStd 与 STL ----
doc.saveAs(fcstd_path)  # 保存可编辑FCStd文件。
Mesh.export([obj], stl_path)  # 导出最终单实体STL。

# ---- 7. 输出可核验摘要 ----
bb = body.BoundBox  # 读取最终实体包围盒。
print("手机支架生成完成：")  # 输出任务完成提示。
print("  单一实体：%s（Solid=%d）" % (obj.IsSingleSolid, len(body.Solids)))  # 输出单实体检查结果。
print("  体积：%.1f mm³" % float(body.Volume))  # 输出实体体积。
print(  # 输出外包围盒尺寸。
    "  外包围盒：%.1f × %.1f × %.1f mm"  # 定义尺寸输出格式。
    % (float(bb.XLength), float(bb.YLength), float(bb.ZLength))  # 填入三个方向尺寸。
)  # 完成包围盒输出。
print("  背板：相对竖直向后倾斜 %.1f°，厚 %.1f mm" % (back_angle, back_T))  # 输出背板参数。
print(  # 输出手机槽参数。
    "  手机槽：%.1f × %.1f mm，实际深 %.1f mm，保留底层 %.1f mm"  # 定义槽参数格式。
    % (slot_W, base_W, slot_depth, slot_floor)  # 填入手机槽尺寸。
)  # 完成手机槽输出。
print("  充电线开口：宽 %.1f mm，高 %.1f mm" % (cable_W, cable_H))  # 输出充电通道尺寸。
print("  FCStd：%s" % fcstd_path)  # 输出FCStd路径。
print("  STL：%s" % stl_path)  # 输出STL路径。
