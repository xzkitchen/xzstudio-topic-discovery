// 选题类型
export type TopicType = "movie_food" | "famous_recipe" | "archaeological"

export const TOPIC_TYPE_LABELS: Record<TopicType, string> = {
  movie_food: "影视美食",
  famous_recipe: "名店配方",
  archaeological: "考古美食"
}

export const TOPIC_TYPE_ICONS: Record<TopicType, string> = {
  movie_food: "🎬",
  famous_recipe: "⭐",
  archaeological: "📜"
}

// 故事切入点
export interface StoryAngle {
  angle_type: "菜品历史" | "演员幕后" | "剧情解读" | "其他"
  title: string
  description: string
  potential_score: number  // 1-10
}

// 烹饪难度
export type CookingDifficulty = "简单" | "中等" | "困难" | "超出能力"

// 跳过原因
export type SkipReason = "not_interested" | "not_suitable" | "too_simple" | "done"

export const SKIP_REASON_LABELS: Record<SkipReason, string> = {
  not_interested: "不感兴趣",
  not_suitable: "不适合我做",
  too_simple: "画面太简单",
  done: "已经做过"
}

// 开场钩子
export interface OpeningHook {
  type: "认知冲突" | "反差跃迁" | "震撼数据" | "悬念" | "名场面"
  content: string
  source?: string  // 数据来源（如果是数据型钩子）
}

// 食材
export interface Ingredient {
  name: string
  amount: string
  is_pantry: boolean  // 是否是厨房常备（洋葱、大蒜、盐等）
}

// 完整的选题候选
export interface TopicCandidate {
  id: string

  // 选题类型
  topic_type: TopicType

  // 作品信息（影视美食用）
  work_name: string
  work_type: string
  douban_score?: number
  douban_url: string | null
  release_year?: number
  poster_url?: string  // 海报URL

  // 美食场景
  food_scene_description: string
  food_scene_timestamp?: string  // 食物画面出现的时间 (电影: "1:38:00", 电视剧: "S01E05 15:00")
  recommended_dish: string
  dish_origin?: string
  visual_complexity?: "低" | "中" | "高"  // 视觉复杂度（低的已过滤）

  // 故事切入点
  story_angles: StoryAngle[]
  backup_angles?: StoryAngle[]  // 备选切入点（用于替换pass掉的）

  // 开场钩子
  opening_hooks?: OpeningHook[]

  // 画面素材
  footage_sources: string[]
  footage_available: boolean

  // 烹饪评估
  cooking_difficulty: CookingDifficulty
  cooking_notes?: string

  // 食材清单
  ingredients?: Ingredient[]

  // 三有评分
  is_interesting: boolean
  is_discussable: boolean
  has_momentum: boolean
  heat_reason?: string

  // === 名店配方专用字段 ===
  restaurant_name?: string        // 餐厅名称
  restaurant_location?: string    // 餐厅位置（城市、国家）
  michelin_stars?: number         // 米其林星级 (1-3)
  chef_name?: string              // 主厨姓名
  chef_background?: string        // 主厨背景故事
  restaurant_story?: string       // 餐厅背景故事
  recipe_source_type?: string     // 配方来源类型（官网/书籍/采访）
  recipe_source_url?: string      // 原始配方URL
  dish_category?: string          // 菜品分类（甜品/正餐/开胃菜等）

  // === 考古美食专用字段 ===
  historical_period?: string      // 历史时期（如"维多利亚时代"）
  year_origin?: number            // 配方具体年份（如1867）
  historical_source?: string      // 史料来源（古籍名称）
  historical_source_url?: string  // 史料数字化链接
  cultural_context?: string       // 文化背景描述
  historical_figure?: string      // 相关历史人物（如"歌德家族"）
  archive_collection?: string     // 所属档案馆/数据库

  // 状态
  is_done: boolean
  is_favorited: boolean

  // 综合得分
  total_score: number

  // 元数据
  discovered_at?: string
  collected_at: string
  source: string
}

// 发现状态
export interface DiscoveryStatus {
  is_running: boolean
  last_run: string | null
  last_count: number
}

// 兼容旧的简化格式（用于渐进迁移）
export interface Topic {
  title: string
  score: number
  year: number
  url: string
  food_hint: string
  source: string
  collected_at: string
}
