---
title: "一款支持闲鱼自动回复\自动发货的神奇工具-带安装教程"
author: "杨CC"
description: "闲鱼自动发货部署,支持Windows\Mac\Linux以及docker部署."
---

---

# 1-简介

 **一个功能完整的闲鱼自动回复和管理系统，支持多用户、多账号管理，具备智能回复、自动发货、自动确认发货、商品管理等企业级功能。**

 **注意:**工具演示在5.2

 首先,该工具是免费的,无需收费的.

 任何花钱购买的工具,请全部申请退款!

------

# 2-核心特性

### 🔐 多用户系统

- **用户注册登录** - 支持邮箱验证码注册，图形验证码保护
- **数据完全隔离** - 每个用户的数据独立存储，互不干扰
- **权限管理** - 严格的用户权限控制和JWT认证
- **安全保护** - 防暴力破解、会话管理、安全日志

### 📱 多账号管理

- **无限账号支持** - 每个用户可管理多个闲鱼账号
- **独立运行** - 每个账号独立监控，互不影响
- **实时状态** - 账号连接状态实时监控
- **批量操作** - 支持批量启动、停止账号任务

### 🤖 智能回复系统

- **关键词匹配** - 支持精确关键词匹配回复
- **指定商品回复** - 支持为特定商品设置专门的回复内容，优先级最高
- **商品专用关键词** - 支持为特定商品设置专用关键词回复
- **通用关键词** - 支持全局通用关键词，适用于所有商品
- **批量导入导出** - 支持Excel格式的关键词批量导入导出
- **AI智能回复** - 集成OpenAI API，支持上下文理解
- **变量替换** - 回复内容支持动态变量（用户名、商品信息、商品ID等）
- **优先级策略** - 指定商品回复 > 商品专用关键词 > 通用关键词 > 默认回复 > AI回复

### 🚚 自动发货功能

- **智能匹配** - 基于商品信息自动匹配发货规则
- **多规格支持** - 支持同一商品的不同规格自动匹配对应卡券
- **精确匹配+兜底机制** - 优先精确匹配规格，失败时自动降级到普通卡券
- **延时发货** - 支持设置发货延时时间（0-3600秒）
- **多种触发** - 支持付款消息、小刀消息等多种触发条件
- **防重复发货** - 智能防重复机制，避免重复发货
- **多种发货方式** - 支持固定文字、批量数据、API调用、图片发货等方式
- **图片发货** - 支持上传图片并自动发送给买家，图片自动上传到CDN
- **自动确认发货** - 检测到付款后自动调用闲鱼API确认发货，支持锁机制防并发
- **防重复确认** - 智能防重复确认机制，避免重复API调用
- **订单详情缓存** - 订单详情获取支持数据库缓存，大幅提升性能
- **发货统计** - 完整的发货记录和统计功能

### 🛍️ 商品管理

- **自动收集** - 消息触发时自动收集商品信息
- **API获取** - 通过闲鱼API获取完整商品详情
- **多规格支持** - 支持多规格商品的规格信息管理
- **批量管理** - 支持批量查看、编辑、切换多规格状态
- **智能去重** - 自动去重，避免重复存储

### 🔍 商品搜索功能

- **真实数据获取** - 基于Playwright技术获取真实闲鱼商品数据
- **智能排序** - 按”人想要”数量自动倒序排列
- **多页搜索** - 支持一次性获取多页商品数据
- **前端分页** - 灵活的前端分页显示
- **商品详情** - 支持查看完整商品详情信息

### 📊 系统监控

- **实时日志** - 完整的操作日志记录和查看
- **性能监控** - 系统资源使用情况监控
- **健康检查** - 服务状态健康检查

### 📁 数据管理

- **Excel导入导出** - 支持关键词数据的Excel格式导入导出
- **模板生成** - 自动生成包含示例数据的导入模板
- **批量操作** - 支持批量添加、更新关键词数据
- **数据验证** - 导入时自动验证数据格式和重复性
- **多规格卡券管理** - 支持创建和管理多规格卡券
- **发货规则管理** - 支持多规格发货规则的创建和管理
- **数据备份** - 自动数据备份和恢复
- **一键部署** - 提供预构建Docker镜像，无需编译即可快速部署

# 3-项目结构

<details open="" style="box-sizing: border-box; display: block; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin-top: 0px; margin-bottom: 16px; color: rgb(31, 35, 40); font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, &quot;Noto Sans&quot;, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;; font-size: 16px; background-color: rgb(255, 255, 255);"><summary style="box-sizing: border-box; display: list-item; cursor: pointer;">点击展开查看详细项目结构</summary><div class="snippet-clipboard-content notranslate position-relative overflow-auto" style="box-sizing: border-box; display: flex; justify-content: space-between; margin-bottom: 16px; background-color: rgb(246, 248, 250); position: relative !important; overflow: auto !important;"><pre class="notranslate" style="box-sizing: border-box; font-family: &quot;Monaspace Neon&quot;, ui-monospace, SFMono-Regular, &quot;SF Mono&quot;, Menlo, Consolas, &quot;Liberation Mono&quot;, monospace; font-size: 13.6px; overflow: auto; margin: 0px; padding: 16px; background: none 0% 0% / auto repeat scroll padding-box border-box rgb(246, 248, 250); color: rgb(31, 35, 40); line-height: 1.45; border-radius: 6px; tab-size: 4; overflow-wrap: normal;"><code style="box-sizing: border-box; font-family: &quot;Monaspace Neon&quot;, ui-monospace, SFMono-Regular, &quot;SF Mono&quot;, Menlo, Consolas, &quot;Liberation Mono&quot;, monospace; font-size: 13.6px; border-radius: 6px; padding: 0px; background: rgba(0, 0, 0, 0); color: rgb(144, 164, 174); text-shadow: none; tab-size: 4; margin: 0px; white-space: pre; word-break: normal; border: 0px; display: inline; overflow: visible; line-height: inherit; overflow-wrap: normal;">xianyu-auto-reply/
├── 📄 核心文件
│   ├── Start.py                    # 项目启动入口，初始化所有服务
│   ├── XianyuAutoAsync.py         # 闲鱼WebSocket连接和消息处理核心
│   ├── reply_server.py            # FastAPI Web服务器和完整API接口
│   ├── db_manager.py              # SQLite数据库管理，支持多用户数据隔离
│   ├── cookie_manager.py          # 多账号Cookie管理和任务调度
│   ├── ai_reply_engine.py         # AI智能回复引擎，支持多种AI模型
│   ├── file_log_collector.py      # 实时日志收集和管理系统
│   ├── config.py                  # 全局配置文件管理器
│   ├── secure_confirm_ultra.py    # 自动确认发货模块（多层加密保护）
│   └── secure_freeshipping_ultra.py # 自动免拼发货模块（多层加密保护）
├── 🛠️ 工具模块
│   └── utils/
│       ├── xianyu_utils.py        # 闲鱼API工具函数（加密、签名、解析）
│       ├── message_utils.py       # 消息格式化和处理工具
│       ├── ws_utils.py            # WebSocket客户端封装
│       ├── qr_login.py            # 二维码登录功能
│       ├── item_search.py         # 商品搜索功能（基于Playwright，无头模式）
│       ├── order_detail_fetcher.py # 订单详情获取工具
│       ├── image_utils.py         # 图片处理工具（压缩、格式转换）
│       └── image_uploader.py      # 图片上传到CDN工具
├── 🌐 前端界面
│   └── static/
│       ├── index.html             # 主管理界面（集成所有功能模块）
│       ├── login.html             # 用户登录页面
│       ├── register.html          # 用户注册页面（邮箱验证）
│       ├── user_management.html   # 用户管理页面（管理员功能）
│       ├── data_management.html   # 数据管理页面（导入导出）
│       ├── log_management.html    # 日志管理页面（实时日志查看）
│       ├── item_search.html       # 商品搜索页面（独立版本）
│       ├── js/
│       │   ├── app.js             # 主要JavaScript逻辑
│       │   └── modules/           # 模块化JavaScript文件
│       ├── css/
│       │   ├── variables.css      # CSS变量定义
│       │   ├── layout.css         # 布局样式
│       │   ├── components.css     # 组件样式
│       │   ├── accounts.css       # 账号管理样式
│       │   ├── keywords.css       # 关键词管理样式
│       │   ├── items.css          # 商品管理样式
│       │   ├── logs.css           # 日志管理样式
│       │   ├── notifications.css  # 通知样式
│       │   ├── dashboard.css      # 仪表板样式
│       │   ├── admin.css          # 管理员样式
│       │   └── app.css            # 主应用样式
│       ├── lib/
│       │   ├── bootstrap/         # Bootstrap框架
│       │   └── bootstrap-icons/   # Bootstrap图标
│       ├── uploads/
│       │   └── images/            # 上传的图片文件
│       ├── xianyu_js_version_2.js # 闲鱼JavaScript工具库
│       ├── wechat-group.png       # 微信群二维码
│       └── qq-group.png           # QQ群二维码
├── 🐳 Docker部署
│   ├── Dockerfile                 # Docker镜像构建文件
│   ├── docker-compose.yml        # Docker Compose一键部署配置
│   ├── docker-deploy.sh          # Docker部署管理脚本（Linux/macOS）
│   ├── docker-deploy.bat         # Docker部署管理脚本（Windows）
│   └── entrypoint.sh              # Docker容器启动脚本
├── 📋 配置文件
│   ├── global_config.yml         # 全局配置文件（WebSocket、API等）
│   ├── requirements.txt          # Python依赖包列表（精简版）
│   ├── .gitignore                # Git忽略文件配置
│   └── README.md                 # 项目说明文档
└── 📊 数据目录（运行时创建）
    ├── data/                     # 数据目录（Docker挂载）
    │   └── xianyu_data.db        # SQLite数据库文件
    ├── logs/                     # 按日期分割的日志文件
    └── backups/                  # 数据备份文件
</code></pre><div class="zeroclipboard-container" style="box-sizing: border-box; display: block; animation: auto ease 0s 1 normal none running none;"></div></div></details>

# 4-安装以及使用

### 环境要求

- **Python**: 3.11+
- **Node.js**: 16+ (用于JavaScript执行)
- **系统**: Windows/Linux/macOS
- **内存**: 建议2GB+
- **存储**: 建议10GB+
- **Docker**: 20.10+ (Docker部署)
- **Docker Compose**: 2.0+ (Docker部署)

## 4.1 小白安装(安装即用)

### 4.1.1 安装Docker

首先,你需要安装docker

- Windows 请自行搜索下载Docker

------

------

- Linux 下,请自行搜索下载Docker

### 4.1.2 Linux\Mac OS 本地安装

- 创建目录
- mkdir -p xianyu-auto-reply
- 启动容器
- docker run -d
  -p 8080:8080
  -v $PWD/xianyu-auto-reply/:/app/data/
  –name xianyu-auto-reply
  registry.cn-shanghai.aliyuncs.com/zhinian-software/xianyu-auto-reply:1.0
- 启动系统
- [http://localhost:8080](http://localhost:8080/)
- [http://127.0.0.1:8080](http://127.0.0.1:8080/)
- 上方两个链接均可访问.

### 4.1.3 Windows 本地安装

- 创建数据目录
- mkdir xianyu-auto-reply
- 启动容器
- docker run -d -p 8080:8080 -v %cd%/xianyu-auto-reply/:/app/data/ –name xianyu-auto-reply registry.cn-shanghai.aliyuncs.com/zhinian-software/xianyu-auto-reply:1.0
- 访问系统
- [http://localhost:8080](http://localhost:8080/)
- [http://127.0.0.1:8080](http://127.0.0.1:8080/)
- 上方两个链接均可访问.

### 4.1.4 云端安装

- 与上方本地安装方式一致,但需要注意查看云端的ip
- 1.Linux安装net-tools工具套
- sudo apt install net-tools # debian系列
- sudo yum install net-tools # redhat系列
- sudo pacman -Sy net-tools # arch系列
- 2.Windows下无需下载net-tools
- 3.开放防火墙8080端口(不会的看服务器文档)
- 4.通过上方本地安装的教程,进行云端安装
- 5.访问:http://你的ip:8080 进行访问即可

## 4.2 源码构建部署(推荐资深玩家部署)

### 4.2.1 Linux\MAC OS 构建

需要安装python环境,最好在python3.11以上(自行百度)

1. 克隆项目

- git clone https://github.com/zhinianboke/xianyu-auto-reply.git
- cd xianyu-auto-reply

1. 设置脚本执行权限（Linux/macOS）

- chmod +x docker-deploy.sh

1. 一键部署（自动构建镜像）

- ./docker-deploy.sh

1. 访问系统

- [http://localhost:8080](http://localhost:8080/)

### 4.2.2 Windows 构建

需要安装python环境,最好在python3.11以上(自行百度)

- 克隆项目
- git clone https://github.com/zhinianboke/xianyu-auto-reply.git
- cd xianyu-auto-reply
- 使用Windows批处理脚本（推荐）
- docker-deploy.bat
- 或者使用Git Bash/WSL
- bash docker-deploy.sh
- 或者直接使用Docker Compose
- docker-compose up -d –build

# 5-核心功能以及演示

## 5.1 核心功能

### 🚀 自动回复系统

- **智能关键词匹配** - 支持精确匹配和模糊匹配，灵活配置回复规则
- **AI智能回复** - 集成多种AI模型（通义千问、GPT等），智能理解用户意图
- **多账号管理** - 支持同时管理多个闲鱼账号，独立配置和运行
- **实时消息处理** - WebSocket长连接，毫秒级响应用户消息
- **自定义回复模板** - 支持占位符和动态内容，个性化回复体验

### 🛒 自动发货系统

- **智能订单识别** - 自动识别虚拟商品订单，精准匹配发货规则
- **多重安全验证** - 超级加密保护，防止误操作和数据泄露
- **批量处理能力** - 支持批量确认发货，提高处理效率
- **异常处理机制** - 完善的错误处理和重试机制，确保发货成功
- **多渠道通知** - 支持QQ、钉钉、邮件等多种发货通知方式

### 👥 多用户系统

- **用户注册登录** - 支持邮箱验证和图形验证码，安全可靠
- **权限管理** - 管理员和普通用户权限分离，精细化权限控制
- **数据隔离** - 每个用户的数据完全隔离，保护隐私安全
- **会话管理** - JWT Token认证，支持自动续期和安全登出

### 📊 数据管理

- **商品信息管理** - 自动获取和同步商品信息，实时更新状态
- **订单数据统计** - 详细的订单数据分析和可视化图表
- **关键词管理** - 灵活的关键词配置，支持正则表达式
- **数据导入导出** - 支持Excel格式的批量数据操作
- **自动备份** - 定期自动备份重要数据，防止数据丢失

### 🔍 商品搜索

- **真实数据获取** - 基于Playwright技术，无头模式获取真实闲鱼商品数据
- **多页搜索** - 支持分页搜索和批量获取，无限制数据采集
- **智能排序** - 按”人想要”数量自动倒序排列，优先显示热门商品
- **数据可视化** - 美观的商品展示界面，支持排序和筛选
- **前端分页** - 灵活的前端分页显示，提升用户体验
- **账号状态验证** - 自动检查cookies启用状态，确保搜索功能正常

### 📱 通知系统

- **多渠道支持** - QQ、钉钉、邮件、微信、Telegram等6种通知方式
- **智能配置** - 可视化配置界面，支持复杂参数和加密设置
- **实时推送** - 重要事件实时通知，及时了解系统状态
- **通知模板** - 自定义通知内容和格式，个性化消息推送

### 🔐 安全特性

- **Cookie安全管理** - 加密存储用户凭证，定期自动刷新
- **Token自动刷新** - 智能检测和刷新过期Token，保持连接稳定
- **操作日志** - 详细记录所有操作日志，支持审计和追踪
- **异常监控** - 实时监控系统异常和错误，主动预警

### 🎨 用户界面

- **现代化设计** - 基于Bootstrap 5的响应式界面，美观易用
- **多主题支持** - 支持明暗主题切换，个性化界面体验
- **移动端适配** - 完美适配手机和平板设备，随时随地管理
- **实时更新** - 界面数据实时更新，无需手动刷新

## 5.2 工具演示

### 登录页面

[![img](https://pic1.imgdb.cn/item/68a72d1e58cb8da5c8413d94.png)](https://pic1.imgdb.cn/item/68a72d1e58cb8da5c8413d94.png)

### 注册页面

[![img](https://pic1.imgdb.cn/item/68a72d4c58cb8da5c8413d98.png)](https://pic1.imgdb.cn/item/68a72d4c58cb8da5c8413d98.png)

### 首页

[![img](https://pic1.imgdb.cn/item/68a72d6f58cb8da5c8413db3.png)](https://pic1.imgdb.cn/item/68a72d6f58cb8da5c8413db3.png)

### 账号管理

[![img](https://pic1.imgdb.cn/item/68a72d8958cb8da5c8413dcc.png)](https://pic1.imgdb.cn/item/68a72d8958cb8da5c8413dcc.png)

### 商品管理

[![img](https://pic1.imgdb.cn/item/68a72da058cb8da5c8413ddf.png)](https://pic1.imgdb.cn/item/68a72da058cb8da5c8413ddf.png)

### 订单管理

[![img](https://pic1.imgdb.cn/item/68a72db858cb8da5c8413de6.png)](https://pic1.imgdb.cn/item/68a72db858cb8da5c8413de6.png)

### 自动回复

[![img](https://pic1.imgdb.cn/item/68a72dd958cb8da5c8413def.png)](https://pic1.imgdb.cn/item/68a72dd958cb8da5c8413def.png)

### 指定商品回复

[![img](https://pic1.imgdb.cn/item/68a72df758cb8da5c8413df4.png)](https://pic1.imgdb.cn/item/68a72df758cb8da5c8413df4.png)

### 自动发货

[![img](https://pic1.imgdb.cn/item/68a72e1558cb8da5c8413df9.png)](https://pic1.imgdb.cn/item/68a72e1558cb8da5c8413df9.png)

### 消息通知支持平台

[![img](https://pic1.imgdb.cn/item/68a72e4d58cb8da5c8413e15.png)](https://pic1.imgdb.cn/item/68a72e4d58cb8da5c8413e15.png)

### 用户管理

[![img](https://pic1.imgdb.cn/item/68a72e6358cb8da5c8413e1a.png)](https://pic1.imgdb.cn/item/68a72e6358cb8da5c8413e1a.png)

## 6-结尾想说的话

- 需要技术文章,记得将ycc77.com 添加到书签栏哦~
- 需要资源,记得将yancy77.cn 添加到书签栏哦~
- B站: 疯狂的杨CC(需要使用视频,请选择这个)
- 抖音: 疯狂的杨CC
- 快手: 疯狂的杨CC
- P站: 疯狂的杨CC
- QQ交流群:660264846(满)
- QQ交流群2:721170435