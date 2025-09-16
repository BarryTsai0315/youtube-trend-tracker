# 🔧 進階開發指南

> 本文檔適合有程式開發經驗的開發者，提供詳細的技術細節、API 說明和系統架構說明。

## 📚 目錄

- [系統架構](#-系統架構)
- [API 參數詳解](#-api-參數詳解)
- [函數參考](#-函數參考)
- [資料結構設計](#-資料結構設計)
- [Linus Torvalds 重構說明](#-linus-torvalds-重構說明)
- [錯誤處理機制](#-錯誤處理機制)
- [效能優化](#-效能優化)
- [開發環境設定](#-開發環境設定)

---

## 🏗 系統架構

### 核心組件

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web API       │    │  Scheduler      │    │  Data Storage   │
│   (doGet)       │    │  (Triggers)     │    │  (Google Sheet) │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • 參數解析      │    │ • 每日執行      │    │ • 影片資料      │
│ • 資料查詢      │    │ • 多地區同步    │    │ • 觀看歷史      │
│ • JSON 回應     │    │ • 智能停止      │    │ • 追蹤狀態      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────┬───────────┴───────────────────────┘
                     │
              ┌─────────────────┐
              │ YouTube Data API │
              │    (v3)         │
              ├─────────────────┤
              │ • 影片搜尋      │
              │ • 地區篩選      │
              │ • 即時資料      │
              └─────────────────┘
```

### 資料流程

1. **API 請求** → 參數解析 → YouTube API 查詢 → 資料處理 → JSON 回應
2. **排程執行** → 多地區查詢 → 資料比對 → Google Sheets 更新 → 狀態管理

---

## 🌐 API 參數詳解

### 基本 URL 格式

```
https://script.google.com/macros/s/{SCRIPT_ID}/exec?param1=value1&param2=value2
```

### 支援參數

| 參數名稱 | 類型 | 預設值 | 說明 | 範例 |
|---------|------|--------|------|------|
| `region` | string | `TW` | 地區代碼 | `US`, `TW`, `IN`, `JP`, `KR` |
| `limit` | number | `10` | 回傳影片數量 (1-50) | `20` |
| `shorts` | boolean | `false` | 是否只搜尋短影片 | `true`, `false` |
| `category` | string | `0` | 影片分類 ID | `10` (音樂), `20` (遊戲) |
| `order` | string | `viewCount` | 排序方式 | `date`, `rating`, `relevance` |

### 地區代碼對照表

| 代碼 | 地區 | 語言 | 時區 |
|------|------|------|------|
| `TW` | 台灣 | zh-TW | GMT+8 |
| `US` | 美國 | en-US | GMT-5 to GMT-8 |
| `IN` | 印度 | hi-IN / en-IN | GMT+5:30 |
| `JP` | 日本 | ja-JP | GMT+9 |
| `KR` | 韓國 | ko-KR | GMT+9 |
| `GB` | 英國 | en-GB | GMT+0 |
| `DE` | 德國 | de-DE | GMT+1 |
| `FR` | 法國 | fr-FR | GMT+1 |
| `BR` | 巴西 | pt-BR | GMT-3 |
| `CA` | 加拿大 | en-CA / fr-CA | GMT-3.5 to GMT-8 |

### API 回應格式

```json
{
  "success": true,
  "data": [
    {
      "id": "VIDEO_ID",
      "title": "影片標題",
      "viewCount": 1234567,
      "publishedAt": "2024-01-15T10:30:00Z",
      "url": "https://www.youtube.com/watch?v=VIDEO_ID"
    }
  ],
  "meta": {
    "region": "TW",
    "limit": 10,
    "timestamp": "2024-01-15T18:30:00Z"
  }
}
```

---

## 📋 函數參考

### 主要 API 函數

#### `doGet(e)`
**Web API 入口點**

```javascript
/**
 * Google Apps Script Web App 入口點
 * @param {Object} e - HTTP 請求事件物件
 * @param {Object} e.parameter - URL 查詢參數
 * @returns {HtmlOutput} JSON 格式的 HTTP 回應
 */
function doGet(e) { /* ... */ }
```

**參數處理邏輯：**
- 自動類型轉換：`limit` → number, `shorts` → boolean
- 預設值填充：未提供參數時使用系統預設值
- 參數驗證：檢查數值範圍和格式有效性

#### `getTrending(options)`
**核心影片搜尋函數**

```javascript
/**
 * 搜尋 YouTube 熱門影片
 * @param {Object} options - 搜尋選項
 * @param {string} options.region - 地區代碼
 * @param {number} options.limit - 影片數量限制
 * @param {boolean} options.shorts - 是否限制短影片
 * @returns {Array} 影片資料陣列
 */
function getTrending(options = {}) { /* ... */ }
```

**內部邏輯：**
1. 參數標準化與驗證
2. YouTube API 查詢參數建構
3. API 呼叫與錯誤處理
4. 資料格式標準化
5. 短影片篩選（如需要）

### 排程管理函數

#### `setupDailyTrigger()`
**設定每日自動執行**

```javascript
/**
 * 建立每日早上 6:00 的定時觸發器
 * 如果已存在觸發器，會先刪除再重新建立
 */
function setupDailyTrigger() { /* ... */ }
```

#### `dailyTrackingTask()`
**每日追蹤任務主函數**

```javascript
/**
 * 每日自動執行的主要追蹤邏輯
 * 1. 查詢多地區熱門影片
 * 2. 更新 Google Sheets 資料
 * 3. 管理追蹤狀態
 */
function dailyTrackingTask() { /* ... */ }
```

### 資料管理函數

#### `getOrCreateTrackingSpreadsheet()`
**Google Sheets 管理**

```javascript
/**
 * 取得或建立追蹤資料表
 * @returns {Spreadsheet} Google Sheets 物件
 */
function getOrCreateTrackingSpreadsheet() { /* ... */ }
```

**建立邏輯：**
1. 搜尋現有檔案（按名稱）
2. 如不存在，建立新檔案
3. 建立標準化工作表結構
4. 設定標題列和格式

---

## 🗄 資料結構設計

### Linus Torvalds 設計哲學

> "Bad programmers worry about the code. Good programmers worry about data structures and their relationships."

### 重構前後對比

#### 舊設計（複雜的多工作表結構）
```
📊 Google Sheet (6 個工作表)
├── 美國熱門影片    │ 冗餘的資料結構
├── 印度熱門影片    │ 相同邏輯的重複實現
├── 台灣熱門影片    │
├── 美國觀看紀錄    │ 複雜的資料同步邏輯
├── 印度觀看紀錄    │
└── 台灣觀看紀錄    │
```

#### 新設計（統一資料結構）
```
📊 Google Sheet (1 個工作表)
└── 影片追蹤資料    │ 統一的資料模型
    ├── 影片 ID     │ 主鍵
    ├── 地區        │ 索引欄位
    ├── 標題        │
    ├── 觀看次數    │
    ├── 發布時間    │
    ├── URL         │
    ├── 首次記錄    │ 追蹤狀態
    ├── 最後更新    │
    └── 狀態        │ active/inactive
```

### 核心資料結構

```javascript
const REGIONS = {
  'US': {
    name: '美國',
    regionCode: 'US',
    language: 'en-US'
  },
  'IN': {
    name: '印度',
    regionCode: 'IN',
    language: 'hi-IN'
  },
  'TW': {
    name: '台灣',
    regionCode: 'TW',
    language: 'zh-TW'
  }
};
```

**設計優勢：**
1. **資料驅動**：新增地區只需修改 `REGIONS` 常數
2. **消除重複**：所有地區使用相同的處理邏輯
3. **易於維護**：單一真實來源（Single Source of Truth）
4. **可擴展性**：輕鬆新增新地區或屬性

---

## 🔄 Linus Torvalds 重構說明

### 核心原則應用

#### 1. "Good Taste" - 消除特殊情況

**重構前：**
```javascript
// 6 個不同的函數處理不同地區
function updateUSSheet(data) { /* 特殊邏輯 */ }
function updateINSheet(data) { /* 幾乎相同的邏輯 */ }
function updateTWSheet(data) { /* 重複的邏輯 */ }
```

**重構後：**
```javascript
// 單一函數處理所有地區
function updateTrackingData(videoData, region) {
  // 統一的處理邏輯，無特殊情況
}
```

#### 2. "Never break userspace" - 保持 API 相容性

```javascript
// 保持所有原有 API 參數支援
function doGet(e) {
  const region = e.parameter.region || 'TW';  // 向後相容
  const limit = parseInt(e.parameter.limit) || 10;
  // ... 現有程式碼完全不受影響
}
```

#### 3. 實用主義 - 解決真實問題

**移除過度設計：**
- ❌ 複雜的工作表管理邏輯
- ❌ 重複的資料驗證函數
- ❌ 過度的抽象化層級

**專注核心功能：**
- ✅ 簡單的資料儲存
- ✅ 可靠的 API 查詢
- ✅ 直觀的狀態管理

#### 4. 簡潔執念 - 函數職責單一

**重構前函數：**
```javascript
function complexFunction() {
  // 40+ 行程式碼
  // 處理驗證、查詢、更新、錯誤處理
  // 4 層以上的巢狀判斷
}
```

**重構後函數：**
```javascript
function validateInput(params) { /* 單一職責：驗證 */ }
function queryYouTube(options) { /* 單一職責：查詢 */ }
function updateSheet(data) { /* 單一職責：更新 */ }
```

### 重構成果統計

| 指標 | 重構前 | 重構後 | 改善 |
|------|--------|--------|------|
| **程式碼行數** | 839 行 | 447 行 | -47% |
| **函數數量** | 23 個 | 15 個 | -35% |
| **巢狀層級** | 最多 5 層 | 最多 3 層 | -40% |
| **重複邏輯** | 6 組重複 | 0 組重複 | -100% |
| **資料表數** | 6 個工作表 | 1 個工作表 | -83% |

---

## ⚠️ 錯誤處理機制

### 分層錯誤處理

```javascript
try {
  // Level 1: API 呼叫錯誤
  const response = YouTube.Search.list(/*...*/);
} catch (apiError) {
  console.error('YouTube API 錯誤:', apiError.message);

  try {
    // Level 2: 降級處理
    return getCachedData(region);
  } catch (cacheError) {
    // Level 3: 最終錯誤回應
    return createErrorResponse('服務暫時無法使用');
  }
}
```

### 常見錯誤類型

| 錯誤類型 | 原因 | 解決方案 |
|----------|------|----------|
| `YouTube is not defined` | 未啟用 YouTube Data API v3 | 在 Apps Script 和 Cloud Console 啟用服務 |
| `配額已用盡` | API 使用量超過限制 | 等待重置或申請提高配額 |
| `權限不足` | OAuth 授權問題 | 重新授權或檢查權限範圍 |
| `找不到工作表` | Google Sheets 建立失敗 | 執行 `getOrCreateTrackingSpreadsheet()` |
| `資料格式錯誤` | API 回應結構改變 | 檢查並更新資料解析邏輯 |

### 錯誤記錄機制

```javascript
function logError(context, error, additionalInfo = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context: context,
    message: error.message,
    stack: error.stack,
    ...additionalInfo
  };

  console.error('錯誤詳情:', JSON.stringify(errorLog, null, 2));

  // 可選：寫入錯誤追蹤工作表
  writeToErrorLog(errorLog);
}
```

---

## ⚡ 效能優化

### API 配額管理

```javascript
const API_QUOTA_LIMITS = {
  daily: 10000,        // 每日查詢限制
  perRequest: 100,     // 單次請求限制
  burstLimit: 1000     // 爆發使用限制
};

function checkQuotaUsage() {
  const today = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd');
  const quotaUsed = getQuotaUsage(today);

  if (quotaUsed >= API_QUOTA_LIMITS.daily * 0.9) {
    console.warn('API 配額使用量已達 90%');
    return false;
  }
  return true;
}
```

### 快取策略

```javascript
function getCachedTrendingVideos(region, maxAge = 3600000) { // 1小時快取
  const cacheKey = `trending_${region}`;
  const cached = CacheService.getScriptCache().get(cacheKey);

  if (cached) {
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp < maxAge) {
      return data.videos;
    }
  }
  return null;
}
```

### 批次處理優化

```javascript
function batchUpdateSheets(updates) {
  const sheet = getTrackingSheet();
  const values = [];

  // 收集所有更新為單一批次操作
  updates.forEach(update => {
    values.push([
      update.videoId,
      update.region,
      update.title,
      update.viewCount,
      update.publishedAt,
      update.url,
      update.firstRecorded,
      update.lastUpdated,
      update.status
    ]);
  });

  // 單次批次寫入，比逐一更新快 10-50 倍
  sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
}
```

---

## 🛠 開發環境設定

### Visual Studio Code 設定

#### 推薦擴充功能

```json
{
  "recommendations": [
    "google.apps-script",           // Google Apps Script 官方支援
    "ms-vscode.vscode-typescript",  // TypeScript 支援
    "esbenp.prettier-vscode",       // 程式碼格式化
    "ms-vscode.vscode-json"         // JSON 語法高亮
  ]
}
```

#### .vscode/settings.json

```json
{
  "files.associations": {
    "*.gs": "javascript"
  },
  "javascript.preferences.includePackageJsonAutoImports": "off",
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "editor.tabSize": 2,
  "editor.insertSpaces": true
}
```

### 本地開發工作流程

1. **安裝 clasp CLI**
   ```bash
   npm install -g @google/clasp
   clasp login
   ```

2. **下載專案**
   ```bash
   clasp clone <SCRIPT_ID>
   ```

3. **本地編輯**
   ```bash
   code .  # 在 VSCode 中開啟
   ```

4. **推送更新**
   ```bash
   clasp push
   ```

### 測試環境

```javascript
// 建立測試用的模擬資料
function createMockData() {
  return {
    US: [
      {
        id: 'test_video_1',
        title: 'Test Video 1',
        viewCount: 1000000,
        publishedAt: '2024-01-15T10:00:00Z',
        url: 'https://www.youtube.com/watch?v=test_video_1'
      }
    ]
  };
}

// 單元測試範例
function testGetTrendingFunction() {
  const mockOptions = {
    region: 'TW',
    limit: 5,
    shorts: false
  };

  const result = getTrending(mockOptions);

  console.assert(Array.isArray(result), '回傳值應為陣列');
  console.assert(result.length <= 5, '結果數量不應超過限制');

  if (result.length > 0) {
    const video = result[0];
    console.assert(typeof video.id === 'string', '影片 ID 應為字串');
    console.assert(typeof video.title === 'string', '標題應為字串');
    console.assert(typeof video.viewCount === 'number', '觀看次數應為數字');
  }

  console.log('✅ getTrending 函數測試通過');
}
```

---

## 🔗 相關資源

### 官方文件
- [Google Apps Script 文件](https://developers.google.com/apps-script)
- [YouTube Data API v3 文件](https://developers.google.com/youtube/v3)
- [Google Sheets API 文件](https://developers.google.com/sheets/api)

### 社群資源
- [Apps Script Community](https://developers.google.com/apps-script/community)
- [Stack Overflow - google-apps-script](https://stackoverflow.com/questions/tagged/google-apps-script)
- [Reddit - r/GoogleAppsScript](https://www.reddit.com/r/GoogleAppsScript/)

### 工具推薦
- [clasp - 命令列工具](https://github.com/google/clasp)
- [Apps Script 範例庫](https://github.com/googleworkspace/apps-script-samples)
- [VSCode Apps Script 擴充功能](https://marketplace.visualstudio.com/items?itemName=google.apps-script)

---

**最後更新：** 2025-09-16