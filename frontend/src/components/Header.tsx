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
      <div className="max-w-6xl mx-auto px-6 py-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Clapperboard size={24} style={{ color: 'var(--accent)' }} />
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                XZstudio
              </h1>
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--text-muted)'
                }}
              >
                v3.0
              </span>
            </div>

            {/* 标签页切换 - 优化样式 */}
            <div className="flex items-center gap-2 flex-wrap">
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
                      relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                      border transition-all duration-200
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

          {/* 右侧：主题切换 + 状态信息 */}
          <div className="flex items-center gap-4">
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
