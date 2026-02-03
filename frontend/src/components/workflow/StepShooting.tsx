import { useState } from 'react'
import { ArrowLeft, ArrowRight, Camera, Utensils, Lightbulb, Check } from 'lucide-react'
import type { TopicCandidate } from '../../types'

interface ChecklistItem {
  id: string
  category: 'equipment' | 'ingredients' | 'scene'
  text: string
  checked: boolean
}

interface StepShootingProps {
  topic: TopicCandidate
  onNext: (data: { checklist: ChecklistItem[] }) => void
  onPrev: () => void
  stepData: Record<string, unknown>
}

const categoryConfig = {
  equipment: { icon: Camera, label: '设备准备', color: 'text-blue-400' },
  ingredients: { icon: Utensils, label: '食材准备', color: 'text-green-400' },
  scene: { icon: Lightbulb, label: '场景布置', color: 'text-amber-400' },
}

const defaultChecklist: ChecklistItem[] = [
  // 设备
  { id: 'e1', category: 'equipment', text: '相机/手机 电量充足', checked: false },
  { id: 'e2', category: 'equipment', text: '存储卡空间充足', checked: false },
  { id: 'e3', category: 'equipment', text: '三脚架/手机支架 固定好', checked: false },
  { id: 'e4', category: 'equipment', text: '补光灯/自然光 调整好', checked: false },
  { id: 'e5', category: 'equipment', text: '录音设备测试', checked: false },
  // 食材
  { id: 'i1', category: 'ingredients', text: '食材已清洗/切好', checked: false },
  { id: 'i2', category: 'ingredients', text: '调料准备齐全', checked: false },
  { id: 'i3', category: 'ingredients', text: '备用食材准备（拍摄可能失败）', checked: false },
  // 场景
  { id: 's1', category: 'scene', text: '台面清洁整齐', checked: false },
  { id: 's2', category: 'scene', text: '背景布置完成', checked: false },
  { id: 's3', category: 'scene', text: '餐具/道具摆放好', checked: false },
  { id: 's4', category: 'scene', text: '眼镜摘下（如需出镜）', checked: false },
]

export function StepShooting({ onNext, onPrev, stepData }: StepShootingProps) {
  const existingChecklist = (stepData.shooting as { checklist: ChecklistItem[] })?.checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>(existingChecklist || defaultChecklist)

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const completedCount = checklist.filter(item => item.checked).length
  const totalCount = checklist.length
  const progress = (completedCount / totalCount) * 100

  // 按类别分组
  const groupedChecklist = {
    equipment: checklist.filter(item => item.category === 'equipment'),
    ingredients: checklist.filter(item => item.category === 'ingredients'),
    scene: checklist.filter(item => item.category === 'scene'),
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">拍摄清单</h2>
        <p className="text-zinc-400">开拍前的准备工作检查</p>
      </div>

      {/* 进度条 */}
      <div className="card-elegant p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">准备进度</span>
          <span className="text-sm text-amber-400 font-medium">
            {completedCount} / {totalCount}
          </span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 检查清单 */}
      <div className="space-y-6">
        {(Object.keys(groupedChecklist) as Array<keyof typeof groupedChecklist>).map(category => {
          const config = categoryConfig[category]
          const Icon = config.icon
          const items = groupedChecklist[category]
          const categoryCompleted = items.filter(item => item.checked).length

          return (
            <div key={category} className="card-elegant overflow-hidden">
              {/* 类别标题 */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Icon size={18} className={config.color} />
                  <span className="font-medium text-white">{config.label}</span>
                </div>
                <span className="text-xs text-zinc-500">
                  {categoryCompleted}/{items.length}
                </span>
              </div>

              {/* 检查项 */}
              <div className="divide-y divide-white/5">
                {items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                      ${item.checked
                        ? 'bg-green-500 border-green-500'
                        : 'border-zinc-600 hover:border-zinc-400'
                      }
                    `}>
                      {item.checked && <Check size={12} className="text-white" />}
                    </div>
                    <span className={`
                      text-sm transition-all
                      ${item.checked ? 'text-zinc-500 line-through' : 'text-zinc-200'}
                    `}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* 提示 */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <p className="text-sm text-amber-400">
          💡 提示：做菜过程只拍手和食物，不真人出镜。结尾出镜喂猫或吃一口时，记得先戴眼镜定位好位置，摘下眼镜后再拍。
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          上一步
        </button>
        <button
          onClick={() => onNext({ checklist })}
          className="px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-400 transition-colors flex items-center gap-2"
        >
          下一步
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
