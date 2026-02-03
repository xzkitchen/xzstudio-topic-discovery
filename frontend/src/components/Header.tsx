import { motion } from 'framer-motion'
import { Clapperboard, Heart, Star, ScrollText } from 'lucide-react'
import type { TopicType } from '../types'
import { ThemeSwitcher } from './ThemeSwitcher'

export type TabType = TopicType | 'favorites'

interface TopicCounts {
  movie_food: number
  famous_recipe: number
  archaeological: number
}

interface HeaderProps {
  lastUpdate: string | null
  favoriteCount: number
  topicCountByType: TopicCounts
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

// 标签页配置
const TAB_CONFIG = {
  movie_food: {
    icon: Clapperboard,
    label: '影视美食',
    activeColor: 'text-blue-400',
    activeBg: 'bg-blue-500/15 border-blue-500/30',
    hoverBg: 'hover:bg-blue-500/10',
  },
  famous_recipe: {
    icon: Star,
    label: '名店配方',
    activeColor: 'text-amber-400',
    activeBg: 'bg-amber-500/15 border-amber-500/30',
    hoverBg: 'hover:bg-amber-500/10',
  },
  archaeological: {
    icon: ScrollText,
    label: '考古美食',
    activeColor: 'text-violet-400',
    activeBg: 'bg-violet-500/15 border-violet-500/30',
    hoverBg: 'hover:bg-violet-500/10',
  },
  favorites: {
    icon: Heart,
    label: '收藏',
    activeColor: 'text-rose-400',
    activeBg: 'bg-rose-500/15 border-rose-500/30',
    hoverBg: 'hover:bg-rose-500/10',
  },
} as const

export function Header({
  lastUpdate,
  favoriteCount,
  topicCountByType,
  activeTab,
  onTabChange
}: HeaderProps) {
  const getCount = (tab: TabType) => {
    if (tab === 'favorites') return favoriteCount
    return topicCountByType[tab]
  }

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 sm:py-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4"
        >
          <div className="w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Clapperboard size={20} className="sm:w-6 sm:h-6" style={{ color: 'var(--accent)' }} />
                <h1
                  className="text-xl sm:text-2xl font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  XZstudio
                </h1>
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider hidden sm:inline-block"
                  style={{
                    background: 'var(--accent-soft)',
                    color: 'var(--text-muted)'
                  }}
                >
                  v3.0
                </span>
              </div>
              {/* 移动端：主题切换放在标题栏右侧 */}
              <div className="sm:hidden">
                <ThemeSwitcher />
              </div>
            </div>

            {/* 标签页切换 - 移动端横向滚动 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {(Object.keys(TAB_CONFIG) as TabType[]).map((tab) => {
                const config = TAB_CONFIG[tab]
                const Icon = config.icon
                const isActive = activeTab === tab
                const count = getCount(tab)

                return (
                  <motion.button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium
                      border transition-all duration-200 whitespace-nowrap shrink-0
                      ${isActive
                        ? `${config.activeBg} ${config.activeColor}`
                        : `border-transparent ${config.hoverBg}`
                      }
                    `}
                    style={!isActive ? { color: 'var(--text-muted)' } : undefined}
                  >
                    <Icon
                      size={16}
                      className={isActive ? config.activeColor : ''}
                      fill={isActive && tab === 'favorites' ? 'currentColor' : 'none'}
                    />
                    <span>{config.label}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md"
                      style={{
                        background: isActive ? 'var(--accent-soft)' : 'var(--border)',
                        color: isActive ? 'inherit' : 'var(--text-muted)'
                      }}
                    >
                      {count}
                    </span>

                    {/* 激活指示器 */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute -bottom-[9px] inset-x-0 h-0.5 rounded-full ${
                          tab === 'movie_food' ? 'bg-blue-400' :
                          tab === 'famous_recipe' ? 'bg-amber-400' :
                          tab === 'archaeological' ? 'bg-violet-400' :
                          'bg-rose-400'
                        }`}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* 右侧：主题切换 + 状态信息（桌面端） */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <ThemeSwitcher />
            {lastUpdate && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                更新: {new Date(lastUpdate).toLocaleString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  )
}
