import { useState, useMemo } from 'react'
import { Star, Film, Clock, UtensilsCrossed, ChefHat, ArrowRight, Check, Copy, ShoppingCart } from 'lucide-react'
import type { TopicCandidate, Ingredient as BackendIngredient } from '../../types'

// 前端使用的食材状态（带勾选状态）
interface IngredientState {
  id: string
  name: string
  amount: string
  haveAtHome: boolean
}

interface StepConfirmProps {
  topic: TopicCandidate
  onNext: (data?: { ingredients: IngredientState[] }) => void
  onPrev: () => void
  stepData: Record<string, unknown>
}

// 将后端食材数据转换为前端状态
function initIngredients(backendIngredients?: BackendIngredient[]): IngredientState[] {
  if (!backendIngredients || backendIngredients.length === 0) {
    // 默认食材（fallback）
    return [
      { id: '1', name: '主食材', amount: '适量', haveAtHome: false },
      { id: '2', name: '洋葱', amount: '1个', haveAtHome: true },
      { id: '3', name: '大蒜', amount: '3瓣', haveAtHome: true },
      { id: '4', name: '橄榄油', amount: '适量', haveAtHome: true },
      { id: '5', name: '盐', amount: '适量', haveAtHome: true },
      { id: '6', name: '黑胡椒', amount: '适量', haveAtHome: true },
    ]
  }

  return backendIngredients.map((ing, index) => ({
    id: String(index + 1),
    name: ing.name,
    amount: ing.amount,
    haveAtHome: false  // 默认不勾选，让用户自己选
  }))
}

const difficultyColors: Record<string, string> = {
  '简单': 'text-green-400 bg-green-400/10 border-green-400/20',
  '中等': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  '困难': 'text-red-400 bg-red-400/10 border-red-400/20',
  '超出能力': 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
}

export function StepConfirm({ topic, onNext, stepData }: StepConfirmProps) {
  // 食材状态管理
  const existingIngredients = (stepData.confirm as { ingredients: IngredientState[] })?.ingredients
  const [ingredients, setIngredients] = useState<IngredientState[]>(
    existingIngredients || initIngredients(topic.ingredients)
  )
  const [copied, setCopied] = useState(false)

  // 切换食材状态
  const toggleIngredient = (id: string) => {
    setIngredients(prev => prev.map(ing =>
      ing.id === id ? { ...ing, haveAtHome: !ing.haveAtHome } : ing
    ))
  }

  // 需采购的食材
  const shoppingList = useMemo(
    () => ingredients.filter(ing => !ing.haveAtHome),
    [ingredients]
  )

  // 复制采购清单
  const copyShoppingList = async () => {
    const text = shoppingList.map(ing => `${ing.name} ${ing.amount}`).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 继续时保存食材状态
  const handleNext = () => {
    onNext({ ingredients })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">确认选题</h2>
        <p className="text-sm sm:text-base text-zinc-400">确认选题信息和食材清单后开始制作</p>
      </div>

      {/* 选题信息卡片 */}
      <div className="card-elegant p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* 基础信息 */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          {/* 海报 */}
          <div className="w-24 h-36 sm:w-32 sm:h-48 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center mx-auto sm:mx-0">
            {topic.poster_url ? (
              <img
                src={topic.poster_url}
                alt={topic.work_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Film size={32} className="sm:w-10 sm:h-10 text-zinc-600" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
              《{topic.work_name}》
            </h3>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="score-badge text-base sm:text-lg">
                <Star size={14} className="sm:w-4 sm:h-4" fill="currentColor" />
                {topic.douban_score}
              </span>
              <span className="tag flex items-center gap-1 sm:gap-1.5 text-xs">
                <Film size={12} className="sm:w-3.5 sm:h-3.5" />
                {topic.work_type}
              </span>
              <span className="tag flex items-center gap-1 sm:gap-1.5 text-xs">
                <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                {topic.release_year}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <UtensilsCrossed size={14} className="sm:w-4 sm:h-4 text-amber-400" />
                <span className="text-base sm:text-lg font-medium text-white">{topic.recommended_dish}</span>
              </div>
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm border ${difficultyColors[topic.cooking_difficulty] || difficultyColors['中等']}`}>
                <ChefHat size={10} className="sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1" />
                {topic.cooking_difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* 美食场景 */}
        <div className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-400 mb-2">美食场景</h4>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{topic.food_scene_description}</p>
        </div>
      </div>

      {/* 食材清单 - 核心功能区 */}
      <div className="card-elegant p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-1.5 sm:gap-2">
            <ShoppingCart size={16} className="sm:w-5 sm:h-5 text-amber-400" />
            食材清单
          </h3>
          {shoppingList.length > 0 && (
            <button
              onClick={copyShoppingList}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors
                ${copied
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
                }
              `}
            >
              {copied ? (
                <>
                  <Check size={12} />
                  已复制
                </>
              ) : (
                <>
                  <Copy size={12} />
                  复制采购清单
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-sm text-zinc-500 mb-4">点击勾选家里已有的食材</p>

        {/* 食材列表 */}
        <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              onClick={() => toggleIngredient(ingredient.id)}
              className="flex items-center gap-4 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              {/* 勾选框 */}
              <div className={`
                w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                ${ingredient.haveAtHome
                  ? 'bg-green-500 border-green-500'
                  : 'border-zinc-600 hover:border-zinc-400'
                }
              `}>
                {ingredient.haveAtHome && <Check size={12} className="text-white" />}
              </div>

              {/* 食材名称和用量 */}
              <div className="flex-1 flex items-center justify-between">
                <span className={`
                  text-sm transition-all
                  ${ingredient.haveAtHome
                    ? 'text-zinc-500 line-through'
                    : 'text-zinc-200'
                  }
                `}>
                  {ingredient.name}
                </span>
                <span className={`
                  text-sm transition-all
                  ${ingredient.haveAtHome
                    ? 'text-zinc-600'
                    : 'text-zinc-400'
                  }
                `}>
                  {ingredient.amount}
                </span>
              </div>

              {/* 状态标签 */}
              <span className={`
                text-xs px-2 py-0.5 rounded-full shrink-0
                ${ingredient.haveAtHome
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-amber-500/10 text-amber-400'
                }
              `}>
                {ingredient.haveAtHome ? '家里有' : '需采购'}
              </span>
            </div>
          ))}
        </div>

        {/* 采购汇总 */}
        {shoppingList.length > 0 ? (
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
              <ShoppingCart size={14} />
              需采购 {shoppingList.length} 项
            </div>
            <div className="text-sm text-zinc-400">
              {shoppingList.map((ing, i) => (
                <span key={ing.id}>
                  {ing.name}
                  {i < shoppingList.length - 1 && '、'}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-center">
            <Check size={24} className="mx-auto mb-2 text-green-400" />
            <p className="text-green-400 font-medium text-sm">所有食材家里都有</p>
          </div>
        )}
      </div>

      {/* 故事切入点 - 折叠展示 */}
      <details className="card-elegant">
        <summary className="p-4 cursor-pointer text-sm font-semibold text-zinc-400 hover:text-zinc-300 transition-colors">
          故事切入点（{topic.story_angles.length}个）
        </summary>
        <div className="px-4 pb-4 space-y-2">
          {topic.story_angles.map((angle, i) => (
            <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-amber-400">{angle.angle_type}</span>
                <span className="text-xs text-zinc-500">{angle.potential_score}分</span>
              </div>
              <p className="text-sm font-medium text-white">{angle.title}</p>
              <p className="text-xs text-zinc-400 mt-1">{angle.description}</p>
            </div>
          ))}
        </div>
      </details>

      {/* 操作按钮 */}
      <div className="flex justify-center sm:justify-end">
        <button
          onClick={handleNext}
          className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-400 active:bg-amber-600 transition-colors flex items-center justify-center gap-2"
        >
          确认，开始制作
          <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
    </div>
  )
}
