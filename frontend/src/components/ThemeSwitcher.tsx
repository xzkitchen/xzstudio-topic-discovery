import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check } from 'lucide-react'
import { useTheme, type Theme } from '../contexts/ThemeContext'

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const currentTheme = themes.find(t => t.id === theme)!

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
        style={{
          background: 'var(--accent-soft)',
          border: '1px solid var(--border)',
        }}
      >
        <Palette size={14} style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {currentTheme.emoji}
        </span>
      </motion.button>

      {/* 下拉面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 p-2 rounded-xl z-50 min-w-[180px]"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
            }}
          >
            <p
              className="text-[10px] uppercase tracking-wider font-medium px-2 py-1.5 mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              选择主题
            </p>

            <div className="space-y-1">
              {themes.map((t) => (
                <ThemeOption
                  key={t.id}
                  theme={t}
                  isActive={theme === t.id}
                  onClick={() => {
                    setTheme(t.id)
                    setIsOpen(false)
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ThemeOption({
  theme,
  isActive,
  onClick
}: {
  theme: Theme
  isActive: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors"
      style={{
        background: isActive ? 'var(--accent-soft)' : 'transparent',
      }}
    >
      {/* 颜色预览 */}
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0"
        style={{
          background: theme.preview.bg,
          border: `2px solid ${theme.preview.accent}`,
        }}
      >
        {theme.emoji}
      </div>

      {/* 主题名称 */}
      <span
        className="text-sm font-medium flex-1 text-left"
        style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}
      >
        {theme.name}
      </span>

      {/* 选中标记 */}
      {isActive && (
        <Check size={14} style={{ color: 'var(--accent)' }} />
      )}
    </motion.button>
  )
}
