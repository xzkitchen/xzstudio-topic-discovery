# 熙崽选题发现工具 v1

每周日自动发现下周可拍的影视美食选题。

## 功能特点

- **豆瓣高分经典** - 从 Top250 中挖掘有美食场景的经典电影
- **热点老片追踪** - 发现近期有热度的重映/周年纪念电影
- **AI 深度分析** - Claude 分析美食场景、故事潜力、烹饪难度
- **三有评分** - 有趣 / 有话题 / 有热点 综合筛选
- **高级感 UI** - 深色主题 + 流畅动画 + 信息密度
- **定时运行** - 每周日 9:00 自动发现

## 快速开始

### 1. 后端启动

```bash
cd backend

# 创建虚拟环境
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp ../.env.example ../.env
# 编辑 .env 填入 ANTHROPIC_API_KEY

# 启动服务
cd ..
uvicorn backend.main:app --reload --port 8000
```

### 2. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 3. 配置定时任务 (macOS)

```bash
# 复制 plist 文件
cp scripts/com.xizai.topic-discovery.plist ~/Library/LaunchAgents/

# 加载定时任务
launchctl load ~/Library/LaunchAgents/com.xizai.topic-discovery.plist

# 查看状态
launchctl list | grep xizai

# 手动触发测试
launchctl start com.xizai.topic-discovery
```

## 项目结构

```
topic-discovery/
├── backend/
│   ├── main.py              # FastAPI 入口
│   ├── config.py            # 配置管理
│   ├── scheduler.py         # 定时任务
│   ├── api/
│   │   └── routes.py        # API 路由
│   ├── core/
│   │   └── discovery.py     # 选题发现核心逻辑
│   ├── scrapers/
│   │   ├── base.py          # 爬虫基类
│   │   └── douban.py        # 豆瓣爬虫
│   ├── analyzers/
│   │   ├── food_scene_analyzer.py   # 美食场景分析
│   │   └── story_evaluator.py       # 故事潜力评估
│   └── models/
│       ├── topic.py         # 数据模型
│       └── database.py      # SQLite 操作
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # 主页面
│   │   ├── components/      # UI 组件
│   │   ├── hooks/           # React hooks
│   │   └── styles/          # 样式
│   └── package.json
├── scripts/
│   ├── run_weekly.sh        # 手动运行脚本
│   └── com.xizai.topic-discovery.plist  # macOS 定时任务
└── data/                    # SQLite 数据库
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 服务信息 |
| GET | `/api/status` | 发现状态 |
| GET | `/api/topics` | 获取选题列表 |
| POST | `/api/discover` | 手动触发发现 |
| POST | `/api/topics/{id}/done` | 标记选题已完成 |

## 选题评分规则

```
总分 = 豆瓣分 × 5
     + 故事切入点潜力分之和
     + (有趣 ? 10 : 0)
     + (有话题 ? 8 : 0)
     + (有热点 ? 12 : 0)
     + (难度适中 ? 5 : -10)
```

## 已知限制

1. 豆瓣有反爬机制，请求间隔设为 2 秒
2. Claude API 调用有成本，建议控制分析数量
3. 热点老片的年份/评分可能不准确（需要进一步获取详情）

## 后续计划

- [ ] 添加知乎/小红书数据源
- [ ] 微信/飞书通知
- [ ] 选题管理（编辑、归档）
- [ ] 导出功能（Notion/飞书）

---

*为熙崽打造* ✨
