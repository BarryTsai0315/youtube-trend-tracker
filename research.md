# YouTube 分析網站技術架構研究報告

## 概述

這份研究報告針對 YouTube 分析網站的五個關鍵技術領域進行深入分析，該網站需要整合 Google Sheets 作為數據源，並提供 React 前端的資料視覺化功能。

---

## 1. Google Apps Script 最佳實踐

### **決策：使用 `text/plain` Content-Type 解決 CORS 問題**

#### 理由
Google Apps Script Web App 與 React 前端的 CORS 問題是最大技術障礙。傳統的 `application/json` 會觸發瀏覽器的 preflight OPTIONS 請求，但 GAS 不支援 OPTIONS 方法，導致 405 錯誤。

#### 推薦方案
```javascript
// React 前端
fetch('https://script.google.com/macros/s/your-id/exec', {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain;charset=utf-8',
  },
  body: JSON.stringify(yourData),
});

// GAS 後端
function doPost(e) {
  const input = JSON.parse(e.postData.contents);
  const output = {
    message: 'Success!',
    data: processYouTubeData(input)
  };

  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}
```

#### 替代方案考慮
- **僅使用 GET 方法**：GET 不會產生 CORS 錯誤，但限制數據傳輸量
- **設置 CORS 標頭**：複雜且不穩定，不推薦
- **代理服務器**：增加架構複雜度

#### 實作重點
1. 部署 GAS 時設定權限為「任何人」
2. 實作完整的錯誤處理機制
3. 使用 ContentService 返回 JSON 格式
4. 腳本錯誤會偽裝成 CORS 錯誤，務必確保代碼無誤

---

## 2. React 圖表庫比較分析

### **決策：根據使用情境分層選擇**

#### 大型數據集 (10k+ 項目)：**D3.js**
- **性能**：直接 DOM 操作，處理大數據集最佳
- **自訂度**：完全控制視覺化元素
- **學習曲線**：最陡峭，需要專業開發

#### 中等數據集 + 快速開發：**Recharts**
- **性能**：利用 React Virtual DOM，中等數據集表現良好
- **開發效率**：最高，組件化設計
- **生態系統**：與 React 生態完美整合

#### 標準圖表需求：**Chart.js (react-chartjs-2)**
- **性能**：Canvas 渲染，平衡性能與易用性
- **移動端**：優秀的響應式支援
- **文檔**：最完整的文檔和社群支援

#### 實作建議
```javascript
// 分層策略
const chartStrategy = {
  dataSize: {
    small: 'recharts',      // < 1k 數據點
    medium: 'chart.js',     // 1k-10k 數據點
    large: 'd3.js'          // > 10k 數據點
  },
  chartType: {
    standard: 'chart.js',   // 標準圖表類型
    custom: 'd3.js',        // 自訂視覺化
    dashboard: 'recharts'   // 儀表板整合
  }
};
```

#### 套件大小考量
- **Recharts**: ~180KB (最輕量)
- **Chart.js**: ~240KB (中等)
- **D3.js**: ~300KB+ (最重，但功能最強)

---

## 3. 中文文本分詞解決方案

### **決策：jieba-wasm-html + wordcloud2.js**

#### 理由
YouTube 影片標題的中文分詞需要在前端執行，避免敏感數據傳輸。WebAssembly 版本提供最佳性能。

#### 推薦技術棧
```javascript
// 1. 安裝依賴
npm install jieba-js wordcloud

// 2. 中文分詞
import jieba from 'jieba-js';

const segmentChineseText = (text) => {
  return jieba.cut(text, true); // true 為精確模式
};

// 3. 詞頻統計
const generateWordFrequency = (segments) => {
  const freq = {};
  segments.forEach(word => {
    if (word.length > 1) { // 過濾單字
      freq[word] = (freq[word] || 0) + 1;
    }
  });
  return Object.entries(freq).map(([word, count]) => [word, count]);
};

// 4. 生成詞雲
import WordCloud from 'wordcloud';

WordCloud(document.getElementById('wordcloud'), {
  list: wordFrequencyList,
  gridSize: Math.round(16 * $('#wordcloud').width() / 1024),
  weightFactor: 2,
  fontFamily: 'Times, serif',
  color: 'random-dark',
  backgroundColor: '#f0f0f0'
});
```

#### 替代方案
- **nodejieba**：Node.js 環境，需要後端處理
- **純前端正則**：精確度不足
- **在線 API**：數據隱私問題

#### 實作重點
1. 使用停用詞過濾（的、了、在等）
2. 實作詞長過濾（避免單字干擾）
3. 字體設定支援中文顯示
4. 響應式尺寸調整

---

## 4. Google Sheets API 限制與優化

### **決策：批次操作 + 指數退避 + 本地快取**

#### 當前配額限制 (2024)
- **讀取請求**：300次/分鐘/專案
- **用戶請求**：60次/分鐘/用戶/專案
- **每日請求**：無限制
- **有效載荷**：最大 2MB

#### 優化策略

##### 1. 批次操作實作
```javascript
// 批次讀取多個範圍
const batchGet = async (spreadsheetId, ranges) => {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
      valueRenderOption: 'UNFORMATTED_VALUE'
    });
    return response.result.valueRanges;
  } catch (error) {
    if (error.status === 429) {
      await exponentialBackoff();
      return batchGet(spreadsheetId, ranges);
    }
    throw error;
  }
};
```

##### 2. 指數退避機制
```javascript
const exponentialBackoff = async (attempt = 1) => {
  const delay = Math.min(1000 * Math.pow(2, attempt), 32000);
  await new Promise(resolve => setTimeout(resolve, delay));
};
```

##### 3. 智能快取策略
```javascript
class SheetsCache {
  constructor(ttl = 300000) { // 5分鐘TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  async get(key, fetcher) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}
```

#### 監控與最佳化
1. 使用 Google Cloud Console 監控 API 使用量
2. 實作請求計數器避免超額
3. 考慮付費提升配額（企業級需求）

---

## 5. 響應式數據視覺化最佳實踐

### **決策：移動優先 + 漸進增強設計**

#### 核心設計原則

##### 1. 觸控友好的互動設計
```css
/* 移動端按鈕最小尺寸 */
.chart-control {
  min-width: 44px;
  min-height: 44px;
  margin: 8px;
  touch-action: manipulation;
}

/* 響應式字體 */
.chart-text {
  font-size: clamp(12px, 2.5vw, 16px);
}
```

##### 2. 彈性網格系統
```javascript
// 響應式圖表容器
const ChartContainer = ({ children }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('chart-container');
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: Math.min(container.offsetWidth * 0.6, 400) // 維持比例
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div id="chart-container" style={{ width: '100%', height: dimensions.height }}>
      {React.cloneElement(children, dimensions)}
    </div>
  );
};
```

##### 3. 資訊密度管理
```javascript
// 根據螢幕大小調整顯示數據
const getDataDensity = (screenWidth) => {
  if (screenWidth < 768) return 'minimal';   // 手機：僅核心數據
  if (screenWidth < 1024) return 'moderate'; // 平板：中等數據
  return 'full';                             // 桌面：完整數據
};

const filterDataByDensity = (data, density) => {
  switch (density) {
    case 'minimal': return data.slice(0, 5);
    case 'moderate': return data.slice(0, 10);
    default: return data;
  }
};
```

##### 4. 漸進式載入
```javascript
// 圖表懶載入
const LazyChart = ({ data }) => {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={chartRef}>
      {isVisible ? <Chart data={data} /> : <ChartSkeleton />}
    </div>
  );
};
```

#### 移動端特殊考量
1. **手勢支援**：縮放、平移、滑動
2. **載入優化**：骨架屏、漸進載入
3. **網路適應**：離線支援、數據壓縮
4. **性能監控**：FCP、LCP 指標追蹤

---

## 總結與建議

### 技術棧推薦
```
前端架構：React + TypeScript
圖表庫：分層選擇 (Recharts/Chart.js/D3.js)
中文處理：jieba-wasm-html + wordcloud2.js
後端：Google Apps Script (text/plain CORS 解決方案)
數據源：Google Sheets API (批次 + 快取優化)
樣式：CSS-in-JS + 響應式設計
```

### 實作優先級
1. **第一階段**：基礎 CORS 解決方案 + Recharts 圖表
2. **第二階段**：中文分詞 + 詞雲功能
3. **第三階段**：API 優化 + 快取機制
4. **第四階段**：移動端優化 + 性能調優

### 風險控制
- **API 配額**：實作監控與退避機制
- **性能瓶頸**：數據分頁與懶載入
- **瀏覽器兼容**：現代瀏覽器特性檢測
- **數據安全**：前端敏感數據最小化

這個技術方案平衡了開發效率、性能需求和維護成本，符合 "好品味" 的簡潔實用原則。