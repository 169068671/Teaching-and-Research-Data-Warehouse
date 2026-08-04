# -*- coding: utf-8 -*-
# ============================================================
# 06_模块一_3D打印启蒙演示.py — 模块一教学演示道具（）
# ============================================================
# 模块一内容：3D打印新视界与STEAM启蒙（无实践项目要求）
# 本样件：5个基础几何体（立方体+圆柱+球体+圆锥+组合），让学生认识3D打印能做什么
# 建模方式：Python 参数化建模（Part 模块基础几何体）
# ============================================================

import FreeCAD, Part, Mesh, os  # 导入 FreeCAD、Part、Mesh、os

# ---- 创建文档 ----
doc = FreeCAD.newDocument("Module1_Intro")  # 新建文档

# ---- 1. 立方体（25×25×25mm）----
box = Part.makeBox(25, 25, 25, FreeCAD.Vector(0, 0, 0))  # 创建立方体，边长25mm
box_obj = doc.addObject("Part::Feature", "01_立方体")  # 添加到文档
box_obj.Shape = box  # 赋值

# ---- 2. 圆柱（半径12，高30mm）----
cyl = Part.makeCylinder(12, 30, FreeCAD.Vector(40, 12, 0))  # 创建圆柱，R12，H30，位置(40,12,0)
cyl_obj = doc.addObject("Part::Feature", "02_圆柱")  # 添加到文档
cyl_obj.Shape = cyl  # 赋值

# ---- 3. 球体（半径12mm）----
sphere = Part.makeSphere(12, FreeCAD.Vector(80, 12, 12))  # 创建球体，R12，圆心(80,12,12)
sphere_obj = doc.addObject("Part::Feature", "03_球体")  # 添加到文档
sphere_obj.Shape = sphere  # 赋值

# ---- 4. 圆锥（底半径12，高25mm）----
cone = Part.makeCone(12, 0, 25, FreeCAD.Vector(110, 12, 0))  # 创建圆锥，底R12，顶R0，H25
cone_obj = doc.addObject("Part::Feature", "04_圆锥")  # 添加到文档
cone_obj.Shape = cone  # 赋值

# ---- 5. 组合（立方体+圆柱布尔并，展示"组合建模"）----
union = box.fuse(cyl)  # 布尔并：立方体与圆柱合并
union_obj = doc.addObject("Part::Feature", "05_组合_立方体与圆柱")  # 添加到文档
union_obj.Shape = union  # 赋值

# ---- 6. 重新计算 ----
doc.recompute()  # 更新文档

# ---- 7. 保存文件 ----
out_dir = os.path.dirname(os.path.abspath(__file__))  # 脚本目录
fcstd_path = os.path.join(out_dir, "..", "06_模块一_3D打印启蒙演示.FCStd")  # FCStd 路径
doc.saveAs(fcstd_path)  # 保存
stl_path = os.path.join(out_dir, "..", "06_模块一_3D打印启蒙演示.stl")  # STL 路径
Mesh.export([box_obj, cyl_obj, sphere_obj, cone_obj, union_obj], stl_path)  # 导出全部5个几何体

# ---- 输出结果 ----
print(f"模块一启蒙演示生成完成：5个基础几何体（立方体+圆柱+球体+圆锥+组合）")
