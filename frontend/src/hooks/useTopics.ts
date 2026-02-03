import { useState, useEffect, useCallback } from 'react'
import type { TopicCandidate, DiscoveryStatus, SkipReason } from '../types'

export function useTopics() {
  // 发现池：当前展示的5个选题
  const [discoveryTopics, setDiscoveryTopics] = useState<TopicCandidate[]>([])
  // 收藏池：用户收藏的选题（持久保存）
  const [favoriteTopics, setFavoriteTopics] = useState<TopicCandidate[]>([])

  const [status, setStatus] = useState<DiscoveryStatus>({
    is_running: false,
    last_run: null,
    last_count: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取发现池选题
  const fetchDiscoveryTopics = useCallback(async () => {
    try {
      const res = await fetch('/api/topics')
      if (!res.ok) throw new Error('获取选题失败')
      const data = await res.json()
      setDiscoveryTopics(data)
    } catch (err) {
      console.error('获取选题失败:', err)
      setError(err instanceof Error ? err.message : '未知错误')
    }
  }, [])

  // 获取收藏池选题（完整数据）
  const fetchFavoriteTopics = useCallback(async () => {
    try {
      const res = await fetch('/api/favorites/full')
      if (!res.ok) throw new Error('获取收藏失败')
      const data = await res.json()
      setFavoriteTopics(data.topics || [])
    } catch (err) {
      console.error('获取收藏失败:', err)
    }
  }, [])

  // 获取状态
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status')
      if (!res.ok) throw new Error('获取状态失败')
      const data = await res.json()
      setStatus(data)
    } catch (err) {
      console.error('获取状态失败:', err)
    }
  }, [])

  // 触发发现 - 完全替换当前5个选题
  const triggerDiscovery = useCallback(async () => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/collect', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || '发现失败')
      }
      const data = await res.json()
      // 后端返回 { topics: [...], formatted: "...", ... }
      const topicsList = data.topics || []
      setDiscoveryTopics(topicsList)
      setStatus(prev => ({
        ...prev,
        last_run: new Date().toISOString(),
        last_count: topicsList.length
      }))
    } catch (err) {
      console.error('发现失败:', err)
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }, [loading])

  // 切换收藏状态
  const toggleFavorite = useCallback(async (topicId: string) => {
    try {
      const res = await fetch(`/api/topics/${topicId}/favorite`, {
        method: 'POST'
      })
      if (!res.ok) throw new Error('操作失败')
      const { is_favorited } = await res.json()

      if (is_favorited) {
        // 收藏：从发现池找到选题，加入收藏池，从发现池移除
        const topic = discoveryTopics.find(t => t.id === topicId)
        if (topic) {
          setFavoriteTopics(prev => [...prev, { ...topic, is_favorited: true }])
          setDiscoveryTopics(prev => prev.filter(t => t.id !== topicId))
        }
      } else {
        // 取消收藏：从收藏池移除（下次刷新发现池时可能重新出现）
        setFavoriteTopics(prev => prev.filter(t => t.id !== topicId))
      }

      return is_favorited
    } catch (err) {
      console.error('收藏操作失败:', err)
      throw err
    }
  }, [discoveryTopics])

  // 标记为已做
  const markAsDone = useCallback(async (workName: string, dishName: string) => {
    try {
      const params = new URLSearchParams({ work_name: workName, dish_name: dishName })
      const res = await fetch(`/api/topics/done?${params}`, {
        method: 'POST'
      })
      if (!res.ok) throw new Error('操作失败')

      // 更新本地状态 - 两个池子都要更新
      setDiscoveryTopics(prev => prev.map(topic =>
        topic.work_name === workName
          ? { ...topic, is_done: true }
          : topic
      ))
      setFavoriteTopics(prev => prev.map(topic =>
        topic.work_name === workName
          ? { ...topic, is_done: true }
          : topic
      ))
    } catch (err) {
      console.error('标记已做失败:', err)
      throw err
    }
  }, [])

  // 跳过选题（不感兴趣/不适合）- 从发现池移除，自动补充新选题
  const skipTopic = useCallback(async (topic: TopicCandidate, reason: SkipReason) => {
    try {
      const res = await fetch('/api/topics/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: topic.id,
          work_name: topic.work_name,
          dish_name: topic.recommended_dish,
          reason
        })
      })
      if (!res.ok) throw new Error('操作失败')

      // 先从本地移除，然后刷新获取新的5个选题（自动补充）
      setDiscoveryTopics(prev => prev.filter(t => t.id !== topic.id))

      // 异步刷新发现池，补充新选题
      setTimeout(() => {
        fetchDiscoveryTopics()
      }, 300) // 短暂延迟让UI动画完成

      return true
    } catch (err) {
      console.error('跳过选题失败:', err)
      throw err
    }
  }, [fetchDiscoveryTopics])

  // 从收藏池移除并跳过
  const skipFavoriteTopic = useCallback(async (topic: TopicCandidate, reason: SkipReason) => {
    try {
      // 先取消收藏
      await fetch(`/api/topics/${topic.id}/favorite`, { method: 'POST' })

      // 再标记跳过
      const res = await fetch('/api/topics/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: topic.id,
          work_name: topic.work_name,
          dish_name: topic.recommended_dish,
          reason
        })
      })
      if (!res.ok) throw new Error('操作失败')

      // 从收藏池移除
      setFavoriteTopics(prev => prev.filter(t => t.id !== topic.id))

      return true
    } catch (err) {
      console.error('跳过选题失败:', err)
      throw err
    }
  }, [])

  // 初始加载
  useEffect(() => {
    fetchDiscoveryTopics()
    fetchFavoriteTopics()
    fetchStatus()
  }, [fetchDiscoveryTopics, fetchFavoriteTopics, fetchStatus])

  return {
    // 发现池
    discoveryTopics,
    // 收藏池
    favoriteTopics,
    // 状态
    status,
    loading,
    error,
    // 操作
    triggerDiscovery,
    toggleFavorite,
    markAsDone,
    skipTopic,
    skipFavoriteTopic,
    // 刷新
    refreshDiscovery: fetchDiscoveryTopics,
    refreshFavorites: fetchFavoriteTopics
  }
}
