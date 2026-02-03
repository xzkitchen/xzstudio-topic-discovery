"""
菜品食材数据库
每道菜对应一个食材清单，包含名称、用量、是否常备（家里通常有的）
"""

from typing import List, Dict, TypedDict


class Ingredient(TypedDict):
    name: str
    amount: str
    is_pantry: bool  # 是否是厨房常备（洋葱、大蒜、盐等）


DISH_INGREDIENTS: Dict[str, List[Ingredient]] = {
    # === 料理鼠王 ===
    "普罗旺斯炖蔬菜": [
        {"name": "茄子", "amount": "1根", "is_pantry": False},
        {"name": "西葫芦", "amount": "1根", "is_pantry": False},
        {"name": "黄西葫芦", "amount": "1根", "is_pantry": False},
        {"name": "番茄", "amount": "3个", "is_pantry": False},
        {"name": "红椒", "amount": "1个", "is_pantry": False},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "大蒜", "amount": "4瓣", "is_pantry": True},
        {"name": "番茄膏", "amount": "2勺", "is_pantry": False},
        {"name": "百里香", "amount": "少许", "is_pantry": False},
        {"name": "橄榄油", "amount": "适量", "is_pantry": True},
    ],

    # === 布达佩斯大饭店 ===
    "Mendl's Courtesan au Chocolat": [
        {"name": "黄油", "amount": "100g", "is_pantry": True},
        {"name": "水", "amount": "200ml", "is_pantry": True},
        {"name": "中筋面粉", "amount": "120g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "4个", "is_pantry": True},
        {"name": "黑巧克力", "amount": "200g", "is_pantry": False},
        {"name": "淡奶油", "amount": "200ml", "is_pantry": False},
        {"name": "糖粉", "amount": "50g", "is_pantry": True},
        {"name": "粉色食用色素", "amount": "少许", "is_pantry": False},
    ],

    # === 低俗小说 ===
    "五美元奶昔": [
        {"name": "香草冰淇淋", "amount": "3球", "is_pantry": False},
        {"name": "牛奶", "amount": "150ml", "is_pantry": False},
        {"name": "香草精", "amount": "少许", "is_pantry": False},
        {"name": "樱桃", "amount": "1颗", "is_pantry": False},
        {"name": "生奶油", "amount": "适量", "is_pantry": False},
    ],

    # === 火影忍者 ===
    "日式豚骨拉面": [
        {"name": "拉面", "amount": "1份", "is_pantry": False},
        {"name": "猪骨汤底", "amount": "500ml", "is_pantry": False},
        {"name": "叉烧肉", "amount": "3片", "is_pantry": False},
        {"name": "溏心蛋", "amount": "1个", "is_pantry": False},
        {"name": "葱花", "amount": "适量", "is_pantry": True},
        {"name": "木耳", "amount": "少许", "is_pantry": False},
        {"name": "白芝麻", "amount": "少许", "is_pantry": True},
        {"name": "紫菜", "amount": "1片", "is_pantry": False},
    ],

    # === 教父 ===
    "教父番茄肉酱意面": [
        {"name": "意面", "amount": "200g", "is_pantry": False},
        {"name": "猪肉末", "amount": "300g", "is_pantry": False},
        {"name": "整罐番茄", "amount": "1罐", "is_pantry": False},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "大蒜", "amount": "4瓣", "is_pantry": True},
        {"name": "橄榄油", "amount": "适量", "is_pantry": True},
        {"name": "红酒", "amount": "50ml", "is_pantry": False},
        {"name": "罗勒", "amount": "少许", "is_pantry": False},
        {"name": "帕玛森芝士", "amount": "适量", "is_pantry": False},
    ],

    # === 落魄大厨 ===
    "古巴三明治": [
        {"name": "古巴面包/法棍", "amount": "1根", "is_pantry": False},
        {"name": "烤猪肉", "amount": "150g", "is_pantry": False},
        {"name": "火腿片", "amount": "4片", "is_pantry": False},
        {"name": "瑞士芝士", "amount": "2片", "is_pantry": False},
        {"name": "酸黄瓜", "amount": "适量", "is_pantry": False},
        {"name": "黄芥末", "amount": "适量", "is_pantry": True},
        {"name": "黄油", "amount": "30g", "is_pantry": True},
    ],

    # === 浓情巧克力 ===
    "玛雅辣椒热巧克力": [
        {"name": "黑巧克力", "amount": "100g", "is_pantry": False},
        {"name": "牛奶", "amount": "300ml", "is_pantry": False},
        {"name": "辣椒粉", "amount": "1/4茶匙", "is_pantry": False},
        {"name": "肉桂粉", "amount": "少许", "is_pantry": False},
        {"name": "香草精", "amount": "少许", "is_pantry": False},
        {"name": "细砂糖", "amount": "1勺", "is_pantry": True},
    ],

    # === 天使爱美丽 ===
    "法式焦糖布丁": [
        {"name": "蛋黄", "amount": "6个", "is_pantry": True},
        {"name": "淡奶油", "amount": "500ml", "is_pantry": False},
        {"name": "细砂糖", "amount": "100g", "is_pantry": True},
        {"name": "香草荚", "amount": "1根", "is_pantry": False},
    ],

    # === 绝命毒师 ===
    "南方风味炸鸡": [
        {"name": "鸡腿/鸡翅", "amount": "500g", "is_pantry": False},
        {"name": "酪乳", "amount": "300ml", "is_pantry": False},
        {"name": "中筋面粉", "amount": "200g", "is_pantry": True},
        {"name": "辣椒粉", "amount": "1勺", "is_pantry": False},
        {"name": "蒜粉", "amount": "1勺", "is_pantry": False},
        {"name": "洋葱粉", "amount": "1勺", "is_pantry": False},
        {"name": "食用油", "amount": "适量", "is_pantry": True},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "黑胡椒", "amount": "适量", "is_pantry": True},
    ],

    # === 权力的游戏 ===
    "石棺鹌鹑派": [
        {"name": "鹌鹑/鸡肉", "amount": "2只", "is_pantry": False},
        {"name": "酥皮", "amount": "2张", "is_pantry": False},
        {"name": "培根", "amount": "100g", "is_pantry": False},
        {"name": "蘑菇", "amount": "150g", "is_pantry": False},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "鸡汤", "amount": "200ml", "is_pantry": False},
        {"name": "百里香", "amount": "少许", "is_pantry": False},
        {"name": "黄油", "amount": "30g", "is_pantry": True},
        {"name": "面粉", "amount": "2勺", "is_pantry": True},
    ],

    # === 美食总动员 ===
    "法式洋葱汤": [
        {"name": "洋葱", "amount": "4个", "is_pantry": False},
        {"name": "黄油", "amount": "50g", "is_pantry": True},
        {"name": "牛肉高汤", "amount": "1升", "is_pantry": False},
        {"name": "白葡萄酒", "amount": "100ml", "is_pantry": False},
        {"name": "法棍", "amount": "4片", "is_pantry": False},
        {"name": "格鲁耶尔芝士", "amount": "100g", "is_pantry": False},
        {"name": "百里香", "amount": "少许", "is_pantry": False},
    ],

    # === 美食、祈祷和恋爱 ===
    "那不勒斯玛格丽特披萨": [
        {"name": "高筋面粉", "amount": "300g", "is_pantry": False},
        {"name": "酵母", "amount": "5g", "is_pantry": False},
        {"name": "圣玛扎诺番茄", "amount": "1罐", "is_pantry": False},
        {"name": "马苏里拉芝士", "amount": "200g", "is_pantry": False},
        {"name": "新鲜罗勒", "amount": "一把", "is_pantry": False},
        {"name": "橄榄油", "amount": "适量", "is_pantry": True},
        {"name": "盐", "amount": "适量", "is_pantry": True},
    ],

    # === 朱莉与朱莉娅 ===
    "勃艮第红酒炖牛肉": [
        {"name": "牛腩", "amount": "500g", "is_pantry": False},
        {"name": "红酒", "amount": "500ml", "is_pantry": False},
        {"name": "洋葱", "amount": "2个", "is_pantry": True},
        {"name": "胡萝卜", "amount": "2根", "is_pantry": False},
        {"name": "蘑菇", "amount": "200g", "is_pantry": False},
        {"name": "培根", "amount": "100g", "is_pantry": False},
        {"name": "番茄膏", "amount": "2勺", "is_pantry": False},
        {"name": "百里香", "amount": "少许", "is_pantry": False},
        {"name": "月桂叶", "amount": "2片", "is_pantry": False},
        {"name": "黄油", "amount": "30g", "is_pantry": True},
    ],

    # === 大餐 ===
    "Timpano（意式千层烤面）": [
        {"name": "意面", "amount": "300g", "is_pantry": False},
        {"name": "猪肉末", "amount": "200g", "is_pantry": False},
        {"name": "牛肉末", "amount": "200g", "is_pantry": False},
        {"name": "意大利香肠", "amount": "150g", "is_pantry": False},
        {"name": "马苏里拉芝士", "amount": "200g", "is_pantry": False},
        {"name": "帕玛森芝士", "amount": "100g", "is_pantry": False},
        {"name": "番茄酱", "amount": "400ml", "is_pantry": False},
        {"name": "煮鸡蛋", "amount": "4个", "is_pantry": True},
        {"name": "面团（外皮）", "amount": "500g", "is_pantry": False},
    ],

    # === 饮食男女 ===
    "红烧狮子头": [
        {"name": "猪肉糜", "amount": "500g", "is_pantry": False},
        {"name": "马蹄", "amount": "4个", "is_pantry": False},
        {"name": "大白菜", "amount": "半颗", "is_pantry": False},
        {"name": "葱", "amount": "2根", "is_pantry": True},
        {"name": "姜", "amount": "1块", "is_pantry": True},
        {"name": "料酒", "amount": "2勺", "is_pantry": True},
        {"name": "生抽", "amount": "2勺", "is_pantry": True},
        {"name": "老抽", "amount": "1勺", "is_pantry": True},
        {"name": "鸡蛋", "amount": "1个", "is_pantry": True},
        {"name": "淀粉", "amount": "适量", "is_pantry": True},
    ],

    # === 食神 ===
    "黯然销魂饭": [
        {"name": "米饭", "amount": "2碗", "is_pantry": True},
        {"name": "牛肉", "amount": "200g", "is_pantry": False},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "鸡蛋", "amount": "2个", "is_pantry": True},
        {"name": "葱", "amount": "2根", "is_pantry": True},
        {"name": "蚝油", "amount": "1勺", "is_pantry": True},
        {"name": "生抽", "amount": "1勺", "is_pantry": True},
        {"name": "糖", "amount": "少许", "is_pantry": True},
    ],

    # === 托斯卡纳艳阳下 ===
    "自制西红柿罐头意面": [
        {"name": "意面", "amount": "200g", "is_pantry": False},
        {"name": "新鲜番茄", "amount": "500g", "is_pantry": False},
        {"name": "大蒜", "amount": "4瓣", "is_pantry": True},
        {"name": "橄榄油", "amount": "适量", "is_pantry": True},
        {"name": "新鲜罗勒", "amount": "一把", "is_pantry": False},
        {"name": "帕玛森芝士", "amount": "适量", "is_pantry": False},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "黑胡椒", "amount": "适量", "is_pantry": True},
    ],

    # === 阿甘正传 ===
    "红香肠": [
        {"name": "香肠", "amount": "4根", "is_pantry": False},
        {"name": "番茄酱", "amount": "适量", "is_pantry": True},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "青椒", "amount": "1个", "is_pantry": False},
        {"name": "黄油", "amount": "适量", "is_pantry": True},
        {"name": "热狗面包", "amount": "4个", "is_pantry": False},
    ],

    # === 海鸥食堂 ===
    "芬兰肉桂卷": [
        {"name": "高筋面粉", "amount": "400g", "is_pantry": False},
        {"name": "牛奶", "amount": "200ml", "is_pantry": False},
        {"name": "黄油", "amount": "80g", "is_pantry": True},
        {"name": "糖", "amount": "80g", "is_pantry": True},
        {"name": "酵母", "amount": "7g", "is_pantry": False},
        {"name": "肉桂粉", "amount": "2勺", "is_pantry": False},
        {"name": "小豆蔻粉", "amount": "1茶匙", "is_pantry": False},
        {"name": "鸡蛋", "amount": "1个", "is_pantry": True},
    ],

    # === 百元之恋 ===
    "法式欧姆蛋": [
        {"name": "鸡蛋", "amount": "3个", "is_pantry": True},
        {"name": "黄油", "amount": "20g", "is_pantry": True},
        {"name": "盐", "amount": "少许", "is_pantry": True},
        {"name": "黑胡椒", "amount": "少许", "is_pantry": True},
        {"name": "细香葱", "amount": "少许", "is_pantry": False},
    ],

    # === 好家伙 ===
    "监狱番茄酱意面": [
        {"name": "意面", "amount": "200g", "is_pantry": False},
        {"name": "大蒜", "amount": "6瓣", "is_pantry": True},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "番茄酱", "amount": "400ml", "is_pantry": False},
        {"name": "橄榄油", "amount": "适量", "is_pantry": True},
        {"name": "牛肉片", "amount": "200g", "is_pantry": False},
        {"name": "干辣椒", "amount": "少许", "is_pantry": True},
    ],

    # === 蜘蛛侠 ===
    "纽约街头披萨": [
        {"name": "高筋面粉", "amount": "300g", "is_pantry": False},
        {"name": "酵母", "amount": "5g", "is_pantry": False},
        {"name": "番茄酱", "amount": "200ml", "is_pantry": False},
        {"name": "马苏里拉芝士", "amount": "250g", "is_pantry": False},
        {"name": "橄榄油", "amount": "适量", "is_pantry": True},
        {"name": "牛至（oregano）", "amount": "少许", "is_pantry": False},
        {"name": "盐", "amount": "适量", "is_pantry": True},
    ],

    # === 功夫熊猫 ===
    "秘制汤面": [
        {"name": "面条", "amount": "200g", "is_pantry": False},
        {"name": "高汤", "amount": "500ml", "is_pantry": False},
        {"name": "葱", "amount": "2根", "is_pantry": True},
        {"name": "姜", "amount": "几片", "is_pantry": True},
        {"name": "酱油", "amount": "适量", "is_pantry": True},
        {"name": "香油", "amount": "少许", "is_pantry": True},
        {"name": "青菜", "amount": "适量", "is_pantry": False},
    ],

    # === 僵尸新娘 ===
    "鲱鱼南瓜派": [
        {"name": "南瓜泥", "amount": "400g", "is_pantry": False},
        {"name": "派皮", "amount": "1张", "is_pantry": False},
        {"name": "淡奶油", "amount": "200ml", "is_pantry": False},
        {"name": "鸡蛋", "amount": "2个", "is_pantry": True},
        {"name": "糖", "amount": "100g", "is_pantry": True},
        {"name": "肉桂粉", "amount": "1茶匙", "is_pantry": False},
        {"name": "姜粉", "amount": "1/2茶匙", "is_pantry": False},
        {"name": "肉豆蔻", "amount": "少许", "is_pantry": False},
    ],

    # === 查理和巧克力工厂 ===
    "旺卡热巧克力": [
        {"name": "黑巧克力", "amount": "150g", "is_pantry": False},
        {"name": "牛奶", "amount": "400ml", "is_pantry": False},
        {"name": "淡奶油", "amount": "100ml", "is_pantry": False},
        {"name": "糖", "amount": "2勺", "is_pantry": True},
        {"name": "香草精", "amount": "少许", "is_pantry": False},
        {"name": "棉花糖", "amount": "适量", "is_pantry": False},
    ],

    # === 阿甘正传 ===
    "布巴虾": [
        {"name": "大虾", "amount": "500g", "is_pantry": False},
        {"name": "黄油", "amount": "50g", "is_pantry": True},
        {"name": "大蒜", "amount": "6瓣", "is_pantry": True},
        {"name": "柠檬", "amount": "1个", "is_pantry": False},
        {"name": "白葡萄酒", "amount": "100ml", "is_pantry": False},
        {"name": "欧芹", "amount": "少许", "is_pantry": False},
        {"name": "辣椒粉", "amount": "少许", "is_pantry": False},
    ],

    # === 哈利波特 ===
    "黄油啤酒": [
        {"name": "奶油苏打/姜汁汽水", "amount": "500ml", "is_pantry": False},
        {"name": "黄油", "amount": "30g", "is_pantry": True},
        {"name": "红糖", "amount": "50g", "is_pantry": True},
        {"name": "淡奶油", "amount": "100ml", "is_pantry": False},
        {"name": "香草精", "amount": "少许", "is_pantry": False},
        {"name": "肉桂粉", "amount": "少许", "is_pantry": False},
    ],

    # === 寄生虫 ===
    "韩式炸酱面": [
        {"name": "乌冬面", "amount": "200g", "is_pantry": False},
        {"name": "猪五花肉", "amount": "150g", "is_pantry": False},
        {"name": "韩式黑豆酱", "amount": "3勺", "is_pantry": False},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "西葫芦", "amount": "半根", "is_pantry": False},
        {"name": "土豆", "amount": "1个", "is_pantry": False},
        {"name": "黄瓜丝", "amount": "适量", "is_pantry": False},
    ],

    # === 请以你的名字呼唤我 ===
    "新鲜杏子/杏子果酱": [
        {"name": "新鲜杏子", "amount": "500g", "is_pantry": False},
        {"name": "糖", "amount": "250g", "is_pantry": True},
        {"name": "柠檬汁", "amount": "2勺", "is_pantry": False},
    ],

    # === 燃烧 ===
    "米其林级别烤鸡": [
        {"name": "整鸡", "amount": "1只(约1.5kg)", "is_pantry": False},
        {"name": "黄油", "amount": "100g", "is_pantry": True},
        {"name": "大蒜", "amount": "1整头", "is_pantry": True},
        {"name": "柠檬", "amount": "1个", "is_pantry": False},
        {"name": "迷迭香", "amount": "几枝", "is_pantry": False},
        {"name": "百里香", "amount": "几枝", "is_pantry": False},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "黑胡椒", "amount": "适量", "is_pantry": True},
    ],

    # === 杯酒人生 ===
    "黑皮诺葡萄酒配奶酪": [
        {"name": "黑皮诺红酒", "amount": "1瓶", "is_pantry": False},
        {"name": "布里奶酪", "amount": "150g", "is_pantry": False},
        {"name": "切达奶酪", "amount": "100g", "is_pantry": False},
        {"name": "法棍面包", "amount": "1根", "is_pantry": False},
        {"name": "葡萄", "amount": "1小串", "is_pantry": False},
        {"name": "核桃", "amount": "适量", "is_pantry": False},
    ],

    # === 寿司之神 ===
    "握寿司": [
        {"name": "寿司米", "amount": "300g", "is_pantry": False},
        {"name": "寿司醋", "amount": "50ml", "is_pantry": False},
        {"name": "三文鱼刺身", "amount": "100g", "is_pantry": False},
        {"name": "金枪鱼刺身", "amount": "100g", "is_pantry": False},
        {"name": "甜虾", "amount": "6只", "is_pantry": False},
        {"name": "芥末", "amount": "适量", "is_pantry": False},
        {"name": "酱油", "amount": "适量", "is_pantry": True},
        {"name": "姜片", "amount": "适量", "is_pantry": False},
    ],

    # === 寻梦环游记 ===
    "墨西哥玉米粽 Tamale": [
        {"name": "玉米粉（Masa）", "amount": "400g", "is_pantry": False},
        {"name": "猪油/黄油", "amount": "150g", "is_pantry": True},
        {"name": "鸡肉/猪肉", "amount": "300g", "is_pantry": False},
        {"name": "干玉米叶", "amount": "20片", "is_pantry": False},
        {"name": "辣椒酱", "amount": "200ml", "is_pantry": False},
        {"name": "鸡汤", "amount": "200ml", "is_pantry": False},
        {"name": "孜然", "amount": "1茶匙", "is_pantry": False},
    ],

    # === 番茄酱效应 ===
    "油炸绿番茄": [
        {"name": "绿番茄", "amount": "3个", "is_pantry": False},
        {"name": "玉米粉", "amount": "100g", "is_pantry": False},
        {"name": "中筋面粉", "amount": "50g", "is_pantry": True},
        {"name": "酪乳", "amount": "200ml", "is_pantry": False},
        {"name": "鸡蛋", "amount": "1个", "is_pantry": True},
        {"name": "食用油", "amount": "适量", "is_pantry": True},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "辣椒粉", "amount": "少许", "is_pantry": False},
    ],

    # === 魔女宅急便 ===
    "�的巧克力蛋糕": [
        {"name": "黑巧克力", "amount": "200g", "is_pantry": False},
        {"name": "黄油", "amount": "150g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "4个", "is_pantry": True},
        {"name": "糖", "amount": "150g", "is_pantry": True},
        {"name": "中筋面粉", "amount": "100g", "is_pantry": True},
        {"name": "可可粉", "amount": "30g", "is_pantry": False},
        {"name": "淡奶油", "amount": "200ml", "is_pantry": False},
    ],

    # === 小森林 ===
    "日式糯米团子": [
        {"name": "糯米粉", "amount": "200g", "is_pantry": False},
        {"name": "水", "amount": "适量", "is_pantry": True},
        {"name": "红豆沙", "amount": "150g", "is_pantry": False},
        {"name": "黄豆粉", "amount": "适量", "is_pantry": False},
        {"name": "抹茶粉", "amount": "少许", "is_pantry": False},
    ],

    # ============================================
    # 名店配方 Famous Recipe
    # ============================================

    # === Eleven Madison Park ===
    "慢烤胡萝卜 Roasted Carrot": [
        {"name": "彩虹胡萝卜", "amount": "500g", "is_pantry": False},
        {"name": "黄油", "amount": "50g", "is_pantry": True},
        {"name": "蜂蜜", "amount": "2勺", "is_pantry": True},
        {"name": "百里香", "amount": "3枝", "is_pantry": False},
        {"name": "橄榄油", "amount": "适量", "is_pantry": True},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "黑胡椒", "amount": "适量", "is_pantry": True},
    ],

    # === Bills Sydney ===
    "瑞可塔芝士松饼 Ricotta Hotcakes": [
        {"name": "瑞可塔芝士", "amount": "250g", "is_pantry": False},
        {"name": "牛奶", "amount": "180ml", "is_pantry": False},
        {"name": "鸡蛋", "amount": "3个", "is_pantry": True},
        {"name": "中筋面粉", "amount": "150g", "is_pantry": True},
        {"name": "泡打粉", "amount": "1茶匙", "is_pantry": True},
        {"name": "糖", "amount": "2勺", "is_pantry": True},
        {"name": "黄油", "amount": "适量", "is_pantry": True},
        {"name": "香蕉", "amount": "2根", "is_pantry": False},
        {"name": "蜂蜜", "amount": "适量", "is_pantry": True},
    ],

    # === Crumbl Cookies ===
    "粉红糖霜曲奇 Pink Sugar Cookie": [
        {"name": "黄油", "amount": "230g", "is_pantry": True},
        {"name": "糖粉", "amount": "200g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "1个", "is_pantry": True},
        {"name": "香草精", "amount": "1茶匙", "is_pantry": False},
        {"name": "中筋面粉", "amount": "350g", "is_pantry": True},
        {"name": "泡打粉", "amount": "1/2茶匙", "is_pantry": True},
        {"name": "奶油芝士", "amount": "100g", "is_pantry": False},
        {"name": "粉色食用色素", "amount": "少许", "is_pantry": False},
    ],

    # === Wingstop ===
    "柠檬胡椒鸡翅 Lemon Pepper Wings": [
        {"name": "鸡翅中", "amount": "500g", "is_pantry": False},
        {"name": "柠檬", "amount": "2个", "is_pantry": False},
        {"name": "黑胡椒粒", "amount": "2勺", "is_pantry": True},
        {"name": "大蒜粉", "amount": "1茶匙", "is_pantry": True},
        {"name": "洋葱粉", "amount": "1茶匙", "is_pantry": True},
        {"name": "黄油", "amount": "50g", "is_pantry": True},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "植物油", "amount": "适量", "is_pantry": True},
    ],

    # === Carbone ===
    "辣味通心粉 Spicy Rigatoni Vodka": [
        {"name": "通心粉", "amount": "400g", "is_pantry": False},
        {"name": "番茄膏", "amount": "3勺", "is_pantry": False},
        {"name": "淡奶油", "amount": "300ml", "is_pantry": False},
        {"name": "伏特加", "amount": "50ml", "is_pantry": False},
        {"name": "帕玛森芝士", "amount": "100g", "is_pantry": False},
        {"name": "红辣椒片", "amount": "1茶匙", "is_pantry": False},
        {"name": "大蒜", "amount": "4瓣", "is_pantry": True},
        {"name": "橄榄油", "amount": "适量", "is_pantry": True},
        {"name": "罗勒", "amount": "少许", "is_pantry": False},
    ],

    # === Levain Bakery ===
    "巧克力核桃曲奇": [
        {"name": "黄油", "amount": "230g", "is_pantry": True},
        {"name": "红糖", "amount": "200g", "is_pantry": True},
        {"name": "白糖", "amount": "100g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "2个", "is_pantry": True},
        {"name": "中筋面粉", "amount": "280g", "is_pantry": True},
        {"name": "黑巧克力块", "amount": "200g", "is_pantry": False},
        {"name": "核桃", "amount": "150g", "is_pantry": False},
        {"name": "小苏打", "amount": "1茶匙", "is_pantry": True},
        {"name": "盐", "amount": "1茶匙", "is_pantry": True},
    ],

    # === Kogi BBQ ===
    "烤牛肉塔可 Bulgogi Taco": [
        {"name": "牛肉片", "amount": "400g", "is_pantry": False},
        {"name": "玉米饼", "amount": "8片", "is_pantry": False},
        {"name": "韩式辣酱", "amount": "3勺", "is_pantry": False},
        {"name": "芝麻油", "amount": "2勺", "is_pantry": False},
        {"name": "酱油", "amount": "3勺", "is_pantry": True},
        {"name": "蒜泥", "amount": "2勺", "is_pantry": True},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "香菜", "amount": "适量", "is_pantry": False},
        {"name": "青柠", "amount": "2个", "is_pantry": False},
    ],

    # === Sweetgreen ===
    "秋收碗 Harvest Bowl": [
        {"name": "羽衣甘蓝", "amount": "200g", "is_pantry": False},
        {"name": "烤鸡胸肉", "amount": "150g", "is_pantry": False},
        {"name": "红薯", "amount": "1个", "is_pantry": False},
        {"name": "藜麦", "amount": "100g", "is_pantry": False},
        {"name": "山羊芝士", "amount": "50g", "is_pantry": False},
        {"name": "苹果", "amount": "1个", "is_pantry": False},
        {"name": "杏仁", "amount": "30g", "is_pantry": False},
        {"name": "香醋", "amount": "2勺", "is_pantry": False},
    ],

    # === Uncle Tetsu ===
    "日式轻芝士蛋糕": [
        {"name": "奶油芝士", "amount": "250g", "is_pantry": False},
        {"name": "牛奶", "amount": "100ml", "is_pantry": False},
        {"name": "黄油", "amount": "50g", "is_pantry": True},
        {"name": "蛋黄", "amount": "6个", "is_pantry": True},
        {"name": "蛋白", "amount": "6个", "is_pantry": True},
        {"name": "低筋面粉", "amount": "60g", "is_pantry": True},
        {"name": "玉米淀粉", "amount": "20g", "is_pantry": True},
        {"name": "糖", "amount": "100g", "is_pantry": True},
        {"name": "柠檬汁", "amount": "少许", "is_pantry": False},
    ],

    # === Nobu ===
    "黑鳕鱼味噌": [
        {"name": "黑鳕鱼", "amount": "400g", "is_pantry": False},
        {"name": "白味噌", "amount": "200g", "is_pantry": False},
        {"name": "味醂", "amount": "3勺", "is_pantry": False},
        {"name": "清酒", "amount": "3勺", "is_pantry": False},
        {"name": "糖", "amount": "3勺", "is_pantry": True},
        {"name": "姜", "amount": "少许", "is_pantry": True},
    ],

    # === Tokyo Banana ===
    "东京芭娜娜香蕉蛋糕": [
        {"name": "鸡蛋", "amount": "4个", "is_pantry": True},
        {"name": "糖", "amount": "100g", "is_pantry": True},
        {"name": "低筋面粉", "amount": "80g", "is_pantry": True},
        {"name": "黄油", "amount": "30g", "is_pantry": True},
        {"name": "香蕉", "amount": "3根", "is_pantry": False},
        {"name": "淡奶油", "amount": "200ml", "is_pantry": False},
        {"name": "吉利丁片", "amount": "3片", "is_pantry": False},
    ],

    # === Shiroi Koibito ===
    "白色恋人白巧克力夹心饼干": [
        {"name": "黄油", "amount": "150g", "is_pantry": True},
        {"name": "糖粉", "amount": "80g", "is_pantry": True},
        {"name": "蛋白", "amount": "2个", "is_pantry": True},
        {"name": "低筋面粉", "amount": "200g", "is_pantry": True},
        {"name": "白巧克力", "amount": "200g", "is_pantry": False},
        {"name": "淡奶油", "amount": "50ml", "is_pantry": False},
        {"name": "香草精", "amount": "少许", "is_pantry": False},
    ],

    # === LeTAO ===
    "双层芝士蛋糕 Double Fromage": [
        {"name": "奶油芝士", "amount": "300g", "is_pantry": False},
        {"name": "马斯卡彭芝士", "amount": "200g", "is_pantry": False},
        {"name": "淡奶油", "amount": "250ml", "is_pantry": False},
        {"name": "鸡蛋", "amount": "3个", "is_pantry": True},
        {"name": "糖", "amount": "80g", "is_pantry": True},
        {"name": "低筋面粉", "amount": "30g", "is_pantry": True},
        {"name": "吉利丁片", "amount": "5g", "is_pantry": False},
        {"name": "消化饼干", "amount": "100g", "is_pantry": False},
    ],

    # === PABLO ===
    "原味流心芝士挞": [
        {"name": "挞皮", "amount": "1个", "is_pantry": False},
        {"name": "奶油芝士", "amount": "250g", "is_pantry": False},
        {"name": "淡奶油", "amount": "150ml", "is_pantry": False},
        {"name": "鸡蛋", "amount": "2个", "is_pantry": True},
        {"name": "糖", "amount": "60g", "is_pantry": True},
        {"name": "玉米淀粉", "amount": "15g", "is_pantry": True},
        {"name": "柠檬汁", "amount": "1勺", "is_pantry": False},
    ],

    # === HARBS ===
    "新鲜水果千层蛋糕": [
        {"name": "低筋面粉", "amount": "100g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "3个", "is_pantry": True},
        {"name": "牛奶", "amount": "400ml", "is_pantry": False},
        {"name": "黄油", "amount": "30g", "is_pantry": True},
        {"name": "淡奶油", "amount": "400ml", "is_pantry": False},
        {"name": "糖", "amount": "60g", "is_pantry": True},
        {"name": "草莓", "amount": "200g", "is_pantry": False},
        {"name": "芒果", "amount": "1个", "is_pantry": False},
        {"name": "奇异果", "amount": "2个", "is_pantry": False},
    ],

    # === Flipper's ===
    "奇迹的舒芙蕾松饼": [
        {"name": "蛋黄", "amount": "3个", "is_pantry": True},
        {"name": "蛋白", "amount": "4个", "is_pantry": True},
        {"name": "低筋面粉", "amount": "40g", "is_pantry": True},
        {"name": "牛奶", "amount": "40ml", "is_pantry": False},
        {"name": "糖", "amount": "40g", "is_pantry": True},
        {"name": "黄油", "amount": "适量", "is_pantry": True},
        {"name": "枫糖浆", "amount": "适量", "is_pantry": False},
        {"name": "鲜奶油", "amount": "适量", "is_pantry": False},
    ],

    # === Shake Shack ===
    "ShackBurger 招牌汉堡": [
        {"name": "牛肉馅", "amount": "150g", "is_pantry": False},
        {"name": "汉堡面包", "amount": "1个", "is_pantry": False},
        {"name": "美式芝士", "amount": "2片", "is_pantry": False},
        {"name": "生菜", "amount": "2片", "is_pantry": False},
        {"name": "番茄", "amount": "2片", "is_pantry": False},
        {"name": "洋葱", "amount": "适量", "is_pantry": True},
        {"name": "ShackSauce酱", "amount": "适量", "is_pantry": False},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "黑胡椒", "amount": "适量", "is_pantry": True},
    ],

    # === In-N-Out ===
    "Animal Style 汉堡": [
        {"name": "牛肉饼", "amount": "2个", "is_pantry": False},
        {"name": "汉堡面包", "amount": "1个", "is_pantry": False},
        {"name": "美式芝士", "amount": "2片", "is_pantry": False},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "酸黄瓜", "amount": "适量", "is_pantry": False},
        {"name": "千岛酱", "amount": "适量", "is_pantry": False},
        {"name": "黄芥末", "amount": "适量", "is_pantry": True},
        {"name": "生菜", "amount": "2片", "is_pantry": False},
        {"name": "番茄", "amount": "2片", "is_pantry": False},
    ],

    # === Chipotle ===
    "烟熏辣椒蛋黄酱 Chipotle Mayo": [
        {"name": "蛋黄", "amount": "2个", "is_pantry": True},
        {"name": "植物油", "amount": "200ml", "is_pantry": True},
        {"name": "烟熏辣椒罐头", "amount": "2个", "is_pantry": False},
        {"name": "蒜泥", "amount": "1茶匙", "is_pantry": True},
        {"name": "青柠汁", "amount": "1勺", "is_pantry": False},
        {"name": "盐", "amount": "适量", "is_pantry": True},
    ],

    # === Milk Bar ===
    "谷物牛奶软冰淇淋 Cereal Milk Soft Serve": [
        {"name": "玉米片", "amount": "150g", "is_pantry": False},
        {"name": "全脂牛奶", "amount": "500ml", "is_pantry": False},
        {"name": "淡奶油", "amount": "200ml", "is_pantry": False},
        {"name": "糖", "amount": "80g", "is_pantry": True},
        {"name": "盐", "amount": "1/4茶匙", "is_pantry": True},
        {"name": "红糖", "amount": "1勺", "is_pantry": True},
    ],

    # === Lady M ===
    "原味千层蛋糕": [
        {"name": "低筋面粉", "amount": "150g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "6个", "is_pantry": True},
        {"name": "牛奶", "amount": "600ml", "is_pantry": False},
        {"name": "黄油", "amount": "60g", "is_pantry": True},
        {"name": "糖", "amount": "100g", "is_pantry": True},
        {"name": "淡奶油", "amount": "500ml", "is_pantry": False},
        {"name": "香草精", "amount": "1茶匙", "is_pantry": False},
    ],

    # === Pho 79 ===
    "什锦牛肉河粉 Pho Dac Biet": [
        {"name": "河粉", "amount": "300g", "is_pantry": False},
        {"name": "牛骨", "amount": "500g", "is_pantry": False},
        {"name": "牛腩", "amount": "200g", "is_pantry": False},
        {"name": "牛肉片", "amount": "100g", "is_pantry": False},
        {"name": "牛筋", "amount": "100g", "is_pantry": False},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "姜", "amount": "1块", "is_pantry": True},
        {"name": "八角", "amount": "3颗", "is_pantry": False},
        {"name": "鱼露", "amount": "适量", "is_pantry": False},
        {"name": "豆芽", "amount": "适量", "is_pantry": False},
        {"name": "香菜", "amount": "适量", "is_pantry": False},
        {"name": "青柠", "amount": "1个", "is_pantry": False},
    ],

    # === Magnolia Bakery ===
    "经典香蕉布丁 Banana Pudding": [
        {"name": "香蕉", "amount": "4根", "is_pantry": False},
        {"name": "香草布丁粉", "amount": "1盒", "is_pantry": False},
        {"name": "炼乳", "amount": "200g", "is_pantry": False},
        {"name": "淡奶油", "amount": "300ml", "is_pantry": False},
        {"name": "香草威化饼干", "amount": "1盒", "is_pantry": False},
    ],

    # === Portillo's ===
    "意大利牛肉三明治 Italian Beef Dipped": [
        {"name": "牛肩肉", "amount": "500g", "is_pantry": False},
        {"name": "法式面包", "amount": "2根", "is_pantry": False},
        {"name": "青椒", "amount": "2个", "is_pantry": False},
        {"name": "牛肉汤", "amount": "500ml", "is_pantry": False},
        {"name": "意大利调味料", "amount": "2勺", "is_pantry": False},
        {"name": "大蒜", "amount": "4瓣", "is_pantry": True},
        {"name": "黑胡椒", "amount": "适量", "is_pantry": True},
    ],

    # === Prince Street Pizza ===
    "奶奶方形披萨 Grandma Slice": [
        {"name": "高筋面粉", "amount": "300g", "is_pantry": True},
        {"name": "酵母", "amount": "5g", "is_pantry": True},
        {"name": "橄榄油", "amount": "3勺", "is_pantry": True},
        {"name": "番茄酱", "amount": "200g", "is_pantry": False},
        {"name": "马苏里拉芝士", "amount": "300g", "is_pantry": False},
        {"name": "帕玛森芝士", "amount": "50g", "is_pantry": False},
        {"name": "罗勒", "amount": "少许", "is_pantry": False},
        {"name": "盐", "amount": "适量", "is_pantry": True},
    ],

    # === Cremia ===
    "北海道牛奶软冰淇淋": [
        {"name": "北海道牛奶", "amount": "400ml", "is_pantry": False},
        {"name": "淡奶油", "amount": "200ml", "is_pantry": False},
        {"name": "糖", "amount": "80g", "is_pantry": True},
        {"name": "蛋黄", "amount": "3个", "is_pantry": True},
        {"name": "香草荚", "amount": "1/2根", "is_pantry": False},
    ],

    # === Blue Bottle ===
    "新奥尔良冰咖啡 New Orleans Iced Coffee": [
        {"name": "深烘咖啡豆", "amount": "50g", "is_pantry": False},
        {"name": "菊苣根粉", "amount": "1勺", "is_pantry": False},
        {"name": "牛奶", "amount": "200ml", "is_pantry": False},
        {"name": "糖浆", "amount": "适量", "is_pantry": True},
        {"name": "冰块", "amount": "适量", "is_pantry": True},
    ],

    # === Russ & Daughters ===
    "烟熏三文鱼百吉饼 Lox & Bagel": [
        {"name": "百吉饼", "amount": "1个", "is_pantry": False},
        {"name": "烟熏三文鱼", "amount": "80g", "is_pantry": False},
        {"name": "奶油芝士", "amount": "50g", "is_pantry": False},
        {"name": "刺山柑", "amount": "1勺", "is_pantry": False},
        {"name": "红洋葱", "amount": "2片", "is_pantry": True},
        {"name": "番茄", "amount": "2片", "is_pantry": False},
    ],

    # === Wendy's ===
    "经典巧克力Frosty": [
        {"name": "香草冰淇淋", "amount": "300g", "is_pantry": False},
        {"name": "牛奶", "amount": "150ml", "is_pantry": False},
        {"name": "可可粉", "amount": "2勺", "is_pantry": False},
        {"name": "麦芽粉", "amount": "1勺", "is_pantry": False},
        {"name": "糖", "amount": "2勺", "is_pantry": True},
    ],

    # === Lawry's ===
    "现切黄金牛肋排 Carved Prime Rib": [
        {"name": "牛肋排", "amount": "2kg", "is_pantry": False},
        {"name": "岩盐", "amount": "3勺", "is_pantry": True},
        {"name": "黑胡椒", "amount": "2勺", "is_pantry": True},
        {"name": "蒜粉", "amount": "1勺", "is_pantry": True},
        {"name": "迷迭香", "amount": "3枝", "is_pantry": False},
        {"name": "黄油", "amount": "50g", "is_pantry": True},
        {"name": "辣根酱", "amount": "适量", "is_pantry": False},
    ],

    # ============================================
    # 考古美食 Archaeological
    # ============================================

    # === 清教徒感恩节 ===
    "清教徒式野鸭配玉米布丁": [
        {"name": "鸭肉", "amount": "1只", "is_pantry": False},
        {"name": "玉米粉", "amount": "200g", "is_pantry": False},
        {"name": "牛奶", "amount": "300ml", "is_pantry": False},
        {"name": "鸡蛋", "amount": "2个", "is_pantry": True},
        {"name": "黄油", "amount": "50g", "is_pantry": True},
        {"name": "糖", "amount": "2勺", "is_pantry": True},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "百里香", "amount": "少许", "is_pantry": False},
    ],

    # === 凡尔赛冰淇淋 ===
    "凡尔赛香草冰淇淋": [
        {"name": "淡奶油", "amount": "400ml", "is_pantry": False},
        {"name": "牛奶", "amount": "200ml", "is_pantry": False},
        {"name": "蛋黄", "amount": "6个", "is_pantry": True},
        {"name": "糖", "amount": "150g", "is_pantry": True},
        {"name": "香草荚", "amount": "1根", "is_pantry": False},
    ],

    "凡尔赛玫瑰冰淇淋": [
        {"name": "淡奶油", "amount": "400ml", "is_pantry": False},
        {"name": "牛奶", "amount": "200ml", "is_pantry": False},
        {"name": "蛋黄", "amount": "6个", "is_pantry": True},
        {"name": "糖", "amount": "150g", "is_pantry": True},
        {"name": "玫瑰水", "amount": "2勺", "is_pantry": False},
        {"name": "食用玫瑰花瓣", "amount": "少许", "is_pantry": False},
    ],

    # === 古罗马 Apicius ===
    "古罗马梨子蛋饼 Patina de Piris": [
        {"name": "梨", "amount": "4个", "is_pantry": False},
        {"name": "鸡蛋", "amount": "6个", "is_pantry": True},
        {"name": "蜂蜜", "amount": "3勺", "is_pantry": True},
        {"name": "黑胡椒", "amount": "1/2茶匙", "is_pantry": True},
        {"name": "孜然", "amount": "1/4茶匙", "is_pantry": False},
        {"name": "橄榄油", "amount": "适量", "is_pantry": True},
    ],

    "古罗马蜜枣 Dulcia Domestica": [
        {"name": "椰枣", "amount": "20颗", "is_pantry": False},
        {"name": "核桃", "amount": "50g", "is_pantry": False},
        {"name": "松子", "amount": "30g", "is_pantry": False},
        {"name": "蜂蜜", "amount": "3勺", "is_pantry": True},
        {"name": "盐", "amount": "少许", "is_pantry": True},
        {"name": "黑胡椒", "amount": "少许", "is_pantry": True},
    ],

    "古罗马蜂蜜蛋糕 Libum": [
        {"name": "瑞可塔芝士", "amount": "250g", "is_pantry": False},
        {"name": "中筋面粉", "amount": "100g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "1个", "is_pantry": True},
        {"name": "蜂蜜", "amount": "适量", "is_pantry": True},
        {"name": "月桂叶", "amount": "数片", "is_pantry": False},
    ],

    # === 中世纪 ===
    "中世纪苹果泥 Apple Muse": [
        {"name": "苹果", "amount": "4个", "is_pantry": False},
        {"name": "杏仁", "amount": "100g", "is_pantry": False},
        {"name": "水", "amount": "300ml", "is_pantry": True},
        {"name": "蜂蜜", "amount": "2勺", "is_pantry": True},
        {"name": "面包屑", "amount": "适量", "is_pantry": True},
        {"name": "肉桂", "amount": "少许", "is_pantry": False},
    ],

    "中世纪蜂蜜香料糕": [
        {"name": "蜂蜜", "amount": "200g", "is_pantry": True},
        {"name": "面包屑", "amount": "200g", "is_pantry": True},
        {"name": "姜粉", "amount": "1茶匙", "is_pantry": False},
        {"name": "肉桂", "amount": "1/2茶匙", "is_pantry": False},
        {"name": "黑胡椒", "amount": "1/4茶匙", "is_pantry": True},
        {"name": "藏红花", "amount": "少许", "is_pantry": False},
    ],

    "蜂蜜无花果炸挞 Tourteletes in Fryture": [
        {"name": "无花果干", "amount": "200g", "is_pantry": False},
        {"name": "中筋面粉", "amount": "200g", "is_pantry": True},
        {"name": "黄油", "amount": "100g", "is_pantry": True},
        {"name": "蜂蜜", "amount": "3勺", "is_pantry": True},
        {"name": "姜粉", "amount": "1/2茶匙", "is_pantry": False},
        {"name": "肉桂", "amount": "1/2茶匙", "is_pantry": False},
        {"name": "植物油", "amount": "适量", "is_pantry": True},
    ],

    "中世纪藏红花蛋奶挞 Medieval Custard Tart": [
        {"name": "挞皮", "amount": "1个", "is_pantry": False},
        {"name": "淡奶油", "amount": "300ml", "is_pantry": False},
        {"name": "蛋黄", "amount": "4个", "is_pantry": True},
        {"name": "糖", "amount": "50g", "is_pantry": True},
        {"name": "藏红花", "amount": "少许", "is_pantry": False},
        {"name": "无花果干", "amount": "50g", "is_pantry": False},
        {"name": "葡萄干", "amount": "30g", "is_pantry": False},
    ],

    # === 都铎王朝 ===
    "伊丽莎白一世姜饼人 Gingerbread Man": [
        {"name": "中筋面粉", "amount": "350g", "is_pantry": True},
        {"name": "黄油", "amount": "125g", "is_pantry": True},
        {"name": "红糖", "amount": "175g", "is_pantry": True},
        {"name": "糖浆", "amount": "4勺", "is_pantry": True},
        {"name": "鸡蛋", "amount": "1个", "is_pantry": True},
        {"name": "姜粉", "amount": "2茶匙", "is_pantry": False},
        {"name": "肉桂", "amount": "1茶匙", "is_pantry": False},
        {"name": "小苏打", "amount": "1茶匙", "is_pantry": True},
    ],

    "都铎杏仁糖膏 Marchpane": [
        {"name": "杏仁粉", "amount": "250g", "is_pantry": False},
        {"name": "糖粉", "amount": "250g", "is_pantry": True},
        {"name": "蛋白", "amount": "1个", "is_pantry": True},
        {"name": "玫瑰水", "amount": "1勺", "is_pantry": False},
        {"name": "食用金箔", "amount": "少许", "is_pantry": False},
    ],

    "巴克韦尔塔 Bakewell Tart": [
        {"name": "挞皮", "amount": "1个", "is_pantry": False},
        {"name": "覆盆子果酱", "amount": "3勺", "is_pantry": False},
        {"name": "黄油", "amount": "125g", "is_pantry": True},
        {"name": "糖", "amount": "125g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "2个", "is_pantry": True},
        {"name": "杏仁粉", "amount": "125g", "is_pantry": False},
        {"name": "杏仁精", "amount": "少许", "is_pantry": False},
        {"name": "糖霜", "amount": "适量", "is_pantry": True},
        {"name": "樱桃", "amount": "1颗", "is_pantry": False},
    ],

    # === 伊丽莎白时代 ===
    "伊丽莎白式玫瑰蛋奶塔": [
        {"name": "挞皮", "amount": "1个", "is_pantry": False},
        {"name": "淡奶油", "amount": "300ml", "is_pantry": False},
        {"name": "蛋黄", "amount": "4个", "is_pantry": True},
        {"name": "糖", "amount": "60g", "is_pantry": True},
        {"name": "玫瑰水", "amount": "2勺", "is_pantry": False},
        {"name": "肉豆蔻", "amount": "少许", "is_pantry": False},
    ],

    # === 美国历史 ===
    "美国大选蛋糕 Election Cake": [
        {"name": "中筋面粉", "amount": "400g", "is_pantry": True},
        {"name": "黄油", "amount": "150g", "is_pantry": True},
        {"name": "糖", "amount": "200g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "3个", "is_pantry": True},
        {"name": "酵母", "amount": "7g", "is_pantry": True},
        {"name": "牛奶", "amount": "200ml", "is_pantry": False},
        {"name": "葡萄干", "amount": "150g", "is_pantry": False},
        {"name": "肉桂", "amount": "1茶匙", "is_pantry": False},
        {"name": "肉豆蔻", "amount": "1/2茶匙", "is_pantry": False},
    ],

    "新英格兰选举蛋糕": [
        {"name": "中筋面粉", "amount": "400g", "is_pantry": True},
        {"name": "黄油", "amount": "150g", "is_pantry": True},
        {"name": "糖", "amount": "200g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "3个", "is_pantry": True},
        {"name": "酵母", "amount": "7g", "is_pantry": True},
        {"name": "牛奶", "amount": "200ml", "is_pantry": False},
        {"name": "葡萄干", "amount": "150g", "is_pantry": False},
        {"name": "雪莉酒", "amount": "2勺", "is_pantry": False},
    ],

    # === 维多利亚时代 Mrs Crocombe ===
    "维多利亚姜饼蛋糕 Gingerbread": [
        {"name": "中筋面粉", "amount": "300g", "is_pantry": True},
        {"name": "黄油", "amount": "150g", "is_pantry": True},
        {"name": "红糖", "amount": "150g", "is_pantry": True},
        {"name": "糖浆", "amount": "200g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "2个", "is_pantry": True},
        {"name": "牛奶", "amount": "150ml", "is_pantry": False},
        {"name": "姜粉", "amount": "2茶匙", "is_pantry": False},
        {"name": "肉桂", "amount": "1茶匙", "is_pantry": False},
        {"name": "小苏打", "amount": "1茶匙", "is_pantry": True},
    ],

    "维多利亚苹果蛋糕 Gâteau de Pommes": [
        {"name": "苹果", "amount": "4个", "is_pantry": False},
        {"name": "黄油", "amount": "150g", "is_pantry": True},
        {"name": "糖", "amount": "150g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "3个", "is_pantry": True},
        {"name": "中筋面粉", "amount": "200g", "is_pantry": True},
        {"name": "泡打粉", "amount": "1茶匙", "is_pantry": True},
        {"name": "柠檬", "amount": "1个", "is_pantry": False},
        {"name": "杏仁片", "amount": "50g", "is_pantry": False},
    ],

    "维多利亚黄瓜冰淇淋 Cucumber Ice Cream": [
        {"name": "黄瓜", "amount": "2根", "is_pantry": False},
        {"name": "淡奶油", "amount": "400ml", "is_pantry": False},
        {"name": "牛奶", "amount": "200ml", "is_pantry": False},
        {"name": "蛋黄", "amount": "4个", "is_pantry": True},
        {"name": "糖", "amount": "150g", "is_pantry": True},
        {"name": "柠檬汁", "amount": "1勺", "is_pantry": False},
    ],

    "维多利亚彩色果冻塔": [
        {"name": "吉利丁片", "amount": "10片", "is_pantry": False},
        {"name": "糖", "amount": "150g", "is_pantry": True},
        {"name": "水", "amount": "600ml", "is_pantry": True},
        {"name": "柠檬汁", "amount": "2勺", "is_pantry": False},
        {"name": "食用色素", "amount": "多种", "is_pantry": False},
        {"name": "水果", "amount": "适量", "is_pantry": False},
    ],

    # === 爱德华时代 ===
    "仙女蛋糕 Fairy Cakes": [
        {"name": "黄油", "amount": "125g", "is_pantry": True},
        {"name": "糖", "amount": "125g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "2个", "is_pantry": True},
        {"name": "自发粉", "amount": "125g", "is_pantry": True},
        {"name": "牛奶", "amount": "2勺", "is_pantry": False},
        {"name": "香草精", "amount": "1茶匙", "is_pantry": False},
        {"name": "糖粉", "amount": "200g", "is_pantry": True},
        {"name": "食用色素", "amount": "少许", "is_pantry": False},
    ],

    "苏格兰邓迪蛋糕 Dundee Cake": [
        {"name": "黄油", "amount": "175g", "is_pantry": True},
        {"name": "红糖", "amount": "175g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "3个", "is_pantry": True},
        {"name": "中筋面粉", "amount": "225g", "is_pantry": True},
        {"name": "杏仁粉", "amount": "50g", "is_pantry": False},
        {"name": "混合果干", "amount": "350g", "is_pantry": False},
        {"name": "橘子酱", "amount": "2勺", "is_pantry": False},
        {"name": "杏仁片", "amount": "50g", "is_pantry": False},
        {"name": "威士忌", "amount": "2勺", "is_pantry": False},
    ],

    # === 歌德时代 ===
    "歌德家族英式布丁配覆盆子酱": [
        {"name": "面包", "amount": "200g", "is_pantry": True},
        {"name": "牛奶", "amount": "400ml", "is_pantry": False},
        {"name": "鸡蛋", "amount": "3个", "is_pantry": True},
        {"name": "糖", "amount": "100g", "is_pantry": True},
        {"name": "黄油", "amount": "50g", "is_pantry": True},
        {"name": "葡萄干", "amount": "100g", "is_pantry": False},
        {"name": "覆盆子", "amount": "200g", "is_pantry": False},
        {"name": "肉桂", "amount": "少许", "is_pantry": False},
    ],

    "歌德家族蒸布丁": [
        {"name": "中筋面粉", "amount": "175g", "is_pantry": True},
        {"name": "牛油", "amount": "175g", "is_pantry": True},
        {"name": "面包屑", "amount": "175g", "is_pantry": True},
        {"name": "糖", "amount": "175g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "3个", "is_pantry": True},
        {"name": "葡萄干", "amount": "150g", "is_pantry": False},
        {"name": "糖浆", "amount": "3勺", "is_pantry": True},
    ],

    # === 古希腊 ===
    "古希腊式蜂蜜芝士饼 Plakous": [
        {"name": "瑞可塔芝士", "amount": "500g", "is_pantry": False},
        {"name": "蜂蜜", "amount": "150g", "is_pantry": True},
        {"name": "中筋面粉", "amount": "100g", "is_pantry": True},
        {"name": "鸡蛋", "amount": "2个", "is_pantry": True},
        {"name": "芝麻", "amount": "适量", "is_pantry": False},
    ],

    # === 古埃及 ===
    "古埃及式发酵扁面包": [
        {"name": "全麦面粉", "amount": "300g", "is_pantry": True},
        {"name": "水", "amount": "200ml", "is_pantry": True},
        {"name": "酵母", "amount": "5g", "is_pantry": True},
        {"name": "盐", "amount": "1茶匙", "is_pantry": True},
        {"name": "橄榄油", "amount": "适量", "is_pantry": True},
    ],

    # === 庞贝 ===
    "庞贝式八分圆面包": [
        {"name": "高筋面粉", "amount": "500g", "is_pantry": True},
        {"name": "水", "amount": "300ml", "is_pantry": True},
        {"name": "酵母", "amount": "7g", "is_pantry": True},
        {"name": "盐", "amount": "10g", "is_pantry": True},
        {"name": "橄榄油", "amount": "2勺", "is_pantry": True},
    ],

    # === 文艺复兴 ===
    "文艺复兴藏红花烩饭": [
        {"name": "意大利米", "amount": "300g", "is_pantry": False},
        {"name": "鸡汤", "amount": "1L", "is_pantry": False},
        {"name": "白葡萄酒", "amount": "100ml", "is_pantry": False},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "黄油", "amount": "50g", "is_pantry": True},
        {"name": "帕玛森芝士", "amount": "80g", "is_pantry": False},
        {"name": "藏红花", "amount": "少许", "is_pantry": False},
    ],

    # === 日本江户 ===
    "江户式大握寿司": [
        {"name": "寿司米", "amount": "300g", "is_pantry": False},
        {"name": "米醋", "amount": "3勺", "is_pantry": False},
        {"name": "糖", "amount": "2勺", "is_pantry": True},
        {"name": "盐", "amount": "1茶匙", "is_pantry": True},
        {"name": "新鲜金枪鱼", "amount": "150g", "is_pantry": False},
        {"name": "新鲜三文鱼", "amount": "150g", "is_pantry": False},
        {"name": "芥末", "amount": "适量", "is_pantry": False},
        {"name": "酱油", "amount": "适量", "is_pantry": True},
    ],

    # === 苏格兰传统 ===
    "传统苏格兰Haggis": [
        {"name": "羊杂（心、肝、肺）", "amount": "500g", "is_pantry": False},
        {"name": "燕麦", "amount": "200g", "is_pantry": False},
        {"name": "洋葱", "amount": "2个", "is_pantry": True},
        {"name": "牛油", "amount": "100g", "is_pantry": True},
        {"name": "肉汤", "amount": "200ml", "is_pantry": False},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "黑胡椒", "amount": "适量", "is_pantry": True},
        {"name": "肉豆蔻", "amount": "少许", "is_pantry": False},
    ],

    # === 二战时期 ===
    "二战式煎午餐肉配蛋": [
        {"name": "午餐肉", "amount": "1罐", "is_pantry": False},
        {"name": "鸡蛋", "amount": "2个", "is_pantry": True},
        {"name": "黄油", "amount": "适量", "is_pantry": True},
        {"name": "黑胡椒", "amount": "适量", "is_pantry": True},
        {"name": "吐司", "amount": "2片", "is_pantry": True},
    ],

    # === 维京时代 ===
    "维京式血肠 Blodpølse": [
        {"name": "猪血", "amount": "500ml", "is_pantry": False},
        {"name": "燕麦", "amount": "200g", "is_pantry": False},
        {"name": "猪油", "amount": "100g", "is_pantry": False},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "黑胡椒", "amount": "适量", "is_pantry": True},
        {"name": "肠衣", "amount": "适量", "is_pantry": False},
    ],

    # ============================================
    # 补充缺失的食材配置
    # ============================================

    # === 日剧美食 ===
    "一人烤肉定食": [
        {"name": "牛五花", "amount": "200g", "is_pantry": False},
        {"name": "牛舌", "amount": "100g", "is_pantry": False},
        {"name": "米饭", "amount": "1碗", "is_pantry": True},
        {"name": "味噌汤", "amount": "1碗", "is_pantry": False},
        {"name": "生菜", "amount": "几片", "is_pantry": False},
        {"name": "烤肉酱", "amount": "适量", "is_pantry": False},
        {"name": "芝麻", "amount": "少许", "is_pantry": True},
        {"name": "蒜片", "amount": "少许", "is_pantry": True},
    ],

    "法式鹅肝配无花果": [
        {"name": "鹅肝", "amount": "200g", "is_pantry": False},
        {"name": "新鲜无花果", "amount": "4个", "is_pantry": False},
        {"name": "波特酒", "amount": "100ml", "is_pantry": False},
        {"name": "黄油", "amount": "30g", "is_pantry": True},
        {"name": "蜂蜜", "amount": "1勺", "is_pantry": True},
        {"name": "盐之花", "amount": "少许", "is_pantry": True},
        {"name": "黑胡椒", "amount": "少许", "is_pantry": True},
        {"name": "法棍片", "amount": "4片", "is_pantry": False},
    ],

    "港式云吞面": [
        {"name": "云吞皮", "amount": "20张", "is_pantry": False},
        {"name": "虾仁", "amount": "200g", "is_pantry": False},
        {"name": "猪肉糜", "amount": "150g", "is_pantry": False},
        {"name": "竹升面", "amount": "200g", "is_pantry": False},
        {"name": "高汤", "amount": "500ml", "is_pantry": False},
        {"name": "葱", "amount": "2根", "is_pantry": True},
        {"name": "姜", "amount": "少许", "is_pantry": True},
        {"name": "胡椒粉", "amount": "少许", "is_pantry": True},
        {"name": "香油", "amount": "少许", "is_pantry": True},
    ],

    "自酿青梅酒": [
        {"name": "青梅", "amount": "1kg", "is_pantry": False},
        {"name": "冰糖", "amount": "500g", "is_pantry": True},
        {"name": "白酒/烧酒", "amount": "1.8L", "is_pantry": False},
    ],

    "日式炸鸡块 唐揚げ": [
        {"name": "鸡腿肉", "amount": "500g", "is_pantry": False},
        {"name": "酱油", "amount": "3勺", "is_pantry": True},
        {"name": "料酒", "amount": "2勺", "is_pantry": True},
        {"name": "姜泥", "amount": "1勺", "is_pantry": True},
        {"name": "蒜泥", "amount": "1勺", "is_pantry": True},
        {"name": "太白粉", "amount": "适量", "is_pantry": True},
        {"name": "植物油", "amount": "适量", "is_pantry": True},
        {"name": "柠檬", "amount": "1个", "is_pantry": False},
    ],

    "日式蛋包饭 オムライス": [
        {"name": "米饭", "amount": "2碗", "is_pantry": True},
        {"name": "鸡蛋", "amount": "4个", "is_pantry": True},
        {"name": "鸡肉丁", "amount": "100g", "is_pantry": False},
        {"name": "洋葱", "amount": "半个", "is_pantry": True},
        {"name": "番茄酱", "amount": "3勺", "is_pantry": True},
        {"name": "黄油", "amount": "30g", "is_pantry": True},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "胡椒粉", "amount": "少许", "is_pantry": True},
    ],

    "相扑火锅 ちゃんこ鍋": [
        {"name": "鸡腿肉", "amount": "300g", "is_pantry": False},
        {"name": "豆腐", "amount": "1块", "is_pantry": False},
        {"name": "大白菜", "amount": "300g", "is_pantry": False},
        {"name": "胡萝卜", "amount": "1根", "is_pantry": False},
        {"name": "香菇", "amount": "6朵", "is_pantry": False},
        {"name": "葱", "amount": "2根", "is_pantry": True},
        {"name": "鸡汤", "amount": "1L", "is_pantry": False},
        {"name": "酱油", "amount": "3勺", "is_pantry": True},
        {"name": "味醂", "amount": "2勺", "is_pantry": False},
    ],

    "关东煮 おでん": [
        {"name": "萝卜", "amount": "半根", "is_pantry": False},
        {"name": "魔芋丝", "amount": "1块", "is_pantry": False},
        {"name": "鱼豆腐", "amount": "6个", "is_pantry": False},
        {"name": "竹轮", "amount": "4根", "is_pantry": False},
        {"name": "水煮蛋", "amount": "4个", "is_pantry": True},
        {"name": "昆布", "amount": "1片", "is_pantry": False},
        {"name": "柴鱼片", "amount": "30g", "is_pantry": False},
        {"name": "酱油", "amount": "3勺", "is_pantry": True},
        {"name": "味醂", "amount": "2勺", "is_pantry": False},
    ],

    "叉烧刈包 Pork Buns": [
        {"name": "五花肉", "amount": "500g", "is_pantry": False},
        {"name": "中筋面粉", "amount": "300g", "is_pantry": True},
        {"name": "酵母", "amount": "5g", "is_pantry": True},
        {"name": "酱油", "amount": "4勺", "is_pantry": True},
        {"name": "冰糖", "amount": "50g", "is_pantry": True},
        {"name": "花生粉", "amount": "适量", "is_pantry": False},
        {"name": "香菜", "amount": "适量", "is_pantry": False},
        {"name": "酸菜", "amount": "适量", "is_pantry": False},
    ],

    "马伦戈炖鸡 Chicken Marengo": [
        {"name": "整鸡", "amount": "1只", "is_pantry": False},
        {"name": "番茄", "amount": "4个", "is_pantry": False},
        {"name": "蘑菇", "amount": "200g", "is_pantry": False},
        {"name": "大虾", "amount": "8只", "is_pantry": False},
        {"name": "鸡蛋", "amount": "4个", "is_pantry": True},
        {"name": "白葡萄酒", "amount": "200ml", "is_pantry": False},
        {"name": "橄榄油", "amount": "适量", "is_pantry": True},
        {"name": "大蒜", "amount": "6瓣", "is_pantry": True},
        {"name": "百里香", "amount": "少许", "is_pantry": False},
    ],

    "泰坦尼克式羊排配薄荷酱": [
        {"name": "羊排", "amount": "8根", "is_pantry": False},
        {"name": "新鲜薄荷", "amount": "一大把", "is_pantry": False},
        {"name": "白醋", "amount": "3勺", "is_pantry": True},
        {"name": "糖", "amount": "2勺", "is_pantry": True},
        {"name": "黄油", "amount": "30g", "is_pantry": True},
        {"name": "迷迭香", "amount": "2枝", "is_pantry": False},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "黑胡椒", "amount": "适量", "is_pantry": True},
    ],

    "内战硬饼干 Hardtack": [
        {"name": "中筋面粉", "amount": "500g", "is_pantry": True},
        {"name": "水", "amount": "200ml", "is_pantry": True},
        {"name": "盐", "amount": "1茶匙", "is_pantry": True},
    ],

    "唐代胡饼（月饼前身）": [
        {"name": "中筋面粉", "amount": "300g", "is_pantry": True},
        {"name": "猪油", "amount": "80g", "is_pantry": True},
        {"name": "芝麻", "amount": "50g", "is_pantry": False},
        {"name": "核桃", "amount": "50g", "is_pantry": False},
        {"name": "蜂蜜", "amount": "2勺", "is_pantry": True},
        {"name": "糖", "amount": "30g", "is_pantry": True},
    ],

    "大革命时期平民黑面包": [
        {"name": "黑麦面粉", "amount": "400g", "is_pantry": False},
        {"name": "全麦面粉", "amount": "100g", "is_pantry": True},
        {"name": "酵母", "amount": "7g", "is_pantry": True},
        {"name": "盐", "amount": "10g", "is_pantry": True},
        {"name": "水", "amount": "350ml", "is_pantry": True},
    ],

    "1950s蔬菜果冻沙拉": [
        {"name": "吉利丁片", "amount": "6片", "is_pantry": False},
        {"name": "番茄汁", "amount": "400ml", "is_pantry": False},
        {"name": "芹菜", "amount": "2根", "is_pantry": False},
        {"name": "青椒", "amount": "1个", "is_pantry": False},
        {"name": "橄榄", "amount": "10颗", "is_pantry": False},
        {"name": "柠檬汁", "amount": "2勺", "is_pantry": False},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "蛋黄酱", "amount": "适量", "is_pantry": False},
    ],

    "红香肠（章鱼切法）": [
        {"name": "红色香肠", "amount": "4根", "is_pantry": False},
        {"name": "食用油", "amount": "少许", "is_pantry": True},
        {"name": "番茄酱", "amount": "适量", "is_pantry": True},
    ],
}


def get_ingredients(dish_name: str) -> List[Ingredient]:
    """
    根据菜品名称获取食材清单
    支持精确匹配和模糊匹配
    """
    # 精确匹配
    if dish_name in DISH_INGREDIENTS:
        return DISH_INGREDIENTS[dish_name]

    # 模糊匹配
    for dish, ingredients in DISH_INGREDIENTS.items():
        if dish_name in dish or dish in dish_name:
            return ingredients

    # 返回通用默认食材
    return [
        {"name": "主食材", "amount": "适量", "is_pantry": False},
        {"name": "洋葱", "amount": "1个", "is_pantry": True},
        {"name": "大蒜", "amount": "3瓣", "is_pantry": True},
        {"name": "橄榄油", "amount": "适量", "is_pantry": True},
        {"name": "盐", "amount": "适量", "is_pantry": True},
        {"name": "黑胡椒", "amount": "适量", "is_pantry": True},
    ]
