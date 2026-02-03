import { useState } from 'react'
import { ArrowLeft, ArrowRight, ChefHat, ExternalLink, Play, Clock, Users, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import type { TopicCandidate } from '../../types'

// 旧格式步骤（兼容现有数据）
interface LegacyStep {
  id: string
  title: string
  description: string      // 旧格式用单个描述
  duration?: string
  tips?: string            // 旧格式用单个提示
}

// 新格式详细步骤
interface DetailedStep {
  id: string
  title: string
  duration?: string
  details: string[]        // 详细操作步骤列表
  ingredients?: string[]   // 这一步用到的食材和用量
  tips?: string[]          // 注意事项列表
  warnings?: string[]      // 常见错误提醒
}

// 运行时使用的完整步骤类型
interface CookingStep {
  id: string
  title: string
  duration?: string
  details: string[]
  ingredients?: string[]
  tips?: string[]
  warnings?: string[]
  completed: boolean
  expanded: boolean
}

// 数据可以是旧格式或新格式
type RawStep = LegacyStep | Omit<DetailedStep, 'completed' | 'expanded'>

interface VideoTutorial {
  title: string
  platform: 'YouTube' | 'B站' | '小红书'
  url: string
  duration?: string
  author?: string
}

interface StepCookingProps {
  topic: TopicCandidate
  onNext: (data: { cookingSteps: CookingStep[] }) => void
  onPrev: () => void
  stepData: Record<string, unknown>
}

// 烹饪教程数据库 - 支持旧格式和新格式的步骤数据
const DETAILED_DISH_STEPS: Record<string, RawStep[]> = {
  '普罗旺斯炖蔬菜': [
    {
      id: '1',
      title: '准备蔬菜',
      duration: '15分钟',
      ingredients: ['茄子 1根（约200g）', '绿西葫芦 1根', '黄西葫芦 1根', '番茄 2个（熟透的）'],
      details: [
        '茄子不用削皮，洗净后用厨房纸擦干',
        '用锋利的刀把茄子切成 2-3mm 厚的圆片，厚度要均匀',
        '西葫芦同样切成 2-3mm 的圆片',
        '番茄切片前先用开水烫30秒去皮会更好，然后切同样厚度',
        '所有切片按颜色分开放好，待用'
      ],
      tips: ['切片厚度一致是关键，否则烤的时候有的糊了有的还没熟', '如果刀不够锋利，蔬菜容易被压扁变形'],
      warnings: ['不要切太薄（<2mm），会烤焦变脆']
    },
    {
      id: '2',
      title: '制作番茄酱底',
      duration: '10分钟',
      ingredients: ['洋葱 半个', '大蒜 3瓣', '番茄膏 2大勺', '橄榄油 2大勺', '水 50ml', '盐 适量', '黑胡椒 适量'],
      details: [
        '洋葱切成细碎的小丁（越细越好，口感会更顺滑）',
        '大蒜切成蒜末',
        '锅里倒橄榄油，小火加热',
        '下洋葱丁，慢慢炒 3-4 分钟直到变透明变软',
        '加入蒜末，再炒 30 秒闻到香味',
        '加入番茄膏，翻炒 1 分钟让它微微上色',
        '倒入水，搅拌均匀，加盐和黑胡椒调味',
        '小火煮 2 分钟让酱汁稍微收浓'
      ],
      tips: ['酱底要能挂在勺子上的浓稠度，太稀的话蔬菜会泡在水里', '番茄膏炒一下可以去掉生味'],
      warnings: ['洋葱不要炒焦，焦了会发苦']
    },
    {
      id: '3',
      title: '摆盘排列',
      duration: '20分钟',
      details: [
        '准备一个圆形或椭圆形烤盘（直径约 20-25cm）',
        '把番茄酱底均匀铺在烤盘底部，厚度约 5mm',
        '从烤盘边缘开始，把蔬菜片竖着插进酱底里',
        '按照「茄子-绿西葫芦-黄西葫芦-番茄」的顺序循环排列',
        '蔬菜片之间稍微重叠一点（重叠约 1/3），这样更好看',
        '一直排到中心，形成一个漂亮的同心圆',
        '中心可以用卷起来的蔬菜片做个"玫瑰花"造型'
      ],
      tips: ['这一步最考验耐心，别着急，慢慢排', '蔬菜片要竖着插，不是平躺着放', '排列整齐出来才好看，这是这道菜的灵魂'],
      warnings: ['蔬菜要插进酱底固定住，不然烤的时候会倒']
    },
    {
      id: '4',
      title: '调味',
      duration: '5分钟',
      ingredients: ['橄榄油 3大勺', '新鲜百里香 4-5枝（或干百里香 1小勺）', '盐 1/2小勺', '黑胡椒 适量'],
      details: [
        '把橄榄油均匀淋在所有蔬菜表面',
        '百里香叶子摘下来，均匀撒在上面（干百里香直接撒）',
        '再撒一层薄薄的盐和黑胡椒',
        '如果有大蒜，可以再切几片薄片插在蔬菜缝隙里增加香味'
      ],
      tips: ['橄榄油要淋够，这样蔬菜才不会干', '新鲜百里香风味最佳，没有的话干的也行']
    },
    {
      id: '5',
      title: '烘烤',
      duration: '60分钟',
      details: [
        '烤箱提前预热到 180°C（上下火）',
        '用锡纸把烤盘盖住，封紧边缘',
        '放入烤箱中层，先烤 45 分钟',
        '45 分钟后取出，小心揭开锡纸（有热蒸汽，别烫到）',
        '观察一下，蔬菜应该已经变软了',
        '不盖锡纸，继续烤 15-20 分钟，让表面上色',
        '烤到边缘微微焦糖化、表面有点金黄就可以出炉了'
      ],
      tips: ['每个烤箱脾气不同，最后 15 分钟要盯着看，别烤过了', '如果你的烤箱火力比较猛，可以降到 170°C'],
      warnings: ['揭锡纸时小心蒸汽烫手', '不盖锡纸的时候不要离开厨房，容易烤焦']
    },
    {
      id: '6',
      title: '出炉装饰',
      duration: '2分钟',
      ingredients: ['新鲜罗勒叶 几片', '橄榄油 少许'],
      details: [
        '小心把烤盘从烤箱取出，放在隔热垫上',
        '趁热再淋一点橄榄油增加光泽',
        '撒上新鲜罗勒叶（撕碎或整片都可以）',
        '可以现磨一点黑胡椒增加风味',
        '直接上桌，趁热吃最好吃'
      ],
      tips: ['这道菜放凉了也很好吃，可以做冷菜', '配上烤好的法棍面包，蘸着酱底吃特别香']
    }
  ],
  '五美元奶昔': [
    { id: '1', title: '准备食材', description: '香草冰淇淋3球，牛奶150ml，香草精少许', duration: '2分钟' },
    { id: '2', title: '搅拌', description: '将冰淇淋和牛奶放入搅拌机，中速搅拌至顺滑', duration: '1分钟', tips: '不要搅太久，保持一定的浓稠度' },
    { id: '3', title: '装杯', description: '倒入高脚杯，顶部可以挤一圈鲜奶油', duration: '1分钟' },
    { id: '4', title: '装饰', description: '顶部放一颗樱桃，插入吸管', duration: '1分钟', tips: '用复古的玻璃杯会更有电影感' },
  ],
  // ========== 名店配方 ==========
  '慢烤胡萝卜 Roasted Carrot': [
    { id: '1', title: '准备胡萝卜', description: '选择粗细均匀的彩虹胡萝卜，洗净去皮，保留2cm胡萝卜缨作装饰', duration: '10分钟', tips: '选择细长的胡萝卜，粗的可以纵向切半' },
    { id: '2', title: '腌制调味', description: '胡萝卜放入大碗，加橄榄油、蜂蜜、盐、黑胡椒、百里香，充分裹匀', duration: '5分钟', tips: '蜂蜜会帮助焦糖化，让表面更漂亮' },
    { id: '3', title: '低温慢烤', description: '预热烤箱180°C，胡萝卜平铺烤盘，烤40-50分钟至软糯', duration: '50分钟', tips: '中途翻面一次，确保均匀上色' },
    { id: '4', title: '制作酱汁', description: '用烤盘底的焦糖汁加少许黄油和柠檬汁调成酱汁', duration: '5分钟' },
    { id: '5', title: '摆盘', description: '胡萝卜排列在盘中，淋酱汁，撒上烤香的坚果碎和新鲜香草', duration: '5分钟', tips: '点缀山羊奶酪碎会更有层次' },
  ],
  '日式轻芝士蛋糕': [
    { id: '1', title: '准备材料', description: '奶油芝士室温软化，分离蛋黄蛋白，面粉过筛', duration: '15分钟', tips: '所有材料需室温，这很关键' },
    { id: '2', title: '芝士糊', description: '奶油芝士、黄油、牛奶隔水加热搅拌至顺滑，离火后逐个加入蛋黄', duration: '15分钟', tips: '加蛋黄时要一个一个加，充分混合' },
    { id: '3', title: '加入粉类', description: '筛入低筋面粉和玉米淀粉，用Z字形手法拌匀', duration: '5分钟', tips: '不要画圈，会起筋' },
    { id: '4', title: '打发蛋白', description: '蛋白加柠檬汁打发，分三次加糖，打至湿性发泡（弯钩状）', duration: '10分钟', tips: '湿性发泡即可，不要打太硬' },
    { id: '5', title: '混合面糊', description: '取1/3蛋白霜与芝士糊混合，再倒回蛋白霜中翻拌均匀', duration: '5分钟', tips: '动作要轻，保持气泡' },
    { id: '6', title: '水浴烘烤', description: '倒入模具，烤盘加热水，150°C烤70分钟', duration: '70分钟', tips: '不要开烤箱门，会塌陷' },
    { id: '7', title: '冷却脱模', description: '关火后在烤箱中焖20分钟，取出室温冷却后冷藏', duration: '30分钟', tips: '冷藏一夜口感最佳' },
  ],
  '原味千层蛋糕': [
    { id: '1', title: '制作班戟皮面糊', description: '鸡蛋、糖、牛奶混合，筛入面粉搅拌，加融化黄油，过筛静置30分钟', duration: '40分钟', tips: '面糊一定要过筛，这样皮才细腻' },
    { id: '2', title: '煎班戟皮', description: '不粘锅小火，舀一勺面糊快速转匀，表面凝固后翻面3秒取出', duration: '45分钟', tips: '火候是关键，太大会有气泡，太小会厚' },
    { id: '3', title: '准备奶油', description: '淡奶油加糖和香草精打发至八分（纹路清晰但仍柔软）', duration: '10分钟', tips: '不要打太硬，会影响切面效果' },
    { id: '4', title: '组装千层', description: '一层皮一层奶油交替叠加，约20层，轻压排除气泡', duration: '30分钟', tips: '每层奶油要薄而均匀' },
    { id: '5', title: '冷藏定型', description: '包保鲜膜冷藏至少4小时，让层次融合', duration: '4小时', tips: '过夜效果更好，切面更漂亮' },
    { id: '6', title: '切片装饰', description: '用热刀切片，表面可撒糖粉或放水果装饰', duration: '5分钟', tips: '刀要用热水烫过擦干再切' },
  ],
  '巧克力核桃曲奇': [
    { id: '1', title: '准备材料', description: '黄油室温软化，核桃切碎烤香，巧克力切大块', duration: '15分钟', tips: '巧克力块要大，烤后才有熔岩效果' },
    { id: '2', title: '打发黄油', description: '黄油加两种糖打发至蓬松发白', duration: '5分钟', tips: '一定要充分打发' },
    { id: '3', title: '加入鸡蛋', description: '分次加入鸡蛋和香草精，打匀', duration: '3分钟' },
    { id: '4', title: '混合干料', description: '面粉、小苏打、盐过筛后加入，拌至看不见粉即可', duration: '3分钟', tips: '不要过度搅拌' },
    { id: '5', title: '加入配料', description: '加入巧克力块和核桃碎，拌匀后冷藏1小时', duration: '1小时', tips: '冷藏让面团定型，更好操作' },
    { id: '6', title: '整形烘烤', description: '挖成高尔夫球大小，间隔排列，190°C烤12-14分钟', duration: '15分钟', tips: '边缘金黄中间软就可以出炉' },
  ],
  'ShackBurger 招牌汉堡': [
    { id: '1', title: '准备肉饼', description: '牛肉糜加盐和黑胡椒，轻轻整形成比面包略大的薄饼', duration: '5分钟', tips: '不要过度按压，保持肉质松软' },
    { id: '2', title: '准备配料', description: '生菜洗净沥干，番茄切片，准备ShackSauce', duration: '5分钟', tips: 'ShackSauce用蛋黄酱+番茄酱+芥末酱+酸黄瓜碎调制' },
    { id: '3', title: '煎肉饼', description: '平底锅大火热油，肉饼下锅压扁，煎2分钟翻面，放芝士片', duration: '5分钟', tips: '煎的时候不要动，要有焦脆的边缘' },
    { id: '4', title: '烤面包', description: '马铃薯面包对半切，切面朝下烤至金黄', duration: '2分钟' },
    { id: '5', title: '组装汉堡', description: '下层面包涂酱→生菜→番茄→肉饼→上层面包', duration: '2分钟', tips: '趁热组装，芝士要能拉丝' },
  ],
  'Animal Style 汉堡': [
    { id: '1', title: '准备洋葱', description: '洋葱切薄片，小火煎至深金黄色焦糖化', duration: '15分钟', tips: '这是Animal Style的灵魂，要耐心煎' },
    { id: '2', title: '准备酱料', description: '调制千岛酱：蛋黄酱+番茄酱+酸黄瓜碎+少许糖', duration: '5分钟' },
    { id: '3', title: '煎肉饼', description: '牛肉饼下锅后涂一层黄芥末，压扁煎至焦脆', duration: '5分钟', tips: '黄芥末要在煎的时候涂，不是组装时' },
    { id: '4', title: '融化芝士', description: '肉饼翻面后放芝士片，盖锅盖闷30秒', duration: '1分钟' },
    { id: '5', title: '组装', description: '面包涂酱→生菜→番茄→肉饼→焦糖洋葱→酸黄瓜片', duration: '2分钟', tips: '酸黄瓜要用切片的，不是整根' },
  ],
  '黑鳕鱼味噌': [
    { id: '1', title: '调制味噌腌料', description: '白味噌、味醂、清酒、糖按3:2:2:1混合，搅拌至糖溶解', duration: '5分钟', tips: '一定要用白味噌，红味噌太咸' },
    { id: '2', title: '腌制鳕鱼', description: '银鳕鱼用厨房纸擦干，均匀涂抹腌料，密封冷藏24-72小时', duration: '10分钟', tips: '腌制时间越长，味道越浓郁，但不超过3天' },
    { id: '3', title: '处理鳕鱼', description: '取出鳕鱼，刮去多余腌料（保留薄薄一层），室温放置15分钟', duration: '15分钟', tips: '腌料太多会烤焦' },
    { id: '4', title: '烤制', description: '烤箱预热200°C，鳕鱼烤12-15分钟至表面金黄微焦', duration: '15分钟', tips: '注意观察，味噌很容易焦' },
    { id: '5', title: '摆盘', description: '配上腌姜片和少许芝麻，可加柠檬角', duration: '2分钟' },
  ],
  '瑞可塔芝士松饼 Ricotta Hotcakes': [
    { id: '1', title: '混合湿料', description: '瑞可塔芝士、牛奶、蛋黄、融化黄油、香草精混合均匀', duration: '5分钟' },
    { id: '2', title: '混合干料', description: '面粉、泡打粉、糖、盐混合过筛', duration: '3分钟' },
    { id: '3', title: '打发蛋白', description: '蛋白打发至湿性发泡', duration: '5分钟', tips: '这是松饼蓬松的关键' },
    { id: '4', title: '混合面糊', description: '湿料倒入干料拌匀，再轻轻翻入蛋白霜', duration: '3分钟', tips: '不要过度搅拌，有小颗粒也没关系' },
    { id: '5', title: '煎松饼', description: '不粘锅小火，舀面糊成圆形，表面起泡后翻面', duration: '15分钟', tips: '第一张通常要丢掉，用来测试温度' },
    { id: '6', title: '摆盘', description: '叠放三片，配新鲜蓝莓、香蕉片、枫糖浆', duration: '3分钟' },
  ],
  // ========== 考古美食 ==========
  '维多利亚彩色果冻塔': [
    { id: '1', title: '准备果冻液', description: '吉利丁片泡软，各色果汁（草莓/柠檬/薄荷）分别加热后加入吉利丁搅溶', duration: '15分钟', tips: '每种颜色单独做，不要混合' },
    { id: '2', title: '分层凝固', description: '模具底部先倒最深色的一层，冷藏20分钟至凝固', duration: '20分钟', tips: '每层要完全凝固再倒下一层' },
    { id: '3', title: '逐层叠加', description: '重复倒入不同颜色的果冻液，每层20分钟，共4-6层', duration: '2小时', tips: '新倒入的液体不能太热，会融化下层' },
    { id: '4', title: '制作塔皮', description: '黄油、糖、面粉搓成沙粒状，加蛋黄揉成面团，冷藏后擀开', duration: '30分钟' },
    { id: '5', title: '烤塔皮', description: '面团入模，叉子戳洞，180°C盲烤15分钟至金黄', duration: '15分钟' },
    { id: '6', title: '组装', description: '果冻脱模切块，摆入塔皮中，可用鲜奶油装饰', duration: '10分钟' },
  ],
  '歌德家族英式布丁配覆盆子酱': [
    { id: '1', title: '准备布丁液', description: '牛奶、淡奶油、糖加热至糖溶，蛋黄打散后缓缓倒入，不断搅拌', duration: '15分钟', tips: '牛奶不能太烫，会把蛋黄烫熟' },
    { id: '2', title: '调味过筛', description: '加入香草精和少许白兰地，过筛去除蛋白絮', duration: '5分钟', tips: '一定要过筛，口感才细腻' },
    { id: '3', title: '倒模蒸烤', description: '布丁液倒入抹黄油的模具，烤盘加热水，150°C烤45分钟', duration: '45分钟', tips: '水浴法让布丁受热均匀' },
    { id: '4', title: '冷却脱模', description: '取出冷却，冷藏4小时以上，脱模前用热毛巾捂一下', duration: '4小时' },
    { id: '5', title: '制作覆盆子酱', description: '覆盆子加糖小火煮5分钟，压碎过筛去籽', duration: '10分钟', tips: '保留几颗完整的装饰用' },
    { id: '6', title: '装盘', description: '布丁脱模，淋覆盆子酱，放几颗新鲜覆盆子和薄荷叶', duration: '5分钟' },
  ],
  '都铎杏仁糖膏 Marchpane': [
    { id: '1', title: '研磨杏仁', description: '去皮杏仁用食品处理机打成细粉', duration: '10分钟', tips: '不要打太久会出油变成杏仁酱' },
    { id: '2', title: '制作糖浆', description: '糖加少许水煮至115°C（软球阶段）', duration: '10分钟', tips: '用糖温计测量最准确' },
    { id: '3', title: '混合揉面', description: '杏仁粉倒入糖浆，加玫瑰水揉成光滑面团', duration: '10分钟', tips: '趁热揉，冷了会硬' },
    { id: '4', title: '塑形', description: '擀成1cm厚的圆饼，用模具压出花纹或塑成水果形状', duration: '20分钟', tips: '传统会做成水果或花朵造型' },
    { id: '5', title: '上色烘烤', description: '刷蛋清，撒金箔，170°C烤10分钟至表面微金', duration: '10分钟', tips: '16世纪贵族会用真金箔装饰' },
  ],
  '凡尔赛香草冰淇淋': [
    { id: '1', title: '浸泡香草', description: '香草荚剖开刮籽，连壳放入牛奶中，小火加热后离火浸泡30分钟', duration: '35分钟', tips: '这步提取香草风味很关键' },
    { id: '2', title: '制作蛋奶液', description: '蛋黄和糖打发至发白，缓缓倒入热牛奶，边倒边搅', duration: '10分钟' },
    { id: '3', title: '加热浓缩', description: '小火加热蛋奶液至82°C，能挂勺即可（不能煮沸）', duration: '10分钟', tips: '过度加热会变成炒蛋' },
    { id: '4', title: '冷却加奶油', description: '过筛后加入冷淡奶油，搅匀后冰浴降温', duration: '15分钟' },
    { id: '5', title: '冷冻搅拌', description: '倒入冰淇淋机搅拌25分钟，或手动每30分钟搅拌一次共4次', duration: '2小时', tips: '搅拌防止冰晶形成' },
    { id: '6', title: '定型', description: '转移至容器，冷冻4小时至硬化', duration: '4小时' },
  ],
  '古罗马梨子蛋饼 Patina de Piris': [
    { id: '1', title: '处理梨子', description: '梨去皮去核，切成小块，加少许蜂蜜拌匀', duration: '10分钟', tips: '用较硬的梨，太软会化掉' },
    { id: '2', title: '煎香梨块', description: '平底锅加橄榄油，中火煎梨块至微微焦黄', duration: '10分钟' },
    { id: '3', title: '调制蛋液', description: '鸡蛋打散，加入黑胡椒、小茴香、蜂蜜、鱼露（或盐）调味', duration: '5分钟', tips: '古罗马用鱼露调味，没有可用盐代替' },
    { id: '4', title: '混合烘烤', description: '梨块铺入烤盘，倒入蛋液，180°C烤20分钟至凝固', duration: '20分钟' },
    { id: '5', title: '撒香料出锅', description: '出炉后撒黑胡椒，淋少许蜂蜜即可', duration: '2分钟', tips: '古罗马人喜欢甜咸混搭' },
  ],
  '中世纪蜂蜜香料糕': [
    { id: '1', title: '加热蜂蜜', description: '蜂蜜倒入锅中小火加热至起小泡', duration: '5分钟', tips: '不要煮沸，会破坏风味' },
    { id: '2', title: '混合香料', description: '肉桂、姜粉、丁香、黑胡椒混合成香料粉', duration: '3分钟', tips: '香料比例可按喜好调整' },
    { id: '3', title: '揉面团', description: '面粉加入热蜂蜜和香料，揉成软面团', duration: '10分钟', tips: '面团有点粘是正常的' },
    { id: '4', title: '擀开切形', description: '面团擀成1cm厚，用模具切出形状', duration: '15分钟' },
    { id: '5', title: '烘烤', description: '170°C烤15-18分钟至边缘微金', duration: '18分钟', tips: '冷却后会变硬，烤的时候要软一点出炉' },
    { id: '6', title: '糖衣装饰', description: '糖粉加少许水调成糖霜，画在糕点上', duration: '10分钟', tips: '中世纪会用蜂蜜代替糖霜' },
  ],
  '维多利亚姜饼蛋糕 Gingerbread': [
    { id: '1', title: '融化湿料', description: '黄油、黑糖、糖蜜、蜂蜜小火加热至融合', duration: '10分钟', tips: '糖蜜是关键，没有可用红糖浆代替' },
    { id: '2', title: '混合干料', description: '面粉、小苏打、姜粉、肉桂、多香果粉混合过筛', duration: '5分钟' },
    { id: '3', title: '制作面糊', description: '湿料稍凉后加入鸡蛋和牛奶，再倒入干料拌匀', duration: '10分钟', tips: '面糊会比较稀，是正常的' },
    { id: '4', title: '烘烤', description: '倒入抹油的烤模，160°C烤50-60分钟', duration: '60分钟', tips: '用牙签测试，不沾即熟' },
    { id: '5', title: '静置', description: '出炉冷却，用锡纸包好放置1-2天风味更佳', duration: '5分钟', tips: 'Mrs Crocombe的秘诀是放几天再吃' },
  ],
  '仙女蛋糕 Fairy Cakes': [
    { id: '1', title: '打发黄油', description: '室温黄油加糖用电动打蛋器打发至蓬松发白', duration: '5分钟' },
    { id: '2', title: '加入鸡蛋', description: '鸡蛋分次加入，每次打匀再加下一个', duration: '3分钟', tips: '分次加防止油水分离' },
    { id: '3', title: '加入面粉', description: '面粉和泡打粉过筛后轻轻拌入，加少许牛奶调节稀稠', duration: '5分钟' },
    { id: '4', title: '分装烘烤', description: '面糊装入纸杯至7分满，180°C烤15-18分钟', duration: '18分钟' },
    { id: '5', title: '制作蝴蝶翅膀', description: '蛋糕顶部切出圆锥，对半切成两片作"翅膀"', duration: '5分钟' },
    { id: '6', title: '装饰', description: '挤奶油在凹槽处，插入翅膀，撒糖粉', duration: '10分钟', tips: '这是维多利亚时代儿童派对必备' },
  ],
  '巴克韦尔塔 Bakewell Tart': [
    { id: '1', title: '制作塔皮', description: '黄油、糖、面粉搓成沙粒，加蛋黄揉成团，冷藏30分钟', duration: '40分钟' },
    { id: '2', title: '盲烤塔皮', description: '面团擀开入模，铺烘焙纸放重物，180°C烤15分钟', duration: '15分钟' },
    { id: '3', title: '涂果酱', description: '烤好的塔皮底部均匀涂一层覆盆子果酱', duration: '3分钟' },
    { id: '4', title: '制作杏仁奶油', description: '黄油打发，加糖、鸡蛋、杏仁粉拌匀成杏仁奶油', duration: '10分钟', tips: '这一层叫Frangipane' },
    { id: '5', title: '组装烘烤', description: '杏仁奶油铺在果酱上，表面撒杏仁片，170°C烤30分钟', duration: '30分钟' },
    { id: '6', title: '装饰', description: '冷却后撒糖粉，可淋白色糖霜', duration: '5分钟' },
  ],
  '古罗马蜂蜜蛋糕 Libum': [
    { id: '1', title: '准备奶酪', description: '瑞可塔奶酪用纱布挤干水分', duration: '10分钟', tips: '古罗马用新鲜羊奶酪' },
    { id: '2', title: '混合材料', description: '奶酪加面粉、鸡蛋揉成光滑面团', duration: '10分钟' },
    { id: '3', title: '整形', description: '分成小份，压成5cm圆饼，放在月桂叶上', duration: '10分钟', tips: '月桂叶增添香气' },
    { id: '4', title: '烘烤', description: '180°C烤20-25分钟至金黄', duration: '25分钟' },
    { id: '5', title: '淋蜂蜜', description: '趁热淋上温热的蜂蜜，撒少许罂粟籽', duration: '3分钟', tips: '古罗马人用这个祭祀神明' },
  ],
  // ========== 影视美食补充 ==========
  '教父番茄肉酱意面': [
    { id: '1', title: '炒香料', description: '大蒜切片，用橄榄油小火炒出香味（不要焦）', duration: '5分钟', tips: '克莱门扎说的第一步' },
    { id: '2', title: '煎肉', description: '猪肉末和牛肉末下锅，中火炒散变色', duration: '10分钟' },
    { id: '3', title: '加番茄', description: '倒入整罐去皮番茄，用锅铲压碎，加番茄膏', duration: '5分钟' },
    { id: '4', title: '慢炖', description: '加入红酒、月桂叶、罗勒，小火炖2-3小时', duration: '3小时', tips: '克莱门扎的秘诀是慢炖' },
    { id: '5', title: '调味', description: '最后半小时加盐、糖调味，收汁至浓稠', duration: '30分钟' },
    { id: '6', title: '配意面', description: '煮好的意面和肉酱拌匀，撒帕玛森芝士', duration: '10分钟' },
  ],
  '日式豚骨拉面': [
    { id: '1', title: '熬汤底', description: '猪骨焯水洗净，重新加冷水大火煮开后转中火熬4-6小时', duration: '6小时', tips: '要一直保持翻滚，汤才会白' },
    { id: '2', title: '调味汁', description: '酱油、味醂、清酒、糖调成酱汁备用', duration: '10分钟' },
    { id: '3', title: '准备配料', description: '叉烧切片、溏心蛋对半切、木耳丝、葱花准备好', duration: '20分钟', tips: '叉烧可以提前一天做好' },
    { id: '4', title: '煮面', description: '细拉面煮至略硬（会在汤里继续熟）', duration: '2分钟' },
    { id: '5', title: '组装', description: '碗里放调味汁，舀入滚烫的汤底，放面条，摆配料', duration: '3分钟', tips: '汤一定要滚烫' },
  ],
  '法式焦糖布丁': [
    { id: '1', title: '制作焦糖', description: '糖加少许水，中火煮至琥珀色，立即倒入模具底部', duration: '10分钟', tips: '焦糖不要煮太深，会苦' },
    { id: '2', title: '制作布丁液', description: '牛奶和香草加热，蛋黄打散加糖，缓缓混合', duration: '10分钟' },
    { id: '3', title: '过筛倒模', description: '布丁液过筛两次，轻轻倒入焦糖模具中', duration: '5分钟' },
    { id: '4', title: '水浴蒸烤', description: '烤盘加热水，150°C烤50-60分钟至微微晃动', duration: '60分钟' },
    { id: '5', title: '冷藏', description: '冷却后冷藏4小时以上', duration: '4小时' },
    { id: '6', title: '脱模', description: '用刀沿边划一圈，倒扣在盘中', duration: '2分钟', tips: '焦糖会自动流下形成酱汁' },
  ],
  '古巴三明治': [
    { id: '1', title: '准备烤猪肉', description: '猪肩肉用蒜泥、橙汁、青柠汁、孜然腌制过夜，160°C慢烤4小时', duration: '4小时', tips: '可以用现成的烤猪肉代替' },
    { id: '2', title: '准备配料', description: '火腿切片，瑞士芝士切片，酸黄瓜切长片', duration: '5分钟' },
    { id: '3', title: '组装', description: '古巴面包对半切，涂黄芥末，依次放火腿、烤猪肉、芝士、酸黄瓜', duration: '5分钟' },
    { id: '4', title: '压烤', description: '三明治放入帕尼尼机或平底锅压烤至芝士融化，两面金黄', duration: '8分钟', tips: '没有帕尼尼机可以用重物压着煎' },
    { id: '5', title: '切片', description: '对角切开，趁热享用', duration: '1分钟' },
  ],
  "Mendl's Courtesan au Chocolat": [
    { id: '1', title: '制作泡芙面团', description: '水、黄油、盐加热沸腾，离火加面粉搅匀，回火炒干后逐个加蛋', duration: '20分钟', tips: '面糊要能挂在木勺上成倒三角' },
    { id: '2', title: '挤泡芙', description: '面糊装入裱花袋，挤成大中小三种圆球（做堆叠用）', duration: '15分钟' },
    { id: '3', title: '烘烤', description: '200°C烤10分钟后降至180°C续烤15分钟，不要开门', duration: '25分钟', tips: '中途开门会塌' },
    { id: '4', title: '制作卡仕达馅', description: '牛奶香草加热，蛋黄糖面粉混合，倒入煮稠冷却', duration: '20分钟' },
    { id: '5', title: '填馅', description: '泡芙底部戳洞，挤入卡仕达馅', duration: '15分钟' },
    { id: '6', title: '巧克力淋面', description: '黑巧克力隔水融化，泡芙顶部蘸巧克力', duration: '10分钟' },
    { id: '7', title: '堆叠装饰', description: '用融化巧克力粘合，大中小堆叠，装入粉色盒子', duration: '10分钟', tips: '韦斯·安德森的标志性粉色！' },
  ],
  '南方风味炸鸡': [
    { id: '1', title: '腌制', description: '鸡块用酪乳、盐、黑胡椒、卡宴辣椒粉腌制4小时以上', duration: '4小时', tips: '酪乳让鸡肉更嫩' },
    { id: '2', title: '调制粉料', description: '面粉、玉米淀粉、蒜粉、洋葱粉、辣椒粉、黑胡椒混合', duration: '5分钟' },
    { id: '3', title: '裹粉', description: '鸡块从酪乳中取出，裹满粉料，按压让粉附着', duration: '10分钟', tips: '重复蘸一次酪乳再裹粉会更脆' },
    { id: '4', title: '静置', description: '裹好粉的鸡块放置15分钟让粉吸收水分', duration: '15分钟' },
    { id: '5', title: '油炸', description: '油温170°C，鸡块下锅炸15-18分钟至金黄酥脆', duration: '18分钟', tips: '不要一次放太多，会降温' },
    { id: '6', title: '沥油', description: '捞出放在网架上沥油，趁热撒少许盐', duration: '5分钟' },
  ],
  '勃艮第红酒炖牛肉': [
    { id: '1', title: '切块腌制', description: '牛肩肉切大块，用红酒、洋葱、胡萝卜、香草腌制过夜', duration: '8小时', tips: '要用能喝的红酒，便宜但不能太差' },
    { id: '2', title: '煎牛肉', description: '沥干牛肉擦干，大火煎至表面焦褐', duration: '15分钟', tips: '要分批煎，一次太多会出水' },
    { id: '3', title: '炒香蔬菜', description: '洋葱、胡萝卜、蒜炒软，加番茄膏炒出香味', duration: '10分钟' },
    { id: '4', title: '炖煮', description: '牛肉回锅，加腌肉的红酒和牛肉汤，小火炖2-3小时', duration: '3小时' },
    { id: '5', title: '准备配菜', description: '小洋葱整颗煎至焦糖色，蘑菇切片煎香', duration: '15分钟' },
    { id: '6', title: '收汁上桌', description: '加入配菜，收汁至浓稠，撒香芹末上桌', duration: '10分钟' },
  ],
  '红烧狮子头': [
    { id: '1', title: '剁肉馅', description: '五花肉和瘦肉3:7切小丁，不要绞成泥', duration: '15分钟', tips: '手切有颗粒感，口感更好' },
    { id: '2', title: '调馅', description: '加葱姜水、蛋液、盐、料酒、淀粉，顺一个方向搅打上劲', duration: '10分钟', tips: '葱姜水分次加，要打出粘性' },
    { id: '3', title: '团丸子', description: '手上抹油，取大团肉馅摔打成圆球', duration: '10分钟', tips: '摔打能去除气泡' },
    { id: '4', title: '煎定型', description: '油温六成热，丸子下锅煎至表面金黄定型', duration: '10分钟' },
    { id: '5', title: '红烧', description: '加入酱油、老抽、糖、料酒、水，大火烧开转小火炖1.5小时', duration: '1.5小时' },
    { id: '6', title: '收汁', description: '大火收浓汤汁，摆上烫好的青菜', duration: '10分钟' },
  ],
  '握寿司': [
    { id: '1', title: '煮寿司饭', description: '短粒米洗净浸泡30分钟，1:1.1水煮熟', duration: '40分钟' },
    { id: '2', title: '调寿司醋', description: '米醋、糖、盐加热至糖溶，趁热拌入米饭', duration: '10分钟', tips: '用扇子扇凉，让醋吸收且米饭有光泽' },
    { id: '3', title: '处理鱼料', description: '新鲜三文鱼/金枪鱼切成0.5cm厚的斜片', duration: '10分钟', tips: '刀要锋利，一刀切下不要来回拉' },
    { id: '4', title: '握寿司', description: '手蘸醋水，取约20g饭轻轻握成椭圆形，放上鱼片', duration: '15分钟', tips: '不要握太紧，要有空气感' },
    { id: '5', title: '上桌', description: '配上酱油碟、芥末、腌姜片', duration: '3分钟' },
  ],
  '法式洋葱汤': [
    { id: '1', title: '切洋葱', description: '大量洋葱（约1kg）切薄丝', duration: '15分钟', tips: '切之前冷藏洋葱可以减少流泪' },
    { id: '2', title: '慢炒焦糖化', description: '黄油中火炒洋葱，不断翻炒至深琥珀色', duration: '45分钟', tips: '这步不能急，是汤甜美的关键' },
    { id: '3', title: '加酒调味', description: '加入白葡萄酒或雪利酒，炒至酒精挥发', duration: '5分钟' },
    { id: '4', title: '炖汤', description: '加入牛肉高汤、百里香、月桂叶，小火炖30分钟', duration: '30分钟' },
    { id: '5', title: '烤面包', description: '法棍切厚片，烤至金黄', duration: '5分钟' },
    { id: '6', title: '焗芝士', description: '汤盛入耐热碗，放面包片，撒大量格鲁耶尔芝士，烤至起泡', duration: '10分钟', tips: '芝士要慷慨，这是灵魂' },
  ],
  // ========== 补充缺失的影视美食 ==========
  '玛雅辣椒热巧克力': [
    { id: '1', title: '切碎巧克力', description: '将黑巧克力切成小块，方便融化', duration: '5分钟' },
    { id: '2', title: '加热牛奶', description: '牛奶倒入锅中小火加热，不要沸腾', duration: '5分钟' },
    { id: '3', title: '融化巧克力', description: '将巧克力块加入热牛奶中，不断搅拌至完全融化', duration: '5分钟', tips: '保持小火，巧克力遇高温会变苦' },
    { id: '4', title: '加入香料', description: '加入辣椒粉、肉桂粉、香草精和少许糖，搅拌均匀', duration: '2分钟', tips: '辣椒粉从少量开始，尝试调整' },
    { id: '5', title: '打出泡沫', description: '用打蛋器快速搅打，让热巧克力表面产生细腻泡沫', duration: '2分钟' },
    { id: '6', title: '装杯享用', description: '倒入马克杯，可撒少许辣椒粉和肉桂粉装饰', duration: '1分钟' },
  ],
  '石棺鹌鹑派': [
    { id: '1', title: '处理鹌鹑', description: '鹌鹑去骨，保留完整形状，用盐和胡椒腌制', duration: '20分钟', tips: '可用鸡腿肉代替' },
    { id: '2', title: '制作馅料', description: '培根、蘑菇、洋葱切丁炒香，加百里香和鸡汤煮稠', duration: '15分钟' },
    { id: '3', title: '煎鹌鹑', description: '平底锅热油，将腌制好的鹌鹑煎至金黄', duration: '10分钟' },
    { id: '4', title: '准备酥皮', description: '酥皮擀开，切成合适大小', duration: '10分钟' },
    { id: '5', title: '组装', description: '在酥皮上放馅料和煎好的鹌鹑，包裹成派形状', duration: '15分钟', tips: '封口要捏紧，刷蛋液' },
    { id: '6', title: '烘烤', description: '200°C烤30-35分钟至金黄酥脆', duration: '35分钟' },
  ],
  '那不勒斯玛格丽特披萨': [
    { id: '1', title: '制作面团', description: '面粉、酵母、盐和水混合揉成光滑面团', duration: '15分钟' },
    { id: '2', title: '发酵', description: '面团盖湿布，室温发酵至两倍大', duration: '1小时', tips: '发酵充分是口感的关键' },
    { id: '3', title: '制作酱料', description: '圣玛扎诺番茄压碎，加盐和橄榄油调味', duration: '5分钟', tips: '不需要煮，生酱料更鲜' },
    { id: '4', title: '擀面饼', description: '面团擀成薄圆饼，中间薄边缘略厚', duration: '10分钟', tips: '用手按压比擀面杖更有嚼劲' },
    { id: '5', title: '组装', description: '涂酱料，放马苏里拉芝士块，淋橄榄油', duration: '5分钟' },
    { id: '6', title: '烘烤', description: '250°C高温烤8-10分钟，出炉后放新鲜罗勒', duration: '10分钟', tips: '温度越高越好，模拟石窑效果' },
  ],
  'Timpano（意式千层烤面）': [
    { id: '1', title: '制作外皮面团', description: '面粉加鸡蛋和橄榄油揉成面团，冷藏1小时', duration: '1小时' },
    { id: '2', title: '准备肉酱', description: '牛猪肉末炒熟，加番茄酱炖煮30分钟', duration: '40分钟' },
    { id: '3', title: '煮意面', description: '意面煮至七分熟，沥干备用', duration: '10分钟' },
    { id: '4', title: '准备其他配料', description: '煮鸡蛋切片，香肠切片，芝士切块', duration: '15分钟' },
    { id: '5', title: '组装', description: '面团擀开铺入模具，层层叠放意面、肉酱、鸡蛋、香肠、芝士', duration: '20分钟', tips: '每层都要压实' },
    { id: '6', title: '封口烘烤', description: '面皮封口，180°C烤1小时至金黄', duration: '1小时' },
    { id: '7', title: '脱模切片', description: '静置15分钟后脱模，切开展示层次', duration: '15分钟', tips: '这是最惊艳的时刻' },
  ],
  '黯然销魂饭': [
    { id: '1', title: '腌制牛肉', description: '牛肉切薄片，加蚝油、生抽、糖腌制15分钟', duration: '15分钟' },
    { id: '2', title: '切洋葱', description: '洋葱切丝备用', duration: '5分钟' },
    { id: '3', title: '煎蛋', description: '热油煎两个荷包蛋，保持蛋黄流心', duration: '5分钟', tips: '蛋黄流心是灵魂' },
    { id: '4', title: '炒牛肉', description: '大火快炒牛肉至变色，加入洋葱丝炒香', duration: '5分钟' },
    { id: '5', title: '调味', description: '加少许水和调味料，收汁', duration: '3分钟' },
    { id: '6', title: '摆盘', description: '米饭盛入碗，铺上牛肉和洋葱，放上煎蛋', duration: '2分钟', tips: '用心做的饭才有灵魂' },
  ],
  '自制西红柿罐头意面': [
    { id: '1', title: '处理番茄', description: '新鲜番茄划十字，沸水烫30秒后去皮切块', duration: '15分钟' },
    { id: '2', title: '炒香蒜', description: '橄榄油小火炒香蒜片', duration: '3分钟', tips: '蒜片金黄即可，不要焦' },
    { id: '3', title: '煮番茄酱', description: '番茄块加入锅中，小火煮至浓稠', duration: '20分钟' },
    { id: '4', title: '煮意面', description: '另起锅煮意面至有嚼劲', duration: '10分钟' },
    { id: '5', title: '混合', description: '意面加入番茄酱中翻拌，加少许煮面水乳化', duration: '3分钟' },
    { id: '6', title: '装盘', description: '盛盘后撒罗勒叶和帕玛森芝士', duration: '2分钟' },
  ],
  '红香肠': [
    { id: '1', title: '切章鱼形状', description: '香肠一端切成八等分，深度为香肠长度的2/3', duration: '5分钟', tips: '切口要均匀' },
    { id: '2', title: '煎制', description: '平底锅加少许油，中火煎香肠至切口卷曲张开', duration: '5分钟' },
    { id: '3', title: '装饰', description: '用番茄酱点出眼睛，摆盘即可', duration: '2分钟', tips: '日式便当的经典配菜' },
  ],
  '芬兰肉桂卷': [
    { id: '1', title: '制作面团', description: '温牛奶激活酵母，加入面粉、糖、黄油揉成面团', duration: '20分钟' },
    { id: '2', title: '发酵', description: '面团盖湿布发酵至两倍大', duration: '1小时' },
    { id: '3', title: '擀开抹料', description: '面团擀成长方形，抹软化黄油，撒肉桂糖和小豆蔻', duration: '10分钟' },
    { id: '4', title: '卷起切段', description: '紧密卷起，切成3cm厚的段', duration: '10分钟' },
    { id: '5', title: '整形', description: '用筷子在中间压一下，做成耳朵形状', duration: '10分钟', tips: '芬兰语叫"打耳光"因为这个形状' },
    { id: '6', title: '二次发酵', description: '室温发酵20分钟', duration: '20分钟' },
    { id: '7', title: '烘烤', description: '刷蛋液，200°C烤15-18分钟至金黄', duration: '18分钟' },
  ],
  '法式欧姆蛋': [
    { id: '1', title: '打蛋', description: '3个鸡蛋打散，加少许盐调味', duration: '2分钟', tips: '不要打出大泡沫' },
    { id: '2', title: '热锅', description: '不粘锅中火加热，加黄油融化', duration: '2分钟' },
    { id: '3', title: '倒蛋液', description: '蛋液倒入锅中，用筷子快速画圈搅动', duration: '1分钟', tips: '动作要快，形成细小凝块' },
    { id: '4', title: '定型', description: '蛋液半凝固时停止搅动，轻轻晃动锅子', duration: '30秒' },
    { id: '5', title: '卷起', description: '用锅铲将蛋卷向锅边，翻转成橄榄形', duration: '30秒', tips: '内部要保持嫩滑' },
    { id: '6', title: '装盘', description: '滑入盘中，表面刷少许黄油增加光泽', duration: '30秒' },
  ],
  '监狱番茄酱意面': [
    { id: '1', title: '切蒜片', description: '大蒜切成纸薄的蒜片', duration: '10分钟', tips: '用剃刀片或锋利的刀，要薄到透光' },
    { id: '2', title: '炒蒜片', description: '橄榄油小火慢慢炒蒜片，让蒜片在油里融化', duration: '5分钟', tips: '这是《好家伙》里的经典做法' },
    { id: '3', title: '加入番茄', description: '加入番茄酱和干辣椒，小火炖煮', duration: '20分钟' },
    { id: '4', title: '煮意面', description: '意面煮至有嚼劲', duration: '10分钟' },
    { id: '5', title: '混合', description: '意面加入酱汁中翻拌均匀', duration: '3分钟' },
    { id: '6', title: '装盘', description: '盛盘，可加牛肉片和帕玛森芝士', duration: '2分钟' },
  ],
  '纽约街头披萨': [
    { id: '1', title: '制作面团', description: '高筋面粉、酵母、盐、水和橄榄油混合揉成面团', duration: '15分钟' },
    { id: '2', title: '发酵', description: '冷藏发酵24小时，或室温发酵2小时', duration: '2小时', tips: '长时间发酵风味更好' },
    { id: '3', title: '擀饼', description: '面团擀成大而薄的圆形，边缘略厚', duration: '10分钟' },
    { id: '4', title: '涂酱', description: '番茄酱均匀涂抹在面饼上', duration: '3分钟' },
    { id: '5', title: '撒芝士', description: '大量马苏里拉芝士覆盖，撒牛至', duration: '3分钟' },
    { id: '6', title: '烘烤', description: '250°C烤10-12分钟至芝士起泡边缘焦脆', duration: '12分钟' },
    { id: '7', title: '切片', description: '切成大三角片，折叠着吃才正宗', duration: '2分钟' },
  ],
  '秘制汤面': [
    { id: '1', title: '熬汤底', description: '用鸡骨或猪骨熬制高汤，加葱姜', duration: '2小时', tips: '时间越久越浓郁' },
    { id: '2', title: '调味', description: '高汤加酱油、盐调味', duration: '5分钟' },
    { id: '3', title: '煮面', description: '面条煮熟沥干', duration: '5分钟' },
    { id: '4', title: '准备配菜', description: '青菜焯水，准备葱花', duration: '5分钟' },
    { id: '5', title: '装碗', description: '碗里放面，浇热汤，摆上青菜和葱花', duration: '2分钟' },
    { id: '6', title: '点睛', description: '淋少许香油，撒白芝麻', duration: '1分钟', tips: '秘方就是用心' },
  ],
  '鲱鱼南瓜派': [
    { id: '1', title: '制作派皮', description: '黄油和面粉搓成沙粒状，加蛋黄揉成面团，冷藏', duration: '30分钟' },
    { id: '2', title: '准备南瓜馅', description: '南瓜蒸熟压成泥，加糖、香料和淡奶油混合', duration: '20分钟' },
    { id: '3', title: '擀皮入模', description: '派皮擀开铺入模具，用叉子戳洞', duration: '10分钟' },
    { id: '4', title: '盲烤', description: '铺烘焙纸放重物，180°C烤15分钟', duration: '15分钟' },
    { id: '5', title: '倒馅烘烤', description: '南瓜馅倒入派皮，继续烤30分钟', duration: '30分钟' },
    { id: '6', title: '冷却装饰', description: '冷却后可配鲜奶油', duration: '30分钟', tips: '可以加少许腌鲱鱼作为点缀增加北欧风味' },
  ],
  '旺卡热巧克力': [
    { id: '1', title: '切碎巧克力', description: '优质黑巧克力切成小块', duration: '5分钟' },
    { id: '2', title: '加热牛奶', description: '牛奶和淡奶油小火加热至微沸', duration: '5分钟' },
    { id: '3', title: '融化巧克力', description: '巧克力块加入，搅拌至完全融化丝滑', duration: '5分钟' },
    { id: '4', title: '调味', description: '加入糖和香草精调味', duration: '2分钟' },
    { id: '5', title: '装杯', description: '倒入马克杯，顶部放棉花糖', duration: '2分钟', tips: '韦斯·安德森的甜美世界' },
  ],
  '布巴虾': [
    { id: '1', title: '处理虾', description: '大虾去壳去虾线，保留尾部', duration: '15分钟' },
    { id: '2', title: '制作蒜蓉黄油', description: '黄油融化，加入蒜末炒香', duration: '5分钟' },
    { id: '3', title: '煎虾', description: '大火煎虾至两面金黄', duration: '5分钟', tips: '不要翻动太频繁' },
    { id: '4', title: '调味', description: '加入白葡萄酒、柠檬汁和辣椒粉', duration: '3分钟' },
    { id: '5', title: '收汁', description: '大火收汁，让酱汁裹满虾', duration: '2分钟' },
    { id: '6', title: '装盘', description: '撒欧芹末，配柠檬角', duration: '2分钟', tips: '布巴说虾有几十种做法，这只是其中之一' },
  ],
  '黄油啤酒': [
    { id: '1', title: '制作黄油糖浆', description: '黄油和红糖小火融化混合', duration: '5分钟' },
    { id: '2', title: '加入香料', description: '加入香草精和少许肉桂', duration: '2分钟' },
    { id: '3', title: '打发奶油', description: '淡奶油打发至七分发', duration: '5分钟' },
    { id: '4', title: '混合', description: '黄油糖浆放凉后拌入打发奶油', duration: '3分钟' },
    { id: '5', title: '调配', description: '奶油苏打或姜汁汽水倒入杯中', duration: '1分钟' },
    { id: '6', title: '完成', description: '顶部挤上黄油奶油，撒少许肉桂粉', duration: '1分钟', tips: '麻瓜也能品尝的魔法饮品' },
  ],
  '韩式炸酱面': [
    { id: '1', title: '切配料', description: '洋葱、西葫芦、土豆切丁', duration: '10分钟' },
    { id: '2', title: '炒肉', description: '五花肉切丁，大火炒至出油', duration: '5分钟' },
    { id: '3', title: '炒酱', description: '加入韩式黑豆酱炒香', duration: '5分钟', tips: '韩式春酱和中式炸酱完全不同' },
    { id: '4', title: '加蔬菜', description: '加入切好的蔬菜丁翻炒', duration: '5分钟' },
    { id: '5', title: '煮面', description: '乌冬面煮熟沥干', duration: '5分钟' },
    { id: '6', title: '装碗', description: '面条盛入碗，浇上炸酱，摆黄瓜丝', duration: '2分钟' },
  ],
  '米其林级别烤鸡': [
    { id: '1', title: '腌制', description: '整鸡里外抹盐，冷藏风干过夜', duration: '12小时', tips: '这一步让皮更脆' },
    { id: '2', title: '调味黄油', description: '软化黄油混合蒜泥、香草', duration: '5分钟' },
    { id: '3', title: '塞入香料', description: '鸡腔内塞柠檬、大蒜和香草', duration: '5分钟' },
    { id: '4', title: '涂抹黄油', description: '调味黄油涂抹在鸡皮下和表面', duration: '10分钟' },
    { id: '5', title: '烤制', description: '220°C烤20分钟后降至180°C，继续烤1小时', duration: '1.5小时', tips: '用温度计测内部达到74°C' },
    { id: '6', title: '静置切块', description: '出炉静置10分钟再切', duration: '10分钟' },
  ],
  '墨西哥玉米粽 Tamale': [
    { id: '1', title: '泡玉米叶', description: '干玉米叶用温水泡软', duration: '30分钟' },
    { id: '2', title: '制作masa', description: '玉米粉加猪油、盐和鸡汤揉成面团', duration: '15分钟', tips: '面团要轻盈蓬松' },
    { id: '3', title: '准备馅料', description: '鸡肉或猪肉切丁，用辣椒酱炒香', duration: '20分钟' },
    { id: '4', title: '包粽子', description: '玉米叶上涂masa，放馅料，包成长方形', duration: '30分钟' },
    { id: '5', title: '蒸制', description: '立着放入蒸锅，蒸1.5小时', duration: '1.5小时', tips: '打开时如果masa不粘叶子就熟了' },
  ],
  '油炸绿番茄': [
    { id: '1', title: '切番茄', description: '绿番茄切成1cm厚的圆片', duration: '5分钟', tips: '绿番茄比红番茄硬，更适合油炸' },
    { id: '2', title: '调粉料', description: '面粉、玉米粉、盐和辣椒粉混合', duration: '5分钟' },
    { id: '3', title: '裹粉', description: '番茄片蘸酪乳，再裹粉料', duration: '10分钟' },
    { id: '4', title: '油炸', description: '175°C油炸至两面金黄', duration: '10分钟' },
    { id: '5', title: '沥油装盘', description: '放在网架上沥油，趁热撒盐', duration: '2分钟', tips: '美国南方的经典小吃' },
  ],
  '港式云吞面': [
    { id: '1', title: '制作馅料', description: '虾仁切粒，和猪肉糜混合，加调味料搅打上劲', duration: '15分钟', tips: '要朝一个方向搅' },
    { id: '2', title: '包云吞', description: '云吞皮包入馅料，捏成金鱼形', duration: '20分钟' },
    { id: '3', title: '熬汤底', description: '用大地鱼和虾壳熬汤', duration: '30分钟' },
    { id: '4', title: '煮云吞', description: '沸水煮云吞至浮起', duration: '5分钟' },
    { id: '5', title: '煮面', description: '竹升面煮熟', duration: '2分钟' },
    { id: '6', title: '装碗', description: '碗里放面和云吞，浇入热汤，撒葱花', duration: '2分钟' },
  ],
  '自酿青梅酒': [
    { id: '1', title: '清洗青梅', description: '青梅洗净，去蒂，晾干', duration: '30分钟', tips: '一定要完全晾干，有水会发霉' },
    { id: '2', title: '扎孔', description: '用牙签在每颗青梅上扎几个孔', duration: '20分钟' },
    { id: '3', title: '分层装瓶', description: '一层青梅一层冰糖，交替放入玻璃瓶', duration: '10分钟' },
    { id: '4', title: '倒酒', description: '倒入白酒，没过青梅', duration: '5分钟' },
    { id: '5', title: '密封', description: '密封瓶口，放阴凉处', duration: '2分钟' },
    { id: '6', title: '等待', description: '至少3个月，1年更好', duration: '3个月起', tips: '时间是最好的调味料' },
  ],
  '日式炸鸡块 唐揚げ': [
    { id: '1', title: '切鸡肉', description: '鸡腿肉切成一口大小', duration: '10分钟' },
    { id: '2', title: '腌制', description: '酱油、料酒、姜泥、蒜泥腌制30分钟', duration: '30分钟' },
    { id: '3', title: '裹粉', description: '沥干腌料，裹上太白粉', duration: '10分钟', tips: '薄薄一层即可' },
    { id: '4', title: '第一次炸', description: '170°C炸3分钟，捞出静置2分钟', duration: '5分钟' },
    { id: '5', title: '复炸', description: '升温至190°C，复炸1分钟至酥脆', duration: '2分钟', tips: '复炸是日式炸�的灵魂' },
    { id: '6', title: '装盘', description: '配柠檬角和生菜', duration: '2分钟' },
  ],
  '日式蛋包饭 オムライス': [
    { id: '1', title: '炒饭', description: '洋葱鸡肉丁炒香，加米饭和番茄酱翻炒', duration: '10分钟' },
    { id: '2', title: '调蛋液', description: '鸡蛋打散，加少许盐和牛奶', duration: '3分钟' },
    { id: '3', title: '煎蛋皮', description: '不粘锅小火，倒入蛋液摊成薄蛋皮', duration: '3分钟', tips: '蛋皮要嫩滑' },
    { id: '4', title: '包饭', description: '炒饭放在蛋皮中央，用蛋皮包裹', duration: '2分钟' },
    { id: '5', title: '翻转', description: '整个翻转到盘中，调整成橄榄形', duration: '2分钟' },
    { id: '6', title: '装饰', description: '用番茄酱在表面画字或图案', duration: '2分钟', tips: '写上"おいしい"' },
  ],
  '相扑火锅 ちゃんこ鍋': [
    { id: '1', title: '准备汤底', description: '鸡汤加酱油、味醂调味', duration: '10分钟' },
    { id: '2', title: '切食材', description: '鸡肉切块，蔬菜切大块，豆腐切块', duration: '15分钟' },
    { id: '3', title: '摆放', description: '食材整齐摆入锅中', duration: '5分钟', tips: '相扑力士只用鸡肉，因为鸡是两脚着地' },
    { id: '4', title: '煮制', description: '大火煮开后转中小火炖煮', duration: '20分钟' },
    { id: '5', title: '享用', description: '边煮边吃，可以配米饭', duration: '30分钟' },
  ],
  '关东煮 おでん': [
    { id: '1', title: '准备高汤', description: '昆布和柴鱼片煮出高汤，加酱油味醂调味', duration: '30分钟' },
    { id: '2', title: '处理萝卜', description: '萝卜切厚片，用米水煮去苦味', duration: '20分钟', tips: '这步很重要' },
    { id: '3', title: '煮鸡蛋', description: '鸡蛋煮熟剥壳', duration: '10分钟' },
    { id: '4', title: '放入食材', description: '萝卜、魔芋丝等难熟的先放，小火慢炖', duration: '1小时' },
    { id: '5', title: '加入鱼糕', description: '最后加入竹轮、鱼豆腐等', duration: '15分钟' },
    { id: '6', title: '享用', description: '蘸黄芥末或甜味噌酱', duration: '随时', tips: '越炖越入味' },
  ],
  '叉烧刈包 Pork Buns': [
    { id: '1', title: '制作馒头', description: '面粉加酵母揉成面团，发酵至两倍大', duration: '1.5小时' },
    { id: '2', title: '制作叉烧', description: '五花肉用酱油、冰糖、五香粉炖煮2小时', duration: '2小时' },
    { id: '3', title: '做刈包形状', description: '面团分割擀圆，对折，二次发酵', duration: '30分钟' },
    { id: '4', title: '蒸馒头', description: '大火蒸12分钟', duration: '12分钟', tips: '不要开盖' },
    { id: '5', title: '组装', description: '刈包夹叉烧、酸菜、花生粉、香菜', duration: '5分钟' },
  ],
  '经典香蕉布丁 Banana Pudding': [
    { id: '1', title: '制作布丁', description: '香草布丁粉按包装说明煮好', duration: '15分钟' },
    { id: '2', title: '打发奶油', description: '淡奶油加炼乳打发', duration: '10分钟' },
    { id: '3', title: '混合', description: '布丁凉后和打发奶油混合', duration: '5分钟' },
    { id: '4', title: '分层', description: '一层威化饼干、一层香蕉片、一层布丁，重复', duration: '10分钟' },
    { id: '5', title: '冷藏', description: '冷藏至少4小时让威化饼干变软', duration: '4小时', tips: '这是Magnolia的秘诀' },
  ],
  // ========== 名店配方补充 ==========
  '粉红糖霜曲奇 Pink Sugar Cookie': [
    { id: '1', title: '制作曲奇面团', description: '黄油加糖打发，加入鸡蛋和香草精，筛入面粉拌匀', duration: '15分钟' },
    { id: '2', title: '冷藏', description: '面团包保鲜膜，冷藏1小时至硬实', duration: '1小时', tips: '冷藏让面团更好操作' },
    { id: '3', title: '擀开切形', description: '面团擀成5mm厚，用圆形模具切出', duration: '15分钟' },
    { id: '4', title: '烘烤', description: '175°C烤10-12分钟至边缘微金', duration: '12分钟', tips: '不要烤太深色，要保持浅色' },
    { id: '5', title: '制作糖霜', description: '糖粉加少许牛奶和粉色食用色素调成糖霜', duration: '5分钟' },
    { id: '6', title: '装饰', description: '曲奇冷却后涂上粉红糖霜，撒彩色糖珠', duration: '15分钟', tips: 'Crumbl的标志性粉色' },
  ],
  '谷物牛奶软冰淇淋 Cereal Milk Soft Serve': [
    { id: '1', title: '制作谷物牛奶', description: '玉米片泡入牛奶30分钟，过滤取牛奶', duration: '35分钟', tips: 'Milk Bar的招牌做法' },
    { id: '2', title: '制作冰淇淋基底', description: '谷物牛奶、淡奶油、糖、少许盐混合', duration: '10分钟' },
    { id: '3', title: '加热杀菌', description: '小火加热至82°C，不要沸腾', duration: '10分钟' },
    { id: '4', title: '冷却', description: '冰浴冷却，冷藏过夜', duration: '8小时', tips: '陈化让口感更顺滑' },
    { id: '5', title: '搅打冷冻', description: '倒入冰淇淋机搅打至软冰淇淋状态', duration: '25分钟' },
    { id: '6', title: '装盘', description: '用软冰淇淋机挤出，顶部撒碎玉米片', duration: '2分钟' },
  ],
  '意大利牛肉三明治 Italian Beef Dipped': [
    { id: '1', title: '腌制牛肉', description: '牛肩肉用意式香料、蒜、盐腌制过夜', duration: '8小时' },
    { id: '2', title: '慢烤', description: '160°C慢烤4-5小时至可撕碎，收集肉汁', duration: '5小时', tips: '芝加哥式的灵魂是肉汁' },
    { id: '3', title: '切薄片', description: '牛肉冷却后切成薄片', duration: '10分钟' },
    { id: '4', title: '准备配料', description: '腌制意大利辣椒 Giardiniera', duration: '10分钟' },
    { id: '5', title: '组装', description: '法式长棍夹入牛肉片和辣椒', duration: '3分钟' },
    { id: '6', title: '蘸汁', description: '整个三明治蘸入热肉汁（Dipped风格）', duration: '1分钟', tips: '湿漉漉的才正宗' },
  ],
  '经典巧克力Frosty': [
    { id: '1', title: '准备材料', description: '香草冰淇淋、巧克力粉、牛奶准备好', duration: '5分钟' },
    { id: '2', title: '混合', description: '冰淇淋、巧克力粉和少许牛奶放入搅拌机', duration: '2分钟' },
    { id: '3', title: '搅打', description: '低速搅打至浓稠顺滑', duration: '2分钟', tips: '不要打太久，保持浓稠度' },
    { id: '4', title: '调整稠度', description: '根据喜好添加牛奶或冰淇淋调整', duration: '1分钟' },
    { id: '5', title: '装杯', description: '倒入Wendy风格的杯子，配长勺', duration: '1分钟', tips: '要用勺子吃，不是吸管' },
  ],
  '新奥尔良冰咖啡 New Orleans Iced Coffee': [
    { id: '1', title: '烘焙咖啡', description: '咖啡豆与菊苣根一起烘焙', duration: '15分钟', tips: '菊苣是新奥尔良咖啡的特色' },
    { id: '2', title: '研磨', description: '烘焙好的咖啡研磨成中粗粉', duration: '5分钟' },
    { id: '3', title: '冷萃', description: '咖啡粉加冷水，1:8比例，冷藏萃取12-24小时', duration: '24小时' },
    { id: '4', title: '过滤', description: '用滤纸或滤布过滤咖啡液', duration: '10分钟' },
    { id: '5', title: '调制', description: '浓缩咖啡加牛奶和炼乳，加入冰块', duration: '3分钟', tips: 'Blue Bottle的招牌甜度' },
  ],
  '现切黄金牛肋排 Carved Prime Rib': [
    { id: '1', title: '准备牛排', description: '牛肋排室温放置2小时，表面抹盐和黑胡椒', duration: '2小时' },
    { id: '2', title: '调味', description: '用蒜泥、迷迭香、百里香和橄榄油涂抹', duration: '10分钟' },
    { id: '3', title: '高温烤表面', description: '230°C烤20分钟让表面上色', duration: '20分钟' },
    { id: '4', title: '低温慢烤', description: '降至120°C，烤至内部温度达到52°C（三分熟）', duration: '3小时', tips: '用温度计确保精准' },
    { id: '5', title: '静置', description: '出炉后用锡纸包裹静置30分钟', duration: '30分钟', tips: '静置让肉汁回流' },
    { id: '6', title: '切片上桌', description: '逆纹切成厚片，配自然肉汁和辣根酱', duration: '5分钟' },
  ],
  '烤牛肉塔可 Bulgogi Taco': [
    { id: '1', title: '腌制牛肉', description: '牛肉薄片用梨泥、酱油、糖、蒜、芝麻油腌制2小时', duration: '2小时', tips: '梨泥是韩式烤肉嫩化的秘密' },
    { id: '2', title: '烤牛肉', description: '高温快烤牛肉至微焦', duration: '5分钟' },
    { id: '3', title: '准备配料', description: '切丝生菜、泡菜、香菜准备好', duration: '10分钟' },
    { id: '4', title: '加热玉米饼', description: '玉米饼干煎或烤至微软', duration: '3分钟' },
    { id: '5', title: '调制酱料', description: '韩式辣酱混合蛋黄酱', duration: '3分钟' },
    { id: '6', title: '组装', description: '玉米饼放牛肉、配料，淋酱', duration: '3分钟', tips: 'Kogi BBQ的招牌融合料理' },
  ],
  '秋收碗 Harvest Bowl': [
    { id: '1', title: '烤蔬菜', description: '红薯、球芽甘蓝切块，加橄榄油200°C烤25分钟', duration: '30分钟' },
    { id: '2', title: '煮谷物', description: '藜麦或糙米按说明煮熟', duration: '20分钟' },
    { id: '3', title: '准备蛋白质', description: '鸡胸肉调味后烤熟切片', duration: '20分钟' },
    { id: '4', title: '制作酱汁', description: '大溪地酱：蜂蜜、苹果醋、芥末混合', duration: '5分钟', tips: 'Sweetgreen的灵魂酱汁' },
    { id: '5', title: '组装', description: '碗底铺谷物，排列蔬菜、鸡肉、山羊芝士', duration: '5分钟' },
    { id: '6', title: '点缀', description: '撒杏仁片，淋酱汁', duration: '2分钟' },
  ],
  '柠檬胡椒鸡翅 Lemon Pepper Wings': [
    { id: '1', title: '处理鸡翅', description: '鸡翅洗净擦干，用盐和小苏打腌制30分钟', duration: '35分钟', tips: '小苏打让皮更脆' },
    { id: '2', title: '调制柠檬胡椒', description: '柠檬皮屑、黑胡椒、蒜粉、盐混合', duration: '5分钟' },
    { id: '3', title: '油炸/空气炸', description: '180°C炸12-15分钟至金黄酥脆', duration: '15分钟' },
    { id: '4', title: '融化黄油', description: '黄油小火融化', duration: '2分钟' },
    { id: '5', title: '裹酱', description: '鸡翅趁热裹上融化黄油，撒柠檬胡椒调料', duration: '3分钟', tips: 'Wingstop的招牌口味' },
  ],
  '烟熏辣椒蛋黄酱 Chipotle Mayo': [
    { id: '1', title: '准备材料', description: '蛋黄、油、Chipotle辣椒准备好', duration: '5分钟' },
    { id: '2', title: '打蛋黄', description: '蛋黄加盐和柠檬汁打发', duration: '2分钟' },
    { id: '3', title: '乳化', description: '一滴一滴加入油，不断搅打至乳化', duration: '10分钟', tips: '耐心是关键' },
    { id: '4', title: '加辣椒', description: 'Chipotle辣椒打成泥加入蛋黄酱', duration: '3分钟' },
    { id: '5', title: '调味', description: '加盐、酸橙汁调味', duration: '2分钟', tips: 'Chipotle门店的灵魂酱料' },
  ],
  '辣味通心粉 Spicy Rigatoni Vodka': [
    { id: '1', title: '炒底料', description: '蒜末、辣椒碎用橄榄油小火炒香', duration: '5分钟' },
    { id: '2', title: '加番茄酱', description: '倒入番茄酱和少许伏特加，炖煮收汁', duration: '15分钟', tips: '伏特加会挥发掉酒精' },
    { id: '3', title: '加奶油', description: '淡奶油倒入拌匀，调味', duration: '5分钟' },
    { id: '4', title: '煮面', description: 'Rigatoni煮至有嚼劲', duration: '12分钟' },
    { id: '5', title: '混合', description: '面条加入酱汁翻拌，加少许煮面水乳化', duration: '3分钟' },
    { id: '6', title: '装盘', description: '撒帕玛森芝士和新鲜罗勒', duration: '2分钟', tips: 'Carbone的网红菜' },
  ],
  '什锦牛肉河粉 Pho Dac Biet': [
    { id: '1', title: '熬汤底', description: '牛骨、洋葱、姜烤香后加水，大火煮开撇沫，小火熬6小时', duration: '6小时', tips: '香料最后1小时再加' },
    { id: '2', title: '加香料', description: '八角、桂皮、丁香、香菜籽、小茴香装入香料袋', duration: '5分钟' },
    { id: '3', title: '调味', description: '加鱼露、冰糖调味', duration: '5分钟' },
    { id: '4', title: '切牛肉', description: '生牛肉片、牛筋、牛丸准备好', duration: '15分钟' },
    { id: '5', title: '烫河粉', description: '河粉烫软沥干放入碗中', duration: '2分钟' },
    { id: '6', title: '组装', description: '放生牛肉片，浇滚烫的汤，配豆芽、罗勒、辣椒、青柠', duration: '3分钟', tips: '汤要滚烫才能烫熟生牛肉' },
  ],
  '烟熏三文鱼百吉饼 Lox & Bagel': [
    { id: '1', title: '制作百吉饼', description: '高筋面粉、酵母、盐揉成面团，发酵后整形成圈', duration: '2小时' },
    { id: '2', title: '水煮', description: '糖水煮百吉饼每面30秒', duration: '5分钟', tips: '这步让百吉饼有嚼劲' },
    { id: '3', title: '烘烤', description: '220°C烤15-20分钟至金黄', duration: '20分钟' },
    { id: '4', title: '准备配料', description: '烟熏三文鱼、奶油芝士、红洋葱、酸豆准备好', duration: '10分钟' },
    { id: '5', title: '组装', description: '百吉饼对半切，抹厚厚的奶油芝士', duration: '2分钟' },
    { id: '6', title: '叠加', description: '铺三文鱼、洋葱圈、酸豆、新鲜莳萝', duration: '3分钟', tips: 'Russ & Daughters的经典' },
  ],
  '东京芭娜娜香蕉蛋糕': [
    { id: '1', title: '制作蛋糕糊', description: '鸡蛋加糖打发，筛入面粉和香蕉泥拌匀', duration: '15分钟' },
    { id: '2', title: '烘烤蛋糕片', description: '面糊倒入烤盘，180°C烤12分钟', duration: '12分钟' },
    { id: '3', title: '制作香蕉卡仕达', description: '牛奶、蛋黄、糖煮稠，加香蕉泥', duration: '15分钟' },
    { id: '4', title: '冷却', description: '蛋糕片和卡仕达分别冷却', duration: '30分钟' },
    { id: '5', title: '组装', description: '蛋糕片裹入卡仕达馅，整形成香蕉形状', duration: '20分钟' },
    { id: '6', title: '包装', description: '用香蕉图案包装纸包好', duration: '5分钟', tips: '东京土特产的代表' },
  ],
  '白色恋人白巧克力夹心饼干': [
    { id: '1', title: '制作饼干面团', description: '黄油、糖、蛋白、面粉混合成面团', duration: '15分钟' },
    { id: '2', title: '擀薄切形', description: '面团擀成2mm薄，切成方形', duration: '15分钟' },
    { id: '3', title: '烘烤', description: '170°C烤8-10分钟至浅金色', duration: '10分钟', tips: '薄脆是关键' },
    { id: '4', title: '融化白巧克力', description: '白巧克力隔水融化', duration: '10分钟' },
    { id: '5', title: '组装', description: '一片饼干涂白巧克力，盖上另一片', duration: '20分钟' },
    { id: '6', title: '冷却定型', description: '冷藏至巧克力凝固', duration: '30分钟', tips: '北海道的浪漫味道' },
  ],
  '双层芝士蛋糕 Double Fromage': [
    { id: '1', title: '烤芝士蛋糕层', description: '奶油芝士、糖、蛋黄混合，水浴烤30分钟', duration: '40分钟' },
    { id: '2', title: '制作慕斯层', description: '奶油芝士加糖打发，加入打发的淡奶油', duration: '15分钟' },
    { id: '3', title: '加吉利丁', description: '泡软的吉利丁片融化后加入慕斯', duration: '5分钟' },
    { id: '4', title: '组装', description: '芝士蛋糕层底部，倒入慕斯层', duration: '10分钟' },
    { id: '5', title: '冷藏定型', description: '冷藏4小时以上', duration: '4小时', tips: 'LeTAO的招牌双层口感' },
    { id: '6', title: '脱模装饰', description: '脱模后撒糖粉', duration: '5分钟' },
  ],
  '原味流心芝士挞': [
    { id: '1', title: '制作挞皮', description: '黄油、糖、蛋黄、面粉混合，冷藏后压入挞模', duration: '1小时' },
    { id: '2', title: '盲烤挞皮', description: '180°C盲烤10分钟至半熟', duration: '10分钟' },
    { id: '3', title: '制作芝士馅', description: '奶油芝士、糖、蛋黄、淡奶油混合', duration: '10分钟' },
    { id: '4', title: '注入馅料', description: '芝士馅倒入半熟挞皮中', duration: '5分钟' },
    { id: '5', title: '烘烤', description: '200°C烤15分钟至表面微焦但中心流动', duration: '15分钟', tips: 'BAKE的秘诀是烤不熟' },
    { id: '6', title: '出炉', description: '趁热享用，体验流心', duration: '1分钟' },
  ],
  '新鲜水果千层蛋糕': [
    { id: '1', title: '制作班戟皮', description: '鸡蛋、糖、牛奶、面粉混合，过筛静置', duration: '40分钟' },
    { id: '2', title: '煎皮', description: '不粘锅小火摊薄皮，约20张', duration: '45分钟' },
    { id: '3', title: '打发奶油', description: '淡奶油加糖打发至八分', duration: '10分钟' },
    { id: '4', title: '切水果', description: '草莓、芒果、奇异果切薄片', duration: '15分钟' },
    { id: '5', title: '组装', description: '一层皮一层奶油一层水果，重复叠加', duration: '30分钟', tips: 'Harbs的水果要新鲜' },
    { id: '6', title: '冷藏', description: '冷藏4小时定型', duration: '4小时' },
  ],
  '奇迹的舒芙蕾松饼': [
    { id: '1', title: '分蛋', description: '蛋黄蛋白分开，蛋黄加牛奶和面粉拌匀', duration: '10分钟' },
    { id: '2', title: '打发蛋白', description: '蛋白分次加糖打发至硬性发泡', duration: '10分钟', tips: '蛋白霜是蓬松的关键' },
    { id: '3', title: '混合', description: '蛋白霜分次轻轻翻入蛋黄糊', duration: '5分钟' },
    { id: '4', title: '入模', description: '面糊倒入圆形模具，高度约4cm', duration: '5分钟' },
    { id: '5', title: '煎烤', description: '小火盖盖煎15分钟，翻面再煎5分钟', duration: '20分钟', tips: '幸福的Pancake的超厚秘密' },
    { id: '6', title: '装盘', description: '脱模后配黄油、枫糖浆、鲜奶油', duration: '3分钟' },
  ],
  '北海道牛奶软冰淇淋': [
    { id: '1', title: '准备材料', description: '新鲜牛奶、淡奶油、糖、脱脂奶粉', duration: '5分钟' },
    { id: '2', title: '混合加热', description: '材料混合，小火加热至糖溶解', duration: '10分钟' },
    { id: '3', title: '加香草', description: '加入香草精或香草籽', duration: '2分钟' },
    { id: '4', title: '冷却', description: '冰浴冷却后冷藏过夜', duration: '8小时' },
    { id: '5', title: '搅打', description: '倒入软冰淇淋机搅打', duration: '20分钟' },
    { id: '6', title: '挤出', description: '用软冰淇淋机挤成螺旋状', duration: '1分钟', tips: '北海道牛奶的醇厚香气' },
  ],
  '奶奶方形披萨 Grandma Slice': [
    { id: '1', title: '制作面团', description: '高筋面粉、酵母、盐、橄榄油和水揉成面团', duration: '15分钟' },
    { id: '2', title: '发酵', description: '室温发酵2小时，或冷藏发酵过夜', duration: '2小时' },
    { id: '3', title: '铺盘', description: '面团铺入抹油的方形烤盘，用手指按压延展', duration: '10分钟' },
    { id: '4', title: '二次发酵', description: '室温再发酵30分钟', duration: '30分钟' },
    { id: '5', title: '加配料', description: '先铺马苏里拉芝士，再淋番茄酱（倒序！）', duration: '5分钟', tips: '芝士在下是纽约奶奶披萨的特色' },
    { id: '6', title: '烘烤', description: '230°C烤15-18分钟至底部酥脆', duration: '18分钟' },
  ],
  // ========== 考古美食补充 ==========
  '美国大选蛋糕 Election Cake': [
    { id: '1', title: '浸泡果干', description: '葡萄干、蔓越莓用朗姆酒浸泡过夜', duration: '8小时', tips: '18世纪选举日的传统' },
    { id: '2', title: '发酵面团', description: '温牛奶激活酵母，加面粉揉成面团发酵', duration: '2小时' },
    { id: '3', title: '加入配料', description: '打发黄油加糖，与面团混合，加入果干和香料', duration: '15分钟' },
    { id: '4', title: '整形', description: '面团放入抹油的蛋糕模', duration: '5分钟' },
    { id: '5', title: '二次发酵', description: '发酵至两倍大', duration: '1小时' },
    { id: '6', title: '烘烤', description: '175°C烤45-50分钟', duration: '50分钟' },
    { id: '7', title: '糖霜', description: '冷却后淋白色糖霜', duration: '10分钟' },
  ],
  '歌德家族蒸布丁': [
    { id: '1', title: '准备布丁液', description: '牛奶、糖、蛋黄混合，过筛', duration: '10分钟' },
    { id: '2', title: '调味', description: '加入香草和少许白兰地', duration: '3分钟' },
    { id: '3', title: '倒入模具', description: '布丁液倒入抹黄油的布丁模', duration: '5分钟' },
    { id: '4', title: '蒸制', description: '水浴蒸45分钟至凝固', duration: '45分钟', tips: '英式布丁用蒸的更软滑' },
    { id: '5', title: '冷却', description: '冷却后冷藏4小时', duration: '4小时' },
    { id: '6', title: '脱模', description: '脱模配卡仕达酱或果酱', duration: '5分钟' },
  ],
  '新英格兰选举蛋糕': [
    { id: '1', title: '准备酵种', description: '温水、糖、酵母混合静置10分钟', duration: '10分钟' },
    { id: '2', title: '制作面团', description: '面粉、黄油、糖与酵种混合揉成面团', duration: '15分钟' },
    { id: '3', title: '发酵', description: '盖湿布发酵2小时', duration: '2小时' },
    { id: '4', title: '加入配料', description: '加入葡萄干、柑橘皮和香料', duration: '10分钟' },
    { id: '5', title: '整形二发', description: '整形入模，再发酵1小时', duration: '1小时' },
    { id: '6', title: '烘烤', description: '170°C烤50分钟', duration: '50分钟', tips: '殖民地时代的选举传统' },
  ],
  '庞贝式八分圆面包': [
    { id: '1', title: '制作面团', description: '斯佩尔特小麦粉、水、盐和酵母揉成面团', duration: '15分钟', tips: '用古老的斯佩尔特麦' },
    { id: '2', title: '发酵', description: '发酵2小时至两倍大', duration: '2小时' },
    { id: '3', title: '整形', description: '面团整成圆形，用刀划出8等分切口', duration: '10分钟' },
    { id: '4', title: '二次发酵', description: '松弛30分钟', duration: '30分钟' },
    { id: '5', title: '烘烤', description: '220°C烤25分钟', duration: '25分钟' },
    { id: '6', title: '冷却', description: '可以掰成8块分享', duration: '10分钟', tips: '庞贝遗址发现的面包形状' },
  ],
  '伊丽莎白式玫瑰蛋奶塔': [
    { id: '1', title: '制作塔皮', description: '黄油、面粉、糖揉成面团，冷藏后擀开入模', duration: '1小时' },
    { id: '2', title: '盲烤', description: '180°C盲烤15分钟', duration: '15分钟' },
    { id: '3', title: '制作蛋奶液', description: '牛奶、蛋黄、糖、玫瑰水混合', duration: '10分钟', tips: '玫瑰水是都铎时代的风味' },
    { id: '4', title: '过筛', description: '蛋奶液过筛去除杂质', duration: '5分钟' },
    { id: '5', title: '倒入烘烤', description: '蛋奶液倒入塔皮，150°C烤30分钟', duration: '30分钟' },
    { id: '6', title: '装饰', description: '撒玫瑰花瓣和糖粉', duration: '5分钟' },
  ],
  '马伦戈炖鸡 Chicken Marengo': [
    { id: '1', title: '煎鸡肉', description: '鸡腿切块，用橄榄油煎至金黄', duration: '15分钟' },
    { id: '2', title: '炒香料', description: '洋葱、蒜炒软，加番茄', duration: '10分钟' },
    { id: '3', title: '加酒炖煮', description: '倒入白葡萄酒和鸡汤，放回鸡肉炖30分钟', duration: '35分钟' },
    { id: '4', title: '加配菜', description: '加入蘑菇和黑橄榄', duration: '10分钟' },
    { id: '5', title: '煎鸡蛋', description: '另起锅煎几个荷包蛋', duration: '5分钟', tips: '拿破仑战胜后的庆功餐' },
    { id: '6', title: '装盘', description: '炖鸡装盘，放上煎蛋，配炸面包块', duration: '5分钟' },
  ],
  '泰坦尼克式羊排配薄荷酱': [
    { id: '1', title: '处理羊排', description: '法式羊排修整干净，室温回温', duration: '30分钟' },
    { id: '2', title: '调味', description: '抹盐、黑胡椒和迷迭香', duration: '5分钟' },
    { id: '3', title: '煎羊排', description: '热锅煎至两面金黄', duration: '5分钟' },
    { id: '4', title: '烤制', description: '200°C烤10分钟至内部55°C', duration: '10分钟' },
    { id: '5', title: '制作薄荷酱', description: '新鲜薄荷、糖、醋混合', duration: '5分钟', tips: '英式传统配羊肉' },
    { id: '6', title: '静置装盘', description: '静置5分钟切开，配薄荷酱', duration: '5分钟', tips: '泰坦尼克头等舱菜单' },
  ],
  '古埃及式发酵扁面包': [
    { id: '1', title: '制作面团', description: '全麦面粉加水和少许蜂蜜揉成面团', duration: '10分钟' },
    { id: '2', title: '自然发酵', description: '室温发酵8-12小时（模拟野生酵母）', duration: '12小时', tips: '古埃及人发现了发酵' },
    { id: '3', title: '分割', description: '面团分成小份，擀成薄饼', duration: '15分钟' },
    { id: '4', title: '烤制', description: '热石板或平底锅高温烤至起泡', duration: '5分钟' },
    { id: '5', title: '出炉', description: '趁热享用，可配蜂蜜或芝麻', duration: '2分钟' },
  ],
  '内战硬饼干 Hardtack': [
    { id: '1', title: '混合', description: '面粉、水、盐混合成非常硬的面团', duration: '10分钟', tips: '不加任何油脂或发酵剂' },
    { id: '2', title: '擀平', description: '面团擀成1cm厚', duration: '10分钟' },
    { id: '3', title: '切块', description: '切成7cm见方的块', duration: '5分钟' },
    { id: '4', title: '戳洞', description: '用叉子戳满小洞（16个孔）', duration: '10分钟' },
    { id: '5', title: '烘烤', description: '150°C烤30分钟，翻面再烤30分钟', duration: '1小时', tips: '烤到完全干燥' },
    { id: '6', title: '放凉', description: '完全冷却后可保存数月', duration: '1小时', tips: '内战士兵的口粮' },
  ],
  '清教徒式野鸭配玉米布丁': [
    { id: '1', title: '处理鸭子', description: '野鸭清理干净，用盐和香草腌制', duration: '2小时' },
    { id: '2', title: '烤鸭', description: '200°C烤45分钟至皮脆', duration: '45分钟' },
    { id: '3', title: '制作玉米布丁', description: '玉米糊加牛奶、蛋、糖混合', duration: '15分钟' },
    { id: '4', title: '烤布丁', description: '160°C水浴烤40分钟', duration: '40分钟', tips: '感恩节前身的菜式' },
    { id: '5', title: '装盘', description: '鸭子切块配玉米布丁', duration: '10分钟' },
  ],
  '江户式大握寿司': [
    { id: '1', title: '煮寿司饭', description: '短粒米洗净，1:1.1水煮熟', duration: '40分钟' },
    { id: '2', title: '调寿司醋', description: '米醋、糖、盐加热溶解，趁热拌入米饭', duration: '10分钟' },
    { id: '3', title: '切鱼', description: '新鲜鱼切成比现代更大的厚片', duration: '10分钟', tips: '江户时代的握寿司比现在大两倍' },
    { id: '4', title: '握寿司', description: '取约40g饭（现代的两倍），轻握成型', duration: '15分钟' },
    { id: '5', title: '腌渍', description: '鱼片用酱油或盐轻腌', duration: '5分钟', tips: '当时没有冷藏，需要腌渍保鲜' },
    { id: '6', title: '上桌', description: '一贯顶两贯的分量', duration: '3分钟' },
  ],
  '唐代胡饼（月饼前身）': [
    { id: '1', title: '制作面团', description: '面粉加水和少许油揉成面团', duration: '10分钟' },
    { id: '2', title: '制作馅料', description: '芝麻、核桃、蜂蜜混合', duration: '10分钟', tips: '唐代从西域传入' },
    { id: '3', title: '包馅', description: '面团擀开包入馅料，收口压扁', duration: '15分钟' },
    { id: '4', title: '撒芝麻', description: '表面刷水，撒白芝麻', duration: '5分钟' },
    { id: '5', title: '烤制', description: '贴在炉壁上烤或平底锅烙', duration: '15分钟' },
    { id: '6', title: '出炉', description: '趁热食用，外酥内香', duration: '2分钟' },
  ],
  '大革命时期平民黑面包': [
    { id: '1', title: '混合面粉', description: '全麦面粉、黑麦面粉、少许白面粉混合', duration: '5分钟', tips: '革命时期白面粉稀缺' },
    { id: '2', title: '发酵', description: '加入酵母和水，发酵2小时', duration: '2小时' },
    { id: '3', title: '加粗粮', description: '可加入麸皮增加分量', duration: '5分钟' },
    { id: '4', title: '整形', description: '整成圆形或长条形', duration: '10分钟' },
    { id: '5', title: '二次发酵', description: '发酵1小时', duration: '1小时' },
    { id: '6', title: '烘烤', description: '220°C烤35分钟', duration: '35分钟', tips: '平等面包，人人有份' },
  ],
  '传统苏格兰Haggis': [
    { id: '1', title: '准备内脏', description: '羊心、肝、肺清洗干净，煮熟后切碎', duration: '1小时' },
    { id: '2', title: '炒洋葱', description: '洋葱切碎炒软', duration: '10分钟' },
    { id: '3', title: '混合', description: '内脏碎、燕麦、洋葱、羊油、香料混合', duration: '15分钟' },
    { id: '4', title: '灌入羊肚', description: '混合物灌入清洗好的羊肚', duration: '15分钟', tips: '传统做法用羊肚做容器' },
    { id: '5', title: '煮制', description: '水煮3小时', duration: '3小时' },
    { id: '6', title: '上桌', description: '切开配土豆泥和芜菁泥', duration: '10分钟', tips: '苏格兰国菜，彭斯之夜必吃' },
  ],
  '二战式煎午餐肉配蛋': [
    { id: '1', title: '切午餐肉', description: '午餐肉切成0.5cm厚的片', duration: '3分钟' },
    { id: '2', title: '煎午餐肉', description: '平底锅不放油，中火煎至两面焦脆', duration: '5分钟', tips: '午餐肉自带油脂' },
    { id: '3', title: '煎蛋', description: '用煎出的油煎荷包蛋', duration: '3分钟' },
    { id: '4', title: '烤面包', description: '面包片烤至金黄', duration: '2分钟' },
    { id: '5', title: '装盘', description: '午餐肉、煎蛋、烤面包摆盘', duration: '2分钟', tips: '战时配给的经典早餐' },
  ],
  '文艺复兴藏红花烩饭': [
    { id: '1', title: '泡藏红花', description: '藏红花丝用温水浸泡15分钟', duration: '15分钟', tips: '文艺复兴时期的奢侈品' },
    { id: '2', title: '炒洋葱', description: '洋葱切碎用黄油炒软', duration: '10分钟' },
    { id: '3', title: '炒米', description: '加入意大利米炒至透明', duration: '5分钟' },
    { id: '4', title: '加酒', description: '倒入白葡萄酒炒至吸收', duration: '3分钟' },
    { id: '5', title: '加汤', description: '分次加入鸡汤，每次吸收后再加，共20分钟', duration: '20分钟' },
    { id: '6', title: '加藏红花', description: '最后加入藏红花水和帕玛森芝士', duration: '5分钟', tips: '米兰烩饭的前身' },
  ],
  '古希腊式蜂蜜芝士饼 Plakous': [
    { id: '1', title: '制作面皮', description: '面粉加水揉成面团，擀成薄片', duration: '15分钟' },
    { id: '2', title: '准备馅料', description: '新鲜软芝士加蜂蜜混合', duration: '5分钟', tips: '古希腊用山羊奶酪' },
    { id: '3', title: '叠层', description: '一层面皮一层芝士馅，叠3-4层', duration: '15分钟' },
    { id: '4', title: '淋蜂蜜', description: '顶部淋上大量蜂蜜', duration: '3分钟' },
    { id: '5', title: '烘烤', description: '180°C烤25分钟至金黄', duration: '25分钟' },
    { id: '6', title: '装饰', description: '出炉后再淋蜂蜜，撒芝麻', duration: '3分钟', tips: '芝士蛋糕的祖先' },
  ],
  '1950s蔬菜果冻沙拉': [
    { id: '1', title: '准备蔬菜', description: '胡萝卜、芹菜、青豆切小丁', duration: '15分钟' },
    { id: '2', title: '溶解果冻', description: '柠檬或青柠口味果冻粉用热水溶解', duration: '5分钟', tips: '50年代主妇的最爱' },
    { id: '3', title: '加入配料', description: '果冻半凝时加入蔬菜丁和少许蛋黄酱', duration: '30分钟' },
    { id: '4', title: '入模', description: '倒入环形模具', duration: '5分钟' },
    { id: '5', title: '冷藏', description: '冷藏4小时至完全凝固', duration: '4小时' },
    { id: '6', title: '脱模', description: '脱模后中间可放蛋黄酱', duration: '5分钟', tips: '复古的美式餐桌' },
  ],
  '维京式血肠 Blodpølse': [
    { id: '1', title: '准备猪血', description: '新鲜猪血加盐搅拌防凝固', duration: '10分钟', tips: '维京人不浪费任何食材' },
    { id: '2', title: '混合配料', description: '猪血加燕麦、洋葱、猪油、香料混合', duration: '15分钟' },
    { id: '3', title: '灌肠衣', description: '混合物灌入猪肠衣', duration: '20分钟' },
    { id: '4', title: '煮制', description: '80°C水煮1小时，不要沸腾', duration: '1小时' },
    { id: '5', title: '冷却', description: '捞出冷却', duration: '30分钟' },
    { id: '6', title: '煎食', description: '切片用黄油煎至两面焦脆', duration: '10分钟' },
  ],
  '凡尔赛玫瑰冰淇淋': [
    { id: '1', title: '浸泡玫瑰', description: '食用玫瑰花瓣浸入牛奶，小火加热后浸泡30分钟', duration: '40分钟' },
    { id: '2', title: '过滤', description: '滤出花瓣，留下玫瑰牛奶', duration: '5分钟' },
    { id: '3', title: '制作蛋奶液', description: '蛋黄加糖打发，加入玫瑰牛奶煮至浓稠', duration: '15分钟' },
    { id: '4', title: '加奶油', description: '冷却后加入打发的淡奶油', duration: '10分钟' },
    { id: '5', title: '冷冻搅拌', description: '冰淇淋机搅打25分钟', duration: '25分钟', tips: '玛丽·安托瓦内特最爱' },
    { id: '6', title: '装饰', description: '撒食用玫瑰花瓣', duration: '3分钟' },
  ],
  '维多利亚苹果蛋糕 Gâteau de Pommes': [
    { id: '1', title: '处理苹果', description: '苹果去皮切薄片', duration: '15分钟' },
    { id: '2', title: '制作面糊', description: '黄油加糖打发，加蛋和面粉', duration: '15分钟' },
    { id: '3', title: '倒入模具', description: '面糊倒入抹油的蛋糕模', duration: '5分钟' },
    { id: '4', title: '摆苹果', description: '苹果片同心圆排列在表面', duration: '10分钟' },
    { id: '5', title: '烘烤', description: '180°C烤40分钟', duration: '40分钟' },
    { id: '6', title: '刷果酱', description: '出炉后刷一层杏子果酱增亮', duration: '5分钟', tips: 'Mrs Crocombe的食谱' },
  ],
  '维多利亚黄瓜冰淇淋 Cucumber Ice Cream': [
    { id: '1', title: '处理黄瓜', description: '黄瓜去皮去籽，用料理机打成泥', duration: '10分钟' },
    { id: '2', title: '过滤', description: '黄瓜泥用纱布过滤取汁', duration: '10分钟', tips: '维多利亚时代的清新口味' },
    { id: '3', title: '制作蛋奶液', description: '牛奶、糖、蛋黄煮成卡仕达', duration: '15分钟' },
    { id: '4', title: '混合', description: '冷却后加入黄瓜汁和淡奶油', duration: '10分钟' },
    { id: '5', title: '冷冻', description: '冰淇淋机搅打或手动冷冻搅拌', duration: '2小时' },
    { id: '6', title: '装盘', description: '配薄荷叶装饰', duration: '3分钟' },
  ],
  '蜂蜜无花果炸挞 Tourteletes in Fryture': [
    { id: '1', title: '制作面团', description: '面粉、蛋、少许水揉成面团', duration: '15分钟' },
    { id: '2', title: '擀皮', description: '面团擀薄，切成圆片', duration: '15分钟' },
    { id: '3', title: '准备馅料', description: '干无花果切碎，加蜂蜜、肉桂混合', duration: '10分钟', tips: '14世纪的英式甜点' },
    { id: '4', title: '包馅', description: '馅料放在面皮上，对折捏紧', duration: '15分钟' },
    { id: '5', title: '油炸', description: '热油炸至金黄', duration: '10分钟' },
    { id: '6', title: '淋蜜', description: '出锅后淋上温热的蜂蜜', duration: '3分钟' },
  ],
  '中世纪藏红花蛋奶挞 Medieval Custard Tart': [
    { id: '1', title: '制作塔皮', description: '面粉、黄油、蛋揉成面团，冷藏后擀开入模', duration: '1小时' },
    { id: '2', title: '盲烤', description: '180°C盲烤15分钟', duration: '15分钟' },
    { id: '3', title: '制作蛋奶液', description: '牛奶、蛋黄、糖、藏红花丝混合', duration: '10分钟', tips: '中世纪的金黄色' },
    { id: '4', title: '过筛', description: '蛋奶液过筛', duration: '5分钟' },
    { id: '5', title: '烘烤', description: '倒入塔皮，150°C烤35分钟', duration: '35分钟' },
    { id: '6', title: '装饰', description: '可撒糖粉或金箔', duration: '5分钟' },
  ],
  '古罗马蜜枣 Dulcia Domestica': [
    { id: '1', title: '去核', description: '椰枣去核', duration: '10分钟' },
    { id: '2', title: '准备馅料', description: '核桃、松子碾碎，加蜂蜜和黑胡椒', duration: '10分钟', tips: '古罗马人爱甜咸混搭' },
    { id: '3', title: '填馅', description: '馅料填入椰枣中', duration: '15分钟' },
    { id: '4', title: '裹盐', description: '表面裹少许细盐', duration: '5分钟' },
    { id: '5', title: '烘烤', description: '180°C烤10分钟', duration: '10分钟' },
    { id: '6', title: '淋蜜', description: '出炉后淋上热蜂蜜', duration: '3分钟', tips: 'Apicius食谱中的甜点' },
  ],
  '中世纪苹果泥 Apple Muse': [
    { id: '1', title: '煮苹果', description: '苹果去皮切块，加少许水煮软', duration: '20分钟' },
    { id: '2', title: '压泥', description: '煮软的苹果压成泥', duration: '5分钟' },
    { id: '3', title: '调味', description: '加入蜂蜜、肉桂和少许藏红花', duration: '5分钟', tips: '中世纪宫廷甜点' },
    { id: '4', title: '加蛋黄', description: '蛋黄打散加入苹果泥', duration: '5分钟' },
    { id: '5', title: '加热浓缩', description: '小火加热搅拌至浓稠', duration: '10分钟' },
    { id: '6', title: '装盘', description: '盛入碗中，撒杏仁片', duration: '3分钟' },
  ],
  '伊丽莎白一世姜饼人 Gingerbread Man': [
    { id: '1', title: '熬糖蜜', description: '糖蜜（或蜂蜜）、黄油加热融合', duration: '10分钟' },
    { id: '2', title: '混合干料', description: '面粉、姜粉、肉桂、丁香混合', duration: '5分钟' },
    { id: '3', title: '制作面团', description: '糖蜜液加入干料揉成面团，冷藏1小时', duration: '1小时', tips: '伊丽莎白一世会做成宾客模样' },
    { id: '4', title: '擀开切形', description: '面团擀成5mm厚，用人形模具切出', duration: '15分钟' },
    { id: '5', title: '烘烤', description: '175°C烤12分钟', duration: '12分钟' },
    { id: '6', title: '装饰', description: '用糖霜画出五官和衣服', duration: '20分钟' },
  ],
  '苏格兰邓迪蛋糕 Dundee Cake': [
    { id: '1', title: '浸泡果干', description: '葡萄干、橙皮用威士忌浸泡', duration: '2小时' },
    { id: '2', title: '打发黄油', description: '黄油加糖打发至蓬松', duration: '10分钟' },
    { id: '3', title: '加蛋', description: '鸡蛋分次加入打匀', duration: '5分钟' },
    { id: '4', title: '加干料', description: '面粉、杏仁粉、香料筛入拌匀', duration: '5分钟' },
    { id: '5', title: '加果干', description: '沥干的果干拌入面糊', duration: '5分钟' },
    { id: '6', title: '装饰烘烤', description: '倒入模具，表面排列整颗杏仁，160°C烤1.5小时', duration: '1.5小时', tips: '维多利亚时代的圣诞蛋糕' },
  ],
  // ========== 影视美食补充2 ==========
  '新鲜杏子/杏子果酱': [
    { id: '1', title: '处理杏子', description: '新鲜杏子洗净去核，切成小块', duration: '15分钟' },
    { id: '2', title: '加糖', description: '杏子加入等量的糖，静置出水', duration: '1小时' },
    { id: '3', title: '煮制', description: '大火煮开后转小火，不断搅拌', duration: '30分钟', tips: '用木勺搅拌防粘锅' },
    { id: '4', title: '测试浓度', description: '滴一滴在冷盘上，推不动即可', duration: '5分钟' },
    { id: '5', title: '装瓶', description: '趁热装入消毒过的玻璃瓶', duration: '10分钟' },
    { id: '6', title: '密封', description: '盖紧盖子，倒扣冷却', duration: '30分钟', tips: '《请以你的名字呼唤我》的夏日味道' },
  ],
  '黑皮诺葡萄酒配奶酪': [
    { id: '1', title: '选酒', description: '选择一瓶品质良好的黑皮诺', duration: '5分钟', tips: '《杯酒人生》的主角' },
    { id: '2', title: '醒酒', description: '开瓶醒酒30分钟', duration: '30分钟' },
    { id: '3', title: '准备奶酪', description: '布里、卡蒙贝尔等软质奶酪切块', duration: '10分钟' },
    { id: '4', title: '配饼干', description: '准备苏打饼干或法棍片', duration: '5分钟' },
    { id: '5', title: '配水果', description: '葡萄、无花果切开摆盘', duration: '10分钟' },
    { id: '6', title: '享用', description: '奶酪配红酒，品味人生', duration: '随时' },
  ],
  '一人烤肉定食': [
    { id: '1', title: '准备肉类', description: '牛五花、牛舌、猪五花切薄片', duration: '15分钟' },
    { id: '2', title: '调酱', description: '酱油、蒜、芝麻油、糖调成蘸酱', duration: '5分钟' },
    { id: '3', title: '备配菜', description: '生菜、紫苏叶、蒜片、辣椒圈准备好', duration: '10分钟' },
    { id: '4', title: '煮米饭', description: '白米饭蒸熟', duration: '20分钟' },
    { id: '5', title: '烤肉', description: '小烤炉烤肉至微焦', duration: '15分钟', tips: '《孤独的美食家》的治愈时刻' },
    { id: '6', title: '享用', description: '生菜包肉配米饭和味噌汤', duration: '30分钟' },
  ],
  '法式鹅肝配无花果': [
    { id: '1', title: '处理鹅肝', description: '鹅肝室温回温，去除筋膜', duration: '30分钟' },
    { id: '2', title: '调味', description: '撒盐和白胡椒腌制', duration: '10分钟' },
    { id: '3', title: '处理无花果', description: '新鲜无花果切半', duration: '5分钟' },
    { id: '4', title: '煎鹅肝', description: '热锅不放油，鹅肝煎至两面焦脆', duration: '3分钟', tips: '高温快煎，锁住油脂' },
    { id: '5', title: '煎无花果', description: '用鹅肝油煎无花果', duration: '2分钟' },
    { id: '6', title: '摆盘', description: '鹅肝配无花果，淋巴萨米可醋', duration: '3分钟', tips: '《茱莉与朱莉娅》的法式优雅' },
  ],
  '石中鹌鹑派 Caille en Sarcophage': [
    { id: '1', title: '处理鹌鹑', description: '鹌鹑去骨，用香料腌制', duration: '30分钟' },
    { id: '2', title: '制作馅料', description: '鹅肝、松露、蘑菇切丁混合', duration: '15分钟', tips: '《巴别塔之塔》的奢华' },
    { id: '3', title: '包裹', description: '鹌鹑包入馅料，再用酥皮包裹', duration: '20分钟' },
    { id: '4', title: '装饰', description: '酥皮表面做出花纹', duration: '10分钟' },
    { id: '5', title: '烘烤', description: '200°C烤30分钟', duration: '30分钟' },
    { id: '6', title: '切开', description: '切开展示内部层次', duration: '5分钟' },
  ],
}

// 根据菜名生成搜索链接
function generateVideoLinks(dishName: string): VideoTutorial[] {
  return [
    {
      title: `搜索「${dishName}」教程`,
      platform: 'B站',
      url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(dishName + ' 教程')}`
    },
    {
      title: `Search "${dishName}" recipe`,
      platform: 'YouTube',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(dishName + ' recipe')}`
    },
    {
      title: `搜索「${dishName}」`,
      platform: '小红书',
      url: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(dishName + ' 做法')}`
    },
  ]
}

// 将原始数据转换为统一的详细格式
function convertToDetailedStep(step: RawStep): Omit<CookingStep, 'completed' | 'expanded'> {
  // 如果是新格式（有 details 数组）
  if ('details' in step && Array.isArray(step.details)) {
    return step as Omit<CookingStep, 'completed' | 'expanded'>
  }

  // 旧格式转换
  const legacy = step as LegacyStep
  return {
    id: legacy.id,
    title: legacy.title,
    duration: legacy.duration,
    details: [legacy.description],
    tips: legacy.tips ? [legacy.tips] : undefined
  }
}

// 获取菜品的详细步骤（自动转换旧格式）
function getDetailedSteps(dishName: string): Omit<CookingStep, 'completed' | 'expanded'>[] {
  const rawSteps = DETAILED_DISH_STEPS[dishName]
  if (!rawSteps) {
    return generateDefaultDetailedSteps(dishName)
  }
  return rawSteps.map(convertToDetailedStep)
}

// 默认详细步骤模板
function generateDefaultDetailedSteps(dishName: string): Omit<CookingStep, 'completed' | 'expanded'>[] {
  return [
    {
      id: '1',
      title: '准备食材',
      duration: '10分钟',
      details: [
        `准备制作「${dishName}」所需的所有食材`,
        '按照食谱清单逐一检查食材是否齐全',
        '提前把需要解冻的食材取出解冻',
        '准备好所需的厨具和容器'
      ],
      tips: ['建议先把所有食材准备好再开始烹饪', '可以参考上面的视频教程确认用量']
    },
    {
      id: '2',
      title: '食材处理',
      duration: '15分钟',
      details: [
        '蔬菜类食材先清洗干净',
        '按照食谱要求切成相应的形状和大小',
        '肉类/海鲜去除不需要的部分，切成适当大小',
        '调味料提前调配好，放在小碗里备用'
      ],
      tips: ['切菜时注意大小均匀，这样烹饪时才能熟度一致', '不确定怎么切可以参考视频教程']
    },
    {
      id: '3',
      title: '烹饪制作',
      duration: '30分钟',
      details: [
        '按照食谱步骤依次进行烹饪',
        '注意火候和时间的控制',
        '过程中可以尝味道，根据口味调整',
        '观察食材的颜色和状态判断是否熟透'
      ],
      tips: ['第一次做可以多看几遍视频教程', '不确定的地方可以暂停下来查看'],
      warnings: ['注意安全，小心烫伤']
    },
    {
      id: '4',
      title: '摆盘出品',
      duration: '5分钟',
      details: [
        '选择合适的盘子盛装',
        '注意摆放的美观度',
        '可以用香草、酱汁等做简单装饰',
        '趁热享用味道最佳'
      ],
      tips: ['好的摆盘能增加食欲', '可以拍照记录你的作品']
    }
  ]
}

export function StepCooking({ topic, onNext, onPrev, stepData }: StepCookingProps) {
  const existingSteps = (stepData.cooking as { cookingSteps: CookingStep[] })?.cookingSteps

  // 获取详细步骤和视频链接（自动兼容旧格式）
  const dishSteps = getDetailedSteps(topic.recommended_dish)
  const videoLinks = generateVideoLinks(topic.recommended_dish)

  const [steps, setSteps] = useState<CookingStep[]>(
    existingSteps || dishSteps.map(s => ({ ...s, completed: false, expanded: false }))
  )
  const [currentStep, setCurrentStep] = useState(0)

  // 切换步骤完成状态
  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(s =>
      s.id === id ? { ...s, completed: !s.completed } : s
    ))
  }

  // 切换步骤展开/收起
  const toggleExpand = (id: string) => {
    setSteps(prev => prev.map(s =>
      s.id === id ? { ...s, expanded: !s.expanded } : s
    ))
  }

  // 展开当前步骤
  const expandStep = (index: number) => {
    setCurrentStep(index)
    setSteps(prev => prev.map((s, i) => ({
      ...s,
      expanded: i === index ? true : s.expanded
    })))
  }

  const completedCount = steps.filter(s => s.completed).length
  const totalDuration = steps.reduce((acc, s) => {
    const match = s.duration?.match(/(\d+)/)
    return acc + (match ? parseInt(match[1]) : 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">烹饪教程</h2>
        <p className="text-zinc-400">一步一步学做 {topic.recommended_dish}</p>
      </div>

      {/* 概览信息 */}
      <div className="flex items-center justify-center gap-6 text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-400" />
          <span>预计 {totalDuration} 分钟</span>
        </div>
        <div className="flex items-center gap-2">
          <ChefHat size={16} className="text-amber-400" />
          <span>难度：{topic.cooking_difficulty || '中等'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-amber-400" />
          <span>1-2人份</span>
        </div>
      </div>

      {/* 步骤列表 - 详细版 */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`
              card-elegant overflow-hidden transition-all
              ${step.completed ? 'opacity-60' : ''}
              ${currentStep === index ? 'ring-2 ring-amber-500/50' : ''}
            `}
          >
            {/* 步骤头部 - 点击展开/收起 */}
            <div
              onClick={() => {
                toggleExpand(step.id)
                expandStep(index)
              }}
              className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* 步骤序号/完成状态 */}
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleStep(step.id)
                  }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-all cursor-pointer
                    ${step.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/30 hover:border-amber-500'
                    }
                  `}
                >
                  {step.completed ? <Check size={18} /> : index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold text-lg ${step.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                      {step.title}
                    </h4>
                    <div className="flex items-center gap-3">
                      {step.duration && (
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Clock size={12} />
                          {step.duration}
                        </span>
                      )}
                      {step.expanded ? (
                        <ChevronUp size={18} className="text-zinc-400" />
                      ) : (
                        <ChevronDown size={18} className="text-zinc-400" />
                      )}
                    </div>
                  </div>
                  {!step.expanded && (
                    <p className="text-sm text-zinc-500 mt-1 truncate">
                      {step.details[0]}...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 展开后的详细内容 */}
            {step.expanded && (
              <div className="px-4 pb-4 pt-0 border-t border-white/5">
                {/* 这一步需要的食材 */}
                {step.ingredients && step.ingredients.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <h5 className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">📦 这一步需要</h5>
                    <div className="flex flex-wrap gap-2">
                      {step.ingredients.map((ing, i) => (
                        <span key={i} className="text-sm text-zinc-300 bg-white/5 px-2 py-1 rounded">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 详细操作步骤 */}
                <div className="mt-4">
                  <h5 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">📝 详细操作</h5>
                  <ol className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-zinc-400 shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-zinc-300 leading-relaxed pt-0.5">{detail}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* 小贴士 */}
                {step.tips && step.tips.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <h5 className="text-xs font-semibold text-green-400 mb-2 uppercase tracking-wider">💡 小贴士</h5>
                    <ul className="space-y-1.5">
                      {step.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex gap-2">
                          <span className="text-green-400">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 常见错误提醒 */}
                {step.warnings && step.warnings.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <h5 className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle size={12} />
                      注意避坑
                    </h5>
                    <ul className="space-y-1.5">
                      {step.warnings.map((warning, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex gap-2">
                          <span className="text-red-400">⚠</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 完成这一步按钮 */}
                {!step.completed && (
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="mt-4 w-full py-2.5 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    完成这一步
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 进度 */}
      <div className="text-center text-sm text-zinc-500">
        已完成 {completedCount} / {steps.length} 步
      </div>

      {/* 视频教程推荐 */}
      <div className="card-elegant p-5">
        <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
          <Play size={14} className="text-amber-400" />
          视频教程参考
        </h3>
        <div className="space-y-2">
          {videoLinks.map((video, i) => (
            <a
              key={i}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className={`
                  px-2 py-0.5 rounded text-[10px] font-medium
                  ${video.platform === 'YouTube' ? 'bg-red-500/20 text-red-400' : ''}
                  ${video.platform === 'B站' ? 'bg-pink-500/20 text-pink-400' : ''}
                  ${video.platform === '小红书' ? 'bg-rose-500/20 text-rose-400' : ''}
                `}>
                  {video.platform}
                </span>
                <div>
                  <p className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                    {video.title}
                  </p>
                  {(video.author || video.duration) && (
                    <p className="text-[10px] text-zinc-500">
                      {video.author && <span>{video.author}</span>}
                      {video.author && video.duration && <span> · </span>}
                      {video.duration && <span>{video.duration}</span>}
                    </p>
                  )}
                </div>
              </div>
              <ExternalLink size={14} className="text-zinc-600 group-hover:text-amber-400 transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          上一步
        </button>
        <button
          onClick={() => onNext({ cookingSteps: steps })}
          className="px-6 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-400 transition-colors flex items-center gap-2"
        >
          下一步
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
