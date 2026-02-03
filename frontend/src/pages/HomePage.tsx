import { useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Header, TopicCard } from '../components'
import { useTopics } from '../hooks/useTopics'
import type { TabType } from '../components/Header'

const PAGE_SIZE = 10
const VALID_TABS: TabType[] = ['movie_food', 'famous_recipe', 'archaeological', 'favorites']

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
    <>
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 选题列表 */}
        {displayedTopics.length > 0 ? (
          <div className="grid gap-4 sm:gap-5">
            {displayedTopics.map((topic, index) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                index={index}
                onToggleFavorite={toggleFavorite}
                onSkip={handleSkip}
                onStartWorkflow={handleStartWorkflow}
              />
            ))}

            {/* 加载更多按钮 */}
            {hasMore && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={loadMore}
                className="mt-4 mx-auto flex items-center gap-2 px-6 py-3 rounded-xl transition-all"
                style={{
                  background: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                <span>加载更多</span>
                <ChevronDown size={16} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  ({visibleCount}/{allFilteredTopics.length})
                </span>
              </motion.button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'favorites' ? '还没有收藏任何选题' : '该分类暂无选题'}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              {activeTab === 'favorites' ? '点击选题卡片上的 ❤️ 来收藏' : '试试其他分类吧'}
            </p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="relative max-w-6xl mx-auto px-4 py-6 mt-6 sm:px-6 sm:py-8 sm:mt-8"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-center sm:text-left" style={{ color: 'var(--text-muted)' }}>
          <p>XZstudio v3.0</p>
          <p>数据来源: 影视美食 · 名店配方 · 考古美食</p>
        </div>
      </footer>
    </>
  )
}
