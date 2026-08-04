// ============================================================
// STEAM 3D打印校本课程网站 — 交互脚本
// 功能：滚动淡入动画、代码高亮、进度条、平滑滚动
// ============================================================

// ---- 1. 滚动淡入动画 ----
// 监听滚动事件，元素进入视口时添加 animate 类触发动画
// 默认内容可见（opacity:1），动画只是增强效果，不控制可见性
function initScrollAnimation() {
  var observer = new IntersectionObserver(function(entries) {  // 创建 IntersectionObserver 监听元素进入视口
    entries.forEach(function(entry) {  // 遍历每个进入视口的元素
      if (entry.isIntersecting) {  // 如果元素进入了视口
        entry.target.classList.add('animate');  // 添加 animate 类触发 CSS 淡入动画
      }
    });
  }, { threshold: 0.1 });  // 阈值0.1：元素10%进入视口时触发

  var fadeElements = document.querySelectorAll('.fade-in');  // 获取所有带 fade-in 类的元素
  fadeElements.forEach(function(el) {  // 遍历每个元素
    observer.observe(el);  // 开始监听
  });
}

// ---- 2. 代码高亮 ----
// 对 .code-block pre 内的代码进行简单语法高亮
function initCodeHighlight() {
  var blocks = document.querySelectorAll('.code-block pre');  // 获取所有代码块
  blocks.forEach(function(block) {  // 遍历每个代码块
    var html = block.innerHTML;  // 获取原始HTML

    // 先转义HTML特殊字符，防止XSS
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 高亮注释（# 开头的行）
    html = html.replace(/(#[^\n]*)/g, '<span class="comment">$1</span>');

    // 高亮字符串（引号内内容）
    html = html.replace(/("[^"]*")/g, '<span class="string">$1</span>');
    html = html.replace(/('[^']*')/g, '<span class="string">$1</span>');

    // 高亮关键字
    var keywords = ['import', 'from', 'def', 'for', 'in', 'if', 'else', 'elif', 'while', 'return', 'class', 'print', 'True', 'False', 'None', 'as', 'with', 'try', 'except'];
    keywords.forEach(function(kw) {  // 遍历每个关键字
      var regex = new RegExp('\\b' + kw + '\\b', 'g');  // 构建正则（单词边界）
      html = html.replace(regex, '<span class="keyword">' + kw + '</span>');  // 替换为带样式的span
    });

    // 高亮数字
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

    // 高亮函数调用（单词后跟括号）
    html = html.replace(/(\b[A-Za-z_]\w*)(\s*\()/g, '<span class="function">$1</span>$2');

    block.innerHTML = html;  // 写回高亮后的HTML
  });
}

// ---- 3. 阅读进度条 ----
// 顶部显示阅读进度
function initProgressBar() {
  var bar = document.createElement('div');  // 创建进度条元素
  bar.className = 'progress-bar';  // 设置类名
  bar.style.width = '0%';  // 初始宽度0
  document.body.appendChild(bar);  // 添加到页面

  window.addEventListener('scroll', function() {  // 监听滚动
    var scrollTop = document.documentElement.scrollTop;  // 已滚动距离
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;  // 总可滚动距离
    var progress = (scrollTop / scrollHeight) * 100;  // 计算进度百分比
    bar.style.width = progress + '%';  // 设置进度条宽度
  });
}

// ---- 4. 平滑滚动 ----
// 点击锚链接平滑滚动到目标位置
function initSmoothScroll() {
  var links = document.querySelectorAll('a[href^="#"]');  // 获取所有以#开头的链接
  links.forEach(function(link) {  // 遍历每个链接
    link.addEventListener('click', function(e) {  // 添加点击事件
      var targetId = this.getAttribute('href');  // 获取目标ID
      if (targetId === '#') return;  // 如果是#则跳过
      var target = document.querySelector(targetId);  // 查找目标元素
      if (target) {  // 如果找到目标
        e.preventDefault();  // 阻止默认跳转
        target.scrollIntoView({ behavior: 'smooth' });  // 平滑滚动
      }
    });
  });
}

// ---- 5. 页面加载完成后初始化所有功能 ----
document.addEventListener('DOMContentLoaded', function() {  // DOM加载完成后执行
  initScrollAnimation();  // 初始化滚动动画
  initCodeHighlight();    // 初始化代码高亮
  initProgressBar();      // 初始化进度条
  initSmoothScroll();     // 初始化平滑滚动
});
