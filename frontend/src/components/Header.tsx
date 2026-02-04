import { motion } from 'framer-motion'
import { Clapperboard, Heart, Star, ScrollText, Sparkles } from 'lucide-react'
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
    activeBg: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20',
  },
  famous_recipe: {
    icon: Star,
    label: '名店配方',
    activeColor: 'text-amber-400',
    activeBg: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/20',
  },
  archaeological: {
    icon: ScrollText,
    label: '考古美食',
    activeColor: 'text-violet-400',
    activeBg: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    glowColor: 'shadow-violet-500/20',
  },
  favorites: {
    icon: Heart,
    label: '收藏',
    activeColor: 'text-rose-400',
    activeBg: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    glowColor: 'shadow-rose-500/20',
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
    <header className="sticky top-0 z-50">
      {/* 毛玻璃背景 */}
      <div
        className="absolute inset-0 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, var(--bg-primary) 0%, color-mix(in srgb, var(--bg-primary) 95%, transparent) 100%)',
        }}
      />
      {/* 底部边框渐变 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--border-hover), transparent)'
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-4 sm:px-6 sm:py-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4"
        >
          {/* 顶部：Logo + 状态 + 主题切换 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-soft), rgba(var(--accent-rgb), 0.03))',
                    border: '1px solid rgba(var(--accent-rgb), 0.15)'
                  }}
                >
                  <Sparkles size={20} style={{ color: 'var(--accent)' }} />
                </div>
              </motion.div>

              {/* 品牌名称 */}
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
                  <span style={{ color: 'var(--text-primary)' }}>XZstudio</span>
                  <span
                    className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider"
                    style={{
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(var(--accent-rgb), 0.1)'
                    }}
                  >
                    v3
                  </span>
                </h1>
                <p className="text-[11px] hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                  美食选题发现工具
                </p>
              </div>
            </div>

            {/* 右侧：状态 + 主题切换 */}
            <div className="flex items-center gap-3">
              {lastUpdate && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="pulse-dot" />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(lastUpdate).toLocaleString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              <ThemeSwitcher />
            </div>
          </div>

          {/* 标签页导航 */}
          <nav className="relative">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
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
                      relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5
                      rounded-xl text-xs sm:text-sm font-medium
                      transition-all duration-300 whitespace-nowrap shrink-0
                      ${isActive
                        ? `${config.activeBg} ${config.activeColor} border ${config.borderColor} shadow-lg ${config.glowColor}`
                        : 'border border-transparent hover:border-[var(--border)] hover:bg-white/[0.02]'
                      }
                    `}
                    style={!isActive ? { color: 'var(--text-muted)' } : undefined}
                  >
                    <Icon
                      size={16}
                      className={`sm:w-[18px] sm:h-[18px] transition-colors ${isActive ? config.activeColor : ''}`}
                      fill={isActive && tab === 'favorites' ? 'currentColor' : 'none'}
                    />
                    <span className="hidden xs:inline">{config.label}</span>

                    {/* 数量徽标 */}
                    <span
                      className={`
                        text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md font-medium
                        transition-all duration-300
                        ${isActive
                          ? 'bg-white/10'
                          : 'bg-white/[0.03]'
                        }
                      `}
                      style={{
                        color: isActive ? 'inherit' : 'var(--text-muted)'
                      }}
                    >
                      {count}
                    </span>

                    {/* 激活状态的底部光条 */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className={`absolute -bottom-1 left-2 right-2 h-0.5 rounded-full ${
                          tab === 'movie_food' ? 'bg-blue-400' :
                          tab === 'famous_recipe' ? 'bg-amber-400' :
                          tab === 'archaeological' ? 'bg-violet-400' :
                          'bg-rose-400'
                        }`}
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </nav>
        </motion.div>
      </div>
    </header>
  )
}
