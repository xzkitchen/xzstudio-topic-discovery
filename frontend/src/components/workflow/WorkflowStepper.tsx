import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export interface WorkflowStep {
  id: string
  title: string
  completed: boolean
}

interface WorkflowStepperProps {
  steps: WorkflowStep[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
}

export function WorkflowStepper({ steps, currentStep, onStepClick }: WorkflowStepperProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto min-w-max sm:min-w-0">
      {steps.map((step, index) => {
        const isCompleted = step.completed
        const isCurrent = index === currentStep
        const isPast = index < currentStep
        const isClickable = isPast || isCurrent

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* Step Circle */}
            <button
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={`
                relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full
                transition-all duration-300 shrink-0
                ${isCompleted
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                  : isCurrent
                    ? 'bg-amber-500 text-white ring-2 sm:ring-4 ring-amber-500/20'
                    : 'bg-zinc-800/80 text-zinc-500 border border-zinc-700/50'
                }
                ${isClickable ? 'cursor-pointer active:scale-95 sm:hover:scale-105' : 'cursor-not-allowed'}
              `}
            >
              {isCompleted ? (
                <Check size={14} className="sm:w-[18px] sm:h-[18px]" strokeWidth={3} />
              ) : (
                <span className="text-xs sm:text-sm font-medium">{index + 1}</span>
              )}

              {/* Step Label */}
              <span className={`
                absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap
                text-[10px] sm:text-xs font-medium transition-colors
                ${isCurrent ? 'text-amber-400' : isCompleted ? 'text-amber-400/80' : 'text-zinc-500'}
              `}>
                {step.title}
              </span>
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-1.5 sm:mx-2 bg-zinc-800/50 relative overflow-hidden rounded-full min-w-[20px] sm:min-w-[40px]">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: isPast ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
