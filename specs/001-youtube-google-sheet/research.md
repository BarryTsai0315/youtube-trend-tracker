# 技術研究報告：YouTube 影片流量分析網站

**日期**: 2025-09-18
**專案**: YouTube 影片流量分析網站 (001-youtube-google-sheet)

## 1. Google Apps Script 最佳實踐

### 決策
使用 Google Apps Script 建立 Web 應用程式端點，搭配 JSON 回應和適當的 CORS 處理。

### 理由
- **原生整合**: 與 Google Sheets 無縫整合，無需額外認證
- **免費託管**: Google 提供免費的雲端執行環境
- **簡單部署**: 一鍵部署為 Web 應用程式
- **穩定性**: Google 基礎設施保證高可用性

### 考慮的替代方案
- **Node.js + Express**: 需要額外託管成本和 OAuth 設定
- **Python Flask**: 同樣需要託管和複雜的認證流程
- **純前端**: 無法處理 CORS 和 API 金鑰安全

### 實作要點
```javascript
// CORS 處理和錯誤管理
function doGet(e) {
  try {
    const result = processRequest(e.parameter);
    return createResponse(result);
  } catch (error) {
    return createErrorResponse(error.message);
  }
}

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.TEXT); // 避免 preflight
}
```

## 2. React 圖表庫比較

### 決策
採用分層策略：基礎圖表用 Recharts，複雜視覺化用 D3.js

### 理由
- **Recharts**: 易用性高，適合標準圖表，檔案大小適中 (200KB)
- **D3.js**: 處理大數據集 (10k+) 效能優異，客製化能力強
- **分層使用**: 根據需求複雜度選擇適當工具

### 考慮的替代方案
- **Chart.js**: 效能較差，大數據集時會卡頓
- **純 SVG**: 開發成本太高，維護困難
- **Plotly.js**: 檔案過大 (2MB+)，載入速度慢

### 實作要點
```typescript
// 數據量判斷策略
const ChartComponent = ({ data }) => {
  if (data.length > 5000) {
    return <D3Chart data={data} />; // 大數據集
  }
  return <RechartsChart data={data} />; // 一般數據集
};
```

## 3. 中文分詞技術

### 決策
使用 jieba-wasm 進行中文分詞，搭配 wordcloud2.js 產生文字雲

### 理由
- **前端執行**: 無需後端處理，減少 API 呼叫
- **高效能**: WebAssembly 實作，速度快
- **準確度高**: jieba 是成熟的中文分詞工具
- **客製化**: 可加入自定義詞典

### 考慮的替代方案
- **後端分詞**: 增加 API 複雜度和延遲
- **正則表達式**: 準確度不足，無法處理語義
- **其他 JS 庫**: 效能和準確度都不如 jieba

### 實作要點
```javascript
// 載入 jieba-wasm 和處理文字
import jieba from 'jieba-wasm';

async function generateWordCloud(titles) {
  await jieba.load();
  const words = titles.flatMap(title => jieba.cut(title));
  const wordFreq = calculateFrequency(words);
  return WordCloud(canvas, { list: wordFreq });
}
```

## 4. Google Sheets API 限制

### 決策
實作批次操作、指數退避重試和智能快取策略

### 理由
- **配額限制**: 每分鐘 300 次讀取請求
- **效能考量**: 批次操作減少 API 呼叫次數
- **用戶體驗**: 快取避免重複載入

### 考慮的替代方案
- **同步載入**: 會觸發限制，用戶體驗差
- **無快取**: 浪費配額，載入速度慢
- **純 JavaScript**: 無法處理認證和 CORS

### 實作要點
```javascript
// 批次操作和快取策略
class SheetsService {
  async getBatchData(ranges) {
    const cacheKey = ranges.join('|');
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const data = await this.batchGet(ranges);
    this.cache.set(cacheKey, data, 5 * 60 * 1000); // 5分鐘快取
    return data;
  }
}
```

## 5. 響應式設計模式

### 決策
採用移動優先設計，搭配漸進增強和適應性圖表佈局

### 理由
- **使用習慣**: 越來越多用戶用手機查看分析
- **觸控優化**: 大按鈕、滑動操作
- **效能考量**: 移動端優先載入核心功能

### 考慮的替代方案
- **桌面優先**: 移動端體驗差，載入慢
- **固定佈局**: 無法適應不同螢幕尺寸
- **純 RWD**: 缺乏互動優化

### 實作要點
```css
/* 移動優先的圖表容器 */
.chart-container {
  width: 100%;
  height: 300px;
  touch-action: pan-x pan-y;
}

@media (min-width: 768px) {
  .chart-container {
    height: 500px;
  }
}

/* 觸控友善的按鈕 */
.filter-button {
  min-height: 44px; /* iOS 建議最小觸控區域 */
  padding: 12px 16px;
}
```

## 技術架構總結

基於以上研究，建議的技術架構：

**前端技術棧**:
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Recharts (基礎圖表) + D3.js (複雜視覺化)
- jieba-wasm + wordcloud2.js (中文處理)

**後端技術棧**:
- Google Apps Script (Web 應用程式)
- Google Sheets API (資料來源)
- 快取策略 + 批次操作

**效能最佳化**:
- 分層圖表策略 (根據數據量選擇)
- API 配額管理 (批次 + 重試 + 快取)
- 響應式載入 (移動優先)

**開發原則**:
- 測試優先 (TDD)
- 模組化設計
- 漸進增強
- 無障礙優化

這個技術架構確保了系統的可擴展性、效能和使用者體驗，同時最小化了開發和維護成本。