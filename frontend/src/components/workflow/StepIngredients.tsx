import { useState, useMemo } from 'react'
import { ArrowLeft, ArrowRight, Copy, Check, ShoppingCart } from 'lucide-react'
import type { TopicCandidate } from '../../types'

interface Ingredient {
  id: string
  name: string
  amount: string
  haveAtHome: boolean  // true = 家里有，false = 需采购
}

interface StepIngredientsProps {
  topic: TopicCandidate
  onNext: (data: { ingredients: Ingredient[] }) => void
  onPrev: () => void
  stepData: Record<string, unknown>
}

// 菜品食材数据库
const DISH_INGREDIENTS: Record<string, Ingredient[]> = {
  '普罗旺斯炖蔬菜': [
    { id: '1', name: '茄子', amount: '1根', haveAtHome: false },
    { id: '2', name: '西葫芦', amount: '1根', haveAtHome: false },
    { id: '3', name: '黄西葫芦', amount: '1根', haveAtHome: false },
    { id: '4', name: '番茄', amount: '3个', haveAtHome: false },
    { id: '5', name: '红椒', amount: '1个', haveAtHome: false },
    { id: '6', name: '洋葱', amount: '1个', haveAtHome: true },
    { id: '7', name: '大蒜', amount: '4瓣', haveAtHome: true },
    { id: '8', name: '番茄膏', amount: '2勺', haveAtHome: false },
    { id: '9', name: '百里香', amount: '少许', haveAtHome: false },
    { id: '10', name: '橄榄油', amount: '适量', haveAtHome: true },
  ],
  '五美元奶昔': [
    { id: '1', name: '香草冰淇淋', amount: '3球', haveAtHome: false },
    { id: '2', name: '牛奶', amount: '150ml', haveAtHome: false },
    { id: '3', name: '香草精', amount: '少许', haveAtHome: false },
    { id: '4', name: '樱桃', amount: '1颗', haveAtHome: false },
  ],
  '日式豚骨拉面': [
    { id: '1', name: '拉面', amount: '1份', haveAtHome: false },
    { id: '2', name: '猪骨汤底', amount: '500ml', haveAtHome: false },
    { id: '3', name: '叉烧肉', amount: '3片', haveAtHome: false },
    { id: '4', name: '溏心蛋', amount: '1个', haveAtHome: false },
    { id: '5', name: '葱花', amount: '适量', haveAtHome: true },
    { id: '6', name: '木耳', amount: '少许', haveAtHome: false },
    { id: '7', name: '白芝麻', amount: '少许', haveAtHome: true },
  ],
  '教父番茄肉酱意面': [
    { id: '1', name: '意面', amount: '200g', haveAtHome: false },
    { id: '2', name: '猪肉末', amount: '300g', haveAtHome: false },
    { id: '3', name: '整罐番茄', amount: '1罐', haveAtHome: false },
    { id: '4', name: '洋葱', amount: '1个', haveAtHome: true },
    { id: '5', name: '大蒜', amount: '4瓣', haveAtHome: true },
    { id: '6', name: '橄榄油', amount: '适量', haveAtHome: true },
    { id: '7', name: '红酒', amount: '50ml', haveAtHome: false },
    { id: '8', name: '罗勒', amount: '少许', haveAtHome: false },
    { id: '9', name: '帕玛森芝士', amount: '适量', haveAtHome: false },
  ],
  '古巴三明治': [
    { id: '1', name: '古巴面包/法棍', amount: '1根', haveAtHome: false },
    { id: '2', name: '烤猪肉', amount: '150g', haveAtHome: false },
    { id: '3', name: '火腿片', amount: '4片', haveAtHome: false },
    { id: '4', name: '瑞士芝士', amount: '2片', haveAtHome: false },
    { id: '5', name: '酸黄瓜', amount: '适量', haveAtHome: false },
    { id: '6', name: '黄芥末', amount: '适量', haveAtHome: true },
    { id: '7', name: '黄油', amount: '30g', haveAtHome: true },
  ],
  '玛雅辣椒热巧克力': [
    { id: '1', name: '黑巧克力', amount: '100g', haveAtHome: false },
    { id: '2', name: '牛奶', amount: '300ml', haveAtHome: false },
    { id: '3', name: '辣椒粉', amount: '1/4茶匙', haveAtHome: false },
    { id: '4', name: '肉桂粉', amount: '少许', haveAtHome: false },
    { id: '5', name: '香草精', amount: '少许', haveAtHome: false },
    { id: '6', name: '细砂糖', amount: '1勺', haveAtHome: true },
  ],
  '法式焦糖布丁': [
    { id: '1', name: '蛋黄', amount: '6个', haveAtHome: true },
    { id: '2', name: '淡奶油', amount: '500ml', haveAtHome: false },
    { id: '3', name: '细砂糖', amount: '100g', haveAtHome: true },
    { id: '4', name: '香草荚', amount: '1根', haveAtHome: false },
  ],
  '南方风味炸鸡': [
    { id: '1', name: '鸡腿/鸡翅', amount: '500g', haveAtHome: false },
    { id: '2', name: '酪乳', amount: '300ml', haveAtHome: false },
    { id: '3', name: '中筋面粉', amount: '200g', haveAtHome: true },
    { id: '4', name: '辣椒粉', amount: '1勺', haveAtHome: false },
    { id: '5', name: '蒜粉', amount: '1勺', haveAtHome: false },
    { id: '6', name: '洋葱粉', amount: '1勺', haveAtHome: false },
    { id: '7', name: '食用油', amount: '适量', haveAtHome: true },
  ],
  '法式洋葱汤': [
    { id: '1', name: '洋葱', amount: '4个', haveAtHome: false },
    { id: '2', name: '黄油', amount: '50g', haveAtHome: true },
    { id: '3', name: '牛肉高汤', amount: '1升', haveAtHome: false },
    { id: '4', name: '白葡萄酒', amount: '100ml', haveAtHome: false },
    { id: '5', name: '法棍', amount: '4片', haveAtHome: false },
    { id: '6', name: '格鲁耶尔芝士', amount: '100g', haveAtHome: false },
    { id: '7', name: '百里香', amount: '少许', haveAtHome: false },
  ],
  '那不勒斯玛格丽特披萨': [
    { id: '1', name: '高筋面粉', amount: '300g', haveAtHome: false },
    { id: '2', name: '酵母', amount: '5g', haveAtHome: false },
    { id: '3', name: '圣玛扎诺番茄', amount: '1罐', haveAtHome: false },
    { id: '4', name: '马苏里拉芝士', amount: '200g', haveAtHome: false },
    { id: '5', name: '新鲜罗勒', amount: '一把', haveAtHome: false },
    { id: '6', name: '橄榄油', amount: '适量', haveAtHome: true },
  ],
  '勃艮第红酒炖牛肉': [
    { id: '1', name: '牛腩', amount: '500g', haveAtHome: false },
    { id: '2', name: '红酒', amount: '500ml', haveAtHome: false },
    { id: '3', name: '洋葱', amount: '2个', haveAtHome: false },
    { id: '4', name: '胡萝卜', amount: '2根', haveAtHome: false },
    { id: '5', name: '蘑菇', amount: '200g', haveAtHome: false },
    { id: '6', name: '培根', amount: '100g', haveAtHome: false },
    { id: '7', name: '番茄膏', amount: '2勺', haveAtHome: false },
    { id: '8', name: '百里香', amount: '少许', haveAtHome: false },
    { id: '9', name: '月桂叶', amount: '2片', haveAtHome: false },
    { id: '10', name: '黄油', amount: '30g', haveAtHome: true },
  ],
}

// 根据菜品生成食材清单
function generateIngredients(dishName: string): Ingredient[] {
  // 精确匹配
  if (DISH_INGREDIENTS[dishName]) {
    return DISH_INGREDIENTS[dishName]
  }

  // 模糊匹配
  for (const [dish, ingredients] of Object.entries(DISH_INGREDIENTS)) {
    if (dishName.includes(dish) || dish.includes(dishName)) {
      return ingredients
    }
  }

  // 默认食材
  return [
    { id: '1', name: '主食材', amount: '500g', haveAtHome: false },
    { id: '2', name: '洋葱', amount: '1个', haveAtHome: true },
    { id: '3', name: '大蒜', amount: '3瓣', haveAtHome: true },
    { id: '4', name: '橄榄油', amount: '适量', haveAtHome: true },
    { id: '5', name: '盐', amount: '适量', haveAtHome: true },
    { id: '6', name: '黑胡椒', amount: '适量', haveAtHome: true },
  ]
}

export function StepIngredients({ topic, onNext, onPrev, stepData }: StepIngredientsProps) {
  const existingIngredients = (stepData.ingredients as { ingredients: Ingredient[] })?.ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    existingIngredients || generateIngredients(topic.recommended_dish)
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">食材清单</h2>
        <p className="text-zinc-400">勾选家里已有的食材，生成采购清单</p>
      </div>

      {/* 食材列表 */}
      <div className="card-elegant divide-y divide-white/5">
        {ingredients.map((ingredient) => (
          <div
            key={ingredient.id}
            onClick={() => toggleIngredient(ingredient.id)}
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
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

      {/* 采购清单汇总 */}
      {shoppingList.length > 0 && (
        <div className="card-elegant p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-amber-400" />
              <h4 className="text-sm font-semibold text-white">
                需采购（{shoppingList.length}项）
              </h4>
            </div>
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
                  复制清单
                </>
              )}
            </button>
          </div>
          <div className="text-sm text-zinc-300">
            {shoppingList.map((ing, i) => (
              <span key={ing.id}>
                {ing.name} {ing.amount}
                {i < shoppingList.length - 1 && '、'}
              </span>
            ))}
          </div>
        </div>
      )}

      {shoppingList.length === 0 && (
        <div className="text-center py-8">
          <Check size={48} className="mx-auto mb-4 text-green-400" />
          <p className="text-green-400 font-medium">所有食材家里都有！</p>
          <p className="text-zinc-500 text-sm mt-1">不需要额外采购</p>
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
        <button
          onClick={() => onNext({ ingredients })}
          className="px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-400 transition-colors flex items-center gap-2"
        >
          下一步
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
