# YouTube 熱門影片追蹤系統 - 開發進度

## 🎯 系統狀態

### ✅ 已完成的重大功能
- [x] 實現雙步驟 API 查詢機制 (Search.list + Videos.list)
- [x] 趨勢分析參數：按讚數、留言數、影片長度歷史追蹤
- [x] 排名系統：依地區和類型分開排名（美國影片 1,2,3...）
- [x] 智能 Shorts 判斷：基於實際影片長度（≤60秒）而非 hashtag
- [x] 新手友好設計：setupSystem() 一鍵初始化
- [x] 代碼清理：刪除無用測試函數，從 1000+ 行精簡為 ~800 行
- [x] 常量管理：系統參數和預設值分類管理
- [x] 創建 hashtag 提取函數支援中英文

### 📊 當前系統規格
- **追蹤地區**: 美國、印度、台灣
- **影片類型**: 一般影片（所有長度）+ Shorts 短影片（≤60秒）
- **排名數量**: 每個地區類型前 20 名
- **搜尋範圍**: 過去 5 天發佈的影片
- **數據收集**: 觀看數、按讚數、留言數歷史追蹤

### 🔄 進行中
- [x] 更新所有 *.md 文檔反映新功能

### 📋 未來改進計劃
- [ ] 監控 API 配額使用情況和優化
- [ ] 建立更完善的 API 錯誤處理機制
- [ ] 考慮實現快取機制減少重複調用
- [ ] 增加數據分析和可視化功能

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
    // 缺少：tags, 完整 description, statistics, contentDetails
  }
}
```

### Videos.list 回傳資料（完整版）
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
  },
  contentDetails: {
    duration: "PT4M13S"     // ✅ 影片長度（4分13秒）
  }
}
```

### Google Sheet 數據結構（16 欄）
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

## 📈 趨勢分析功能 ✅ 已實現

### 🎯 成果：完整的影片數據分析能力

#### 🏆 已實現的趨勢分析參數

**1. 排名系統**
```javascript
rank: 1, 2, 3...  // 依地區和類型分開排名
```
- **功能**: 美國影片第1名、印度Shorts第5名等
- **更新**: 每日追蹤時自動更新排名

**2. 互動指標歷史追蹤**
```javascript
likeHistory: "678,690,702,715",     // 按讚數變化
commentHistory: "90,95,98,105"      // 留言數變化
```
- **功能**: 追蹤每日變化，計算增長率和趨勢
- **格式**: 逗號分隔的歷史數值

**3. 影片長度智能判斷**
```javascript
durationSeconds: 253  // 4分13秒 = 253秒
```
- **功能**:
  - 自動解析 YouTube API 的 PT4M13S 格式
  - 用於智能判斷真正的 Shorts（≤60秒）
  - 提供長度分析數據

**4. 智能 Shorts 分類**
- **一般影片**: 保留所有長度的影片，不限制
- **Shorts 短影片**: 只保留 ≤60秒 的真正短影片
- **消除誤判**: 不再依賴不準確的 #shorts hashtag

#### 📊 數據收集邏輯

**API 調用**
```javascript
YouTube.Videos.list('snippet,statistics,contentDetails', { id: videoIds.join(',') })
```

**完整數據追蹤**
- 觀看數歷史：`viewHistory`
- 按讚數歷史：`likeHistory`
- 留言數歷史：`commentHistory`
- 影片長度：`durationSeconds`
- 排名變化：`rank`

#### ✅ 系統優勢
- **零配額增加**: 使用現有 API 調用
- **向後兼容**: 不影響現有功能
- **數據豐富**: 提供完整的趨勢分析基礎
- **智能過濾**: 基於實際數據而非標籤

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