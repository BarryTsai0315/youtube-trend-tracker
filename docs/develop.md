# 🔧 進階開發指南 v3.0 - Web 分析工具平台

## 🌟 v3.0 重大更新：Web 分析工具平台 (2025-09-18)

### 🎉 全新 Web 分析工具架構

#### 📊 v3.0 系統架構概覽
```
Web 分析工具平台 = Google Apps Script API + 三大分析工具
├── 資料收集層：Google Apps Script + YouTube Data API v3
├── 資料儲存層：Google Sheets (階層檔案結構)
├── API 服務層：JSON REST API
└── 前端分析層：三個獨立的 HTML 分析工具
```

#### ✨ 三大核心分析工具

1. **📺 影片搜尋分析** (`src/youtube-search.html`)
   - 響應式 5 列網格佈局
   - 多維度即時篩選系統
   - YouTube 縮圖整合

2. **📊 Hashtag 統計分析** (`src/hashtag-analytics.html`)
   - Chart.js 專業圖表視覺化
   - 雙重排行榜系統
   - 詳細統計數據表格

3. **☁️ 標題文字雲分析** (`src/title-wordcloud.html`)
   - 智能中英文分詞引擎
   - 動態文字雲渲染
   - 互動式關鍵詞分析

---

## 🏗️ Web 分析工具技術架構

### 📺 工具 1：影片搜尋分析系統

#### 🎯 核心技術特色
- **零框架設計**：Pure HTML + Vanilla JavaScript + Tailwind CSS
- **響應式佈局**：CSS Grid + Flexbox 混合架構
- **數據驅動UI**：JavaScript 模板字符串動態渲染

#### 🔧 關鍵實現細節

**響應式網格系統：**
```css
.video-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 1280px) {
  .video-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

**即時篩選引擎：**
```javascript
function applyFilters() {
  const filteredVideos = allVideos.filter(video => {
    // 地區篩選
    if (selectedRegion !== 'all' && video.region !== selectedRegion) return false;

    // 類型篩選
    if (selectedType !== 'all' && video.type !== selectedType) return false;

    // 觀看數範圍篩選
    const viewCount = parseInt(video.viewCount) || 0;
    if (viewCount < minViews || viewCount > maxViews) return false;

    // 關鍵字搜尋（標題 + hashtags）
    if (searchKeyword) {
      const searchText = `${video.title} ${video.hashtags}`.toLowerCase();
      if (!searchText.includes(searchKeyword.toLowerCase())) return false;
    }

    return true;
  });

  renderVideos(filteredVideos);
}
```

**動畫系統：**
```javascript
function showFilteringAnimation() {
  filteringIndicator.classList.remove('hidden');
  videoContainer.style.opacity = '0.5';

  setTimeout(() => {
    applyFiltersCore();
    hideFilteringAnimation();
  }, 300);
}
```

### 📊 工具 2：Hashtag 統計分析系統

#### 🎨 Chart.js 集成架構
- **圓餅圖**：Hashtag 使用比例分布
- **長條圖**：數值排行對比
- **環圈圖**：雙重數據層展示

#### 🔧 關鍵實現細節

**動態圖表切換：**
```javascript
function switchChartType(newType) {
  if (currentChart) {
    currentChart.destroy();
  }

  const config = {
    pie: createPieChartConfig,
    bar: createBarChartConfig,
    doughnut: createDoughnutChartConfig
  }[newType];

  currentChart = new Chart(chartCanvas, config(processedData));
}
```

**數據統計引擎：**
```javascript
function analyzeHashtags(videos) {
  const hashtagStats = {};

  videos.forEach(video => {
    if (video.hashtags && typeof video.hashtags === 'string') {
      const tags = video.hashtags.split(',').map(tag => tag.trim());
      tags.forEach(tag => {
        if (tag && tag.length >= minWordLength) {
          if (!hashtagStats[tag]) {
            hashtagStats[tag] = {
              count: 0,
              totalViews: 0,
              totalLikes: 0,
              videos: []
            };
          }
          hashtagStats[tag].count++;
          hashtagStats[tag].totalViews += parseInt(video.viewCount) || 0;
          hashtagStats[tag].totalLikes += parseInt(video.likeCount) || 0;
          hashtagStats[tag].videos.push(video);
        }
      });
    }
  });

  return hashtagStats;
}
```

**雙重排行榜系統：**
```javascript
function generateRankings(hashtagStats) {
  const byFrequency = Object.entries(hashtagStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20);

  const byTotalViews = Object.entries(hashtagStats)
    .sort((a, b) => b[1].totalViews - a[1].totalViews)
    .slice(0, 20);

  return { byFrequency, byTotalViews };
}
```

### ☁️ 工具 3：標題文字雲分析系統

#### 🧠 智能分詞引擎設計

**中英文混合分詞：**
```javascript
function intelligentSegmentation(text) {
  // 移除特殊字符和數字
  text = text.replace(/[^\u4e00-\u9fa5a-zA-Z\s]/g, ' ');

  const segments = [];

  // 英文詞彙提取（基於空格分割）
  const englishWords = text.match(/[a-zA-Z]+/g) || [];
  englishWords.forEach(word => {
    if (word.length >= minWordLength && !isStopWord(word)) {
      segments.push(word.toLowerCase());
    }
  });

  // 中文詞彙提取（基於字符組合）
  const chineseText = text.replace(/[a-zA-Z\s]/g, '');
  for (let i = 0; i < chineseText.length - 1; i++) {
    for (let len = minWordLength; len <= Math.min(6, chineseText.length - i); len++) {
      const segment = chineseText.substr(i, len);
      if (!isStopWord(segment)) {
        segments.push(segment);
      }
    }
  }

  return segments;
}
```

**停用詞過濾系統：**
```javascript
const STOP_WORDS = {
  chinese: ['的', '是', '在', '有', '和', '就', '不', '人', '都', '一', '了', '我', '你', '他', '她', '它'],
  english: ['the', 'is', 'at', 'which', 'on', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by']
};

function isStopWord(word) {
  const lowerWord = word.toLowerCase();
  return STOP_WORDS.chinese.includes(word) || STOP_WORDS.english.includes(lowerWord);
}
```

**動態文字雲渲染：**
```javascript
function generateWordCloud(wordData) {
  const maxCount = Math.max(...wordData.map(w => w.count));
  const maxViews = Math.max(...wordData.map(w => w.totalViews));

  wordData.forEach(word => {
    const fontSize = Math.max(12, (word.count / maxCount) * 48);
    const opacity = Math.max(0.4, word.totalViews / maxViews);
    const rotation = (Math.random() - 0.5) * 60; // -30° to +30°

    const wordElement = createWordElement({
      text: word.word,
      fontSize: fontSize,
      opacity: opacity,
      rotation: rotation,
      color: interpolateColor(opacity)
    });

    positionWordElement(wordElement);
    attachClickHandler(wordElement, word);
  });
}
```

---

## 🔄 統一導航系統設計

### 🧭 三頁面導航架構

**導航狀態管理：**
```javascript
function updateNavigation() {
  const currentPage = getCurrentPageName();

  document.querySelectorAll('.nav-link').forEach(link => {
    const isActive = link.dataset.page === currentPage;
    link.classList.toggle('bg-blue-600', isActive);
    link.classList.toggle('text-white', isActive);
    link.classList.toggle('bg-gray-700', !isActive);
  });
}

function getCurrentPageName() {
  const path = window.location.pathname;
  if (path.includes('hashtag-analytics')) return 'hashtag';
  if (path.includes('title-wordcloud')) return 'wordcloud';
  return 'search';
}
```

**響應式導航設計：**
```css
.navigation-bar {
  @apply flex flex-wrap justify-center gap-2 p-4 bg-gray-800;
}

.nav-button {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
  @apply hover:bg-blue-500 hover:text-white;
  @apply flex items-center gap-2;
}

@media (max-width: 640px) {
  .nav-button {
    @apply px-3 py-2 text-sm;
  }
}
```

---

## 🎨 設計系統規範

### 🌙 統一暗色主題

**顏色系統：**
```css
:root {
  --bg-primary: #1f2937;      /* 主背景 */
  --bg-secondary: #374151;    /* 次要背景 */
  --bg-card: #4b5563;         /* 卡片背景 */
  --text-primary: #f9fafb;    /* 主要文字 */
  --text-secondary: #d1d5db;  /* 次要文字 */
  --accent-blue: #3b82f6;     /* 主色調藍色 */
  --accent-green: #10b981;    /* 成功綠色 */
  --accent-yellow: #f59e0b;   /* 警告黃色 */
}
```

**組件設計模式：**
```css
.filter-container {
  @apply bg-gray-800 p-6 rounded-lg shadow-lg mb-6;
}

.video-card {
  @apply bg-gray-700 rounded-lg overflow-hidden shadow-lg;
  @apply hover:shadow-xl hover:scale-105 transition-all duration-300;
}

.chart-container {
  @apply bg-gray-800 p-6 rounded-lg shadow-lg;
  @apply border border-gray-600;
}
```

### 📱 響應式設計原則

**斷點系統：**
```css
/* Mobile First 設計 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

**流式佈局模式：**
```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

@media (min-width: 1280px) {
  .responsive-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

---

## 🔗 API 整合架構

### 📡 Google Apps Script API 端點

**主要 API 端點：**
- `GET ?action=getData` - 完整影片資料
- `GET ?action=getFilters` - 動態篩選選項

**API 回應格式：**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "videoId": "abc123",
      "title": "影片標題",
      "channelTitle": "頻道名稱",
      "publishedAt": "2025-09-18T10:00:00Z",
      "region": "TW",
      "type": "videos",
      "recordDate": "2025-09-18",
      "url": "https://www.youtube.com/watch?v=abc123",
      "viewCount": "1234567",
      "likeCount": "12345",
      "commentCount": "678",
      "hashtags": "tag1, tag2, tag3",
      "durationSeconds": "180",
      "thumbnailUrl": "https://img.youtube.com/vi/abc123/mqdefault.jpg"
    }
  ],
  "timestamp": "2025-09-18T18:30:00Z"
}
```

### 🔄 錯誤處理和載入狀態

**統一錯誤處理：**
```javascript
async function fetchVideoData() {
  try {
    showLoadingState();
    const response = await fetch(API_ENDPOINTS.getData);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || '資料載入失敗');
    }

    return data.data;
  } catch (error) {
    showErrorState(error.message);
    console.error('載入資料時發生錯誤:', error);
    return [];
  } finally {
    hideLoadingState();
  }
}
```

**載入狀態管理：**
```javascript
function showLoadingState() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('content').classList.add('opacity-50');
}

function hideLoadingState() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('content').classList.remove('opacity-50');
}
```

---

## 📊 v2.0 階層檔案結構（後端）

### 檔案組織架構

```
YouTube Analytics Data/
├── 2025/
│   ├── 2025-09 (每日分頁: 01, 02, ..., 30)
│   │   ├── 18 (今日：所有地區和類型的數據)
│   │   └── 19 (明日：準備好的結構)
│   └── 2025-10 (跨月處理)
└── 2024/ (歷史數據)
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

---

## 🔧 開發環境設定

### 📁 專案結構

```
youtube-trend-tracker/
├── src/                          # 原始碼
│   ├── youtube-search.html       # 影片搜尋分析頁面
│   ├── hashtag-analytics.html    # Hashtag 統計分析頁面
│   ├── title-wordcloud.html      # 標題文字雲分析頁面
│   └── youtube-search-api.gs     # Google Apps Script 後端 API
├── docs/                         # 文檔
│   ├── CHANGELOG.md              # 更新記錄
│   ├── beginner.md               # 新手指南
│   ├── develop.md                # 開發文檔（本檔案）
│   └── todo-list.md              # 待辦清單
├── data/                         # 資料檔案
└── README.md                     # 專案說明
```

### 🛠️ 開發工具推薦

#### Visual Studio Code 設定

**推薦擴充功能：**
```json
{
  "recommendations": [
    "google.apps-script",           // Google Apps Script 官方支援
    "ms-vscode.vscode-typescript",  // TypeScript 支援
    "esbenp.prettier-vscode",       // 程式碼格式化
    "ms-vscode.vscode-json",        // JSON 語法高亮
    "bradlc.vscode-tailwindcss"     // Tailwind CSS 智能提示
  ]
}
```

**.vscode/settings.json：**
```json
{
  "files.associations": {
    "*.gs": "javascript",
    "*.html": "html"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "html.format.indentInnerHtml": true,
  "css.validate": false,
  "tailwindCSS.includeLanguages": {
    "html": "html"
  }
}
```

### 🔄 本地開發工作流程

#### 1. 後端開發（Google Apps Script）

```bash
# 安裝 clasp CLI
npm install -g @google/clasp

# 登入 Google 帳號
clasp login

# 下載專案
clasp clone <SCRIPT_ID>

# 推送更新
clasp push

# 部署 Web App
clasp deploy --description "v3.0 Web Analytics Tools"
```

#### 2. 前端開發（HTML 工具）

**本地測試環境：**
```bash
# 使用 Live Server 測試
# 安裝 VSCode Live Server 擴充功能
# 右鍵點擊 HTML 檔案 → Open with Live Server
```

**資料來源配置：**
```javascript
// 在每個 HTML 檔案中配置 API 端點
const API_BASE_URL = 'https://script.google.com/macros/s/{SCRIPT_ID}/exec';
const API_ENDPOINTS = {
  getData: `${API_BASE_URL}?action=getData`,
  getFilters: `${API_BASE_URL}?action=getFilters`
};
```

---

## 🧪 測試和品質保證

### 📊 單元測試架構

**API 端點測試：**
```javascript
function testApiEndpoints() {
  // 測試 getData 端點
  const dataResponse = doGet({ parameter: { action: 'getData' } });
  console.assert(dataResponse.success === true, 'getData 應該返回成功狀態');
  console.assert(Array.isArray(dataResponse.data), 'data 應該是陣列');

  // 測試 getFilters 端點
  const filtersResponse = doGet({ parameter: { action: 'getFilters' } });
  console.assert(filtersResponse.success === true, 'getFilters 應該返回成功狀態');
  console.assert(filtersResponse.filters.regions.length > 0, '應該返回地區選項');

  console.log('✅ API 端點測試通過');
}
```

**前端功能測試：**
```javascript
function testFilteringLogic() {
  // 模擬資料
  const mockVideos = [
    { region: 'TW', type: 'videos', viewCount: '1000000', title: 'Test Video 1' },
    { region: 'US', type: 'shorts', viewCount: '500000', title: 'Test Video 2' }
  ];

  // 測試地區篩選
  const twVideos = mockVideos.filter(v => v.region === 'TW');
  console.assert(twVideos.length === 1, '地區篩選應該正確');

  // 測試類型篩選
  const shorts = mockVideos.filter(v => v.type === 'shorts');
  console.assert(shorts.length === 1, '類型篩選應該正確');

  console.log('✅ 篩選邏輯測試通過');
}
```

### 🔍 效能監控

**載入時間測試：**
```javascript
function measurePerformance() {
  const startTime = performance.now();

  loadVideoData().then(() => {
    const loadTime = performance.now() - startTime;
    console.log(`資料載入時間: ${loadTime.toFixed(2)}ms`);

    if (loadTime > 3000) {
      console.warn('載入時間過長，建議優化');
    }
  });
}
```

**記憶體使用監控：**
```javascript
function monitorMemoryUsage() {
  if (performance.memory) {
    const memory = performance.memory;
    console.log({
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
  }
}
```

---

## 🚀 部署和維護

### 📦 部署檢查清單

#### 後端部署（Google Apps Script）
- [ ] YouTube Data API v3 已啟用
- [ ] OAuth 權限已正確配置
- [ ] Web App 已部署並設定為「任何人」存取
- [ ] API 端點正確回應 JSON 格式
- [ ] 錯誤處理機制運作正常

#### 前端部署（HTML 工具）
- [ ] API 端點 URL 已正確配置
- [ ] 所有外部資源（CDN）可正常載入
- [ ] 響應式設計在各裝置測試正常
- [ ] 圖表和文字雲渲染正常
- [ ] 導航系統運作正常

### 🔄 維護和更新

**定期檢查項目：**
1. **API 配額使用量**：監控 YouTube API 使用情況
2. **資料品質**：檢查新資料是否正常收集
3. **效能表現**：監控頁面載入速度和響應時間
4. **使用者回饋**：收集並處理使用者問題

**版本更新流程：**
1. 在 develop 分支進行開發
2. 完成功能測試
3. 更新相關文檔
4. 合併到主分支
5. 部署到生產環境
6. 更新 CHANGELOG.md

---

## 🔗 相關資源

### 📚 技術文檔
- [Google Apps Script 官方文檔](https://developers.google.com/apps-script)
- [YouTube Data API v3 文檔](https://developers.google.com/youtube/v3)
- [Chart.js 官方文檔](https://www.chartjs.org/docs/)
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)

### 🛠️ 開發工具
- [clasp - Google Apps Script CLI](https://github.com/google/clasp)
- [Live Server - VSCode 擴充功能](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### 🌐 設計資源
- [Material Design Icons](https://fonts.google.com/icons)
- [Google Fonts](https://fonts.google.com/)
- [Coolors - 配色工具](https://coolors.co/)

---

## 📈 未來開發規劃

### v3.1 計畫功能
- [ ] 影片趨勢圖表分析
- [ ] 多時間範圍對比功能
- [ ] 資料匯出功能（CSV, JSON）
- [ ] 自訂篩選器儲存

### v3.2 計畫功能
- [ ] 即時資料更新（WebSocket）
- [ ] 進階統計分析（回歸分析、相關係數）
- [ ] 使用者偏好設定
- [ ] 深色/淺色主題切換

### v4.0 長期目標
- [ ] React 版本重構
- [ ] 後端資料庫整合
- [ ] 多用戶支援系統
- [ ] 行動裝置 PWA 支援

---

**最後更新：** 2025-09-18 - v3.0.0 Web 分析工具平台版