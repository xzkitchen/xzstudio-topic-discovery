import { useState } from 'react'
import { ArrowLeft, Copy, Check, Sparkles, Loader2, PartyPopper, Image } from 'lucide-react'
import type { TopicCandidate } from '../../types'

interface StepPublishProps {
  topic: TopicCandidate
  onNext: (data: unknown) => void
  onPrev: () => void
  onComplete: () => void
  stepData: Record<string, unknown>
}

interface PublishMaterial {
  coverTexts: string[]      // 封面文字选项
  titleOptions: string[]    // 小红书标题选项
}

export function StepPublish({ topic, onPrev, onComplete, stepData }: StepPublishProps) {
  const existingMaterial = stepData.publish as PublishMaterial | undefined
  const [material, setMaterial] = useState<PublishMaterial | null>(existingMaterial || null)
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [selectedCover, setSelectedCover] = useState(0)
  const [selectedTitle, setSelectedTitle] = useState(0)
  const [completing, setCompleting] = useState(false)

  // 根据选题类型和故事角度生成封面文字
  // 熙崽风格：有悬念、有冲突、有反转，不用模板化表达
  const generateCoverTexts = (): string[] => {
    const texts: string[] = []
    const dish = topic.recommended_dish
    const angles = topic.story_angles || []
    const type = topic.topic_type || 'movie_food'

    // 基于故事角度生成（优先使用角度中的精华）
    if (angles.length > 0) {
      // 取评分最高的角度标题
      const sortedAngles = [...angles].sort((a, b) => (b.potential_score || 0) - (a.potential_score || 0))
      for (const angle of sortedAngles.slice(0, 2)) {
        if (angle?.title && angle.title.length <= 15) {
          texts.push(angle.title)
        }
      }
    }

    // 根据类型生成不同风格的封面
    if (type === 'movie_food') {
      // 影视美食 - 强调画面/场景/冲突
      if (topic.food_scene_description) {
        const scene = topic.food_scene_description
        if (scene.includes('名场面') || scene.includes('经典')) {
          texts.push(`这个名场面馋了我好久`)
        }
        if (scene.includes('吃') && scene.includes('戏')) {
          texts.push(`电影史上最馋人的吃戏`)
        }
      }
      texts.push(dish)  // 直接用菜名，简洁有力
    } else if (type === 'famous_recipe') {
      // 名店配方 - 强调稀缺性/复刻价值
      texts.push(`终于搞到配方了`)
      if (topic.restaurant_name) {
        const shortName = topic.restaurant_name.length <= 10 ? topic.restaurant_name : dish
        texts.push(shortName)
      }
      texts.push(dish)
    } else if (type === 'archaeological') {
      // 考古美食 - 强调时间跨度/历史反差
      if (topic.year_origin) {
        const yearsAgo = 2024 - topic.year_origin
        if (yearsAgo > 100) {
          texts.push(`${yearsAgo}年前的味道`)
        }
      }
      texts.push(`史料里挖出来的食谱`)
      texts.push(dish)
    }

    // 去重并限制数量
    return [...new Set(texts)].filter(t => t.length <= 15).slice(0, 4)
  }

  // 生成小红书标题
  // 熙崽风格：开头有钩子，不用emoji堆砌，讲故事不讲配方
  const generateTitleOptions = (): string[] => {
    const titles: string[] = []
    const dish = topic.recommended_dish
    const work = topic.work_name
    const type = topic.topic_type || 'movie_food'

    // 基于故事角度生成标题
    const angles = topic.story_angles || []
    if (angles.length > 0) {
      const sortedAngles = [...angles].sort((a, b) => (b.potential_score || 0) - (a.potential_score || 0))
      for (const angle of sortedAngles.slice(0, 2)) {
        if (angle?.description) {
          // 基于描述生成更自然的标题
          const desc = angle.description
          if (desc.length <= 35) {
            titles.push(desc)
          }
        }
      }
    }

    if (type === 'movie_food') {
      // 影视美食 - 讲故事
      titles.push(`《${work}》里那道馋人的${dish}，终于做出来了`)
      titles.push(`看完这部电影，我立刻去厨房复刻了这道菜`)

      // 如果有场景描述，提取关键信息
      if (topic.food_scene_description) {
        const scene = topic.food_scene_description
        if (scene.includes('吃')) {
          titles.push(`这场吃戏馋了我好久，今天终于复刻`)
        }
      }

      // 基于开场钩子
      if (topic.opening_hooks && topic.opening_hooks.length > 0) {
        const hook = topic.opening_hooks[0]
        if (hook.content && hook.content.length <= 35) {
          titles.push(hook.content)
        }
      }
    } else if (type === 'famous_recipe') {
      // 名店配方
      if (topic.restaurant_name) {
        titles.push(`${topic.restaurant_name}的配方被我搞到了`)
        titles.push(`不用排队也能吃到｜复刻${topic.restaurant_name}`)
      }
      if (topic.chef_name) {
        titles.push(`${topic.chef_name}公开的配方，在家试了一下`)
      }
      titles.push(`这家店的配方其实早就公开了`)
    } else if (type === 'archaeological') {
      // 考古美食
      if (topic.year_origin) {
        const yearsAgo = 2024 - topic.year_origin
        titles.push(`${yearsAgo}年前的人吃什么？我复刻了一道古老食谱`)
      }
      if (topic.historical_source) {
        titles.push(`${topic.historical_source}里居然有食谱，我做了一下`)
      }
      titles.push(`从史料里挖出来的食谱，意外好吃`)
    }

    // 去重并限制数量
    return [...new Set(titles)].slice(0, 4)
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      // 模拟生成过程
      await new Promise(resolve => setTimeout(resolve, 600))

      // 生成符合熙崽风格的物料
      // 风格要求：具体、口语化、有悬念/冲突、不用模板
      setMaterial({
        coverTexts: generateCoverTexts(),
        titleOptions: generateTitleOptions(),
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await onComplete()
    } catch {
      setCompleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">发布物料</h2>
        <p className="text-zinc-400">封面素材 + 小红书标题</p>
      </div>

      {!material ? (
        <div className="card-elegant p-12 text-center">
          <Sparkles size={48} className="mx-auto mb-4 text-amber-400" />
          <h3 className="text-xl font-semibold text-white mb-2">生成发布物料</h3>
          <p className="text-zinc-400 mb-6">
            生成封面文字和小红书标题
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                正在生成...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                生成物料
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 封面文字选择 */}
          <div className="card-elegant p-5">
            <div className="flex items-center gap-2 mb-4">
              <Image size={16} className="text-amber-400" />
              <h4 className="text-sm font-semibold text-zinc-400">封面文字（选择一个）</h4>
            </div>
            <div className="space-y-2">
              {material.coverTexts.map((text, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedCover(index)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3
                    ${selectedCover === index
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'
                    }
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                    ${selectedCover === index
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-zinc-600'
                    }
                  `}>
                    {selectedCover === index && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-zinc-200">{text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => copyToClipboard(material.coverTexts[selectedCover], 'cover')}
              className={`
                mt-4 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors
                ${copiedField === 'cover'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
                }
              `}
            >
              {copiedField === 'cover' ? <Check size={12} /> : <Copy size={12} />}
              {copiedField === 'cover' ? '已复制' : '复制封面文字'}
            </button>
          </div>

          {/* 小红书标题选择 */}
          <div className="card-elegant p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-amber-400 text-sm">📕</span>
              <h4 className="text-sm font-semibold text-zinc-400">小红书标题（选择一个）</h4>
            </div>
            <div className="space-y-2">
              {material.titleOptions.map((text, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedTitle(index)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3
                    ${selectedTitle === index
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'
                    }
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                    ${selectedTitle === index
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-zinc-600'
                    }
                  `}>
                    {selectedTitle === index && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-zinc-200">{text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => copyToClipboard(material.titleOptions[selectedTitle], 'title')}
              className={`
                mt-4 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors
                ${copiedField === 'title'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
                }
              `}
            >
              {copiedField === 'title' ? <Check size={12} /> : <Copy size={12} />}
              {copiedField === 'title' ? '已复制' : '复制标题'}
            </button>
          </div>

          {/* 提示说明 */}
          <div className="text-center text-xs text-zinc-500">
            抖音/视频号直接用小红书标题即可
          </div>
        </div>
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
        {material && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="px-6 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {completing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                完成中...
              </>
            ) : (
              <>
                <PartyPopper size={18} />
                完成制作！
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
