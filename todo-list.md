# YouTube API 影片資料調閱 - 控管文件

## 🎯 核心任務

### ✅ 已完成
- [x] 實現雙步驟 API 查詢機制 (Search.list + Videos.list)
- [x] 加入 hashtags 欄位到 Google Sheet 追蹤系統
- [x] 修改空 query 邏輯，使用地區配置作為救場機制
- [x] 創建 hashtag 提取函數支援中英文

### 🔄 進行中
- [ ] 文件化 API 調用流程和最佳實務

### 📋 待辦事項
- [ ] 加入趨勢分析參數 (likeCount, commentCount, duration, categoryId)
- [ ] 更新 API 調用從 'snippet,statistics' 到 'snippet,statistics,contentDetails'
- [ ] 監控 API 配額使用情況
- [ ] 建立 API 錯誤處理機制
- [ ] 考慮實現快取機制減少重複調用

---

## 📊 YouTube API 調用流程

### 第一步：Search.list (搜尋影片)
**目的：** 根據關鍵字搜尋符合條件的影片
**輸入：** 搜尋關鍵字、地區、時間範圍
**輸出：** 影片 ID 列表 + 基本資訊
**配額消耗：** 1 單位

```javascript
YouTube.Search.list('snippet', {
  q: query,
  maxResults: 50,
  order: 'viewCount',
  regionCode: regionCode,
  type: 'video'
})
```

### 第二步：Videos.list (取得詳細資料)
**目的：** 批量取得影片的完整詳細資訊
**輸入：** 影片 ID 列表 (最多 50 個)
**輸出：** 完整影片資料 (觀看數、標籤、描述、hashtags)
**配額消耗：** 1 單位

```javascript
YouTube.Videos.list('snippet,statistics', {
  id: 'videoId1,videoId2,videoId3,...'  // 批量查詢
})
```

---

## ⚡ 性能分析

### 當前配額使用量
- **每日追蹤次數：** 6 次 (3地區 × 2類型)
- **每次 API 調用：** 2 次 (Search + Videos)
- **每日總配額：** 12 單位
- **YouTube 免費限額：** 10,000 單位/天
- **使用率：** 0.12%

### 批量處理效率
- **單次 Videos.list：** 最多查詢 50 個影片
- **避免逐個調用：** 從 50 次減少到 1 次
- **配額節省：** 98% 效率提升

---

## 🔍 資料結構說明

### Search.list 回傳資料
```javascript
{
  id: { videoId: "abc123" },
  snippet: {
    title: "基本標題",
    description: "可能被截斷的描述...",
    channelTitle: "頻道名稱",
    publishedAt: "2025-09-16T..."
    // 缺少：tags, 完整 description, statistics
  }
}
```

### Videos.list 回傳資料
```javascript
{
  id: "abc123",
  snippet: {
    title: "完整標題",
    description: "完整描述包含所有 #hashtags...",
    tags: ["ai", "music", "generated"],  // ✅ 創作者標籤
    channelTitle: "頻道名稱"
  },
  statistics: {
    viewCount: "12345",     // ✅ 觀看數
    likeCount: "678",       // ✅ 按讚數
    commentCount: "90"      // ✅ 留言數
  }
}
```

---

## 🛠️ 實現細節

### getVideoDetails() 函數流程
1. **提取 video ID：** 從 Search 結果中提取所有 videoId
2. **過濾空值：** 移除無效的 ID
3. **批量查詢：** 將 ID 用逗號連接，一次查詢最多 50 個
4. **資料處理：** 提取 hashtags，整理成標準格式
5. **排序輸出：** 按觀看數排序

### hashtags 處理機制
- **來源：** snippet.description + snippet.title
- **提取：** 正則表達式 `/#[\w\u4e00-\u9fff]+/g`
- **格式：** 陣列形式在 API，逗號分隔在 Google Sheet
- **支援：** 中英文 hashtag

---

## ⚠️ 注意事項

### API 限制
- **Videos.list 必須提供 video ID**，無法用關鍵字搜尋
- **批量查詢上限：** 一次最多 50 個 ID
- **搜尋結果可能包含無效 ID**，需要過濾處理

### 錯誤處理
- **空結果檢查：** 搜尋無結果時跳過 Videos.list 調用
- **ID 驗證：** 過濾掉空或無效的 video ID
- **API 錯誤：** 統一錯誤回應格式

### 向後兼容
- **現有 API 格式保持不變**
- **Google Sheet 新增 hashtags 欄位在最後**
- **不影響現有索引和函數**

---

## 📈 趨勢分析參數規劃

### 🎯 目標：增強影片數據分析能力

#### 當前已有的數據
- `viewCount`: 觀看數 - 核心流量指標
- `tags`: 創作者標籤 - 內容分類
- `hashtags`: 提取的 hashtag - 趨勢標籤
- `publishedAt`: 發佈時間 - 時間序列分析

#### 📊 計劃新增的趨勢分析參數

**1. 互動指標 (statistics 部分)**
```javascript
likeCount: parseInt(video.statistics.likeCount) || 0,        // 按讚數
commentCount: parseInt(video.statistics.commentCount) || 0,  // 留言數
```
- **用途**: 計算參與率 `(likes + comments) / views`
- **趨勢分析**: AI 內容的互動模式
- **配額成本**: 無額外成本 (已在 statistics 中)

**2. 內容特徵 (contentDetails 部分)**
```javascript
duration: video.contentDetails?.duration || '',             // 影片長度 (PT4M13S 格式)
definition: video.contentDetails?.definition || '',         // 畫質 (sd/hd)
```
- **用途**: 分析內容長度趨勢，品質 vs 表現關係
- **趨勢分析**: 短影片 vs 長影片表現
- **配額成本**: 無額外成本 (contentDetails 為基本資料)

**3. 分類資訊 (snippet 部分)**
```javascript
categoryId: video.snippet.categoryId || '',                 // YouTube 分類 ID
defaultLanguage: video.snippet.defaultLanguage || ''        // 主要語言
```
- **用途**: 內容分類分析，多語言市場分析
- **趨勢分析**: 哪些分類的 AI 內容最受歡迎
- **配額成本**: 無額外成本 (已在 snippet 中)

#### 🔧 技術實現計劃

**1. API 調用修改**
```javascript
// 從這個
YouTube.Videos.list('snippet,statistics', { id: videoIds.join(',') })

// 改為這個
YouTube.Videos.list('snippet,statistics,contentDetails', { id: videoIds.join(',') })
```

**2. 回應物件擴展**
```javascript
// 現有的回應物件會增加這些欄位
{
  // ... 現有欄位
  likeCount: 678,
  commentCount: 90,
  duration: "PT4M13S",
  definition: "hd",
  categoryId: "28",
  defaultLanguage: "zh-Hant"
}
```

**3. Google Sheet 考量**
- **選項 A**: 保持現狀，新參數只在 API 回應中
- **選項 B**: 選擇性加入重要參數到 Google Sheet (如 likeCount, duration)
- **建議**: 先實現選項 A，後續根據需求考慮 Sheet 擴展

#### 📋 實施步驟
1. [ ] 更新 `getVideoDetails()` 函數的 API 調用
2. [ ] 加入新的資料欄位到回應物件
3. [ ] 測試 API 調用和資料完整性
4. [ ] 更新文件記錄新的資料結構
5. [ ] 考慮 Google Sheet 欄位擴展 (可選)

#### ⚠️ 風險評估
- **配額影響**: 無 (contentDetails 不增加配額消耗)
- **向後兼容**: ✅ 只增加欄位，不影響現有功能
- **資料大小**: 輕微增加，但在可接受範圍內

---

## 📈 優化建議

### 短期優化
- [ ] 加入 API 調用重試機制
- [ ] 實現錯誤日誌記錄
- [ ] 監控配額使用趨勢

### 長期優化
- [ ] 考慮本地快取減少重複查詢
- [ ] 實現增量更新機制
- [ ] 分析 hashtags 趨勢數據

---

## 🔗 相關文件
- [YouTube Data API v3 - Search](https://developers.google.com/youtube/v3/docs/search/list)
- [YouTube Data API v3 - Videos](https://developers.google.com/youtube/v3/docs/videos/list)
- [配額計算和限制](https://developers.google.com/youtube/v3/getting-started#quota)

---

**最後更新：** 2025-09-16
**維護者：** AI Assistant (Claude)
**版本：** 1.1 - 加入趨勢分析參數規劃