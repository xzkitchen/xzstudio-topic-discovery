# 一条龙工作流 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为选题添加完整的制作工作流，从确认选题到生成发布物料的6个阶段

**Architecture:**
- 前端使用 React Router 实现页面路由，新建 WorkflowPage 组件
- 工作流进度存储在后端数据库，支持断点续做
- 每个阶段是独立组件，通过 Stepper 组件串联

**Tech Stack:** React 18, React Router, Framer Motion, FastAPI, SQLite

---

## 阶段概览

```
┌─────────────────────────────────────────────────────────────────┐
│  TopicCard [开始制作] → WorkflowPage                            │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: 选题确认    → 显示选题详情，确认开始                    │
│  Step 2: 素材挖掘    → AI生成20+条素材，用户筛选                 │
│  Step 3: 大纲&初稿   → 选择大纲→生成初稿→审核修改                │
│  Step 4: 食材清单    → 勾选需采购的食材，一键复制                │
│  Step 5: 拍摄清单    → 拍摄准备checklist                        │
│  Step 6: 发布物料    → 封面文字、平台文案                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Task 1: 添加 React Router

**Files:**
- Modify: `frontend/package.json` - 添加依赖
- Modify: `frontend/src/main.tsx` - 配置 Router
- Modify: `frontend/src/App.tsx` - 改为路由组件

**Step 1: 安装 react-router-dom**

```bash
cd frontend && npm install react-router-dom
```

**Step 2: 修改 main.tsx**

```tsx
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

**Step 3: 修改 App.tsx 添加路由**

```tsx
import { Routes, Route } from 'react-router-dom'
import { WorkflowPage } from './pages/WorkflowPage'

// 在 App 组件中添加路由
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/workflow/:topicId" element={<WorkflowPage />} />
</Routes>
```

---

## Task 2: 创建 WorkflowPage 页面框架

**Files:**
- Create: `frontend/src/pages/WorkflowPage.tsx`
- Create: `frontend/src/pages/HomePage.tsx` - 从 App.tsx 抽取
- Create: `frontend/src/components/workflow/WorkflowStepper.tsx`

**Step 1: 创建 HomePage**

将 App.tsx 中的列表逻辑抽取到 HomePage.tsx

**Step 2: 创建 WorkflowStepper 组件**

```tsx
interface WorkflowStepperProps {
  currentStep: number
  steps: { id: string; title: string; completed: boolean }[]
  onStepClick: (step: number) => void
}
```

**Step 3: 创建 WorkflowPage 骨架**

```tsx
export function WorkflowPage() {
  const { topicId } = useParams()
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { id: 'confirm', title: '选题确认' },
    { id: 'materials', title: '素材挖掘' },
    { id: 'draft', title: '大纲&初稿' },
    { id: 'ingredients', title: '食材清单' },
    { id: 'shooting', title: '拍摄清单' },
    { id: 'publish', title: '发布物料' },
  ]

  return (
    <div>
      <WorkflowStepper steps={steps} currentStep={currentStep} />
      {/* 阶段内容渲染 */}
    </div>
  )
}
```

---

## Task 3: TopicCard 添加「开始制作」按钮

**Files:**
- Modify: `frontend/src/components/TopicCard.tsx`

**Step 1: 添加按钮到卡片底部**

在豆瓣链接旁边添加「开始制作」按钮，使用 `useNavigate` 跳转

```tsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

<button
  onClick={() => navigate(`/workflow/${topic.id}`)}
  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors text-xs font-medium"
>
  <Play size={12} />
  开始制作
</button>
```

---

## Task 4: 阶段1 - 选题确认组件

**Files:**
- Create: `frontend/src/components/workflow/StepConfirm.tsx`

**功能:**
- 显示选题完整信息（复用 TopicCard 的部分UI）
- 「确认开始」按钮进入下一步
- 「返回列表」按钮

---

## Task 5: 阶段2 - 素材挖掘组件

**Files:**
- Create: `frontend/src/components/workflow/StepMaterials.tsx`
- Create: `backend/api/workflow_routes.py` - 新增 API

**功能:**
- 调用后端 API 生成素材（使用 Claude）
- 素材分类展示：历史源头、文化流变、名人轶事、冷知识
- 每条素材可标记：✓保留 / ✗删除
- 可信度标注

**API:**
```
POST /api/workflow/{topic_id}/generate-materials
GET /api/workflow/{topic_id}/materials
PUT /api/workflow/{topic_id}/materials/{material_id}
```

---

## Task 6: 阶段3 - 大纲&初稿组件

**Files:**
- Create: `frontend/src/components/workflow/StepDraft.tsx`

**功能:**
- 基于保留的素材生成2-3个大纲方案
- 用户选择一个大纲
- 生成350字初稿
- 事实核查标注
- 编辑器修改

---

## Task 7: 阶段4 - 食材清单组件

**Files:**
- Create: `frontend/src/components/workflow/StepIngredients.tsx`

**功能:**
- 基于菜品生成食材清单
- 勾选机制：点击切换「需采购」/「家里有」
- 家里有的显示删除线+变灰
- 底部汇总需采购项目
- 一键复制采购清单

**UI设计:**
```
┌─ 食材清单 ────────────────────────────┐
│  ☐ 牛腩 500g                          │
│  ☑ 洋葱 1个          (删除线, 变灰)    │
│  ☐ 红酒 200ml                         │
├────────────────────────────────────────┤
│  📋 需采购（2项）            [复制]    │
│  牛腩 500g、红酒 200ml                 │
└────────────────────────────────────────┘
```

---

## Task 8: 阶段5 - 拍摄清单组件

**Files:**
- Create: `frontend/src/components/workflow/StepShooting.tsx`

**功能:**
- 拍摄准备 checklist
- 勾选已完成项
- 分类：设备、食材、场景布置

---

## Task 9: 阶段6 - 发布物料组件

**Files:**
- Create: `frontend/src/components/workflow/StepPublish.tsx`

**功能:**
- 生成3-5个封面文字选项
- 生成小红书/抖音/视频号文案
- 一键复制
- 标记「已完成」并更新 done_topics

---

## Task 10: 后端工作流 API

**Files:**
- Create: `backend/api/workflow_routes.py`
- Modify: `backend/main.py` - 注册路由
- Modify: `backend/models/database.py` - 新增表

**数据库表:**
```sql
CREATE TABLE workflow_progress (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  current_step INTEGER DEFAULT 0,
  step_data JSON,  -- 每个阶段的数据
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**API 端点:**
```
GET  /api/workflow/{topic_id}           -- 获取工作流进度
POST /api/workflow/{topic_id}/step/{n}  -- 保存阶段数据
POST /api/workflow/{topic_id}/complete  -- 完成工作流
```

---

## 执行顺序

1. Task 1: React Router 配置
2. Task 2: 页面框架 + Stepper
3. Task 3: TopicCard 按钮
4. Task 10: 后端 API 基础
5. Task 4-9: 依次实现各阶段组件

---

## 验证方式

1. 访问 http://localhost:3000，点击选题卡片的「开始制作」
2. 进入工作流页面，Stepper 显示6个步骤
3. 依次完成各阶段，数据正确保存
4. 刷新页面后进度保留
5. 完成后选题标记为「已做过」
