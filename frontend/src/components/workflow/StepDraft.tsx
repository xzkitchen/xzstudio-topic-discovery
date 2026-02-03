import { useState, useMemo } from 'react'
import { ArrowLeft, ArrowRight, Loader2, Check, Sparkles, Star, ChevronDown, ChevronUp, Wand2, RotateCcw, Copy, CheckCircle } from 'lucide-react'
import type { TopicCandidate } from '../../types'

interface MaterialBlock {
  id: string
  type: '开场' | '历史' | '人物' | '转折' | '数据' | '收尾' | '冷知识'
  content: string
  source?: string
}

interface Outline {
  id: string
  title: string
  structure: string
  hook: string
  wordCount: number
  isRecommended?: boolean
  recommendReason?: string
}

interface StepDraftProps {
  topic: TopicCandidate
  onNext: (data: { outline: Outline; draft: string }) => void
  onPrev: () => void
  stepData: Record<string, unknown>
}

export function StepDraft({ topic, onNext, onPrev, stepData }: StepDraftProps) {
  const existingOutline = (stepData.draft as { outline: Outline })?.outline || null
  const existingDraft = (stepData.draft as { draft: string })?.draft || ''

  // 阶段：blocks(素材排序) -> outline(选大纲) -> draft(生成初稿) -> review(审核)
  const [phase, setPhase] = useState<'blocks' | 'outline' | 'draft' | 'review'>(
    existingDraft ? 'review' : existingOutline ? 'draft' : 'blocks'
  )

  // 素材块
  const [blocks, setBlocks] = useState<MaterialBlock[]>([])
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([])
  const [blocksGenerated, setBlocksGenerated] = useState(false)

  // 大纲
  const [outlines, setOutlines] = useState<Outline[]>([])
  const [selectedOutline, setSelectedOutline] = useState<Outline | null>(existingOutline)
  const [expandedOutline, setExpandedOutline] = useState<string | null>(null)

  // 初稿
  const [draft, setDraft] = useState(existingDraft)
  const [loading, setLoading] = useState(false)
  const [, setShowPrompt] = useState(false) // showPrompt 用于未来扩展
  const [promptCopied, setPromptCopied] = useState(false)

  // 从上一步获取已挖掘的素材
  interface PreviousMaterial {
    id: string
    category: string
    content: string
    credibility: string
    sourceNote?: string
  }
  const previousMaterials = (stepData.materials as { materials: PreviousMaterial[] })?.materials ||
                            (stepData.materials as PreviousMaterial[]) || []

  // 素材 category 到 block type 的映射
  const categoryToType: Record<string, MaterialBlock['type']> = {
    '作品细节': '开场',
    '开场钩子': '开场',
    '历史源头': '历史',
    '文化流变': '转折',
    '名人轶事': '人物',
    '冷知识': '冷知识',
    '数据': '数据',
    '故事角度': '转折',
  }

  // 根据选题生成素材块
  const handleGenerateBlocks = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      const generatedBlocks: MaterialBlock[] = []
      let blockId = 1

      // 优先使用上一步挖掘的真实素材
      if (previousMaterials.length > 0) {
        for (const material of previousMaterials) {
          // 跳过 [待挖掘] 开头的占位符素材
          if (material.content.startsWith('[待挖掘]')) continue

          const blockType = categoryToType[material.category] || '冷知识'
          generatedBlocks.push({
            id: `b${blockId}`,
            type: blockType,
            content: material.content,
            source: material.sourceNote || material.category
          })
          blockId++
        }
      }

      // 如果没有足够的真实素材，补充一些基础开场素材
      if (!generatedBlocks.some(b => b.type === '开场')) {
        generatedBlocks.unshift({
          id: `b${blockId}`,
          type: '开场',
          content: `《${topic.work_name}》里有一个经典场景：${topic.food_scene_description || '一个令人印象深刻的美食画面'}`,
          source: '作品原片'
        })
        blockId++
      }

      // 补充收尾互动话题（多个具体选项）
      if (!generatedBlocks.some(b => b.type === '收尾')) {
        // 根据选题生成具体的互动话题
        const interactionTopics = [
          `你第一次吃${topic.recommended_dish}是什么时候？`,
          `你觉得电影里的${topic.recommended_dish}做得到底正不正宗？`,
          `如果让你选，你会用什么食材改良这道菜？`,
          `你有没有因为一部电影特意去吃某道菜？`,
        ]
        // 随机选一个作为推荐
        const randomTopic = interactionTopics[Math.floor(Math.random() * interactionTopics.length)]
        generatedBlocks.push({
          id: `b${blockId}`,
          type: '收尾',
          content: randomTopic,
          source: '互动设计'
        })
        blockId++
      }

      // 如果完全没有素材（fallback），生成基础模板
      if (generatedBlocks.length < 3) {
        generatedBlocks.push(
          {
            id: `b${blockId++}`,
            type: '开场',
            content: `看过《${topic.work_name}》的人一定记得那道${topic.recommended_dish}`,
            source: '作品原片'
          }
        )
      }

      // 按类型分组排序，同类型的放在一起
      const typeOrder: Record<MaterialBlock['type'], number> = {
        '开场': 1,
        '历史': 2,
        '人物': 3,
        '转折': 4,
        '冷知识': 5,
        '数据': 6,
        '收尾': 7,
      }
      generatedBlocks.sort((a, b) => typeOrder[a.type] - typeOrder[b.type])

      setBlocks(generatedBlocks)
      setBlocksGenerated(true)
    } finally {
      setLoading(false)
    }
  }

  // 切换素材选中状态
  const toggleBlock = (id: string) => {
    setSelectedBlocks(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // 一键自动排序：智能选择最佳素材组合
  const handleAutoSort = () => {
    // 定义叙事顺序和每种类型的最大数量
    // 开场和收尾各1个，中间部分可以有多条来丰富叙事
    const typeConfig: Record<MaterialBlock['type'], { order: number; maxCount: number }> = {
      '开场': { order: 1, maxCount: 1 },   // 开场只要1个
      '历史': { order: 2, maxCount: 2 },   // 历史背景可以多条
      '人物': { order: 3, maxCount: 2 },   // 人物故事可以多条
      '转折': { order: 4, maxCount: 2 },   // 转折/文化流变可以多条
      '冷知识': { order: 5, maxCount: 2 }, // 冷知识可以多条
      '数据': { order: 6, maxCount: 1 },   // 数据1个就够
      '收尾': { order: 7, maxCount: 1 },   // 收尾只要1个
    }

    // 按类型分组
    const byType: Record<string, MaterialBlock[]> = {}
    for (const block of blocks) {
      if (!byType[block.type]) byType[block.type] = []
      byType[block.type].push(block)
    }

    // 智能选择每种类型的最佳素材
    const selectedIds: string[] = []
    const sortedTypes = Object.keys(typeConfig).sort(
      (a, b) => typeConfig[a as MaterialBlock['type']].order - typeConfig[b as MaterialBlock['type']].order
    )

    for (const type of sortedTypes) {
      const blocksOfType = byType[type] || []
      const maxCount = typeConfig[type as MaterialBlock['type']].maxCount

      // 优先选择"已核实"内容，排除"方向提示"
      const prioritized = [...blocksOfType].sort((a, b) => {
        // [方向] 开头的排最后
        const aIsDirection = a.content.startsWith('[方向]')
        const bIsDirection = b.content.startsWith('[方向]')
        if (aIsDirection && !bIsDirection) return 1
        if (!aIsDirection && bIsDirection) return -1
        // 否则保持原顺序（通常第一个是最好的）
        return 0
      })

      // 只取 maxCount 个
      const selected = prioritized.slice(0, maxCount)
      selectedIds.push(...selected.map(b => b.id))
    }

    setSelectedBlocks(selectedIds)
  }

  // 取消排序
  const handleClearSort = () => {
    setSelectedBlocks([])
  }

  // 获取选中的素材（按选择顺序）
  const orderedBlocks = useMemo(() =>
    selectedBlocks.map(id => blocks.find(b => b.id === id)!).filter(Boolean),
    [selectedBlocks, blocks]
  )

  // 根据用户排序生成大纲
  const handleGenerateOutlines = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 分析用户选择的素材类型分布
      const types = orderedBlocks.map(b => b.type)
      const hasHistory = types.includes('历史')
      const hasPerson = types.includes('人物')
      const hasTransition = types.includes('转折')

      const generatedOutlines: Outline[] = []

      // 根据用户选择推荐不同结构
      if (hasHistory && hasTransition) {
        generatedOutlines.push({
          id: '1',
          title: '反转叙事（推荐）',
          structure: '电影开场 → 历史低谷 → 转折崛起 → 当代意义',
          hook: `《${topic.work_name}》里让评论家落泪的那道菜，以前根本上不了台面。`,
          wordCount: 350,
          isRecommended: true,
          recommendReason: '你选的素材有明显的"低谷→逆袭"走向，反转叙事最能突出这个张力'
        })
      }

      if (hasPerson) {
        generatedOutlines.push({
          id: '2',
          title: '人物驱动',
          structure: '电影场景 → 幕后人物 → 人物故事 → 电影呼应',
          hook: `为了《${topic.work_name}》里的一道菜，Thomas Keller跑去法国乡村找老奶奶学艺。`,
          wordCount: 350,
          isRecommended: !hasHistory && hasPerson,
          recommendReason: '你选了人物相关的素材，围绕人物展开故事会更有代入感'
        })
      }

      generatedOutlines.push({
        id: '3',
        title: '知识科普',
        structure: '电影引入 → 冷知识1 → 冷知识2 → 升华收尾',
        hook: `《${topic.work_name}》里那道菜，你知道正宗做法要把蔬菜切到多薄吗？`,
        wordCount: 320,
        isRecommended: false,
        recommendReason: undefined
      })

      // 确保至少有一个推荐
      if (!generatedOutlines.some(o => o.isRecommended)) {
        generatedOutlines[0].isRecommended = true
        generatedOutlines[0].recommendReason = '根据你选择的素材，这个结构最能串联起完整的故事'
      }

      setOutlines(generatedOutlines)
      setPhase('outline')
    } finally {
      setLoading(false)
    }
  }

  // 生成 Prompt（供 Claude Code 使用）
  const generatePrompt = (): string => {
    if (!selectedOutline) return ''

    const materialsText = orderedBlocks.map((b, i) => {
      const isDirection = b.content.startsWith('[方向]') || (b.content.includes('【') && b.content.includes('】'))
      return `${i + 1}. [${b.type}] ${isDirection ? '(方向提示)' : ''} ${b.content}`
    }).join('\n')

    return `/xizai-content 请根据以下信息，生成一段300-380字的短视频旁白文案。

## 选题信息
- 作品名：《${topic.work_name}》
- 推荐菜品：${topic.recommended_dish}
- 美食场景：${topic.food_scene_description || '无'}

## 用户选择的大纲结构
- 标题：${selectedOutline.title}
- 结构：${selectedOutline.structure}
- 开场钩子示例：${selectedOutline.hook}

## 用户选择的素材（按选择顺序）
${materialsText}

## 要求
1. 严格遵守熙崽风格指南
2. 字数控制在300-380字之间
3. 一句一行，方便录音
4. 开场必须有钩子（认知冲突/反差/数据/悬念）
5. 结尾必须是互动话题，不要总结式收尾
6. 使用口语化表达
7. 对于"方向提示"类素材，需要搜索资料后展开成完整段落
8. 不确定的信息用"据说"、"传说"标注
9. 搜索资料时：中国网站用中文搜索，YouTube/国外网站用英文搜索

请直接输出文案内容，每句话单独一行。`
  }

  // 复制 Prompt
  const handleCopyPrompt = async () => {
    const prompt = generatePrompt()
    try {
      await navigator.clipboard.writeText(prompt)
      setPromptCopied(true)
      setTimeout(() => setPromptCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 显示 Prompt 界面
  const handleShowPrompt = () => {
    setShowPrompt(true)
    setPhase('draft')
  }

  // 用户粘贴了 Claude 生成的文案，进入审核阶段
  const handleDraftPasted = () => {
    if (draft.trim().length > 50) {
      setShowPrompt(false)
      setPhase('review')
    }
  }

  // 素材类型颜色
  const typeColors: Record<string, string> = {
    '开场': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    '历史': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    '人物': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    '转折': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    '数据': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    '冷知识': 'bg-green-500/10 text-green-400 border-green-500/30',
    '收尾': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">大纲 & 初稿</h2>
        <p className="text-zinc-400">
          {phase === 'blocks' && '选择并排序你想用的素材块'}
          {phase === 'outline' && '选择一个叙事结构'}
          {phase === 'draft' && '复制 Prompt 到 Claude Code 生成文案'}
          {phase === 'review' && '审核并修改初稿'}
        </p>
      </div>

      {/* 阶段1：素材块选择与排序 */}
      {phase === 'blocks' && (
        <>
          {!blocksGenerated ? (
            <div className="card-elegant p-12 text-center">
              <Sparkles size={48} className="mx-auto mb-4 text-amber-400" />
              <h3 className="text-xl font-semibold text-white mb-2">生成素材块</h3>
              <p className="text-zinc-400 mb-6">
                AI 将为你准备多个可组合的素材段落，你来决定使用哪些、按什么顺序
              </p>
              <button
                onClick={handleGenerateBlocks}
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
                    生成素材块
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 操作按钮区 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAutoSort}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <Wand2 size={14} />
                    一键自动排序
                  </button>
                  {selectedBlocks.length > 0 && (
                    <button
                      onClick={handleClearSort}
                      className="px-3 py-1.5 rounded-lg bg-zinc-500/10 text-zinc-400 text-sm hover:bg-zinc-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw size={14} />
                      取消排序
                    </button>
                  )}
                </div>
                <span className="text-xs text-zinc-500">
                  点击素材块进行选择，选择顺序即为叙事顺序
                </span>
              </div>

              {/* 已选素材预览 */}
              {selectedBlocks.length > 0 && (
                <div className="card-elegant p-4 mb-6">
                  <h4 className="text-sm font-semibold text-zinc-400 mb-3">
                    已选顺序（{selectedBlocks.length}个）
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {orderedBlocks.map((block, i) => (
                      <div
                        key={block.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs"
                      >
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span>{block.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 素材列表 */}
              <div className="space-y-3">
                {blocks.map((block) => {
                  const isSelected = selectedBlocks.includes(block.id)
                  const orderIndex = selectedBlocks.indexOf(block.id)

                  return (
                    <div
                      key={block.id}
                      onClick={() => toggleBlock(block.id)}
                      className={`
                        card-elegant p-4 cursor-pointer transition-all
                        ${isSelected ? 'ring-2 ring-amber-500/50' : 'hover:bg-white/[0.02]'}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* 序号/勾选 */}
                        <div className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold
                          ${isSelected
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'border-zinc-600 text-zinc-600'
                          }
                        `}>
                          {isSelected ? orderIndex + 1 : ''}
                        </div>

                        <div className="flex-1">
                          {/* 类型标签 */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs border ${typeColors[block.type]}`}>
                              {block.type}
                            </span>
                            {block.source && (
                              <span className="text-[10px] text-zinc-500">
                                来源：{block.source}
                              </span>
                            )}
                          </div>
                          {/* 内容 */}
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            {block.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 下一步按钮 */}
              <button
                onClick={handleGenerateOutlines}
                disabled={selectedBlocks.length < 3 || loading}
                className="w-full px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    正在分析...
                  </>
                ) : (
                  <>
                    根据我的排序生成大纲
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              {selectedBlocks.length < 3 && (
                <p className="text-center text-xs text-zinc-500">至少选择3个素材块</p>
              )}
            </div>
          )}
        </>
      )}

      {/* 阶段2：选择大纲 */}
      {phase === 'outline' && (
        <div className="space-y-4">
          {outlines.map((outline) => (
            <div
              key={outline.id}
              onClick={() => setSelectedOutline(outline)}
              className={`
                card-elegant overflow-hidden cursor-pointer transition-all
                ${selectedOutline?.id === outline.id ? 'ring-2 ring-amber-500/50' : 'hover:bg-white/[0.02]'}
                ${outline.isRecommended ? 'border-amber-500/30' : ''}
              `}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                    ${selectedOutline?.id === outline.id
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-zinc-600'
                    }
                  `}>
                    {selectedOutline?.id === outline.id && <Check size={14} className="text-white" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-white">{outline.title}</h4>
                      {outline.isRecommended && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                          <Star size={10} fill="currentColor" />
                          推荐
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 mb-3">{outline.structure}</p>

                    {/* 推荐理由 */}
                    {outline.isRecommended && outline.recommendReason && (
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-3">
                        <p className="text-xs text-amber-400">
                          <strong>推荐理由：</strong>{outline.recommendReason}
                        </p>
                      </div>
                    )}

                    {/* 展开/收起钩子示例 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedOutline(expandedOutline === outline.id ? null : outline.id)
                      }}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      {expandedOutline === outline.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      查看开场示例
                    </button>

                    {expandedOutline === outline.id && (
                      <div className="mt-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <p className="text-sm text-zinc-300 italic">"{outline.hook}"</p>
                      </div>
                    )}

                    <p className="text-xs text-zinc-500 mt-3">预估 {outline.wordCount} 字</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleShowPrompt}
            disabled={!selectedOutline}
            className="w-full px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            生成文案 Prompt
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* 阶段3：显示 Prompt，用户复制到 Claude Code */}
      {phase === 'draft' && (
        <div className="space-y-6">
          {/* Prompt 区域 */}
          <div className="card-elegant p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-zinc-400">复制以下 Prompt 到 Claude Code</h4>
              <button
                onClick={handleCopyPrompt}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  promptCopied
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                {promptCopied ? (
                  <>
                    <CheckCircle size={14} />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    复制 Prompt
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs text-zinc-400 bg-black/30 p-4 rounded-lg overflow-auto max-h-[200px] whitespace-pre-wrap">
              {generatePrompt()}
            </pre>
          </div>

          {/* 粘贴区域 */}
          <div className="card-elegant p-6">
            <h4 className="text-sm font-semibold text-zinc-400 mb-4">将 Claude 生成的文案粘贴到这里</h4>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full h-[300px] bg-black/30 text-zinc-200 text-sm leading-loose resize-none focus:outline-none font-mono p-4 rounded-lg"
              placeholder="粘贴 Claude 生成的文案..."
            />
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-zinc-500">
                字数：约 <span className="text-amber-400 font-medium">{draft.replace(/[\s\n\-—？！。，、：""'']/g, '').length}</span> 字
              </div>
              <button
                onClick={handleDraftPasted}
                disabled={draft.trim().length < 50}
                className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                确认文案
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 阶段4：审核初稿 */}
      {phase === 'review' && (
        <div className="space-y-4">
          <div className="card-elegant p-6">
            <h4 className="text-sm font-semibold text-zinc-400 mb-4">初稿内容（一句一行，方便录音）</h4>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full h-[420px] bg-transparent text-zinc-200 text-sm leading-loose resize-none focus:outline-none font-mono"
              placeholder="初稿内容..."
            />
          </div>

          {/* 字数统计 - 移到对话框外 */}
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-zinc-500">
              字数：约 <span className="text-amber-400 font-medium">{draft.replace(/[\s\n\-—？！。，、：""'']/g, '').length}</span> 字
            </div>
            <div className="text-xs text-zinc-600">
              建议字数：300-380字
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-between pt-4">
        <button
          onClick={() => {
            if (phase === 'outline') {
              setPhase('blocks')
            } else if (phase === 'review') {
              setPhase('outline')
            } else if (phase === 'draft') {
              // draft 阶段（正在生成中）也应该能退回 outline
              setPhase('outline')
            } else {
              // blocks 阶段才退回上一步
              onPrev()
            }
          }}
          className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {phase === 'blocks' ? '上一步' : '返回'}
        </button>
        {phase === 'review' && (
          <button
            onClick={() => onNext({ outline: selectedOutline!, draft })}
            className="px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-400 transition-colors flex items-center gap-2"
          >
            下一步
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
