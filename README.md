# YouTube 熱門影片追蹤系統 - 版本更新日誌

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://script.google.com/)
[![YouTube Data API](https://img.shields.io/badge/YouTube%20Data%20API-FF0000?logo=youtube&logoColor=white)](https://developers.google.com/youtube/v3)

## 📋 專案簡介

這是一個基於 Google Apps Script 的 YouTube 影片搜尋和追蹤系統，採用 **Linus Torvalds 的設計哲學** 進行重構，實現：

- 🔍 **智能搜尋**：支援多地區、hashtag 提取的 YouTube 影片搜尋
- 📊 **自動追蹤**：每日自動抓取並追蹤影片觀看次數變化
- 🌐 **Web API**：提供 RESTful API 供第三方應用程式使用
- 🏷️ **Hashtag 分析**：自動提取和追蹤影片 hashtag 趨勢

---

## 📈 版本更新歷史

### 🚀 v2.0.0 - Linus 式重構版本 (2025-09-16)

**重大架構改進 - 採用 Linus Torvalds 設計哲學**

> *"Bad programmers worry about the code. Good programmers worry about data structures."* - Linus Torvalds

#### ✨ 新功能
- **🏷️ Hashtag 提取系統**：自動從影片標題和描述中提取 hashtag
- **🎯 智能搜尋邏輯**：空 query 時使用地區配置作為備用搜尋詞
- **📊 Google Sheet 整合**：新增 hashtags 欄位到追蹤表格
- **🔍 測試系統**：完整的空 query 行為測試函數

#### 🛠️ 架構優化
- **單一職責原則**：每個函數都有明確的單一職責
- **數據結構優先**：重新設計資料結構，消除特殊情況
- **統一錯誤處理**：標準化的錯誤處理和回應格式
- **配置驅動**：地區配置改為數據驅動，易於擴展

#### 🧹 代碼品質提升
- **消除巢狀縮進**：所有函數控制在 3 層縮進以內
- **移除重複代碼**：統一的參數處理和 API 調用邏輯
- **向後兼容**：保持所有舊版 API 介面不變

#### 📋 詳細變更記錄

**核心系統改進：**
- 重構 `normalizeParams()` 函數，統一參數處理邏輯
- 優化 `searchVideos()` 函數，改進搜尋效率
- 新增 `extractHashtags()` 函數，支援中英文 hashtag 提取
- 改進 `getVideoDetails()` 函數，加入完整描述和標籤

**Google Sheet 追蹤系統：**
- COLUMNS 常量新增 `hashtags` 欄位
- `getExistingData()` 函數支援 hashtags 資料讀取
- `updateExistingRecord()` 和 `addNewRecord()` 函數支援 hashtags 寫入
- Hashtags 以逗號分隔字串格式儲存：`#ai,#music,#shorts`

**測試和工具函數：**
- 新增 `testEmptyQuery()` 函數，驗證各種空 query 情況
- 保持所有舊版測試函數的向後兼容
- 完整的錯誤處理和日誌記錄

**設計哲學實踐：**
```javascript
// Linus 式設計原則的具體實現
const REGIONS = {
  'TW': { name: '台灣', query: '台灣 OR 繁體 OR 中文', lang: 'zh-Hant' }
};
// 數據驅動，不是硬編碼 if/else
```

---

### 📚 v1.0.0 - 原始版本

**基礎功能實現**

#### 核心功能
- YouTube Data API v3 整合
- 多地區搜尋支援 (US, IN, TW)
- Google Sheets 自動追蹤
- Web API 介面 (`doGet` 函數)

#### 特色
- 每日自動觸發器設定
- 觀看次數歷史追蹤
- 過期記錄清理機制
- 基本的關鍵字過濾

#### 限制
- 代碼結構較複雜，維護困難
- 缺乏統一的錯誤處理
- 沒有 hashtag 分析功能
- 搜尋邏輯不夠智能

---

## 🔄 版本差異對比

### 主要差異表

| 功能項目 | v1.0.0 (原版) | v2.0.0 (重構版) |
|---------|---------------|----------------|
| **代碼架構** | 🟡 混亂 | ✅ Linus 式設計 |
| **函數職責** | 🔴 多重職責 | ✅ 單一職責 |
| **資料結構** | 🟡 普通 | ✅ 優化設計 |
| **錯誤處理** | 🔴 不統一 | ✅ 統一標準 |
| **測試系統** | 🔴 基本 | ✅ 完整測試 |
| **Hashtag 支援** | ❌ 無 | ✅ 完整支援 |
| **智能搜尋** | ❌ 無 | ✅ 地區救場 |
| **Google Sheet** | 🟡 11 欄位 | ✅ 12 欄位 + hashtags |
| **向後兼容** | N/A | ✅ 完全兼容 |

### API 回應格式比較

**v1.0.0 回應格式：**
```javascript
{
  videoId: "abc123",
  title: "影片標題",
  viewCount: 12345,
  url: "https://www.youtube.com/watch?v=abc123",
  thumbnails: {...}
}
```

**v2.0.0 新增欄位：**
```javascript
{
  // ... 原有欄位保持不變
  tags: ["ai", "music", "generated"],           // 創作者標籤
  description: "完整影片描述 #ai #music...",      // 完整描述
  hashtags: ["#ai", "#music", "#shorts"]        // 提取的 hashtag
}
```

### Google Sheet 結構變化

**v1.0.0 工作表欄位：**
```
videoId | title | channelTitle | publishedAt | region | type |
firstSeen | lastSeen | isTracking | url | viewHistory
```

**v2.0.0 新增欄位：**
```
videoId | title | channelTitle | publishedAt | region | type |
firstSeen | lastSeen | isTracking | url | viewHistory | hashtags
```

---

## 🚀 升級指南

### 從 v1.0.0 升級到 v2.0.0

**步驟 1：備份現有資料**
- 備份你的 Google Sheets 追蹤資料
- 記錄現有的觸發器設定

**步驟 2：部署新版代碼**
- 將 `ai_youtube_webapp.gs` 替換為重構版內容
- 新版會自動處理 Google Sheet 欄位擴展

**步驟 3：驗證功能**
- 執行 `testEmptyQuery()` 測試新功能
- 執行 `checkSystemStatus()` 確認系統狀態
- 測試 hashtag 提取是否正常工作

**步驟 4：享受新功能**
- 開始使用 hashtag 分析功能
- 體驗更穩定的搜尋系統

### ⚠️ 重要提醒

- **向後兼容**：所有舊版 API 呼叫都能正常工作
- **資料安全**：現有追蹤資料會保持完整
- **無停機升級**：可以直接替換代碼，無需停止服務

---

## 🛠️ 開發文檔

### 相關文件
- **[📋 API 調用控管文件 (todo-list.md)](./todo-list.md)** - 技術實現細節和優化計劃
- **[📖 新手完整教學 (beginner.md)](./beginner.md)** - 從零開始的完整教學
- **[🔧 進階開發指南 (develop.md)](./develop.md)** - 深度技術文檔

### 技術支援
- 查看 `todo-list.md` 了解最新的 API 調用流程
- 參考代碼中的 Linus 式註解了解設計思路
- 使用內建的測試函數驗證功能

---

## 📞 維護信息

**當前版本：** v2.0.0 - Linus 式重構版本
**最後更新：** 2025-09-16
**維護狀態：** 🟢 積極維護
**技術債務：** 🟢 極低

### 設計哲學

本專案遵循 **Linus Torvalds 的軟體設計哲學**：

1. **"Good taste"** - 消除特殊情況，讓代碼簡潔優雅
2. **"Never break userspace"** - 向後兼容是鐵律
3. **實用主義** - 解決實際問題，不追求理論完美
4. **簡潔執念** - 控制複雜度，函數單一職責

> *"If you need more than 3 levels of indentation, you're screwed."* - Linus Torvalds

---

## 📄 授權

本專案採用 MIT 授權條款

## 🤝 貢獻

歡迎提交改進建議！請遵循 Linus 式的設計哲學：
- 數據結構優先於算法優化
- 消除特殊情況勝過增加條件分支
- 保持函數的單一職責
- 永遠不破壞向後兼容性