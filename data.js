/**
 * 餐廳與菜單資料（首頁、restaurant.html 共用）
 */
(function () {
  /** 本機菜單縮圖；若要每杯獨照可放到 images/food/menu/ 並在 item() 直接寫路徑 */
  const MENU_IMG = {
    milkTea: "images/food/bubble-tea.jpg",
    boba: "images/food/bubble-tea.jpg",
    icedTea: "images/food/bubble-tea.jpg",
    fruit: "images/food/bubble-tea.jpg",
    smoothie: "images/food/bubble-tea.jpg",
    cheese: "images/food/bubble-tea.jpg",
    matcha: "images/food/bubble-tea.jpg",
    coffee: "images/food/coffee.jpg",
    latte: "images/food/coffee.jpg",
    tea: "images/food/bubble-tea.jpg",
    topping: "images/food/cake.jpg",
  };

  function item(id, name, price, category, description, image) {
    return { id, name, price, category, description, image };
  }

  /** 僅珍珠奶茶品類示範 — 巷口手搖完整資料 */
  const alleyBubbleTea = {
    id: "alley-bubble-tea",
    image: "images/food/bubble-tea.jpg",
    name: "巷口手搖",
    meta: "15–25 分鐘 · 4.9",
    tag: "第二杯半價",
    categories: ["珍珠奶茶"],
    intro:
      "巷口手搖在這條街開了八年，堅持茶湯每日現泡、珍珠兩小時內煮完。我們用台灣產茶葉與紐西蘭鮮奶，甜度與冰量都可客製。外送同樣附保冷袋，讓你在家也能喝到店裡同款風味。",
    ratingSummary: { score: "4.9", reviewCount: 328, breakdown: "口味 4.9 · 包裝 4.8 · 準時 4.9" },
    reviews: [
      {
        author: "阿琳",
        rating: 5,
        date: "2025/03",
        text: "珍珠很 Q，半糖去冰剛剛好，每週五都會點！",
      },
      {
        author: "Jason L.",
        rating: 5,
        date: "2025/02",
        text: "奶蓋烏龍鹹甜平衡，外送來奶蓋還是分層的，推。",
      },
      {
        author: "小米",
        rating: 4,
        date: "2025/02",
        text: "水果茶料很多，略甜了一點點，下次改微糖。",
      },
      {
        author: "Chen_88",
        rating: 5,
        date: "2025/01",
        text: "黑糖波霸鮮奶濃郁，孩子也很愛，會再回購。",
      },
      {
        author: "週末吃貨",
        rating: 4,
        date: "2024/12",
        text: "出餐快，袋子沒漏過；希望多一點無糖茶選擇。",
      },
    ],
    menuCategories: [
      { id: "all", label: "全部" },
      { id: "signature", label: "招牌奶茶" },
      { id: "fruit", label: "水果．氣泡" },
      { id: "cheese", label: "奶蓋．芝士" },
      { id: "coffee", label: "咖啡拿鐵" },
      { id: "tea", label: "純茶" },
      { id: "extra", label: "加料" },
    ],
    menu: [
      item("boba-pearl-lg", "珍珠奶茶（大）", 45, "signature", "阿薩姆紅茶與鮮奶黃金比例，手炒黑糖珍珠 Q 彈有嚼勁。", MENU_IMG.boba),
      item("boba-pearl-md", "珍珠奶茶（中）", 38, "signature", "同款配方中杯份量，下午茶剛剛好。", MENU_IMG.boba),
      item("boba-brown-sugar", "黑糖波霸鮮奶", 55, "signature", "溫熱黑糖淋在鮮奶上，波霸大顆飽滿、香氣濃郁。", MENU_IMG.milkTea),
      item("boba-taro", "芋頭鮮奶", 52, "signature", "綿密芋泥與鮮奶融合，可吃到真實芋頭顆粒。", MENU_IMG.smoothie),
      item("boba-pudding", "布丁奶茶", 48, "signature", "滑嫩雞蛋布丁搭配奶茶，一口茶一口布丁。", MENU_IMG.milkTea),
      item("boba-oat", "燕麥奶茶", 50, "signature", "燕麥粒增加口感與飽足感，微穀香不搶茶味。", MENU_IMG.icedTea),
      item("boba-coconut", "椰果奶茶", 46, "signature", "清爽椰果條配經典奶茶，嚼感輕盈。", MENU_IMG.fruit),
      item("boba-redbean", "紅豆奶茶", 49, "signature", "蜜紅豆甜而不膩，與奶茶溫潤順口。", MENU_IMG.milkTea),
      item("fruit-grapefruit", "葡萄柚青茶", 52, "fruit", "新鮮葡萄柚果粒與青茶，微苦回甘、超解膩。", MENU_IMG.fruit),
      item("fruit-wintermelon", "檸檬冬瓜露", 42, "fruit", "古早冬瓜茶香，檸檬提味，清爽低負擔。", MENU_IMG.icedTea),
      item("fruit-passion", "百香綠茶", 48, "fruit", "百香果籽咬感十足，搭茉莉綠茶酸甜開胃。", MENU_IMG.fruit),
      item("fruit-mango", "芒果冰沙", 58, "fruit", "當季芒果打成冰沙，濃郁果香像甜點。", MENU_IMG.smoothie),
      item("fruit-lychee", "荔枝氣泡飲", 55, "fruit", "荔枝果香配上細緻氣泡，夏天必點。", MENU_IMG.fruit),
      item("fruit-strawberry", "草莓優格冰沙", 62, "fruit", "草莓與優格打成綿密冰沙，微酸微甜。", MENU_IMG.smoothie),
      item("fruit-kumquat", "金桔檸檬", 44, "fruit", "金桔與檸檬雙重柑橘香，去油解膩首選。", MENU_IMG.icedTea),
      item("cheese-oolong", "奶蓋烏龍", 55, "cheese", "鹹香芝士奶蓋覆蓋高山烏龍，先喝奶蓋再攪匀。", MENU_IMG.cheese),
      item("cheese-four", "芝士四季春", 52, "cheese", "四季春茶清香，奶蓋厚實綿密。", MENU_IMG.cheese),
      item("cheese-black", "奶蓋紅茶", 50, "cheese", "經典紅茶底，奶蓋鹹甜與茶湯平衡。", MENU_IMG.cheese),
      item("cheese-matcha-macchiato", "瑪奇朵抹茶", 58, "cheese", "日本抹茶微苦，上層奶蓋與鮮奶拉花層次分明。", MENU_IMG.matcha),
      item("cheese-jasmine", "奶蓋茉莉綠茶", 51, "cheese", "茉莉花香細緻，奶蓋襯托茶韻。", MENU_IMG.cheese),
      item("coffee-tea-latte", "紅茶拿鐵", 48, "coffee", "錫蘭紅茶與鮮奶蒸奶泡，無咖啡因過重感。", MENU_IMG.latte),
      item("coffee-matcha-latte", "抹茶拿鐵", 52, "coffee", "抹茶與鮮奶完美融合，表面可選微奶泡。", MENU_IMG.matcha),
      item("coffee-americano", "美式咖啡", 40, "coffee", "中深焙豆現萃，清爽不刮胃。", MENU_IMG.coffee),
      item("coffee-caramel", "焦糖拿鐵", 55, "coffee", "自熬焦糖醬與濃縮、鮮奶，甜香溫暖。", MENU_IMG.latte),
      item("coffee-hojicha", "焙茶拿鐵", 53, "coffee", "焙茶焙香明顯，低澀感、尾韻甘醇。", MENU_IMG.latte),
      item("tea-coldbrew", "冷泡青茶", 35, "tea", "低溫慢萃 8 小時，茶胺酸甜感明顯、不苦。", MENU_IMG.tea),
      item("tea-alpine", "高山青茶", 32, "tea", "高山茶區茶青，花香與果香並存。", MENU_IMG.tea),
      item("tea-roast-oolong", "重焙烏龍", 36, "tea", "炭焙香氣濃厚，適合喜歡厚實茶感的人。", MENU_IMG.tea),
      item("tea-jasmine", "茉莉花茶", 30, "tea", "茉莉薰香綠茶，淡雅順口。", MENU_IMG.icedTea),
      item("tea-black", "古早味紅茶", 28, "tea", "傳統紅茶甜度可調，冰熱皆宜。", MENU_IMG.icedTea),
      item("extra-boba", "加波霸", 15, "extra", "多一份手工波霸，建議搭配無料飲品。", MENU_IMG.topping),
      item("extra-pearl", "加珍珠", 15, "extra", "小顆珍珠口感更細緻，可加進任一奶茶。", MENU_IMG.topping),
      item("extra-cheese-cap", "加奶蓋", 20, "extra", "鹹芝士奶蓋淋頂，讓純茶瞬間升級。", MENU_IMG.cheese),
      item("extra-pudding", "加布丁", 18, "extra", "一整顆滑嫩布丁，與奶茶、拿鐵都搭。", MENU_IMG.topping),
      item("extra-coconut", "加椰果", 12, "extra", "條狀椰果增加清爽嚼感。", MENU_IMG.topping),
      item("extra-ice-cream", "加冰淇淋", 25, "extra", "香草冰淇淋一球，倒入紅茶變漂浮飲。", MENU_IMG.topping),
    ],
  };

  const dealPool = [alleyBubbleTea];

  function getRestaurantById(id) {
    if (!id) return null;
    return dealPool.find((r) => r.id === id) ?? null;
  }

  window.DELIVERY_DATA = {
    dealPool,
    getRestaurantById,
  };
})();
