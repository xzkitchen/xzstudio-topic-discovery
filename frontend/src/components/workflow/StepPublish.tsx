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

  const handleGenerate = async () => {
    setLoading(true)
    try {
      // 模拟生成发布物料
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 生成符合熙崽风格的封面文字和标题
      // 风格要求：具体、口语化、不卖弄、没有废话形容词
      setMaterial({
        coverTexts: [
          `复刻《${topic.work_name}》`,
          `${topic.recommended_dish}`,
          `电影里那道菜的真实配方`,
          `${topic.recommended_dish}的故事`,
        ],
        titleOptions: [
          `🎬 ${topic.work_name}｜${topic.recommended_dish}配方`,
          `《${topic.work_name}》里的${topic.recommended_dish}，在家就能做`,
          `复刻${topic.work_name}名场面｜${topic.recommended_dish}`,
          `这道${topic.recommended_dish}背后的故事比电影还精彩`,
        ],
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
