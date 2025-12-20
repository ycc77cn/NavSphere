import os
import subprocess
import datetime
from pathlib import Path
import sys

def check_pandoc():
    """检查 pandoc 是否安装"""
    try:
        subprocess.run(
            ["pandoc", "--version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def get_current_date():
    """获取当前时间，格式：YYYY-MM-DD HH:MM:SS"""
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def generate_index_html(success_files, publish_date):
    """生成索引页 index.html，复用模板风格，指向 html 目录下的文件"""
    # 索引页标题和副标题
    index_title = "文档索引"
    index_subtitle = f"{index_title}_疯狂的杨CC_杨CC技术录：https://ycc77.cn 或 https://ycc77.com 发布时间：{publish_date}"
    
    # 索引页 HTML 内容（保持模板风格，适配多级目录链接）
    index_html_content = f'''<!DOCTYPE html>
<html lang="zh-CN" class="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="https://pic1.imgdb.cn/item/68f1b8ccc5157e1a887a8c09.png" type="image/x-icon">
    <title>{index_title}</title>
    <!-- 引入 Inter 字体 -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- 代码高亮（保持和模板一致） -->
    <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-okaidia.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
    <script async="" src="https://01987425-44bc-77e0-a189-165a6b6e93b4.spst2.com/ustat.js"></script>
    <style>
        /* 全局变量：和模板保持一致 */
        :root.light {{
            --bg-primary: #ffffff;
            --bg-secondary: #f8fafc;
            --bg-sidebar: #f1f5f9;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --accent: #2563eb;
            --accent-light: #3b82f6;
            --border: #e2e8f0;
            --code-bg: #f8fafc;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }}
        :root.dark {{
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-sidebar: #1e293b;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #3b82f6;
            --accent-light: #60a5fa;
            --border: #334155;
            --code-bg: #1e293b;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }}

        /* 全局重置 & 基础样式 */
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }}
        body {{
            font-family: 'Inter', '思源黑体', 'Microsoft YaHei', sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.8;
            overflow-x: hidden;
        }}
        a {{
            color: var(--accent);
            text-decoration: none;
            transition: color 0.2s ease;
        }}
        a:hover {{
            color: var(--accent-light);
            text-decoration: underline;
        }}

        /* 导航栏：和模板一致 */
        .navbar {{
            position: sticky;
            top: 0;
            z-index: 100;
            background-color: var(--bg-primary);
            border-bottom: 1px solid var(--border);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: var(--shadow);
        }}
        .navbar-title {{
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(90deg, var(--accent), var(--accent-light));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }}
        .mode-toggle {{
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 0.5rem 1rem;
            color: var(--text-primary);
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}
        .mode-toggle:hover {{
            background: var(--border);
        }}

        /* 主体容器：优雅居中 */
        .container {{
            max-width: 1000px;
            margin: 3rem auto;
            padding: 0 2rem;
        }}

        /* 文档列表样式：适配多级目录，简洁炫酷 */
        .doc-list {{
            list-style: none;
            margin-top: 2rem;
            display: grid;
            gap: 1rem;
        }}
        .doc-item {{
            background-color: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1.2rem 1.5rem;
            box-shadow: var(--shadow);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }}
        .doc-item:hover {{
            transform: translateY(-2px);
            box-shadow: 0 8px 12px -1px rgba(0, 0, 0, 0.15);
        }}
        .doc-path {{
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-bottom: 0.3rem;
        }}
        .doc-name {{
            font-size: 1.1rem;
            font-weight: 600;
        }}
        .doc-meta {{
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-top: 0.3rem;
        }}

        /* 页脚：和模板一致 */
        .footer {{
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            border-top: 1px solid var(--border);
            margin-top: 3rem;
            font-size: 0.9rem;
        }}

        /* 响应式适配 */
        @media (max-width: 900px) {{
            .navbar {{
                padding: 1rem;
            }}
            .container {{
                margin: 2rem auto;
                padding: 0 1rem;
            }}
            .doc-item {{
                padding: 1rem;
            }}
            .doc-path {{
                font-size: 0.8rem;
            }}
        }}

        /* 平滑滚动 */
        html {{
            scroll-behavior: smooth;
        }}
    </style>
</head>
<body>
    <!-- 导航栏 -->
    <nav class="navbar">
        <div class="navbar-title">{index_title}</div>
        <button class="mode-toggle" id="modeToggle">
            <span id="modeIcon">🌞</span>
            <span id="modeText">切换暗黑模式</span>
        </button>
    </nav>

    <!-- 主体内容 -->
    <div class="container">
        <h1>文档列表</h1>
        <p style="color: var(--text-secondary); margin-top: 0.5rem;">共 {len(success_files)} 个文档，生成时间：{publish_date}</p>
        
        <ul class="doc-list">
            {"".join([f'''
            <li class="doc-item">
                <div class="doc-path">路径：{os.path.dirname(file)}</div>
                <div class="doc-name"><a href="{file}">{os.path.basename(file).replace('.html', '')}</a></div>
                <div class="doc-meta">生成时间：{publish_date}</div>
            </li>
            ''' for file in sorted(success_files)])}
        </ul>
    </div>

    <!-- 页脚 -->
    <footer class="footer">
        <p>文档索引页 · 生成时间：{publish_date} · 杨CC技术录：https://ycc77.cn</p>
    </footer>

    <script>
        // 暗黑/亮色模式切换（和模板一致）
        const html = document.documentElement;
        const modeToggle = document.getElementById('modeToggle');
        const modeIcon = document.getElementById('modeIcon');
        const modeText = document.getElementById('modeText');

        const savedMode = localStorage.getItem('colorMode');
        if (savedMode === 'dark') {{
            html.classList.remove('light');
            html.classList.add('dark');
            modeIcon.textContent = '🌙';
            modeText.textContent = '切换亮色模式';
        }}

        modeToggle.addEventListener('click', () => {{
            if (html.classList.contains('light')) {{
                html.classList.remove('light');
                html.classList.add('dark');
                localStorage.setItem('colorMode', 'dark');
                modeIcon.textContent = '🌙';
                modeText.textContent = '切换亮色模式';
            }} else {{
                html.classList.add('light');
                html.classList.remove('dark');
                localStorage.setItem('colorMode', 'light');
                modeIcon.textContent = '🌞';
                modeText.textContent = '切换亮色模式';
            }}
        }});
    </script>
</body>
</html>'''
    
    # 写入 index.html 文件（根目录）
    index_file = Path("index.html")
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(index_html_content)
    
    print(f"\n✅ 索引页生成成功：{index_file.absolute()}")

def batch_convert_md_to_html():
    """批量转换 docs 目录下所有层级的 MD 文件，保持目录结构输出到 html 目录"""
    # 1. 基础配置
    TEMPLATE_PATH = "elegant-template.html"  # pandoc 模板路径
    DOCS_ROOT = Path("docs")  # MD 文件根目录
    HTML_ROOT = Path("html")  # HTML 输出根目录
    SUPPORTED_EXT = ".md"  # 仅处理 md 文件

    # 2. 前置检查
    if not check_pandoc():
        print("❌ 错误：未检测到 pandoc，请先安装 pandoc（参考：https://pandoc.org/installing.html）")
        sys.exit(1)

    if not DOCS_ROOT.exists():
        print(f"❌ 错误：目录 {DOCS_ROOT.absolute()} 不存在，请确认路径是否正确")
        sys.exit(1)

    if not Path(TEMPLATE_PATH).exists():
        print(f"❌ 错误：模板文件 {TEMPLATE_PATH} 不存在，请确认模板路径")
        sys.exit(1)

    # 3. 创建 HTML 根目录（不存在则创建）
    HTML_ROOT.mkdir(exist_ok=True)
    print(f"📁 HTML 输出目录：{HTML_ROOT.absolute()}")

    # 4. 获取当前时间
    publish_date = get_current_date()
    print(f"📅 当前发布时间：{publish_date}")

    # 5. 递归遍历 docs 下所有 MD 文件（包括所有子目录）
    md_files = list(DOCS_ROOT.rglob(f"*{SUPPORTED_EXT}"))  # rglob 递归查找
    if not md_files:
        print(f"⚠️ 警告：目录 {DOCS_ROOT.absolute()} 下未找到任何 {SUPPORTED_EXT} 文件")
        sys.exit(0)

    print(f"🔍 共找到 {len(md_files)} 个 MD 文件（含子目录），开始转换...\n")

    # 6. 逐个转换（记录成功的 HTML 文件相对路径）
    success_count = 0
    fail_count = 0
    success_files = []  # 保存成功生成的 HTML 文件（相对于根目录的路径，如 html/子目录/文件.html）
    
    for md_file in md_files:
        try:
            # --- 核心：计算路径映射 ---
            # 步骤1：获取 MD 文件相对于 docs 的相对路径（如：sub1/sub2/test.md）
            md_rel_path = md_file.relative_to(DOCS_ROOT)
            # 步骤2：替换后缀为 .html，得到 HTML 相对于 html 根目录的路径（如：sub1/sub2/test.html）
            html_rel_path = md_rel_path.with_suffix(".html")
            # 步骤3：拼接 HTML 完整输出路径（如：html/sub1/sub2/test.html）
            html_file = HTML_ROOT / html_rel_path
            # 步骤4：创建 HTML 文件所在的目录（自动创建多级目录）
            html_file.parent.mkdir(parents=True, exist_ok=True)

            # --- 构造 pandoc 参数 ---
            # 标题：MD 文件名（去掉后缀）
            title = md_file.stem
            # 副标题（按要求构造，不显示在页面）
            subtitle = f"{title}_疯狂的杨CC_杨CC技术录：https://ycc77.cn 或 https://ycc77.com 发布时间：{publish_date}"
            # HTML 文件相对根目录的路径（用于 index.html 链接）
            html_root_rel_path = Path("html") / html_rel_path

            # 构造 pandoc 命令
            pandoc_cmd = [
                "pandoc",
                str(md_file.absolute()),  # MD 文件绝对路径（避免相对路径问题）
                "-o", str(html_file.absolute()),  # HTML 输出绝对路径
                "-s",
                "--template", str(Path(TEMPLATE_PATH).absolute()),  # 模板绝对路径
                "--metadata", f"title={title}",
                "--metadata", f"subtitle={subtitle}",
                "--metadata", f"date={publish_date}",
                "--toc",
                "--toc-depth=6",
                "-f", "gfm"
            ]

            # 执行 pandoc 转换
            subprocess.run(
                pandoc_cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                check=True,
                encoding="utf-8"
            )

            # 记录成功的文件（转为字符串，兼容跨平台路径）
            success_files.append(str(html_root_rel_path).replace("\\", "/"))  # Windows 路径转 /
            print(f"✅ 转换成功：{md_file.relative_to(DOCS_ROOT)} → {html_file.relative_to(HTML_ROOT)}")
            success_count += 1

        except subprocess.CalledProcessError as e:
            print(f"❌ 转换失败：{md_file.relative_to(DOCS_ROOT)} → 错误信息：{e.stderr.strip()}")
            fail_count += 1
        except Exception as e:
            print(f"❌ 转换异常：{md_file.relative_to(DOCS_ROOT)} → 异常信息：{str(e)}")
            fail_count += 1

    # 7. 生成索引页（仅当有成功文件时）
    if success_files:
        generate_index_html(success_files, publish_date)
    else:
        print("\n⚠️ 警告：无成功转换的文件，跳过索引页生成")

    # 8. 转换结果汇总
    print("\n" + "="*60)
    print(f"📊 转换完成：成功 {success_count} 个，失败 {fail_count} 个")
    print(f"📁 MD 源目录：{DOCS_ROOT.absolute()}")
    print(f"📁 HTML 输出目录：{HTML_ROOT.absolute()}")
    print(f"📄 索引页路径：{Path('index.html').absolute()}")
    if fail_count > 0:
        print("⚠️  请检查失败文件的路径/内容，或 pandoc 命令是否正确")

if __name__ == "__main__":
    print("🚀 开始批量转换 MD 到 HTML（递归处理多级目录）")
    print("="*60)
    batch_convert_md_to_html()