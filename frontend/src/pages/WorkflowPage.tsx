import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { WorkflowStepper, type WorkflowStep } from '../components/workflow/WorkflowStepper'
import { StepConfirm } from '../components/workflow/StepConfirm'
import { StepMaterials } from '../components/workflow/StepMaterials'
import { StepDraft } from '../components/workflow/StepDraft'
import { StepCooking } from '../components/workflow/StepCooking'
import { StepPublish } from '../components/workflow/StepPublish'
import type { TopicCandidate } from '../types'

// 食材清单已整合到选题确认步骤
const WORKFLOW_STEPS = [
  { id: 'confirm', title: '选题确认' },
  { id: 'materials', title: '素材挖掘' },
  { id: 'draft', title: '大纲&初稿' },
  { id: 'cooking', title: '烹饪教程' },
  { id: 'publish', title: '发布物料' },
]

export function WorkflowPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // 从URL参数读取步骤，支持浏览器后退
  const stepFromUrl = parseInt(searchParams.get('step') || '0', 10)
  const currentStep = isNaN(stepFromUrl) ? 0 : Math.max(0, Math.min(stepFromUrl, WORKFLOW_STEPS.length - 1))

  const [topic, setTopic] = useState<TopicCandidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stepData, setStepData] = useState<Record<string, unknown>>({})

  // 加载选题数据
  useEffect(() => {
    async function loadTopic() {
      if (!topicId) return
      try {
        setLoading(true)
        const res = await fetch(`/api/topics/${topicId}`)
        if (!res.ok) throw new Error('选题不存在')
        const data = await res.json()
        setTopic(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }
    loadTopic()
  }, [topicId])

  // 构建步骤数据
  const steps: WorkflowStep[] = WORKFLOW_STEPS.map((step, index) => ({
    ...step,
    completed: index < currentStep
  }))

  // 步骤导航 - 通过URL参数控制，支持浏览器后退
  const setCurrentStep = useCallback((step: number) => {
    setSearchParams({ step: step.toString() }, { replace: false })
  }, [setSearchParams])

  const handleNext = (data?: unknown) => {
    if (data) {
      setStepData(prev => ({ ...prev, [WORKFLOW_STEPS[currentStep].id]: data }))
    }
    if (currentStep < WORKFLOW_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    // 标记选题为已完成
    try {
      await fetch('/api/topics/done', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_name: topic?.work_name,
          dish_name: topic?.recommended_dish
        })
      })
      navigate('/')
    } catch (err) {
      console.error('标记完成失败:', err)
    }
  }

  // 渲染当前步骤内容
  const renderStepContent = () => {
    if (!topic) return null

    const commonProps = {
      topic,
      onNext: handleNext,
      onPrev: handlePrev,
      stepData
    }

    switch (currentStep) {
      case 0:
        return <StepConfirm {...commonProps} />
      case 1:
        return <StepMaterials {...commonProps} />
      case 2:
        return <StepDraft {...commonProps} />
      case 3:
        return <StepCooking {...commonProps} />
      case 4:
        return <StepPublish {...commonProps} onComplete={handleComplete} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || '选题不存在'}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 transition-colors"
          style={{ color: 'var(--accent)' }}
        >
          <ArrowLeft size={16} />
          返回上一页
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className="relative backdrop-blur-xl sticky top-0 z-40"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 sm:gap-2 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm">返回</span>
            </button>
            <div className="text-right flex-1 ml-4 min-w-0">
              <h1 className="text-sm sm:text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                <span className="hidden sm:inline">《{topic.work_name}》· </span>
                <span className="sm:hidden">{topic.recommended_dish}</span>
                <span className="hidden sm:inline">{topic.recommended_dish}</span>
              </h1>
            </div>
          </div>

          {/* Stepper */}
          <div className="pb-6 sm:pb-8 pt-1 sm:pt-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <WorkflowStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
