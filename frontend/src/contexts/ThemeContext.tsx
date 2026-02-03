import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type ThemeId = 'space' | 'midnight' | 'rosegold' | 'sand' | 'aurora' | 'amber'

export interface Theme {
  id: ThemeId
  name: string
  emoji: string
  preview: {
    bg: string
    accent: string
  }
}

export const THEMES: Theme[] = [
  {
    id: 'space',
    name: '深空黑',
    emoji: '🌑',
    preview: { bg: '#1a1a1a', accent: '#e8993a' }
  },
  {
    id: 'midnight',
    name: '午夜蓝',
    emoji: '🌙',
    preview: { bg: '#0f1729', accent: '#d4a853' }
  },
  {
    id: 'rosegold',
    name: '玫瑰金',
    emoji: '🌹',
    preview: { bg: '#1c1618', accent: '#e8b4b8' }
  },
  {
    id: 'sand',
    name: '暖沙棕',
    emoji: '🏜️',
    preview: { bg: '#1a1714', accent: '#dfc089' }
  },
  {
    id: 'aurora',
    name: '极光灰',
    emoji: '❄️',
    preview: { bg: '#141618', accent: '#7dd3fc' }
  },
  {
    id: 'amber',
    name: '琥珀金',
    emoji: '🌅',
    preview: { bg: '#1a1610', accent: '#f59e0b' }
  }
]

interface ThemeContextType {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const STORAGE_KEY = 'xzstudio-theme'

// 旧主题 ID 映射到新主题
const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  'forest': 'rosegold',
  'dusk': 'sand',
  'latte': 'aurora'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      // 检查是否是有效的当前主题
      if (THEMES.some(t => t.id === saved)) {
        return saved as ThemeId
      }
      // 检查是否是旧主题，映射到新主题
      if (saved in LEGACY_THEME_MAP) {
        return LEGACY_THEME_MAP[saved]
      }
    }
    return 'space'
  })

  useEffect(() => {
    // 移除所有主题类
    document.documentElement.classList.remove(...THEMES.map(t => `theme-${t.id}`))
    // 添加当前主题类
    document.documentElement.classList.add(`theme-${theme}`)
    // 保存到 localStorage
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
