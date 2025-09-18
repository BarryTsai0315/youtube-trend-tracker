# Google Apps Script 部署指南

## 步驟 1: 建立 Google Apps Script 專案

1. 前往 [Google Apps Script](https://script.google.com/)
2. 點擊「新專案」
3. 將專案重新命名為「YouTube影片分析API」

## 步驟 2: 貼入程式碼

1. 刪除預設的 `myFunction()` 函數
2. 將 `google_apps_script.js` 檔案中的所有程式碼複製並貼入
3. 修改第12行的 `SHEET_ID` 變數，將 `'YOUR_GOOGLE_SHEET_ID_HERE'` 替換為你的 Google Sheet ID

### 如何找到 Google Sheet ID:
- 開啟你的 Google Sheet
- 從網址列複製 ID，格式如下：
  ```
  https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit#gid=0
  ```
- 例如：`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## 步驟 3: 設定權限

1. 點擊「執行」按鈕測試程式碼
2. 系統會要求授權，點擊「檢閱權限」
3. 選擇你的 Google 帳戶
4. 點擊「進階」→「前往 YouTube影片分析API (不安全)」
5. 點擊「允許」

## 步驟 4: 部署為 Web 應用程式

1. 點擊右上角的「部署」→「新增部署作業」
2. 點擊「類型」旁的齒輪圖示，選擇「網路應用程式」
3. 設定如下：
   - **說明**: YouTube影片分析API v1
   - **執行身分**: 我
   - **存取權限**: 任何人
4. 點擊「部署」
5. 複製「網路應用程式」網址，這就是你的 API 端點

## 步驟 5: 測試 API

使用以下網址測試你的 API：

```
[你的網路應用程式網址]?action=getData&limit=5
```

應該會返回 JSON 格式的影片資料。

## API 端點說明

### 獲取影片資料
```
GET [API_URL]?action=getData&page=1&limit=20&sortBy=viewCount&sortOrder=desc
```

### 獲取趨勢資料
```
GET [API_URL]?action=getTrends
```

### 獲取熱門 Hashtag
```
GET [API_URL]?action=getHashtags
```

### 獲取熱門頻道
```
GET [API_URL]?action=getChannels
```

### 篩選參數
- `startDate`: 開始日期 (YYYY-MM-DD)
- `endDate`: 結束日期 (YYYY-MM-DD)
- `region`: 地區代碼 (例如: TW)
- `type`: 類型 (例如: videos)
- `channel`: 頻道名稱 (部分匹配)
- `hashtag`: Hashtag (部分匹配)
- `minViews`: 最小觀看次數

## 注意事項

1. Google Apps Script 有執行時間限制 (6分鐘)
2. 每日配額限制，大量請求可能會被限制
3. 如果資料量很大，建議實作快取機制
4. 定期備份你的 Google Apps Script 程式碼

