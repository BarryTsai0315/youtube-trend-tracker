# YouTube 熱門影片追蹤系統

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://script.google.com/)
[![YouTube Data API](https://img.shields.io/badge/YouTube%20Data%20API-FF0000?logo=youtube&logoColor=white)](https://developers.google.com/youtube/v3)

## 📋 專案簡介

這是一個基於 Google Apps Script 的 YouTube 影片搜尋和追蹤系統，採用 **Linus Torvalds 的設計哲學** 重構，實現完整的影片趨勢分析：

- 🏆 **智能排名系統**：依地區和類型分開排名，追蹤每日變化
- 📊 **完整趨勢分析**：觀看數、按讚數、留言數歷史追蹤
- 🎬 **智能分類**：基於實際長度判斷 Shorts（≤60秒）vs 一般影片
- 🌐 **多地區追蹤**：美國、印度、台灣三個地區同步追蹤
- 🚀 **新手友好**：一鍵初始化，自動設置所有功能
- 🔍 **Web API**：提供 RESTful API 供第三方應用程式使用

---

## 🚀 立即開始

### 🌟 新手一鍵設置

如果您是第一次使用，只需要執行一個函數：

1. 在 Google Apps Script 中找到 `setupSystem()` 函數
2. 點擊執行按鈕 ▶️
3. 等待完成，系統會自動：
   - ✅ 創建 Google Sheet（16 欄位結構）
   - ✅ 設置每日自動追蹤（早上 6:00）
   - ✅ 測試 YouTube API 連接
   - ✅ 提供 Google Sheet 直接連結

### 📊 立即收集數據

想要馬上看到數據？執行 `dailyYouTubeTracking()` 函數開始收集：

- 🇺🇸 美國熱門影片 & Shorts 前 20 名
- 🇮🇳 印度熱門影片 & Shorts 前 20 名
- 🇹🇼 台灣熱門影片 & Shorts 前 20 名

---

## 📈 版本更新歷史

### 🎯 v3.0.0 - 趨勢分析完整版 (2025-09-16)

**🏆 重大功能升級 - 完整趨勢分析系統**

> *"數據結構決定一切，好的設計消除所有特殊情況"* - Linus Torvalds 哲學實踐

#### ✨ 全新功能

- **🥇 排名系統**：每個地區和類型獨立排名（美國影片第1名、台灣Shorts第5名）
- **📈 趨勢分析**：按讚數、留言數、觀看數完整歷史追蹤
- **⏱️ 智能長度判斷**：自動解析影片長度，精確分類 Shorts（≤60秒）
- **🎬 真正的 Shorts**：基於實際時長而非不可靠的 hashtag 判斷
- **🚀 新手友好設計**：`setupSystem()` 一鍵完成所有設置

#### 🛠️ 系統改進

- **數據豐富化**：從 12 欄擴展為 16 欄，新增排名、長度等關鍵數據
- **代碼精簡**：刪除無用測試函數，從 1000+ 行精簡為 ~800 行
- **常量管理**：系統參數統一管理，易於調整
- **邏輯修正**：修正 Shorts 判斷邏輯，一般影片不再被錯誤排除

#### 📊 數據結構升級

**新的 Google Sheet 結構（16 欄）：**

```
1. rank              - 排名（依地區類型分開）
2. videoId           - YouTube 影片 ID
3. title             - 影片標題
4. channelTitle      - 頻道名稱
5. publishedAt       - 發佈時間
6. region            - 地區（US/IN/TW）
7. type              - 類型（videos/shorts）
8. firstSeen         - 首次發現日期
9. lastSeen          - 最後更新日期
10. isTracking       - 是否持續追蹤
11. url              - YouTube 連結
12. viewHistory      - 觀看數歷史："123,456,789"
13. hashtags         - 提取的 hashtag
14. likeHistory      - 按讚數歷史："67,68,70"
15. commentHistory   - 留言數歷史："8,9,10"
16. durationSeconds  - 影片長度（秒數）
```

#### 🎯 智能分類邏輯

```javascript
// 新的分類邏輯 - 更精確
if (wantShorts) {
  // Shorts: 只保留 ≤60 秒的影片
  return video.durationSeconds <= 60;
} else {
  // 一般影片: 保留所有長度，不限制
  return true;
}
```

---

### 🚀 v2.0.0 - Linus 式重構版本 (2025-09-16)

**重大架構改進 - 採用 Linus Torvalds 設計哲學**

#### ✨ 核心功能

- **🏷️ Hashtag 提取系統**：自動從影片標題和描述中提取 hashtag
- **🎯 智能搜尋邏輯**：空 query 時使用地區配置作為備用搜尋詞
- **📊 Google Sheet 整合**：統一的數據結構和追蹤系統
- **🔍 完整測試系統**：驗證各種邊界情況

#### 🛠️ 架構優化

- **單一職責原則**：每個函數都有明確的單一職責
- **數據結構優先**：重新設計資料結構，消除特殊情況
- **統一錯誤處理**：標準化的錯誤處理和回應格式
- **配置驅動**：地區配置改為數據驅動，易於擴展

---

### 📚 v1.0.0 - 原始版本

**基礎功能實現**
- YouTube Data API v3 整合
- 多地區搜尋支援
- 基本的 Google Sheets 追蹤
- 簡單的 Web API 介面

---

## 🔄 版本功能比較

| 功能項目               | v1.0.0    | v2.0.0        | v3.0.0 ⭐    |
| ---------------------- | --------- | ------------- | ------------- |
| **排名系統**     | ❌        | ❌            | ✅ 智能排名   |
| **趨勢分析**     | 🟡 基本   | 🟡 部分       | ✅ 完整       |
| **Shorts 判斷**  | ❌ 無     | 🔴 hashtag    | ✅ 實際長度   |
| **數據欄位**     | 11 欄     | 12 欄         | 16 欄         |
| **新手友好**     | 🔴 複雜   | 🟡 普通       | ✅ 一鍵設置   |
| **代碼品質**     | 🔴 混亂   | 🟡 改善       | ✅ 精簡優雅   |
| **智能分類**     | ❌        | 🟡 部分       | ✅ 完整       |
| **向後兼容**     | N/A       | ✅            | ✅            |

---

## 📊 系統規格

### 當前追蹤參數

- **地區範圍**: 美國 🇺🇸、印度 🇮🇳、台灣 🇹🇼
- **搜尋天數**: 5 天（可調整 `DAILY_SEARCH_DAYS`）
- **排名數量**: 每個地區類型前 20 名（可調整 `RANKING_LIMIT`）
- **Shorts 定義**: ≤ 60 秒（可調整 `SHORTS_DURATION_LIMIT`）
- **更新頻率**: 每天早上 6:00 自動執行

### API 配額使用

- **每日調用**: 12 次 API 調用（3地區 × 2類型 × 2步驟）
- **配額消耗**: ~12 單位/天（YouTube 免費額度 10,000 單位）
- **使用率**: 0.12%，非常節約

---

## 🛠️ 開發文檔

### 📋 相關文件

- **[📊 開發進度 (todo-list.md)](./todo-list.md)** - 系統規格和 API 調用流程
- **[📖 新手教學 (beginner.md)](./beginner.md)** - 完整的設置教學
- **[🔧 開發指南 (develop.md)](./develop.md)** - 深度技術文檔

### 🎯 核心函數

**新手必備的兩個函數：**

1. **`setupSystem()`** - 🚀 一鍵初始化整個系統
2. **`dailyYouTubeTracking()`** - 📊 執行數據收集和更新

**其他管理函數：**

- `checkSystemStatus()` - 檢查系統狀態
- `setupDailyTrigger()` - 設置自動觸發器
- `removeDailyTrigger()` - 移除自動觸發器

---

## ⚙️ 系統參數調整

想要調整系統行為？修改頂部的全域常量：

```javascript
// 可調整的系統參數
const DAILY_SEARCH_DAYS = 5;        // 搜尋過去幾天
const API_MAX_RESULTS = 50;         // API 查詢數量
const RANKING_LIMIT = 20;           // 保留排名數量
const SHORTS_DURATION_LIMIT = 60;   // Shorts 長度閾值（秒）
```

---

## 🎯 使用場景

### 📈 數據分析師
- 追蹤不同地區的影片趨勢
- 分析 Shorts vs 一般影片的表現
- 研究按讚率和留言率變化

### 🎬 內容創作者
- 了解各地區熱門內容類型
- 分析成功影片的長度分布
- 追蹤 hashtag 趨勢

### 📊 市場研究
- 跨地區內容偏好分析
- 影片互動模式研究
- 趨勢預測和分析

---

## 📞 維護信息

**當前版本：** v3.0.0 - 趨勢分析完整版
**最後更新：** 2025-09-16
**維護狀態：** 🟢 積極維護
**代碼品質：** 🟢 優秀（精簡 + 功能完整）

### 設計哲學

本專案遵循 **Linus Torvalds 的軟體設計哲學**：

1. **"Good taste"** - 消除特殊情況，讓代碼簡潔優雅
2. **"Never break userspace"** - 向後兼容是鐵律
3. **實用主義** - 解決實際問題，不追求理論完美
4. **數據結構決定一切** - 好的數據設計勝過複雜算法

> *"如果你需要超過 3 層縮進，你就已經完蛋了"* - Linus Torvalds

---

## 📄 授權

本專案採用 MIT 授權條款

## 🤝 貢獻

歡迎提交改進建議！請遵循 Linus 式的設計哲學：

- 數據結構優先於算法優化
- 消除特殊情況勝過增加條件分支
- 保持函數的單一職責
- 永遠不破壞向後兼容性