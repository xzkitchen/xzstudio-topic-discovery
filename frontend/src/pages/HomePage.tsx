import { useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, AlertCircle, Heart, Sparkles } from 'lucide-react'
import { Header, TopicCard } from '../components'
import { useTopics } from '../hooks/useTopics'
import type { TabType } from '../components/Header'

const PAGE_SIZE = 10
const VALID_TABS: TabType[] = ['movie_food', 'famous_recipe', 'archaeological', 'favorites']

// 入场动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

export function HomePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    discoveryTopics,
    favoriteTopics,
    status,
    error,
    toggleFavorite,
    skipTopic,
    skipFavoriteTopic
  } = useTopics()

  // 从 URL 读取 tab 状态，支持浏览器后退
  const tabFromUrl = searchParams.get('tab') as TabType | null
  const activeTab: TabType = tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'movie_food'

  // 从 URL 读取可见数量
  const countFromUrl = parseInt(searchParams.get('count') || String(PAGE_SIZE), 10)
  const visibleCount = isNaN(countFromUrl) ? PAGE_SIZE : Math.max(PAGE_SIZE, countFromUrl)

  // 切换标签页 - 通过 URL 参数控制
  const setActiveTab = useCallback((tab: TabType) => {
    setSearchParams({ tab }, { replace: false })
  }, [setSearchParams])

  // 加载更多 - 更新 URL 参数
  const setVisibleCount = useCallback((count: number) => {
    setSearchParams({ tab: activeTab, count: count.toString() }, { replace: true })
  }, [setSearchParams, activeTab])

  // 计算各类型数量
  const topicCountByType = useMemo(() => ({
    movie_food: discoveryTopics.filter(t => t.topic_type === 'movie_food').length,
    famous_recipe: discoveryTopics.filter(t => t.topic_type === 'famous_recipe').length,
    archaeological: discoveryTopics.filter(t => t.topic_type === 'archaeological').length,
  }), [discoveryTopics])

  // 根据标签页选择显示的选题
  const allFilteredTopics = useMemo(() => {
    if (activeTab === 'favorites') return favoriteTopics
    return discoveryTopics.filter(t => t.topic_type === activeTab)
  }, [activeTab, discoveryTopics, favoriteTopics])

  // 只显示前 visibleCount 条
  const displayedTopics = useMemo(() => {
    return allFilteredTopics.slice(0, visibleCount)
  }, [allFilteredTopics, visibleCount])

  const hasMore = visibleCount < allFilteredTopics.length

  const loadMore = () => {
    setVisibleCount(visibleCount + PAGE_SIZE)
  }

  const handleStartWorkflow = (topicId: string) => {
    navigate(`/workflow/${topicId}`)
  }

  // 根据当前标签页选择正确的跳过处理函数
  const handleSkip = activeTab === 'favorites' ? skipFavoriteTopic : skipTopic

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <Header
        lastUpdate={status.last_run}
        favoriteCount={favoriteTopics.length}
        topicCountByType={topicCountByType}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="mb-6 p-4 rounded-xl flex items-start gap-3"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)'
              }}
            >
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 选题列表 */}
        {displayedTopics.length > 0 ? (
          <div className="grid gap-4 sm:gap-5">
            <AnimatePresence mode="popLayout">
              {displayedTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                  layout
                >
                  <TopicCard
                    topic={topic}
                    index={index}
                    onToggleFavorite={toggleFavorite}
                    onSkip={handleSkip}
                    onStartWorkflow={handleStartWorkflow}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 加载更多按钮 */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-6"
              >
                <button
                  onClick={loadMore}
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span>加载更多</span>
                  <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
                  <span
                    className="text-xs px-2 py-0.5 rounded-md"
                    style={{
                      background: 'var(--border)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {visibleCount}/{allFilteredTopics.length}
                  </span>
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* 空状态 */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-20 sm:py-32"
          >
            {/* 图标 */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, var(--accent-soft), rgba(var(--accent-rgb), 0.02))',
                border: '1px solid rgba(var(--accent-rgb), 0.1)'
              }}
            >
              {activeTab === 'favorites' ? (
                <Heart size={32} style={{ color: 'var(--accent)' }} />
              ) : (
                <Sparkles size={32} style={{ color: 'var(--accent)' }} />
              )}
            </div>

            {/* 文案 */}
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {activeTab === 'favorites' ? '还没有收藏选题' : '暂无选题'}
            </h3>
            <p className="text-sm text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
              {activeTab === 'favorites'
                ? '浏览选题时，点击卡片上的心形图标即可收藏'
                : '当前分类暂无可用选题，试试其他分类吧'
              }
            </p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative max-w-6xl mx-auto px-4 py-8 mt-8 sm:px-6 sm:py-12 sm:mt-12">
        {/* 顶部分割线 */}
        <div className="divider mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* 品牌 */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'var(--accent-soft)',
                border: '1px solid rgba(var(--accent-rgb), 0.1)'
              }}
            >
              <Sparkles size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>XZstudio</p>
              <p style={{ color: 'var(--text-muted)' }}>v3.0</p>
            </div>
          </div>

          {/* 数据来源 */}
          <p style={{ color: 'var(--text-muted)' }}>
            数据来源: 影视美食 · 名店配方 · 考古美食
          </p>
        </div>
      </footer>
    </div>
  )
}
