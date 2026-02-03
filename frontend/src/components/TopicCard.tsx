import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Film,
  Clock,
  ExternalLink,
  UtensilsCrossed,
  Heart,
  Check,
  ChefHat,
  Lightbulb,
  Video,
  Flame,
  MessageCircle,
  TrendingUp,
  Ban,
  MoreHorizontal,
  Play,
  Sparkles,
  X,
  ScrollText,
  MapPin,
  BookOpen,
  Clapperboard
} from 'lucide-react'
import type { TopicCandidate, SkipReason } from '../types'
import { SKIP_REASON_LABELS, TOPIC_TYPE_LABELS } from '../types'

interface TopicCardProps {
  topic: TopicCandidate
  index: number
  onToggleFavorite?: (id: string) => void
  onSkip?: (topic: TopicCandidate, reason: SkipReason) => void
  onStartWorkflow?: (topicId: string) => void
}

// 烹饪难度颜色映射
const difficultyColors: Record<string, string> = {
  '简单': 'text-green-400 bg-green-400/10 border-green-400/20',
  '中等': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  '困难': 'text-red-400 bg-red-400/10 border-red-400/20',
  '超出能力': 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
}

// 故事角度类型颜色
const angleTypeColors: Record<string, string> = {
  '菜品历史': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  '演员幕后': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  '剧情解读': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  '其他': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
}

// 开场钩子类型颜色
const hookTypeColors: Record<string, string> = {
  '认知冲突': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  '反差跃迁': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  '震撼数据': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  '悬念': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  '名场面': 'bg-amber-500/10 text-amber-400 border-amber-500/20'
}

export function TopicCard({ topic, index, onToggleFavorite, onSkip, onStartWorkflow }: TopicCardProps) {
  const [showSkipMenu, setShowSkipMenu] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [skipError, setSkipError] = useState<string | null>(null)

  // 确保 topic_type 有默认值
  const topicType = topic.topic_type || 'movie_food'

  // 只显示前3个最好的故事切入点
  const displayedAngles = (topic.story_angles || []).slice(0, 3)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite?.(topic.id)
  }

  const handleSkip = async (reason: SkipReason) => {
    if (isSkipping || !onSkip) return
    setIsSkipping(true)
    setSkipError(null)
    try {
      await onSkip(topic, reason)
      // 成功后组件会被卸载，不需要手动关闭菜单
    } catch (err) {
      console.error('跳过失败:', err)
      setSkipError('操作失败，请重试')
      setIsSkipping(false)
      // 保持菜单打开，让用户可以重试
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.03, 0.3),  // 限制最大延迟为0.3秒
        ease: 'easeOut'
      }}
      className="card-elegant overflow-hidden"
    >
      {/* 顶部区域：海报 + 基础信息 */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5">
        {/* 海报/封面 - 根据类型显示不同样式 */}
        <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-lg overflow-hidden shrink-0 relative">
          {/* 影视美食 - 使用 TMDB 海报 */}
          {topicType === 'movie_food' && (
            topic.poster_url ? (
              <img
                src={topic.poster_url}
                alt={topic.work_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-slate-900 flex items-center justify-center">
                <Film size={28} className="text-blue-400/60" />
              </div>
            )
          )}

          {/* 名店配方 - 精美渐变占位符 */}
          {topicType === 'famous_recipe' && (
            <div className="w-full h-full bg-gradient-to-br from-amber-600/30 via-orange-700/20 to-amber-900/40 flex flex-col items-center justify-center relative">
              {/* 装饰元素 */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)]" />
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center">
                <Star size={12} className="text-amber-400/80" fill="currentColor" />
              </div>
              <ChefHat size={24} className="text-amber-400/70 mb-1.5" />
              <span className="text-[9px] font-medium text-amber-300/60 uppercase tracking-wider">Recipe</span>
            </div>
          )}

          {/* 考古美食 - 复古风格占位符 */}
          {topicType === 'archaeological' && (
            <div className="w-full h-full bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-indigo-950/50 flex flex-col items-center justify-center relative">
              {/* 复古纹理效果 */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(139,92,246,0.05) 2px,
                  rgba(139,92,246,0.05) 4px
                )`
              }} />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(167,139,250,0.1),transparent_60%)]" />
              <ScrollText size={24} className="text-violet-400/70 mb-1.5" />
              <span className="text-[9px] font-medium text-violet-300/60 uppercase tracking-wider">Archive</span>
              {topic.year_origin && (
                <span className="text-[10px] font-bold text-violet-400/50 mt-1">{topic.year_origin}</span>
              )}
            </div>
          )}
        </div>

        {/* 基础信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* 编号 + 类型标签 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  #{index + 1}
                </span>
                <span className={`tag text-[10px] flex items-center gap-1 ${
                  topicType === 'famous_recipe' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  topicType === 'archaeological' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {topicType === 'famous_recipe' && <Star size={10} />}
                  {topicType === 'archaeological' && <ScrollText size={10} />}
                  {topicType === 'movie_food' && <Clapperboard size={10} />}
                  {TOPIC_TYPE_LABELS[topicType] || '影视美食'}
                </span>
              </div>

              {/* 标题 - 根据类型显示不同内容 */}
              <h2 className="text-base sm:text-xl font-semibold text-white leading-tight mb-2 group-hover:text-amber-400 transition-colors">
                {topicType === 'famous_recipe' && topic.restaurant_name ? (
                  topic.restaurant_name
                ) : topicType === 'archaeological' && topic.year_origin ? (
                  `${topic.year_origin}年 ${topic.recommended_dish}`
                ) : (
                  `《${topic.work_name}》`
                )}
              </h2>

              {/* 元数据标签 - 根据类型显示不同内容 */}
              <div className="flex flex-wrap items-center gap-2">
                {topicType === 'movie_food' && (
                  <>
                    {topic.douban_score && (
                      <span className="score-badge">
                        <Star size={14} fill="currentColor" />
                        {topic.douban_score}
                      </span>
                    )}
                    <span className="tag flex items-center gap-1.5">
                      <Film size={12} />
                      {topic.work_type}
                    </span>
                    {topic.release_year && (
                      <span className="tag flex items-center gap-1.5">
                        <Clock size={12} />
                        {topic.release_year}
                      </span>
                    )}
                  </>
                )}
                {topicType === 'famous_recipe' && (
                  <>
                    {topic.michelin_stars && (
                      <span className="tag bg-amber-500/10 text-amber-400 border-amber-500/20">
                        {'⭐'.repeat(topic.michelin_stars)} 米其林
                      </span>
                    )}
                    {topic.restaurant_location && (
                      <span className="tag flex items-center gap-1.5">
                        <MapPin size={12} />
                        {topic.restaurant_location}
                      </span>
                    )}
                    {topic.recipe_source_type && (
                      <span className="tag flex items-center gap-1.5">
                        <BookOpen size={12} />
                        {topic.recipe_source_type}
                      </span>
                    )}
                  </>
                )}
                {topicType === 'archaeological' && (
                  <>
                    {topic.historical_period && (
                      <span className="tag bg-violet-500/10 text-violet-400 border-violet-500/20">
                        {topic.historical_period}
                      </span>
                    )}
                    {topic.year_origin && (
                      <span className="tag flex items-center gap-1.5">
                        <Clock size={12} />
                        {topic.year_origin}年
                      </span>
                    )}
                    {topic.archive_collection && (
                      <span className="tag flex items-center gap-1.5">
                        <BookOpen size={12} />
                        {topic.archive_collection}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 操作按钮区：开始制作 + Pass + 收藏 + 已做标记 */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {topic.is_done ? (
                <div className="px-2 sm:px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="text-[10px] sm:text-xs text-green-400 flex items-center gap-1">
                    <Check size={10} className="sm:w-3 sm:h-3" />
                    已做过
                  </span>
                </div>
              ) : onStartWorkflow && (
                /* 开始制作按钮 */
                <button
                  onClick={() => onStartWorkflow(topic.id)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 active:bg-amber-500/30 transition-colors text-[10px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5"
                >
                  <Play size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">开始</span>制作
                </button>
              )}

              {/* Pass按钮 */}
              <div className="relative">
                <button
                  onClick={() => setShowSkipMenu(!showSkipMenu)}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors group"
                  title="跳过这个选题"
                >
                  <X
                    size={16}
                    className="sm:w-[18px] sm:h-[18px] text-zinc-500 group-hover:text-red-400 transition-colors"
                  />
                </button>

                {/* 跳过原因菜单 */}
                <AnimatePresence>
                  {showSkipMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-48 p-2 rounded-xl bg-bg-card border border-white/10 shadow-xl z-50"
                    >
                      <p className="text-xs text-zinc-500 px-2 py-1 mb-1">为什么跳过？</p>
                      {skipError && (
                        <p className="text-xs text-red-400 px-2 py-1 mb-1">{skipError}</p>
                      )}
                      {isSkipping ? (
                        <p className="text-xs text-amber-400 px-2 py-2 text-center">处理中...</p>
                      ) : (
                        (Object.keys(SKIP_REASON_LABELS) as SkipReason[]).map((reason) => (
                          <button
                            key={reason}
                            onClick={() => handleSkip(reason)}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                          >
                            {reason === 'not_interested' && <Ban size={14} className="text-zinc-500" />}
                            {reason === 'not_suitable' && <X size={14} className="text-zinc-500" />}
                            {reason === 'too_simple' && <MoreHorizontal size={14} className="text-zinc-500" />}
                            {reason === 'done' && <Check size={14} className="text-green-500" />}
                            {SKIP_REASON_LABELS[reason]}
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 收藏按钮 */}
              <button
                onClick={handleFavorite}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
                title={topic.is_favorited ? '取消收藏' : '收藏'}
              >
                <Heart
                  size={16}
                  className={`sm:w-[18px] sm:h-[18px] ${
                    topic.is_favorited
                      ? 'fill-red-400 text-red-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 推荐菜品 + 难度 */}
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <UtensilsCrossed size={12} className="sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span className="text-xs sm:text-sm font-medium text-white">{topic.recommended_dish}</span>
            </div>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs border ${difficultyColors[topic.cooking_difficulty] || difficultyColors['中等']}`}>
              <ChefHat size={10} className="inline mr-0.5 sm:mr-1" />
              {topic.cooking_difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* 美食场景/描述 */}
      <div className="px-4 sm:px-5 pb-3 sm:pb-4">
        <div className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
              <Film size={10} className="sm:w-3 sm:h-3" />
              {topicType === 'famous_recipe' ? '配方亮点' :
               topicType === 'archaeological' ? '历史背景' : '美食场景'}
            </h3>
            {topic.food_scene_timestamp && (
              <span className="text-[10px] sm:text-xs text-amber-400/80 flex items-center gap-1">
                <Clock size={10} />
                {topic.food_scene_timestamp}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {topic.food_scene_description}
          </p>
        </div>
      </div>

      {/* 名店配方专用：主厨信息 */}
      {topicType === 'famous_recipe' && topic.chef_name && (
        <div className="px-4 sm:px-5 pb-3 sm:pb-4">
          <div className="p-3 sm:p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h3 className="text-[10px] sm:text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 sm:gap-2">
              <ChefHat size={10} className="sm:w-3 sm:h-3" />
              主厨
            </h3>
            <p className="text-xs sm:text-sm text-white font-medium">{topic.chef_name}</p>
            {topic.chef_background && (
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">{topic.chef_background}</p>
            )}
            {topic.restaurant_story && (
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-2 italic">{topic.restaurant_story}</p>
            )}
          </div>
        </div>
      )}

      {/* 考古美食专用：史料来源 */}
      {topicType === 'archaeological' && topic.historical_source && (
        <div className="px-4 sm:px-5 pb-3 sm:pb-4">
          <div className="p-3 sm:p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
            <h3 className="text-[10px] sm:text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 sm:gap-2">
              <BookOpen size={10} className="sm:w-3 sm:h-3" />
              史料来源
            </h3>
            <p className="text-xs sm:text-sm text-white">{topic.historical_source}</p>
            {topic.historical_source_url && (
              <a
                href={topic.historical_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] sm:text-xs text-violet-400 hover:underline mt-2 inline-flex items-center gap-1"
              >
                <ExternalLink size={10} />
                查看原始文献
              </a>
            )}
            {topic.cultural_context && (
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-2">{topic.cultural_context}</p>
            )}
            {topic.historical_figure && (
              <p className="text-[10px] sm:text-xs text-zinc-400 mt-1">相关人物：{topic.historical_figure}</p>
            )}
          </div>
        </div>
      )}

      {/* 故事切入点 */}
      <div className="px-4 sm:px-5 pb-3 sm:pb-4">
        <h3 className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
          <Lightbulb size={10} className="sm:w-3 sm:h-3" />
          故事切入点
        </h3>
        <div className="grid gap-2">
          {displayedAngles.map((angle, i) => (
            <div
              key={`${angle.title}-${i}`}
              className={`p-2.5 sm:p-3 rounded-lg border ${angleTypeColors[angle.angle_type] || angleTypeColors['其他']}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs font-medium">{angle.angle_type}</span>
                <span className="text-[10px] sm:text-xs opacity-60">{angle.potential_score}分</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-white mb-1">{angle.title}</p>
              <p className="text-[10px] sm:text-xs text-zinc-400">{angle.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 开场钩子 */}
      {topic.opening_hooks && topic.opening_hooks.length > 0 && (
        <div className="px-4 sm:px-5 pb-3 sm:pb-4">
          <h3 className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
            <Sparkles size={10} className="sm:w-3 sm:h-3" />
            开场钩子参考
          </h3>
          <div className="grid gap-2">
            {topic.opening_hooks.map((hook, i) => (
              <div
                key={i}
                className={`p-2.5 sm:p-3 rounded-lg border ${hookTypeColors[hook.type] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10">
                    {hook.type}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">"{hook.content}"</p>
                {hook.source && (
                  <p className="text-[9px] sm:text-[10px] text-zinc-500 mt-1">来源: {hook.source}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 画面素材 + 三有评分 */}
      <div className="px-4 sm:px-5 pb-3 sm:pb-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
          {/* 画面素材 */}
          {topic.footage_sources && topic.footage_sources.length > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-zinc-400">
              <Video size={10} className="sm:w-3 sm:h-3" />
              <span>{topic.footage_sources.join(' · ')}</span>
            </div>
          )}
        </div>

        {/* 三有评分 */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
          <span className={`flex items-center gap-1 text-[10px] sm:text-xs ${topic.is_interesting ? 'text-amber-400' : 'text-zinc-600'}`}>
            <Flame size={10} className="sm:w-3 sm:h-3" />
            {topic.is_interesting ? '✓' : '○'} 有趣
          </span>
          <span className={`flex items-center gap-1 text-[10px] sm:text-xs ${topic.is_discussable ? 'text-amber-400' : 'text-zinc-600'}`}>
            <MessageCircle size={10} className="sm:w-3 sm:h-3" />
            {topic.is_discussable ? '✓' : '○'} 有话题
          </span>
          <span className={`flex items-center gap-1 text-[10px] sm:text-xs ${topic.has_momentum ? 'text-amber-400' : 'text-zinc-600'}`}>
            <TrendingUp size={10} className="sm:w-3 sm:h-3" />
            {topic.has_momentum ? '✓' : '○'} 有热点
          </span>
        </div>
      </div>

      {/* 底部：外部链接 + 收集时间 */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-white/5 flex items-center justify-between">
        {topicType === 'movie_food' && (
          <a
            href={topic.douban_url || `https://movie.douban.com/subject_search?search_text=${encodeURIComponent(topic.work_name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-zinc-500 hover:text-amber-400 active:text-amber-500 transition-colors"
          >
            <ExternalLink size={10} className="sm:w-3 sm:h-3" />
            豆瓣详情
          </a>
        )}
        {topicType === 'famous_recipe' && (
          <a
            href={topic.recipe_source_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-zinc-500 hover:text-amber-400 active:text-amber-500 transition-colors"
          >
            <ExternalLink size={10} className="sm:w-3 sm:h-3" />
            {topic.recipe_source_url ? '官方配方' : '暂无链接'}
          </a>
        )}
        {topicType === 'archaeological' && (
          <a
            href={topic.historical_source_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-zinc-500 hover:text-violet-400 active:text-violet-500 transition-colors"
          >
            <ExternalLink size={10} className="sm:w-3 sm:h-3" />
            {topic.historical_source_url ? '史料原文' : '暂无链接'}
          </a>
        )}

        <span className="text-[9px] sm:text-[10px] text-zinc-600">
          {new Date(topic.collected_at).toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </motion.article>
  )
}
