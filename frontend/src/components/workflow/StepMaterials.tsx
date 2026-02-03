import { useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Check, ExternalLink } from 'lucide-react'
import type { TopicCandidate } from '../../types'

interface Material {
  id: string
  category: '历史源头' | '文化流变' | '名人轶事' | '冷知识' | '作品细节' | '数据'
  content: string
  credibility: '已核实' | '传说'  // 只有已核实和传说两种状态
  sourceNote?: string  // 来源说明
  sourceUrl?: string   // 可点击验证的链接
  selected: boolean
}

interface StepMaterialsProps {
  topic: TopicCandidate
  onNext: (data: { materials: Material[] }) => void
  onPrev: () => void
  stepData: Record<string, unknown>
}

const categoryColors: Record<string, string> = {
  '历史源头': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  '文化流变': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  '名人轶事': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  '冷知识': 'bg-green-500/10 text-green-400 border-green-500/20',
  '作品细节': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  '数据': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

const credibilityIcons: Record<string, { icon: string; color: string; label: string }> = {
  '已核实': { icon: '✓', color: 'text-green-400', label: '已核实' },
  '传说': { icon: '△', color: 'text-zinc-400', label: '传说' },
  '待挖掘': { icon: '◇', color: 'text-amber-400', label: '方向提示' },
  '待核实': { icon: '?', color: 'text-yellow-400', label: '待核实' },
}

export function StepMaterials({ topic, onNext, onPrev, stepData }: StepMaterialsProps) {
  // 兼容两种数据结构：{ materials: Material[] } 或直接 Material[]
  const rawMaterials = stepData.materials
  const existingMaterials = rawMaterials
    ? (Array.isArray(rawMaterials) ? rawMaterials as Material[] : (rawMaterials as { materials: Material[] }).materials)
    : null
  const [materials, setMaterials] = useState<Material[]>(existingMaterials || [])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(!!existingMaterials && existingMaterials.length > 0)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/workflow/${topic.id}/generate-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_name: topic.work_name,
          dish_name: topic.recommended_dish,
          food_scene: topic.food_scene_description
        })
      })
      if (!res.ok) throw new Error('生成失败')
      const data = await res.json()
      setMaterials(data.materials.map((m: Omit<Material, 'selected'>) => ({ ...m, selected: true })))
      setGenerated(true)
    } catch (err) {
      console.error('生成素材失败:', err)
      // API 失败时只显示基本的已核实信息
      setMaterials([
        { id: '1', category: '作品细节', content: `在《${topic.work_name}》中，${topic.food_scene_description || '有一个令人印象深刻的美食场景'}`, credibility: '已核实', sourceNote: '作品原片', selected: true },
      ])
      setGenerated(true)
    } finally {
      setLoading(false)
    }
  }

  const toggleMaterial = (id: string) => {
    setMaterials(prev => prev.map(m =>
      m.id === id ? { ...m, selected: !m.selected } : m
    ))
  }

  const selectedCount = materials.filter(m => m.selected).length

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">素材挖掘</h2>
        <p className="text-zinc-400">挖掘选题相关素材，选择想要使用的</p>
      </div>

      {!generated ? (
        <div className="card-elegant p-12 text-center">
          <Sparkles size={48} className="mx-auto mb-4 text-amber-400" />
          <h3 className="text-xl font-semibold text-white mb-2">准备好挖掘素材了吗？</h3>
          <p className="text-zinc-400 mb-6">
            AI 将搜索《{topic.work_name}》和{topic.recommended_dish}的相关故事
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                正在挖掘...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                开始挖掘素材
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          {/* 素材列表 */}
          <div className="space-y-3">
            {materials.map((material) => (
              <div
                key={material.id}
                onClick={() => toggleMaterial(material.id)}
                className={`
                  card-elegant p-4 cursor-pointer transition-all
                  ${material.selected ? 'ring-2 ring-amber-500/50' : 'opacity-60'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5
                    ${material.selected
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-zinc-600'
                    }
                  `}>
                    {material.selected && <Check size={14} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${categoryColors[material.category]}`}>
                        {material.category}
                      </span>
                      <span className={`text-xs ${credibilityIcons[material.credibility]?.color || 'text-green-400'}`}>
                        {credibilityIcons[material.credibility]?.icon || '✓'} {credibilityIcons[material.credibility]?.label || '已核实'}
                      </span>
                      {/* 来源批注 */}
                      {material.sourceNote && (
                        material.sourceUrl ? (
                          <a
                            href={material.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-zinc-500 hover:text-amber-400 flex items-center gap-0.5 transition-colors"
                          >
                            <span className="underline underline-offset-2">{material.sourceNote}</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-[10px] text-zinc-600">{material.sourceNote}</span>
                        )
                      )}
                    </div>
                    <p className={`text-sm ${material.selected ? 'text-zinc-200' : 'text-zinc-500 line-through'}`}>
                      {material.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 统计 */}
          <div className="text-center text-sm text-zinc-500">
            已选择 {selectedCount} / {materials.length} 条素材
          </div>
        </>
      )}

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
          onClick={() => onNext({ materials: materials.filter(m => m.selected) })}
          disabled={!generated || selectedCount === 0}
          className="px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          下一步
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
