# 資料模型設計

**專案**: YouTube 影片流量分析網站
**日期**: 2025-09-18

## 核心實體定義

### 1. Video (影片)

**描述**: 代表 YouTube 影片及其效能指標

**欄位**:
```typescript
interface Video {
  id: string;                    // 影片 ID
  title: string;                 // 影片標題
  description?: string;          // 影片描述
  channelId: string;            // 頻道 ID
  channelName: string;          // 頻道名稱
  publishedAt: Date;            // 發布時間
  thumbnailUrl: string;         // 縮圖 URL
  duration: number;             // 影片長度（秒）
  viewCount: number;            // 觀看次數
  likeCount: number;            // 按讚數
  commentCount: number;         // 留言數
  tags: string[];               // 標籤陣列
  category: VideoCategory;      // 影片類別
  region?: string;              // 地區
  language?: string;            // 語言
  createdAt: Date;              // 記錄建立時間
  updatedAt: Date;              // 記錄更新時間
}
```

**驗證規則**:
- `id`: 必填，唯一
- `title`: 必填，最大 100 字元
- `channelId`: 必填
- `channelName`: 必填
- `publishedAt`: 必填，不可為未來時間
- `viewCount`: 非負整數，預設 0
- `likeCount`: 非負整數，預設 0
- `commentCount`: 非負整數，預設 0

**狀態轉換**:
- 建立 → 啟用
- 啟用 → 停用（影片被刪除）
- 啟用 → 更新（指標更新）

### 2. Channel (頻道)

**描述**: 代表 YouTube 頻道及其統計資料

**欄位**:
```typescript
interface Channel {
  id: string;                   // 頻道 ID
  name: string;                 // 頻道名稱
  description?: string;         // 頻道描述
  thumbnailUrl?: string;        // 頻道頭像 URL
  subscriberCount: number;      // 訂閱者數量
  totalViews: number;          // 總觀看數
  videoCount: number;          // 影片數量
  country?: string;            // 國家
  customUrl?: string;          // 自訂 URL
  createdAt: Date;             // 記錄建立時間
  updatedAt: Date;             // 記錄更新時間
}
```

**驗證規則**:
- `id`: 必填，唯一
- `name`: 必填，最大 50 字元
- `subscriberCount`: 非負整數，預設 0
- `totalViews`: 非負整數，預設 0
- `videoCount`: 非負整數，預設 0

### 3. Hashtag (標籤)

**描述**: 代表熱門標籤及其使用統計

**欄位**:
```typescript
interface Hashtag {
  id: string;                   // 標籤 ID
  name: string;                 // 標籤名稱
  usageCount: number;           // 使用次數
  totalViews: number;           // 相關影片總觀看數
  avgViews: number;             // 平均觀看數
  firstUsed: Date;              // 首次使用時間
  lastUsed: Date;               // 最後使用時間
  lifecycle: HashtagLifecycle; // 生命週期階段
  trendScore: number;           // 趨勢分數 (0-100)
  relatedVideos: string[];      // 相關影片 ID 陣列
  createdAt: Date;              // 記錄建立時間
  updatedAt: Date;              // 記錄更新時間
}

enum HashtagLifecycle {
  EMERGING = 'emerging',        // 新興
  TRENDING = 'trending',        // 熱門
  STABLE = 'stable',           // 穩定
  DECLINING = 'declining'       // 衰退
}
```

**驗證規則**:
- `name`: 必填，唯一，最大 50 字元
- `usageCount`: 正整數
- `trendScore`: 0-100 之間的數值
- `firstUsed`: 不可為未來時間
- `lastUsed`: 不可早於 `firstUsed`

### 4. Trend (趨勢)

**描述**: 代表時間序列的趨勢資料

**欄位**:
```typescript
interface Trend {
  id: string;                   // 趨勢 ID
  entityType: TrendEntityType;  // 實體類型
  entityId: string;             // 實體 ID
  metric: TrendMetric;          // 指標類型
  value: number;                // 指標值
  date: Date;                   // 日期
  periodType: PeriodType;       // 時間周期類型
  growthRate?: number;          // 成長率 (%)
  rank?: number;                // 排名
  createdAt: Date;              // 記錄建立時間
}

enum TrendEntityType {
  VIDEO = 'video',
  CHANNEL = 'channel',
  HASHTAG = 'hashtag'
}

enum TrendMetric {
  VIEWS = 'views',
  LIKES = 'likes',
  COMMENTS = 'comments',
  SUBSCRIBERS = 'subscribers',
  USAGE_COUNT = 'usage_count'
}

enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}
```

**驗證規則**:
- `entityId`: 必填，必須對應有效的實體
- `value`: 非負數值
- `date`: 必填
- `growthRate`: -100 到 1000 之間

### 5. EngagementMetric (互動指標)

**描述**: 代表影片的互動率計算結果

**欄位**:
```typescript
interface EngagementMetric {
  id: string;                   // 指標 ID
  videoId: string;              // 影片 ID
  likeRate: number;             // 按讚率 (likes/views)
  commentRate: number;          // 留言率 (comments/views)
  engagementRate: number;       // 總互動率
  viralCoefficient: number;     // 病毒係數
  growthVelocity: number;       // 成長速度
  growthAcceleration: number;   // 成長加速度
  peakDate?: Date;              // 峰值日期
  calculatedAt: Date;           // 計算時間
  createdAt: Date;              // 記錄建立時間
}
```

**驗證規則**:
- `videoId`: 必填，必須對應有效的影片
- `likeRate`: 0-1 之間的小數
- `commentRate`: 0-1 之間的小數
- `engagementRate`: 0-1 之間的小數
- `viralCoefficient`: 非負數值

### 6. ContentTheme (內容主題)

**描述**: 代表內容主題分類及其趨勢

**欄位**:
```typescript
interface ContentTheme {
  id: string;                   // 主題 ID
  name: string;                 // 主題名稱
  description?: string;         // 主題描述
  category: ThemeCategory;      // 主題類別
  keywords: string[];           // 關鍵字陣列
  videoCount: number;           // 相關影片數量
  totalViews: number;           // 總觀看數
  avgEngagement: number;        // 平均互動率
  seasonalPattern: SeasonalPattern; // 季節性模式
  trendDirection: TrendDirection;   // 趨勢方向
  lastAnalyzed: Date;           // 最後分析時間
  createdAt: Date;              // 記錄建立時間
  updatedAt: Date;              // 記錄更新時間
}

enum ThemeCategory {
  TECHNOLOGY = 'technology',    // 科技
  LIFESTYLE = 'lifestyle',     // 生活
  ENTERTAINMENT = 'entertainment', // 娛樂
  EDUCATION = 'education',      // 教育
  GAMING = 'gaming',           // 遊戲
  MUSIC = 'music',             // 音樂
  SPORTS = 'sports',           // 運動
  NEWS = 'news'                // 新聞
}

enum SeasonalPattern {
  NONE = 'none',               // 無明顯模式
  WEEKLY = 'weekly',           // 週循環
  MONTHLY = 'monthly',         // 月循環
  SEASONAL = 'seasonal'        // 季節循環
}

enum TrendDirection {
  RISING = 'rising',           // 上升
  STABLE = 'stable',           // 穩定
  DECLINING = 'declining'      // 下降
}
```

**驗證規則**:
- `name`: 必填，唯一，最大 50 字元
- `keywords`: 至少一個關鍵字
- `videoCount`: 非負整數
- `avgEngagement`: 0-1 之間的小數

## 實體關係

### 主要關係
1. **Video** ↔ **Channel**: 多對一（一個頻道有多支影片）
2. **Video** ↔ **Hashtag**: 多對多（影片可有多個標籤，標籤可屬於多支影片）
3. **Video** → **EngagementMetric**: 一對一（每支影片有一個互動指標）
4. **Video** ↔ **ContentTheme**: 多對多（影片可屬於多個主題）
5. **Trend** → **Video/Channel/Hashtag**: 多對一（實體可有多個趨勢記錄）

### 索引策略
```sql
-- 主要查詢索引
CREATE INDEX idx_video_channel ON Video(channelId);
CREATE INDEX idx_video_published ON Video(publishedAt);
CREATE INDEX idx_video_views ON Video(viewCount);
CREATE INDEX idx_trend_entity ON Trend(entityType, entityId);
CREATE INDEX idx_trend_date ON Trend(date);
CREATE INDEX idx_hashtag_usage ON Hashtag(usageCount);
```

## 資料完整性規則

### 業務規則
1. **影片發布時間**：不可為未來時間
2. **指標一致性**：互動指標必須基於最新的影片數據計算
3. **標籤生命週期**：根據使用頻率和時間自動更新
4. **趨勢計算**：每日批次計算，確保資料時效性

### 清理策略
1. **過期趨勢資料**：保留 1 年，超過的資料歸檔
2. **無效標籤**：超過 90 天未使用的標籤標記為無效
3. **孤立記錄**：定期清理沒有關聯影片的指標資料

這個資料模型設計支援所有功能需求，提供了完整的資料追蹤和分析能力，同時考慮了效能和維護性。