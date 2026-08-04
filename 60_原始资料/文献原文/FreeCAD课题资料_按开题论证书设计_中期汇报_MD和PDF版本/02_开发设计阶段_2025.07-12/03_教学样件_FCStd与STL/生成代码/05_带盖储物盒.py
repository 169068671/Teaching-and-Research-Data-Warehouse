# -*- coding: utf-8 -*-
"""05_带盖储物盒：双卡边环形槽 + FreeCAD 原生 Assembly 装配。"""

import os  # 导入路径模块，用于生成可复现的输出路径。

import FreeCAD as App  # 导入 FreeCAD 核心 API。
import FreeCADGui as Gui  # 导入 GUI API，用于调用原生 Assembly 工作台命令。
import Mesh  # 导入网格模块，用于输出 STL。
import Part  # 导入 Part 几何内核，用于实体建模。

# ---------- 参数 ----------
BOX_L = 60.0  # 设置盒体外部长度，单位为毫米。
BOX_W = 40.0  # 设置盒体外部宽度，单位为毫米。
BOX_H = 35.0  # 设置盒体外部高度，单位为毫米。
WALL_T = 2.5  # 设置盒壁厚度，单位为毫米。
BOTTOM_T = 2.5  # 设置盒底厚度，单位为毫米。

LID_OVERHANG = 2.0  # 设置盒盖相对盒体的四周外伸量。
LID_T = 3.0  # 设置盒盖顶板厚度。
GROOVE_DEPTH = 6.0  # 设置双卡边环形槽深度。
ASSEMBLY_CLEARANCE = 0.35  # 设置盒壁与卡边之间的单侧装配间隙。
OUTER_SKIRT_T = 1.5  # 设置外挡边厚度。
INNER_LIP_T = 1.5  # 设置内定位边厚度。

def make_box_body():  # 定义开口盒体生成函数。
    """外壳减内腔；顶部开口，保留盒底和四周壁。"""
    outer = Part.makeBox(BOX_L, BOX_W, BOX_H)  # 创建盒体外包络实体。
    inner = Part.makeBox(  # 创建略高于外壳的内腔切削体，确保顶部完全开口。
        BOX_L - 2 * WALL_T,  # 计算内腔长度。
        BOX_W - 2 * WALL_T,  # 计算内腔宽度。
        BOX_H - BOTTOM_T + 1.0,  # 计算内腔高度并向上多切1毫米。
        App.Vector(WALL_T, WALL_T, BOTTOM_T),  # 将内腔抬高以保留盒底。
    )  # 完成内腔切削体。
    return outer.cut(inner)  # 从外包络中切除内腔并返回盒体实体。

def make_lid():  # 定义带双卡边环槽的盒盖生成函数。
    """盒盖下方两圈卡边之间形成向下开口的连续环形槽。"""
    z0 = BOX_H - GROOVE_DEPTH  # 计算两圈卡边的最低高度。
    lid = Part.makeBox(  # 创建盒盖顶板。
        BOX_L + 2 * LID_OVERHANG,  # 计算盒盖总长度。
        BOX_W + 2 * LID_OVERHANG,  # 计算盒盖总宽度。
        LID_T,  # 写入盒盖顶板厚度。
        App.Vector(-LID_OVERHANG, -LID_OVERHANG, BOX_H),  # 将顶板居中放在盒体上方。
    )  # 完成盒盖顶板。

    # 外挡边：内侧比盒体外轮廓放大 CLEARANCE。
    c = ASSEMBLY_CLEARANCE  # 使用简短变量表示单侧间隙。
    t = OUTER_SKIRT_T  # 使用简短变量表示外挡边厚度。
    outer_bars = [  # 创建外圈四根连续挡边。
        Part.makeBox(BOX_L + 2 * (c + t), t, GROOVE_DEPTH,
                     App.Vector(-c - t, -c - t, z0)),  # 创建前侧外挡边。
        Part.makeBox(BOX_L + 2 * (c + t), t, GROOVE_DEPTH,
                     App.Vector(-c - t, BOX_W + c, z0)),  # 创建后侧外挡边。
        Part.makeBox(t, BOX_W + 2 * c, GROOVE_DEPTH,
                     App.Vector(-c - t, -c, z0)),  # 创建左侧外挡边。
        Part.makeBox(t, BOX_W + 2 * c, GROOVE_DEPTH,
                     App.Vector(BOX_L + c, -c, z0)),  # 创建右侧外挡边。
    ]  # 完成外挡边列表。

    # 内定位边：外侧比盒体内轮廓缩小 CLEARANCE。
    ix = WALL_T + c  # 计算内定位边左侧起点。
    iy = WALL_T + c  # 计算内定位边前侧起点。
    inner_l = BOX_L - 2 * (WALL_T + c)  # 计算内定位边外轮廓长度。
    inner_w = BOX_W - 2 * (WALL_T + c)  # 计算内定位边外轮廓宽度。
    t2 = INNER_LIP_T  # 使用简短变量表示内定位边厚度。
    inner_bars = [  # 创建内圈四根连续定位边。
        Part.makeBox(inner_l, t2, GROOVE_DEPTH, App.Vector(ix, iy, z0)),  # 创建前侧内定位边。
        Part.makeBox(inner_l, t2, GROOVE_DEPTH,
                     App.Vector(ix, iy + inner_w - t2, z0)),  # 创建后侧内定位边。
        Part.makeBox(t2, inner_w - 2 * t2, GROOVE_DEPTH,
                     App.Vector(ix, iy + t2, z0)),  # 创建左侧内定位边。
        Part.makeBox(t2, inner_w - 2 * t2, GROOVE_DEPTH,
                     App.Vector(ix + inner_l - t2, iy + t2, z0)),  # 创建右侧内定位边。
    ]  # 完成内定位边列表。

    # 不做 removeSplitter：保留装配用的盒盖底面子面。
    for bar in outer_bars + inner_bars:  # 依次遍历八根卡边。
        lid = lid.fuse(bar)  # 将每根卡边融合到盒盖顶板。
    return lid  # 返回保留装配基准子面的完整盒盖实体。

def planar_face_at(shape, z_value, center_x, center_y):  # 定义装配基准面查找函数。
    """寻找指定高度且质心匹配的装配基准平面。"""
    candidates = []  # 创建候选面列表。
    for index, face in enumerate(shape.Faces, 1):  # 遍历全部面并保留FreeCAD的一基索引。
        bb = face.BoundBox  # 读取候选面的包围盒。
        c = face.CenterOfMass  # 读取候选面的质心。
        if (abs(bb.ZMin - z_value) < 1e-6  # 检查面最低Z是否匹配。
                and abs(bb.ZMax - z_value) < 1e-6  # 检查面最高Z是否匹配，确保是水平面。
                and abs(c.x - center_x) < 1e-6  # 检查质心X坐标。
                and abs(c.y - center_y) < 1e-6):  # 检查质心Y坐标。
            candidates.append((index, face.Area))  # 记录匹配面的索引与面积。
    if not candidates:  # 检查是否成功找到基准面。
        raise RuntimeError("未找到装配基准面")  # 未找到时停止装配，避免错误引用。
    # 盒体取最大的环形顶面；盒盖取最小的槽底环形子面。
    return min(candidates, key=lambda item: item[1])[0]  # 返回槽底环形子面对应的最小面积索引。

def build_native_assembly(doc, box_obj, lid_obj, box_face, lid_face):  # 定义FreeCAD原生装配创建函数。
    """调用 FreeCAD 自带 Assembly 工作台创建装配、接地和固定关节。"""
    Gui.activateWorkbench("AssemblyWorkbench")  # 激活FreeCAD自带Assembly工作台。
    import JointObject  # 导入FreeCAD自带Assembly工作台的原生关节实现。
    assembly = doc.addObject("Assembly::AssemblyObject", "Assembly")  # 直接创建原生装配容器，避免依赖当前GUI选择状态。
    assembly.Label = "带盖储物盒装配体"  # 设置装配体中文名称。
    joint_group = assembly.newObject("Assembly::JointGroup", "Joints")  # 在装配体内创建原生关节组。
    assembly.addObject(box_obj)  # 将盒体加入装配容器。
    assembly.addObject(lid_obj)  # 将盒盖加入装配容器。
    doc.recompute()  # 重新计算装配文档。

    ground = joint_group.newObject("App::FeaturePython", "GroundedJoint")  # 在原生关节组中创建接地关节对象。
    JointObject.GroundedJoint(ground, box_obj)  # 用原生GroundedJoint API将盒体接地。
    JointObject.ViewProviderGroundedJoint(ground.ViewObject)  # 为接地关节安装原生视图提供器。
    doc.recompute()  # 重新计算接地状态。

    joint = joint_group.newObject("App::FeaturePython", "FixedJoint")  # 在原生关节组中创建固定关节对象。
    JointObject.Joint(joint, 0)  # 用原生Joint API初始化索引0对应的Fixed关节。
    JointObject.ViewProviderJoint(joint.ViewObject)  # 为固定关节安装原生视图提供器。
    joint.Label = "盒盖—盒体（固定装配）"  # 设置关节中文名称。
    refs = [  # 构造原生Joint API所需的两组连接器引用。
        (box_obj, ["Face%d" % box_face, "Face%d" % box_face]),  # 写入盒体连接器引用。
        (lid_obj, ["Face%d" % lid_face, "Face%d" % lid_face]),  # 写入盒盖连接器引用。
    ]  # 完成连接器引用列表。
    joint.Proxy.setJointConnectors(joint, refs)  # 将两组装配面写入固定关节。
    doc.recompute()  # 重新计算固定关节。
    return assembly, joint  # 返回装配容器与固定关节。

def main():  # 定义完整生成、装配、验证和导出流程。
    default_script_path = "/Users/wangzirui/教科研补件汇总/FreeCAD课题资料_按开题论证书设计/02_开发设计阶段_2025.07-12/03_教学样件_FCStd与STL/生成代码/05_带盖储物盒.py"  # 提供GUI桥无__file__时的兼容路径。
    script_path = globals().get("__file__", default_script_path)  # 优先采用脚本自身路径。
    out_dir = os.path.normpath(os.path.join(os.path.dirname(script_path), ".."))  # 获取教学样件输出目录。
    fcstd_path = os.path.join(out_dir, "05_带盖储物盒.FCStd")  # 定义FCStd输出路径。
    stl_path = os.path.join(out_dir, "05_带盖储物盒.stl")  # 定义STL输出路径。

    for name, open_doc in list(App.listDocuments().items()):  # 遍历当前已打开文档。
        same_output = bool(open_doc.FileName) and os.path.normpath(open_doc.FileName) == fcstd_path  # 判断是否已打开同一路径。
        same_session = open_doc.Name.startswith("StorageBox_Assembly")  # 判断是否为上次脚本遗留的未保存装配文档。
        if same_output or same_session:  # 合并两类需要关闭的旧文档条件。
            App.closeDocument(name)  # 关闭旧文档，防止覆盖失败。

    doc = App.newDocument("StorageBox_Assembly")  # 新建储物盒装配文档。
    box_shape = make_box_body()  # 生成开口盒体实体。
    lid_shape = make_lid()  # 生成带双卡边环槽的盒盖实体。

    box_obj = doc.addObject("Part::Feature", "BoxBody")  # 创建盒体特征对象。
    box_obj.Label = "盒体"  # 设置盒体中文名称。
    box_obj.Shape = box_shape  # 写入盒体形状。
    box_obj.addProperty("App::PropertyLength", "WallThickness", "参数", "盒体壁厚")  # 添加盒壁厚度属性。
    box_obj.WallThickness = WALL_T  # 写入盒壁厚度。
    box_obj.addProperty("App::PropertyLength", "BottomThickness", "参数", "盒底厚度")  # 添加盒底厚度属性。
    box_obj.BottomThickness = BOTTOM_T  # 写入盒底厚度。

    lid_obj = doc.addObject("Part::Feature", "BoxLid")  # 创建盒盖特征对象。
    lid_obj.Label = "盒盖（双卡边环形槽）"  # 设置盒盖中文名称并明确槽结构。
    lid_obj.Shape = lid_shape  # 写入盒盖形状。
    lid_obj.addProperty("App::PropertyLength", "GrooveWidth", "参数", "槽宽")  # 添加槽宽属性。
    lid_obj.GrooveWidth = WALL_T + 2 * ASSEMBLY_CLEARANCE  # 写入由盒壁和两侧间隙构成的3.2毫米槽宽。
    lid_obj.addProperty("App::PropertyLength", "GrooveDepth", "参数", "槽深")  # 添加槽深属性。
    lid_obj.GrooveDepth = GROOVE_DEPTH  # 写入6毫米槽深。
    lid_obj.addProperty("App::PropertyLength", "AssemblyClearance", "参数", "单侧装配间隙")  # 添加装配间隙属性。
    lid_obj.AssemblyClearance = ASSEMBLY_CLEARANCE  # 写入0.35毫米单侧间隙。

    box_obj.ViewObject.ShapeColor = (0.72, 0.86, 0.96)  # 设置盒体浅蓝色。
    lid_obj.ViewObject.ShapeColor = (0.96, 0.72, 0.26)  # 设置盒盖橙黄色以突出装配关系。
    box_obj.ViewObject.LineColor = (0.15, 0.25, 0.32)  # 设置盒体边线颜色。
    lid_obj.ViewObject.LineColor = (0.35, 0.20, 0.05)  # 设置盒盖边线颜色。

    doc.recompute()  # 重新计算两个零件。
    box_face = planar_face_at(box_shape, BOX_H, BOX_L / 2, BOX_W / 2)  # 查找盒体顶部环形基准面。
    lid_face = planar_face_at(lid_shape, BOX_H, BOX_L / 2, BOX_W / 2)  # 查找盒盖槽底环形基准面。
    assembly, joint = build_native_assembly(  # 创建原生装配体和固定关节。
        doc, box_obj, lid_obj, box_face, lid_face  # 传入文档、零件及两个装配基准面。
    )  # 完成原生装配创建。

    # 强制质量检查。
    if len(box_obj.Shape.Solids) != 1 or len(lid_obj.Shape.Solids) != 1:  # 检查盒体和盒盖是否分别为单实体。
        raise RuntimeError("盒体或盒盖不是单一实体")  # 分体时停止保存。
    interference = box_obj.Shape.common(lid_obj.Shape).Volume  # 计算闭合位置的相交体积。
    if interference > 1e-6:  # 判断是否存在超出数值容差的实体干涉。
        raise RuntimeError("装配干涉体积 %.6f mm³" % interference)  # 有干涉时停止保存。
    if not joint.Reference1 or not joint.Reference2:  # 检查固定关节是否保存了两端引用。
        raise RuntimeError("固定关节缺少装配引用")  # 引用不完整时停止保存。

    doc.recompute()  # 重新计算最终装配文档。
    doc.saveAs(fcstd_path)  # 保存包含原生Assembly对象的FCStd文件。
    Mesh.export([box_obj, lid_obj], stl_path)  # 导出盒体与盒盖的教学展示STL。

    print("带盖储物盒生成完成")  # 输出任务完成提示。
    print("  原生装配：%s (%s)" % (assembly.Label, assembly.TypeId))  # 输出装配对象类型。
    print("  固定关节：%s；盒体已接地" % joint.Label)  # 输出接地和关节信息。
    print("  环形槽：宽 %.2f mm，深 %.2f mm" %  # 输出槽宽与槽深。
          (lid_obj.GrooveWidth.Value, lid_obj.GrooveDepth.Value))  # 填入环形槽参数。
    print("  单侧装配间隙：%.2f mm" % lid_obj.AssemblyClearance.Value)  # 输出单侧装配间隙。
    print("  装配干涉体积：%.6f mm³" % interference)  # 输出干涉检查结果。

main()  # 执行完整生成流程。
