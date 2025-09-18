# 任務清單：YouTube 影片流量分析網站

**輸入**: 設計文件來自 `/specs/001-youtube-google-sheet/`
**前提條件**: plan.md (必需), research.md, data-model.md, contracts/

## 執行流程

```text
1. 從功能目錄載入 plan.md
   → 已載入：技術堆疊、程式庫、結構決策
2. 載入可選設計文件
   → data-model.md: 提取實體 → 模型任務
   → contracts/: 每個檔案 → 合約測試任務
   → research.md: 提取決策 → 設定任務
3. 依類別產生任務
   → 設定：專案初始化、依賴關係、代碼規範
   → 測試：合約測試、整合測試
   → 核心：模型、服務、API 端點
   → 整合：Google Sheets 連接、中介軟體、日誌
   → 完善：單元測試、效能、文件
4. 應用任務規則
   → 不同檔案 = 標記 [P] 平行執行
   → 相同檔案 = 順序執行（無 [P]）
   → 測試優先於實作（TDD）
5. 依序編號任務（T001, T002...）
6. 產生依賴關係圖
7. 建立平行執行範例
8. 驗證任務完整性
   → 所有合約都有測試？
   → 所有實體都有模型？
   → 所有端點都已實作？
9. 回傳：成功（任務準備執行）
```

## 格式：`[ID] [P?] 描述`
- **[P]**: 可平行執行（不同檔案，無依賴關係）
- 在描述中包含確切的檔案路徑

## 路徑慣例
- **網頁應用程式**: `backend/src/`, `frontend/src/`
- 根據 plan.md 結構調整路徑

## 階段 3.1: 環境設定

- [ ] **T001** 建立專案結構（前端和後端分離架構）
- [ ] **T002** 初始化 React + TypeScript 前端專案並安裝依賴（React 18+, Tailwind CSS, shadcn/ui, Recharts）
- [ ] **T003** [P] 設定 Google Apps Script 後端專案結構
- [ ] **T004** [P] 配置前端開發工具（ESLint, Prettier, TypeScript 設定）
- [ ] **T005** [P] 設定前端測試環境（Jest, React Testing Library）

## 階段 3.2: 測試優先（TDD）⚠️ 必須在 3.3 前完成

**關鍵**：這些測試必須先寫好且必須失敗，才能開始任何實作

### Google Apps Script API 合約測試
- [ ] **T006** [P] /getData 端點合約測試 in `backend/tests/contract/test_getData.js`
- [ ] **T007** [P] /getTrends 端點合約測試 in `backend/tests/contract/test_getTrends.js`
- [ ] **T008** [P] /getHashtags 端點合約測試 in `backend/tests/contract/test_getHashtags.js`
- [ ] **T009** [P] /getChannels 端點合約測試 in `backend/tests/contract/test_getChannels.js`
- [ ] **T010** [P] /getWordCloud 端點合約測試 in `backend/tests/contract/test_getWordCloud.js`
- [ ] **T011** [P] /getEngagement 端點合約測試 in `backend/tests/contract/test_getEngagement.js`

### 前端整合測試
- [ ] **T012** [P] 影片分析儀表板載入測試 in `frontend/tests/integration/test_dashboard.test.tsx`
- [ ] **T013** [P] 趨勢圖表渲染測試 in `frontend/tests/integration/test_trends.test.tsx`
- [ ] **T014** [P] 標籤統計視覺化測試 in `frontend/tests/integration/test_hashtags.test.tsx`
- [ ] **T015** [P] 頻道比較功能測試 in `frontend/tests/integration/test_channels.test.tsx`
- [ ] **T016** [P] 文字雲產生測試 in `frontend/tests/integration/test_wordcloud.test.tsx`

## 階段 3.3: 核心實作（僅在測試失敗後）

### 資料模型與類型定義
- [ ] **T017** [P] Video 介面定義 in `frontend/src/types/Video.ts`
- [ ] **T018** [P] Channel 介面定義 in `frontend/src/types/Channel.ts`
- [ ] **T019** [P] Hashtag 介面定義 in `frontend/src/types/Hashtag.ts`
- [ ] **T020** [P] Trend 介面定義 in `frontend/src/types/Trend.ts`
- [ ] **T021** [P] EngagementMetric 介面定義 in `frontend/src/types/EngagementMetric.ts`
- [ ] **T022** [P] ContentTheme 介面定義 in `frontend/src/types/ContentTheme.ts`

### Google Apps Script 後端實作
- [ ] **T023** Google Sheets 連接服務 in `backend/src/services/SheetsService.js`
- [ ] **T024** 資料篩選和驗證工具 in `backend/src/utils/DataUtils.js`
- [ ] **T025** /getData 端點實作 in `backend/src/api/getData.js`
- [ ] **T026** /getTrends 端點實作 in `backend/src/api/getTrends.js`
- [ ] **T027** /getHashtags 端點實作 in `backend/src/api/getHashtags.js`
- [ ] **T028** /getChannels 端點實作 in `backend/src/api/getChannels.js`
- [ ] **T029** /getWordCloud 端點實作 in `backend/src/api/getWordCloud.js`
- [ ] **T030** /getEngagement 端點實作 in `backend/src/api/getEngagement.js`

### 前端服務層
- [ ] **T031** [P] API 呼叫服務 in `frontend/src/services/apiService.ts`
- [ ] **T032** [P] 資料快取服務 in `frontend/src/services/cacheService.ts`
- [ ] **T033** [P] 中文分詞服務 in `frontend/src/services/segmentationService.ts`
- [ ] **T034** [P] 圖表資料轉換工具 in `frontend/src/utils/chartUtils.ts`

### React 組件實作
- [ ] **T035** [P] 影片列表組件 in `frontend/src/components/VideoList.tsx`
- [ ] **T036** [P] 篩選器組件 in `frontend/src/components/FilterBar.tsx`
- [ ] **T037** [P] 統計卡片組件 in `frontend/src/components/StatsCard.tsx`
- [ ] **T038** [P] 趨勢圖表組件 in `frontend/src/components/TrendChart.tsx`
- [ ] **T039** [P] 標籤圓餅圖組件 in `frontend/src/components/HashtagChart.tsx`
- [ ] **T040** [P] 頻道排行組件 in `frontend/src/components/ChannelRanking.tsx`
- [ ] **T041** [P] 文字雲組件 in `frontend/src/components/WordCloud.tsx`

### 主要頁面
- [ ] **T042** 主要儀表板頁面 in `frontend/src/pages/Dashboard.tsx`
- [ ] **T043** 趨勢分析頁面 in `frontend/src/pages/TrendsAnalysis.tsx`
- [ ] **T044** 內容分析頁面 in `frontend/src/pages/ContentAnalysis.tsx`

## 階段 3.4: 整合功能

### 系統整合
- [ ] **T045** Google Apps Script 主要入口點整合 in `backend/src/main.js`
- [ ] **T046** 前端路由設定 in `frontend/src/App.tsx`
- [ ] **T047** CORS 和錯誤處理 in `backend/src/middleware/corsHandler.js`
- [ ] **T048** API 限流和重試機制 in `frontend/src/services/apiService.ts`

### 響應式設計和最佳化
- [ ] **T049** 行動裝置響應式佈局 in `frontend/src/styles/responsive.css`
- [ ] **T050** 圖表效能最佳化（大數據集處理）
- [ ] **T051** 資料載入狀態管理 in `frontend/src/hooks/useLoadingState.ts`
- [ ] **T052** 錯誤邊界組件 in `frontend/src/components/ErrorBoundary.tsx`

## 階段 3.5: 完善和最佳化

### 單元測試
- [ ] **T053** [P] apiService 單元測試 in `frontend/tests/unit/apiService.test.ts`
- [ ] **T054** [P] 資料轉換工具測試 in `frontend/tests/unit/chartUtils.test.ts`
- [ ] **T055** [P] 篩選邏輯測試 in `backend/tests/unit/DataUtils.test.js`
- [ ] **T056** [P] 中文分詞服務測試 in `frontend/tests/unit/segmentationService.test.ts`

### 效能和文件
- [ ] **T057** 效能測試（首次載入 < 3 秒，圖表渲染 < 1 秒）
- [ ] **T058** [P] API 使用文件更新 in `docs/api-usage.md`
- [ ] **T059** [P] 部署指南更新 in `docs/deployment.md`
- [ ] **T060** 程式碼重構和重複移除

### 最終驗證
- [ ] **T061** 執行完整的 quickstart.md 測試流程
- [ ] **T062** 跨瀏覽器相容性測試
- [ ] **T063** 無障礙功能測試（鍵盤導航、螢幕閱讀器）

## 依賴關係

**關鍵依賴**：
- 測試任務（T006-T016）必須在實作任務（T017-T044）之前
- 資料模型（T017-T022）阻塞服務層（T031-T034）
- 服務層阻塞組件實作（T035-T041）
- 組件實作阻塞頁面實作（T042-T044）
- 核心實作在整合功能（T045-T052）之前
- 所有實作在完善階段（T053-T063）之前

**具體阻塞**：
- T023 阻塞 T025-T030（API 端點依賴 Sheets 服務）
- T031 阻塞 T048（API 重試依賴 API 服務）
- T017-T022 阻塞 T031（API 服務需要類型定義）
- T035-T041 阻塞 T042-T044（頁面需要組件）

## 平行執行範例

### 第一批：合約測試（可同時執行）
```bash
# 同時啟動 T006-T011：
Task: "寫 /getData 端點合約測試 in backend/tests/contract/test_getData.js"
Task: "寫 /getTrends 端點合約測試 in backend/tests/contract/test_getTrends.js"
Task: "寫 /getHashtags 端點合約測試 in backend/tests/contract/test_getHashtags.js"
Task: "寫 /getChannels 端點合約測試 in backend/tests/contract/test_getChannels.js"
Task: "寫 /getWordCloud 端點合約測試 in backend/tests/contract/test_getWordCloud.js"
Task: "寫 /getEngagement 端點合約測試 in backend/tests/contract/test_getEngagement.js"
```

### 第二批：資料模型定義（可同時執行）
```bash
# 同時啟動 T017-T022：
Task: "定義 Video 介面 in frontend/src/types/Video.ts"
Task: "定義 Channel 介面 in frontend/src/types/Channel.ts"
Task: "定義 Hashtag 介面 in frontend/src/types/Hashtag.ts"
Task: "定義 Trend 介面 in frontend/src/types/Trend.ts"
Task: "定義 EngagementMetric 介面 in frontend/src/types/EngagementMetric.ts"
Task: "定義 ContentTheme 介面 in frontend/src/types/ContentTheme.ts"
```

### 第三批：React 組件（可同時執行）
```bash
# 同時啟動 T035-T041：
Task: "實作影片列表組件 in frontend/src/components/VideoList.tsx"
Task: "實作篩選器組件 in frontend/src/components/FilterBar.tsx"
Task: "實作統計卡片組件 in frontend/src/components/StatsCard.tsx"
Task: "實作趨勢圖表組件 in frontend/src/components/TrendChart.tsx"
Task: "實作標籤圓餅圖組件 in frontend/src/components/HashtagChart.tsx"
Task: "實作頻道排行組件 in frontend/src/components/ChannelRanking.tsx"
Task: "實作文字雲組件 in frontend/src/components/WordCloud.tsx"
```

## 注意事項

- **[P] 任務** = 不同檔案，無依賴關係
- **驗證測試失敗**才開始實作
- **每個任務後提交**程式碼
- **避免**：模糊任務、相同檔案衝突
- **技術要求**：遵循 TypeScript 嚴格模式、ESLint 規則、響應式設計原則

## 任務產生規則

*在 main() 執行期間應用*

1. **來自合約**：
   - 每個合約檔案 → 合約測試任務 [P]
   - 每個端點 → 實作任務

2. **來自資料模型**：
   - 每個實體 → 模型建立任務 [P]
   - 關係 → 服務層任務

3. **來自使用者故事**：
   - 每個故事 → 整合測試 [P]
   - 快速開始情境 → 驗證任務

4. **排序**：
   - 設定 → 測試 → 模型 → 服務 → 端點 → 完善
   - 依賴關係阻塞平行執行

## 驗證檢查清單

*在回傳前由 main() 檢查*

- [x] 所有合約都有對應測試
- [x] 所有實體都有模型任務
- [x] 所有測試都在實作之前
- [x] 平行任務真正獨立
- [x] 每個任務指定確切檔案路徑
- [x] 沒有任務修改與其他 [P] 任務相同的檔案

---

**總任務數**：63 個任務
**預估完成時間**：15-20 個工作日
**關鍵里程碑**：T016（測試完成）、T044（核心功能完成）、T052（整合完成）、T063（專案完成）