
## 網站設計筆記

### 1. 資料流設計
- **資料來源**: Google Sheet
- **中間層**: Google Apps Script (作為API端點)
- **前端**: 網頁應用程式 (React)

**詳細流程**:
1. 使用者透過前端網站發出資料請求 (例如，篩選條件、排序方式)。
2. 前端網站呼叫部署在Google Apps Script上的Web應用程式API。
3. Google Apps Script讀取指定的Google Sheet資料。
4. Google Apps Script根據前端請求的篩選條件和排序邏輯處理資料。
5. Google Apps Script將處理後的資料以JSON格式返回給前端。
6. 前端網站接收JSON資料，並渲染到UI上。

### 2. UI/UX 規劃

**主要頁面元素**:
- **頂部導航欄**: 網站標題、可能的登入/設定按鈕 (如果需要)。
- **篩選器側邊欄/區域**: 
    - **日期篩選**: 選擇 `recordDate` 範圍 (例如，過去7天、特定日期)。
    - **地區篩選**: 下拉選單選擇 `region` (例如，TW)。
    - **類型篩選**: 下拉選單選擇 `type` (例如，videos)。
    - **頻道篩選**: 搜尋框或下拉選單選擇 `channelTitle`。
    - **Hashtag篩選**: 搜尋框或多選標籤選擇 `hashtags`。
    - **排序選項**: 依 `viewCount`, `likeCount`, `commentCount`, `publishedAt` 排序。
- **影片列表區域**: 
    - 顯示YouTube影片縮圖 (可從 `videoId` 生成)。
    - 影片標題 (`title`)。
    - 頻道名稱 (`channelTitle`)。
    - 發布日期 (`publishedAt`)。
    - 觀看次數 (`viewCount`)、按讚數 (`likeCount`)、留言數 (`commentCount`)。
    - 點擊影片縮圖或標題可連結到YouTube。
- **資料分析與趨勢圖表區域**: 
    - **趨勢分析圖**: 
        - 顯示選定時間範圍內 (例如，過去7天) 影片的 `viewCount`, `likeCount`, `commentCount` 變化趨勢。
        - 可以是折線圖，顯示每日總計或平均值。
    - **熱門Hashtag統計**: 
        - 圓餅圖或長條圖顯示最常出現的 `hashtags` 及其頻率。
        - 點擊hashtag可篩選影片。
    - **熱門頻道統計/推薦**: 
        - 長條圖顯示觀看次數或影片數量最多的頻道。
        - 推薦相關頻道。

**技術選型**:
- **前端**: React (使用 `create-react-app` 或 Vite 初始化)。
- **圖表庫**: Recharts 或 Chart.js (用於趨勢分析圖和統計圖表)。
- **後端**: Google Apps Script (用於讀取Google Sheet資料並提供API)。
- **資料儲存**: Google Sheet。

**網站外觀/風格**: 
- 簡潔、現代的設計。
- 響應式佈局，適應不同螢幕尺寸。
- 色彩搭配應清晰、易讀。

