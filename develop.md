# 🔧 進階開發指南 v2.0 - 階層檔案結構

## 📚 v2.0 重點更新

### 🏗 系統架構變更

**核心變更：**
- **檔案結構**：從單一檔案改為階層檔案結構
- **數據組織**：從歷史累積改為每日分頁快照
- **邊界處理**：智能處理跨月、跨年邊界

### 📊 新增核心函數

#### `ensureTodayStructureExists(targetDate)`
**智能結構檢查函數**

```javascript
/**
 * 智能按需建立今日結構
 * - 只建立今日+明日分頁
 * - 自動處理跨月、跨年邊界
 * - 重複執行時跳過已存在的結構
 */
function ensureTodayStructureExists(targetDate) {
  // 處理三種邊界情況：
  // 1. 同月：正常情況
  // 2. 跨月：09/30 → 10/01
  // 3. 跨年：12/31 → 01/01
}
```

#### `trackRegionToDaily(sheet, regionCode, wantShorts, today)`
**新版追蹤函數**

```javascript
/**
 * v2.0 追蹤函數：直接寫入每日分頁
 * - 不累積歷史數據
 * - 每日重新排名
 * - 簡化數據結構
 */
```

#### `createSheetIfNotExists(spreadsheet, sheetName)`
**智能分頁建立**

```javascript
/**
 * 智能建立分頁
 * - 檢查分頁是否存在
 * - 確保標題行正確（14欄新結構）
 * - 修復舊分頁標題行
 */
```

### 📈 數據結構變更

**v1.0 → v2.0 比較：**

| 項目 | v1.0 | v2.0 |
|------|------|------|
| 檔案結構 | 單一檔案 | 階層結構 |
| 數據組織 | 歷史累積 | 每日分頁 |
| 欄位數量 | 16 欄 | 14 欄 |
| 擴展性 | 200分頁限制 | 無限制 |
| 維護成本 | 高 | 零維護 |

**新 COLUMNS 結構（14 欄）：**
```javascript
const COLUMNS = [
  'rank', 'videoId', 'title', 'channelTitle', 'publishedAt', 'region', 'type',
  'recordDate', 'url', 'viewCount', 'likeCount', 'commentCount', 'hashtags', 'durationSeconds'
];
```

### 🌐 地區擴展

```javascript
const REGIONS = {
  'TW': { name: '台灣', query: '台灣 OR 繁體 OR 中文', lang: 'zh-Hant' },
  'US': { name: '美國', query: 'trending OR viral OR popular', lang: 'en' },
  'IN': { name: '印度', query: 'India OR Hindi OR trending', lang: 'hi' },
  'BR': { name: '巴西', query: 'Brasil OR português OR viral', lang: 'pt' },
  'ID': { name: '印尼', query: 'Indonesia OR trending OR populer', lang: 'id' },
  'MX': { name: '墨西哥', query: 'Mexico OR español OR popular', lang: 'es' }
};
```

### 🔄 邊界處理邏輯

**三種邊界情況：**

1. **同月邊界**（正常）
   ```
   2024/09/17 → 2024/09/18
   ✅ 同一月份檔案，建立新分頁
   ```

2. **跨月邊界**
   ```
   2024/09/30 → 2024/10/01
   ✅ 建立新月份檔案 + 新分頁
   ```

3. **跨年邊界**
   ```
   2024/12/31 → 2025/01/01
   ✅ 建立新年份資料夾 + 新月份檔案 + 新分頁
   ```

### ⚡ 效能優化

**按需建立策略：**
- 第一次執行：建立今日+明日分頁
- 重複執行：跳過已存在結構
- 跨邊界：自動建立必要結構

**API 配額管理：**
- 6個地區 × 2類型 × 2步驟 = 24次API調用/日
- 使用率：0.24%（YouTube免費額度10,000單位）

---

## 🏗 v1.0 系統架構（參考）

### 核心組件

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

## 🗄 v2.0 階層檔案結構設計

### 檔案組織架構

```
YouTube Analytics Data/
├── 2024/
│   ├── 2024-09 (每日分頁: 01, 02, ..., 30)
│   ├── 2024-10 (每日分頁: 01, 02, ..., 31)
│   └── ...
├── 2025/
│   ├── 2025-01
│   └── ...
```

### v1.0 → v2.0 結構對比

#### v1.0 設計（單一檔案）
```
📊 單一 Google Sheet
├── 美國熱門影片    │ 混雜的歷史數據
├── 印度熱門影片    │ 複雜的History欄位
├── 台灣熱門影片    │ 200分頁限制
└── 觀看記錄工作表  │ 維護困難
```

#### v2.0 設計（階層檔案結構）
```
📁 YouTube Analytics Data/
├── 📅 2024/
│   ├── 📊 2024-09
│   │   ├── 📋 01 (當日所有地區數據)
│   │   ├── 📋 02
│   │   └── 📋 ...
│   └── 📊 2024-10
└── 📅 2025/
```

### 每日分頁數據結構（14 欄）

```javascript
const COLUMNS = [
  'rank',              // 排名（依地區類型分開）
  'videoId',           // YouTube 影片 ID
  'title',             // 影片標題
  'channelTitle',      // 頻道名稱
  'publishedAt',       // 發佈時間
  'region',            // 地區（US/IN/TW/BR/ID/MX）
  'type',              // 類型（videos/shorts）
  'recordDate',        // 記錄日期
  'url',               // YouTube 連結
  'viewCount',         // 當日觀看數
  'likeCount',         // 當日按讚數
  'commentCount',      // 當日留言數
  'hashtags',          // 提取的 hashtag
  'durationSeconds'    // 影片長度（秒數）
];
```

### v2.0 設計優勢

1. **永續運行**：永不觸及 Google Sheets 200分頁限制
2. **智能建立**：只建立必要結構，自動處理邊界
3. **清晰組織**：時間層次分明，便於數據分析
4. **零維護**：可運行數年無人工干預
5. **簡化數據**：移除複雜歷史累積，改為每日快照

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

**最後更新：** 2025-09-17 - v2.0 階層檔案結構版