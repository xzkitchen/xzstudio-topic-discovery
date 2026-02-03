import { motion } from 'framer-motion'
import { Film, Sparkles, RefreshCw } from 'lucide-react'

interface EmptyStateProps {
  isLoading: boolean
  onDiscover?: () => void
}

export function EmptyState({ isLoading, onDiscover }: EmptyStateProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {/* 外圈动画 */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-400/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/10 flex items-center justify-center">
            <Film size={32} className="text-amber-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <h3 className="text-lg font-medium text-zinc-300 mb-2">
            正在发现选题...
          </h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            正在收集美食电影精选数据，完成后可配合 Claude Code 进行深度分析
          </p>
        </motion.div>

        {/* 进度指示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-amber-400/60 animate-pulse delay-100" />
          <span className="w-2 h-2 rounded-full bg-amber-400/30 animate-pulse delay-200" />
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24"
    >
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <Sparkles size={32} className="text-zinc-600" />
      </div>

      <h3 className="text-lg font-medium text-zinc-400 mb-2">
        还没有选题
      </h3>
      <p className="text-sm text-zinc-500 text-center max-w-sm mb-6">
        点击下方按钮开始搜索美食选题候选
      </p>

      {onDiscover && (
        <button
          onClick={onDiscover}
          className="px-6 py-3 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors font-medium flex items-center gap-2"
        >
          <RefreshCw size={18} />
          立即发现
        </button>
      )}
    </motion.div>
  )
}
