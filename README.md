# YouTube 熱門影片追蹤與分析系統 v3.0 - Web 分析工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://script.google.com/)
[![YouTube Data API](https://img.shields.io/badge/YouTube%20Data%20API-FF0000?logo=youtube&logoColor=white)](https://developers.google.com/youtube/v3)
[![Web Analytics](https://img.shields.io/badge/Web%20Analytics-ea2a33?logo=chart.js&logoColor=white)](https://chart.js.org/)

## 📋 專案簡介

這是一個完整的 YouTube 影片追蹤與分析系統，採用 **Linus Torvalds 的設計哲學** 開發，包含 **後端數據收集** 和 **前端分析工具**：

### 🎯 後端數據收集系統
- 📁 **階層檔案結構**：YouTube Analytics Data/年份/月份檔案/每日分頁
- 🚀 **智能按需建立**：只建立今日+明日分頁，自動處理跨月、跨年
- 📊 **每日數據快照**：不累積歷史，每日分頁直接記錄當日數據
- 🎬 **智能分類**：基於實際長度判斷 Shorts（≤60秒）vs 一般影片
- 🌐 **多地區追蹤**：美國、印度、台灣、巴西、印尼、墨西哥六個地區
- 🔍 **Web API**：提供 RESTful API 供前端應用使用
- ⚡ **永續運行**：永不觸及 Google Sheets 限制，可運行數年無人工干預

### 🖥️ 前端 Web 分析工具
- 📺 **影片搜尋頁面**：支援多維度篩選的影片列表瀏覽
- 📊 **Hashtag 統計分析**：圓餅圖、長條圖等視覺化統計圖表
- ☁️ **標題文字雲分析**：智能分詞與關鍵詞頻率分析
- 🎨 **現代化 UI**：暗色主題、響應式設計、流暢動畫效果
- 🔄 **即時切換**：三個分析頁面間無縫導航切換

---

## 🚀 立即開始

### 🌟 後端數據收集設置

如果您是第一次使用，只需要執行一個函數：

1. 在 Google Apps Script 中找到 `setupSystem()` 函數
2. 點擊執行按鈕 ▶️
3. 等待完成，系統會自動：
   - 📁 創建階層檔案結構（YouTube Analytics Data/年份/月份檔案）
   - ⏰ 設置每日自動追蹤（早上 6:00）
   - 🔗 測試 YouTube API 連接
   - ✅ 系統準備完成

### 📊 立即收集數據

想要馬上看到數據？執行 `dailyYouTubeTracking()` 函數開始收集：

- 🇺🇸 美國熱門影片 & Shorts 前 20 名
- 🇮🇳 印度熱門影片 & Shorts 前 20 名
- 🇹🇼 台灣熱門影片 & Shorts 前 20 名
- 🇧🇷 巴西熱門影片 & Shorts 前 20 名
- 🇮🇩 印尼熱門影片 & Shorts 前 20 名
- 🇲🇽 墨西哥熱門影片 & Shorts 前 20 名

**每日執行時會自動建立今日分頁，資料直接寫入對應的日期分頁中！**

### 🖥️ Web 分析工具使用

#### 🌐 方式 1：GitHub Pages 在線使用 (推薦)

**立即在線使用，無需下載：**

1. **訪問主頁**：開啟 [https://您的用戶名.github.io/youtube-trend-tracker](https://您的用戶名.github.io/youtube-trend-tracker)
2. **選擇分析工具**：在主頁中選擇您需要的分析工具
3. **開始分析**：點擊對應按鈕直接進入分析頁面

**三大分析工具在線版本：**
- 📺 **影片搜尋分析**：[video-search.html](https://您的用戶名.github.io/youtube-trend-tracker/video-search.html)
- 📊 **Hashtag 統計分析**：[hashtag-analytics.html](https://您的用戶名.github.io/youtube-trend-tracker/hashtag-analytics.html)
- ☁️ **標題文字雲分析**：[title-wordcloud.html](https://您的用戶名.github.io/youtube-trend-tracker/title-wordcloud.html)

> **💡 GitHub Pages 部署提示**：將專案上傳到 GitHub 並啟用 Pages 功能即可獲得專屬網址

#### 💻 方式 2：本地檔案使用

數據收集完成後，下載並開啟本地 HTML 檔案：

#### 📺 影片搜尋分析
開啟 `video-search.html`：
- 🔍 多維度篩選：地區、類型、關鍵字、觀看數範圍
- 📱 響應式網格：最多5列影片卡片展示
- ⚡ 即時搜尋：輸入關鍵字立即篩選結果
- 🎬 影片預覽：hover 顯示播放按鈕，點擊跳轉 YouTube

#### 📊 Hashtag 統計分析
開啟 `hashtag-analytics.html`：
- 📈 視覺化圖表：圓餅圖、長條圖、環圈圖可切換
- 🏆 排行榜：按使用次數或觀看數排序
- 🎯 篩選選項：時間範圍、地區、類型多維篩選
- 📋 詳細資料表格：完整統計數據一覽

#### ☁️ 標題文字雲分析
開啟 `title-wordcloud.html`：
- 🌀 智能文字雲：動態字體大小和顏色
- 🧠 中英文分詞：自動識別並過濾停用詞
- 📊 雙排行榜：頻率排行 + 觀看數排行
- 🔍 關鍵詞點擊：查看包含該詞的所有影片

---

## 📈 版本更新歷史

### 🌟 v3.0.0 - Web 分析工具 (2025-09-18)

**🎨 全新 Web 前端分析工具 - 完整視覺化分析平台**

> *"簡潔直接的用戶體驗，解決實際分析需求"* - Linus 式產品設計實踐

#### ✨ 三大分析頁面

**📺 影片搜尋頁面 (`src/youtube-search.html`)**
- 🏗️ 現代化暗色主題設計，支援 5 列響應式網格
- 🔍 多維度即時篩選：地區、類型、關鍵字、觀看數範圍
- 🎬 精美影片卡片：縮圖、標題、統計數據、hashtags 一覽
- ⚡ 流暢 hover 效果和載入動畫

**📊 Hashtag 統計分析 (`src/hashtag-analytics.html`)**
- 📈 Chart.js 視覺化圖表：圓餅圖、長條圖、環圈圖可切換
- 🏆 雙重排行榜：使用頻率排行 + 總觀看數排行
- 🎯 豐富篩選選項：時間範圍、地區、類型、排序方式
- 📋 詳細資料表格：完整統計數據和百分比分析

**☁️ 標題文字雲分析 (`src/title-wordcloud.html`)**
- 🌀 動態文字雲：智能字體大小、顏色漸變、旋轉效果
- 🧠 中英文智能分詞：停用詞過濾、可調整最小字數
- 📊 雙排行榜系統：頻率排行 + 觀看數排行
- 🔍 關鍵詞互動：點擊查看包含該詞的所有影片

#### 🛠️ 技術特色

- **🎨 統一設計語言**：三個頁面採用一致的暗色主題和交互設計
- **🔄 無縫導航**：頂部導航列支援頁面間快速切換
- **📱 響應式設計**：完美適配桌面和行動裝置
- **⚡ 原生性能**：純 HTML/CSS/JS，無需框架，載入快速
- **🔗 API 整合**：統一使用 Google Apps Script API 作為數據來源

#### 📁 檔案結構

```
src/
├── youtube-search.html      # 影片搜尋頁面
├── hashtag-analytics.html   # Hashtag 統計分析
└── title-wordcloud.html     # 標題文字雲分析
```

### 🎯 v2.0.0 - 階層檔案結構 (2025-09-17)

**🏗️ 重大架構升級 - 階層檔案結構系統**

> *"數據結構決定一切，好的設計消除所有特殊情況"* - Linus Torvalds 哲學實踐

#### ✨ 革命性檔案組織

**📁 階層檔案結構：**
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

#### 🚀 智能邊界處理

- **🔍 智能按需建立**：只建立今日+明日分頁，避免過度設計
- **📅 跨月自動處理**：09/30 → 10/01 自動建立新月份檔案
- **🎆 跨年自動處理**：12/31 → 01/01 自動建立新年份資料夾
- **⚡ 重複執行友好**：跳過已存在結構，零浪費

#### 📊 數據結構簡化

**新的每日分頁結構（14 欄）：**

```
1. rank              - 排名（依地區類型分開）
2. videoId           - YouTube 影片 ID
3. title             - 影片標題
4. channelTitle      - 頻道名稱
5. publishedAt       - 發佈時間
6. region            - 地區（US/IN/TW/BR/ID/MX）
7. type              - 類型（videos/shorts）
8. recordDate        - 記錄日期
9. url               - YouTube 連結
10. viewCount        - 當日觀看數
11. likeCount        - 當日按讚數
12. commentCount     - 當日留言數
13. hashtags         - 提取的 hashtag
14. durationSeconds  - 影片長度（秒數）
```

#### 🛠️ 系統改進

- **移除歷史累積**：從複雜的 History 欄位改為每日快照
- **永續運行**：永不觸及 Google Sheets 200分頁限制
- **智能建立**：`createSheetIfNotExists()` 避免重複建立
- **地區擴展**：新增巴西、印尼、墨西哥三個地區

---

### 🚀 v1.0.0 - Linus 式重構版本 (2025-09-16)

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

---

## 🔄 版本功能比較

| 功能項目               | v1.0.0 舊版  | v2.0.0 新版  | v3.0.0 最新 ⭐  |
| ---------------------- | ------------ | ------------ | --------------- |
| **檔案結構**     | 🔴 單一檔案  | ✅ 階層結構  | ✅ 階層結構     |
| **數據組織**     | 🔴 混雜累積  | ✅ 每日分頁  | ✅ 每日分頁     |
| **前端工具**     | ❌ 無        | ❌ 無        | ✅ 三頁面分析   |
| **視覺化分析**   | ❌ 無        | ❌ 無        | ✅ 圖表+文字雲  |
| **用戶體驗**     | 🔴 命令行    | 🔴 命令行    | ✅ Web 界面     |
| **即時篩選**     | ❌ 無        | ❌ 無        | ✅ 多維篩選     |
| **數據可視化**   | 🔴 原始表格  | 🔴 原始表格  | ✅ 互動式圖表   |
| **響應式設計**   | ❌ 無        | ❌ 無        | ✅ 全設備支援   |
| **邊界處理**     | 🔴 手動      | ✅ 自動智能  | ✅ 自動智能     |
| **維護成本**     | 🔴 高        | ✅ 零維護    | ✅ 零維護       |

---

## 📊 系統規格

### 當前追蹤參數

- **地區範圍**: 美國 🇺🇸、印度 🇮🇳、台灣 🇹🇼、巴西 🇧🇷、印尼 🇮🇩、墨西哥 🇲🇽
- **搜尋天數**: 5 天（可調整 `DAILY_SEARCH_DAYS`）
- **排名數量**: 每個地區類型前 20 名（可調整 `RANKING_LIMIT`）
- **Shorts 定義**: ≤ 60 秒（可調整 `SHORTS_DURATION_LIMIT`）
- **更新頻率**: 每天早上 6:00 自動執行
- **檔案組織**: 每月一檔案，每日一分頁

### API 配額使用

- **每日調用**: 24 次 API 調用（6地區 × 2類型 × 2步驟）
- **配額消耗**: ~24 單位/天（YouTube 免費額度 10,000 單位）
- **使用率**: 0.24%，非常節約

### 檔案結構特性

- **永續運行**: 永不觸及 Google Sheets 限制
- **智能建立**: 只建立必要的分頁
- **自動邊界**: 跨月、跨年自動處理
- **零維護**: 可運行數年無人工干預

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

## 🌐 GitHub Pages 部署指南

### 📦 快速部署到 GitHub Pages

#### 步驟 1：準備 GitHub 儲存庫

1. **建立新儲存庫**：
   ```bash
   # 在 GitHub 上建立名為 youtube-trend-tracker 的新儲存庫
   ```

2. **上傳專案檔案**：
   ```bash
   git clone https://github.com/您的用戶名/youtube-trend-tracker.git
   cd youtube-trend-tracker

   # 複製專案檔案到儲存庫
   # 確保以下檔案在根目錄：
   # - index.html (主頁)
   # - video-search.html (影片搜尋分析)
   # - hashtag-analytics.html (Hashtag 統計分析)
   # - title-wordcloud.html (標題文字雲分析)
   # - docs/ 目錄（包含所有 .md 文檔）
   ```

#### 步驟 2：啟用 GitHub Pages

1. **進入儲存庫設定**：
   - 前往您的 GitHub 儲存庫頁面
   - 點擊 "Settings" 頁籤

2. **配置 Pages 設定**：
   - 在左側選單找到 "Pages"
   - Source 選擇 "Deploy from a branch"
   - Branch 選擇 "main" (或 "master")
   - Folder 選擇 "/ (root)"
   - 點擊 "Save"

3. **取得您的網站網址**：
   - GitHub 會顯示您的網站網址：`https://您的用戶名.github.io/youtube-trend-tracker`
   - 通常需要等待 5-10 分鐘網站才會生效

#### 步驟 3：配置 API 連接

在每個 HTML 檔案中，確保已正確設定 Google Apps Script API URL：

```javascript
// 在每個 HTML 檔案的 JavaScript 部分
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/您的SCRIPT_ID/exec';
```

### 🔧 部署檔案結構

GitHub Pages 部署後的檔案結構：

```
您的用戶名.github.io/youtube-trend-tracker/
├── index.html                 # 主頁入口 🏠
├── video-search.html          # 影片搜尋分析 📺
├── hashtag-analytics.html     # Hashtag 統計分析 📊
├── title-wordcloud.html       # 標題文字雲分析 ☁️
├── docs/                      # 文檔目錄 📚
│   ├── beginner.md           # 新手指南
│   ├── develop.md            # 開發文檔
│   ├── CHANGELOG.md          # 更新記錄
│   └── todo-list.md          # 待辦清單
└── README.md                  # 專案說明
```

### 🌟 使用您的在線分析平台

部署完成後，您可以透過以下網址使用分析工具：

- **🏠 主頁**：`https://您的用戶名.github.io/youtube-trend-tracker/`
- **📺 影片搜尋**：`https://您的用戶名.github.io/youtube-trend-tracker/video-search.html`
- **📊 Hashtag 分析**：`https://您的用戶名.github.io/youtube-trend-tracker/hashtag-analytics.html`
- **☁️ 文字雲分析**：`https://您的用戶名.github.io/youtube-trend-tracker/title-wordcloud.html`

### 📱 優勢特色

✅ **零服務器成本**：完全免費的 GitHub Pages 託管
✅ **全球 CDN**：GitHub 提供的高速內容分發網路
✅ **HTTPS 安全**：自動提供 SSL 證書
✅ **響應式設計**：完美支援桌面、平板、手機
✅ **即時更新**：推送代碼後自動更新網站
✅ **自訂域名**：可配置個人域名

### 🔄 更新和維護

當您需要更新分析工具時：

```bash
# 在本地修改檔案後
git add .
git commit -m "更新分析工具功能"
git push origin main

# GitHub Pages 會自動重新部署（通常 1-5 分鐘）
```

---

## 🎯 使用場景

### 📈 數據分析師
- **🔍 深度趨勢分析**：使用 Web 工具進行多維度數據探索
- **📊 視覺化報告**：Hashtag 統計圖表和標題關鍵詞分析
- **⏰ 時間序列分析**：追蹤不同時間段的內容趨勢變化
- **🌐 跨地區比較**：分析不同地區的內容偏好差異

### 🎬 內容創作者
- **🎯 內容策略優化**：透過熱門關鍵詞文字雲發現內容機會
- **📱 Shorts vs 長影片**：分析不同內容格式的表現差異
- **🏷️ Hashtag 策略**：使用統計工具選擇最有效的標籤
- **🎨 視覺化儀表板**：一目了然的數據呈現，快速決策

### 📊 市場研究與學術研究
- **🔬 學術研究工具**：完整的數據收集和分析工具鏈
- **📈 市場趨勢報告**：生成專業的視覺化分析報告
- **🧠 內容語義分析**：標題文字雲揭示內容主題趨勢
- **📋 競品分析**：追蹤競爭對手的內容策略變化

### 🎨 產品經理與設計師
- **💡 靈感發現**：透過趨勢分析發現產品設計靈感
- **👥 用戶行為研究**：分析不同地區用戶的內容偏好
- **🎪 營銷策略**：基於數據制定精準的營銷內容策略

---

## 📞 維護信息

**當前版本：** v3.0.0 - Web 分析工具
**最後更新：** 2025-09-18
**維護狀態：** 🟢 積極維護
**代碼品質：** 🟢 優秀（後端：智能 + 永續運行，前端：現代化 + 響應式）

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