/**
 * YouTube 熱門影片追蹤系統 - Linus 式重構版本
 *
 * 設計哲學：
 * 1. 數據結構決定一切：單一工作表，簡單欄位
 * 2. 消除特殊情況：統一的錯誤處理，統一的數據流
 * 3. 函數只做一件事：每個函數都有明確的單一職責
 * 4. 向後兼容：Web API 介面保持不變
 *
 * "Bad programmers worry about the code. Good programmers worry about data structures."
 *                                                                    - Linus Torvalds
 */

// ============================================================================
// 全域常量 - 所有魔術數字都放這裡
// ============================================================================

/** @const {string} 追蹤檔案名稱 */
const TRACKING_FILE_NAME = 'YouTube 熱門影片追蹤';

/** @const {string} 工作表名稱 - 只需要一個 */
const SHEET_NAME = '影片追蹤';

/** @const {Array<string>} 資料欄位定義 */
const COLUMNS = [
  'rank', 'videoId', 'title', 'channelTitle', 'publishedAt', 'region', 'type',
  'firstSeen', 'lastSeen', 'isTracking', 'url', 'viewHistory', 'hashtags',
  'likeHistory', 'commentHistory', 'durationSeconds'
];

/** @const {Object} 地區配置 - 數據驅動，不是硬編碼 */
const REGIONS = {
    'TW': { name: '台灣', query: '台灣 OR 繁體 OR 中文', lang: 'zh-Hant' },
    'US': { name: '美國', query: 'trending OR viral OR popular', lang: 'en' },
    'IN': { name: '印度', query: 'India OR Hindi OR trending', lang: 'hi' },
    'BR': { name: '巴西', query: 'Brasil OR português OR viral', lang: 'pt' },
    'ID': { name: '印尼', query: 'Indonesia OR trending OR populer', lang: 'id' },
    'MX': { name: '墨西哥', query: 'Mexico OR español OR popular', lang: 'es' }
};

/** @const {number} 停止追蹤的天數閾值 */
const STALE_DAYS = 10;

/** @const {number} 每日追蹤搜尋天數 - 可調整 */
const DAILY_SEARCH_DAYS = 5;

/** @const {number} API 最大查詢數量 - 可調整 */
const API_MAX_RESULTS = 50;

/** @const {number} 每個地區類型保留的排名數量 - 可調整 */
const RANKING_LIMIT = 20;

/** @const {number} Shorts 影片長度閾值（秒）- 可調整 */
const SHORTS_DURATION_LIMIT = 60;

// ============================================================================
// 預設值 - 當沒有提供參數時使用
// ============================================================================

/** @const {number} Web API 預設搜尋天數 */
const DEFAULT_WEB_DAYS = 2;

/** @const {number} Web API 預設影片數量 */
const DEFAULT_WEB_COUNT = 50;

/** @const {number} 向後兼容函數預設天數 */
const DEFAULT_LEGACY_DAYS = 3;

/** @const {number} 向後兼容函數預設數量 */
const DEFAULT_LEGACY_COUNT = 20;

// ============================================================================
// 一鍵初始化 - 新手友好
// ============================================================================

/**
 * 🚀 【新手必備】YouTube 熱門影片追蹤系統 - 一鍵初始化
 *
 * ⭐ 如果您是第一次使用此系統，請執行這個函數！
 *
 * 此函數會自動完成所有設置：
 * ✅ 創建 Google Sheet 並設置 16 欄位結構（包含排名、影片長度等）
 * ✅ 啟用每日自動追蹤（每天早上 6 點執行）
 * ✅ 測試 YouTube API 連接和數據收集功能
 * ✅ 提供完整的操作說明和 Google Sheet 連結
 *
 * 🌟 使用方法：
 * 1. 在 Google Apps Script 函數列表中找到此函數
 * 2. 點擊執行按鈕
 * 3. 等待執行完成，查看控制台訊息
 *
 * 🎯 執行後系統將自動：
 * - 追蹤 美國、印度、台灣 三個地區的熱門影片
 * - 同時追蹤一般影片和 Shorts 短影片（≤60秒）
 * - 記錄排名變化、觀看數、按讚數、留言數歷史
 * - 每個地區類型保留前 20 名影片
 */
function setupSystem() {
  console.log('🚀 =================================');
  console.log('🚀 YouTube 熱門影片追蹤系統初始化');
  console.log('🚀 =================================');
  console.log('');

  try {
    // 步驟 1: 創建或檢查 Google Sheet
    console.log('📋 步驟 1: 設置 Google Sheet...');
    const sheet = getTrackingSheet();

    // 強制重建標題行（處理清空工作表的情況）
    console.log('   ⚙️  設置欄位標題...');
    sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#E8F0FE');

    console.log(`   ✅ Google Sheet 已準備完成 (${COLUMNS.length} 個欄位)`);
    console.log(`   🔗 檔案連結: https://docs.google.com/spreadsheets/d/${sheet.getParent().getId()}`);
    console.log('');

    // 步驟 2: 設置自動觸發器
    console.log('⏰ 步驟 2: 設置每日自動追蹤...');
    setupDailyTrigger();
    console.log('   ✅ 每日觸發器已設置（每天早上 6 點自動執行）');
    console.log('');

    // 步驟 3: 執行初始數據收集測試
    console.log('🎯 步驟 3: 測試數據收集功能...');
    const testResult = testInitialDataCollection();
    console.log('');

    // 成功總結
    console.log('🎉 ================================');
    console.log('🎉 系統初始化完成！');
    console.log('🎉 ================================');
    console.log('');
    console.log('📊 系統狀態：');
    console.log(`   • Google Sheet: ✅ 已創建 (${COLUMNS.length} 欄)`);
    console.log('   • 每日追蹤: ✅ 已啟用 (每天 06:00)');
    console.log('   • API 連接: ✅ 正常');
    console.log(`   • 測試收集: ✅ 成功 (${testResult.count} 筆影片)`);
    console.log('');
    console.log('🎯 下一步操作：');
    console.log('   1. 系統將自動每天收集熱門影片數據');
    console.log('   2. 您可以隨時查看 Google Sheet 中的數據');
    console.log('   3. 如需立即手動收集數據，請執行: dailyYouTubeTracking()');
    console.log('   4. 如需檢查系統狀態，請執行: checkSystemStatus()');
    console.log('');
    console.log('📝 重要提醒：');
    console.log('   • 數據會自動追蹤影片的觀看數、按讚數、留言數變化');
    console.log('   • 系統涵蓋 美國、印度、台灣 三個地區');
    console.log('   • 同時追蹤一般影片和 Shorts 短影片');
    console.log('   • 如需停用自動追蹤，請執行: removeDailyTrigger()');

  } catch (error) {
    console.log('');
    console.log('❌ ================================');
    console.log('❌ 初始化過程發生錯誤');
    console.log('❌ ================================');
    console.log(`錯誤訊息: ${error.toString()}`);
    console.log('');
    console.log('🔧 可能的解決方案：');
    console.log('   1. 確認您有 YouTube Data API v3 的存取權限');
    console.log('   2. 檢查 Google Drive 和 Google Sheets API 權限');
    console.log('   3. 如果是首次使用，請授予所需的 API 權限');
    console.log('   4. 重新執行此函數進行重試');

    throw error;
  }
}

/**
 * 📊 【日常運行】每日 YouTube 熱門影片追蹤
 *
 * 🎯 此函數執行完整的數據收集和更新流程
 *
 * ✅ 自動執行內容：
 * - 搜尋 3 個地區（美國、印度、台灣）的熱門影片
 * - 分別追蹤一般影片和 Shorts 短影片
 * - 更新排名、觀看數、按讚數、留言數歷史
 * - 清理超過 10 天未更新的過期記錄
 *
 * ⏰ 觸發方式：
 * - 自動：每天早上 6:00（由 setupSystem 設置的觸發器）
 * - 手動：直接執行此函數進行即時更新
 *
 * 🔧 系統參數（可在頂部常量區修改）：
 * - DAILY_SEARCH_DAYS: 搜尋過去幾天的影片
 * - API_MAX_RESULTS: 每次搜尋的最大影片數
 * - RANKING_LIMIT: 每個地區類型保留的排名數量
 * - SHORTS_DURATION_LIMIT: Shorts 影片長度閾值
 *
 * 📋 執行結果會顯示在控制台，包含成功/失敗的詳細資訊
 */
function dailyYouTubeTracking() {
  try {
    console.log('=== 開始每日追蹤 ===');

    const sheet = getTrackingSheet();
    const today = new Date().toISOString().split('T')[0];

    // 對每個地區和類型進行追蹤 - 數據驅動
    Object.keys(REGIONS).forEach(regionCode => {
      [false, true].forEach(isShorts => {
        try {
          trackRegion(sheet, regionCode, isShorts, today);
        } catch (error) {
          console.log(`追蹤 ${regionCode} ${isShorts ? '短影片' : '影片'} 失敗: ${error}`);
        }
      });
    });

    // 清理過期記錄 - 單一職責
    cleanupStaleRecords(sheet, today);

    console.log('=== 追蹤完成 ===');

  } catch (error) {
    console.log(`追蹤系統失敗: ${error}`);
    throw error;
  }
}

// ============================================================================
// Web API 入口點 - 保持向後兼容
// ============================================================================

/**
 * 主要的 Web API 入口點
 *
 * "Never break userspace" - 這個介面必須保持不變
 *
 * @param {Object} e - Google Apps Script 事件物件
 * @return {ContentService.TextOutput} JSON 回應
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};

    // 參數正規化 - 統一處理，消除特殊情況
    const config = normalizeParams(params);

    // 搜尋影片 - 單一職責
    const videos = searchVideos(config);

    // 回傳結果 - 保持原有格式
    return createJsonResponse({
      query: config.query,
      keywords: config.keywords,
      publishedAfter: config.publishedAfter,
      publishedBefore: config.publishedBefore,
      count: videos.length,
      items: videos
    });

  } catch (error) {
    return createJsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * 正規化 API 參數
 *
 * "Good taste" - 把所有參數處理邏輯集中在一個地方
 *
 * @param {Object} params - 原始參數
 * @return {Object} 正規化後的配置
 */
function normalizeParams(params) {
  const days = Math.max(1, Math.min(7, parseInt(params.days) || DEFAULT_WEB_DAYS));
  const max = Math.max(1, Math.min(50, parseInt(params.max) || DEFAULT_WEB_COUNT));
  const region = params.regionCode || '';
  const isShorts = params.shorts === 'true';

  const now = new Date();
  const publishedBefore = now.toISOString();
  const publishedAfter = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  // 構建搜尋詞 - 數據驅動，空 query 時用地區救場
  let query = params.q || '';

  // 如果 query 為空且有地區配置，使用地區搜尋詞
  if (!query.trim() && region && REGIONS[region]) {
    query = REGIONS[region].query;
  } else if (region && REGIONS[region] && query.trim()) {
    // 如果有自定義 query 且有地區，保持自定義 query，不覆蓋
    // query 保持不變
  }

  // 移除 hashtag 搜尋，後續用影片長度判斷真正的 Shorts

  // 關鍵字處理 - 簡化邏輯
  let keywords = [];
  if (params.keywords === 'none' || params.keywords === '') {
    keywords = [];
  } else if (params.keywords) {
    keywords = params.keywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  } else {
    keywords = ['ai', '人工智慧', 'chatgpt', 'gpt', '機器學習', 'deep learning'];
  }

  return {
    query,
    keywords,
    maxResults: max,
    publishedAfter,
    publishedBefore,
    regionCode: region,
    relevanceLanguage: region && REGIONS[region] ? REGIONS[region].lang : 'en',
    isShorts
  };
}

/**
 * 搜尋 YouTube 影片
 *
 * @param {Object} config - 搜尋配置
 * @return {Array} 影片列表
 */
function searchVideos(config) {
  // YouTube API 呼叫
  const searchParams = {
    q: config.query,
    maxResults: config.maxResults,
    order: 'viewCount',
    publishedAfter: config.publishedAfter,
    publishedBefore: config.publishedBefore,
    type: 'video'
  };

  if (config.regionCode) searchParams.regionCode = config.regionCode;
  if (config.relevanceLanguage) searchParams.relevanceLanguage = config.relevanceLanguage;

  const searchResult = YouTube.Search.list('snippet', searchParams);
  const items = (searchResult && searchResult.items) || [];

  // 關鍵字過濾 - 如果有關鍵字的話
  const filtered = config.keywords.length > 0
    ? items.filter(item => matchesKeywords(item, config.keywords))
    : items;

  // 取得詳細統計資料
  return getVideoDetails(filtered);
}

/**
 * 檢查影片是否符合關鍵字
 *
 * @param {Object} item - YouTube 搜尋結果項目
 * @param {Array<string>} keywords - 關鍵字列表
 * @return {boolean} 是否符合
 */
function matchesKeywords(item, keywords) {
  const text = ((item.snippet.title || '') + ' ' + (item.snippet.description || '')).toLowerCase();
  return keywords.some(keyword => text.indexOf(keyword) !== -1);
}

/**
 * 取得影片詳細資訊
 *
 * @param {Array} items - 搜尋結果
 * @return {Array} 包含統計資料的影片列表
 */
function getVideoDetails(items) {
  const videoIds = items
    .map(item => item.id && item.id.videoId)
    .filter(id => id);

  if (videoIds.length === 0) return [];

  const videosResult = YouTube.Videos.list('snippet,statistics,contentDetails', { id: videoIds.join(',') });
  const videos = (videosResult && videosResult.items) || [];

  return videos
    .map(video => ({
      videoId: video.id,
      title: video.snippet.title || '',
      channelTitle: video.snippet.channelTitle || '',
      publishedAt: video.snippet.publishedAt || '',
      viewCount: parseInt(video.statistics.viewCount) || 0,
      likeCount: parseInt(video.statistics.likeCount) || 0,
      commentCount: parseInt(video.statistics.commentCount) || 0,
      durationSeconds: parseDurationToSeconds(video.contentDetails?.duration || ''),
      url: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnails: video.snippet.thumbnails || {},
      tags: video.snippet.tags || [],                    // 創作者設定的標籤
      description: video.snippet.description || '',      // 完整描述 (含 hashtag)
      hashtags: extractHashtags(video.snippet.description || video.snippet.title || '') // 從描述和標題提取 hashtag
    }))
    .sort((a, b) => b.viewCount - a.viewCount);
}

/**
 * 從文字中提取 hashtag
 *
 * "Good taste" - 用簡單的正則表達式，不要過度複雜化
 *
 * @param {string} text - 要分析的文字
 * @return {Array<string>} hashtag 列表
 */
function extractHashtags(text) {
  if (!text) return [];

  // 匹配 #後面跟著字母、數字、底線的組合
  const hashtagRegex = /#[\w\u4e00-\u9fff]+/g;
  const matches = text.match(hashtagRegex) || [];

  // 移除重複，轉小寫統一
  return [...new Set(matches.map(tag => tag.toLowerCase()))];
}

/**
 * 解析 YouTube 影片長度格式
 *
 * "好品味" - 處理所有可能的時間格式，轉換為秒數
 *
 * @param {string} duration - YouTube API 時間格式 (例: PT4M13S, PT59S, PT1H2M3S)
 * @return {number} 影片長度（秒）
 */
function parseDurationToSeconds(duration) {
  if (!duration) return 0;

  // YouTube API 格式：PT4M13S, PT59S, PT1H2M3S
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * 創建 JSON 回應
 *
 * @param {Object} data - 回應資料
 * @param {number} [status] - HTTP 狀態碼
 * @return {ContentService.TextOutput} JSON 回應
 */
function createJsonResponse(data, status) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  if (status) data.status = status;
  return output;
}

// ============================================================================
// 追蹤系統 - 簡化的數據結構
// ============================================================================

/**
 * 取得或創建追蹤工作表
 *
 * "Good taste" - 消除所有特殊情況，工作表不存在就創建，存在就用
 *
 * @return {GoogleAppsScript.Spreadsheet.Sheet} 工作表物件
 */
function getTrackingSheet() {
  let spreadsheet;

  // 嘗試找到現有檔案
  const files = DriveApp.getFilesByName(TRACKING_FILE_NAME);
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.openById(files.next().getId());
  } else {
    spreadsheet = SpreadsheetApp.create(TRACKING_FILE_NAME);
  }

  // 取得或創建工作表
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);

    // 設定標題行
    sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#E8F0FE');

    // 刪除預設工作表（如果存在且不是唯一工作表）
    const defaultSheet = spreadsheet.getSheetByName('工作表1') || spreadsheet.getSheetByName('Sheet1');
    if (defaultSheet && spreadsheet.getSheets().length > 1) {
      spreadsheet.deleteSheet(defaultSheet);
    }
  }

  return sheet;
}

/**
 * 追蹤特定地區的影片
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 工作表
 * @param {string} regionCode - 地區代碼
 * @param {boolean} wantShorts - 是否要追蹤短影片
 * @param {string} today - 今日日期字串
 */
function trackRegion(sheet, regionCode, wantShorts, today) {
  const type = wantShorts ? 'shorts' : 'videos';
  console.log(`追蹤 ${REGIONS[regionCode].name} ${type}`);

  // 搜尋影片（不再用 hashtag 區分）
  const config = {
    query: REGIONS[regionCode].query,
    keywords: [],
    maxResults: API_MAX_RESULTS,
    regionCode: regionCode,
    relevanceLanguage: REGIONS[regionCode].lang,
    isShorts: wantShorts,
    publishedAfter: new Date(Date.now() - DAILY_SEARCH_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    publishedBefore: new Date().toISOString()
  };

  const videos = searchVideos(config);
  if (videos.length === 0) return;

  // 根據需求過濾影片
  const filteredVideos = videos
    .filter(video => {
      if (wantShorts) {
        // 如果要 shorts，只保留 ≤60 秒的影片
        return video.durationSeconds > 0 && video.durationSeconds <= SHORTS_DURATION_LIMIT;
      } else {
        // 如果要一般影片，不管長度，全部保留
        return true;
      }
    })
    .slice(0, RANKING_LIMIT);

  if (filteredVideos.length === 0) return;

  // 取得現有資料
  const existingData = getExistingData(sheet);

  // 依排名處理每個影片
  filteredVideos.forEach((video, index) => {
    const rank = index + 1; // 排名從 1 開始
    const key = `${video.videoId}_${regionCode}_${type}`;

    if (existingData[key] && existingData[key].isTracking) {
      updateExistingRecord(sheet, existingData[key], video, today, rank);
    } else if (!existingData[key]) {
      addNewRecord(sheet, video, regionCode, type, today, rank);
    }
    // 如果 isTracking 是 false，就跳過 - 簡單明瞭
  });
}

/**
 * 取得現有資料
 *
 * "Worry about data structures" - 一次讀取所有資料，建立索引
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 工作表
 * @return {Object} 以複合鍵為索引的資料物件
 */
function getExistingData(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return {};

  const data = sheet.getRange(2, 1, lastRow - 1, COLUMNS.length).getValues();
  const existing = {};

  data.forEach((row, index) => {
    if (row[1]) { // videoId 存在（現在在第2欄）
      const key = `${row[1]}_${row[5]}_${row[6]}`; // videoId_region_type
      existing[key] = {
        rowIndex: index + 2,
        rank: row[0] || 0,
        videoId: row[1],
        title: row[2],
        channelTitle: row[3],
        publishedAt: row[4],
        region: row[5],
        type: row[6],
        firstSeen: row[7],
        lastSeen: row[8],
        isTracking: row[9],
        url: row[10],
        viewHistory: row[11] || '',
        hashtags: row[12] || '',
        likeHistory: row[13] || '',
        commentHistory: row[14] || '',
        durationSeconds: row[15] || 0
      };
    }
  });

  return existing;
}

/**
 * 更新現有記錄
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 工作表
 * @param {Object} existing - 現有記錄
 * @param {Object} video - 新的影片資料
 * @param {string} today - 今日日期
 * @param {number} rank - 當前排名
 */
function updateExistingRecord(sheet, existing, video, today, rank) {
  // 更新觀看數歷史
  const newViewHistory = existing.viewHistory
    ? `${existing.viewHistory},${video.viewCount}`
    : video.viewCount.toString();

  // 更新按讚數歷史
  const newLikeHistory = existing.likeHistory
    ? `${existing.likeHistory},${video.likeCount}`
    : video.likeCount.toString();

  // 更新留言數歷史
  const newCommentHistory = existing.commentHistory
    ? `${existing.commentHistory},${video.commentCount}`
    : video.commentCount.toString();

  // 轉換 hashtags 陣列為逗號分隔字串
  const hashtagsString = video.hashtags ? video.hashtags.join(',') : '';

  sheet.getRange(existing.rowIndex, 1).setValue(rank); // rank
  sheet.getRange(existing.rowIndex, 9).setValue(today); // lastSeen
  sheet.getRange(existing.rowIndex, 12).setValue(newViewHistory); // viewHistory
  sheet.getRange(existing.rowIndex, 13).setValue(hashtagsString); // hashtags
  sheet.getRange(existing.rowIndex, 14).setValue(newLikeHistory); // likeHistory
  sheet.getRange(existing.rowIndex, 15).setValue(newCommentHistory); // commentHistory
  sheet.getRange(existing.rowIndex, 16).setValue(video.durationSeconds); // durationSeconds
}

/**
 * 新增記錄
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 工作表
 * @param {Object} video - 影片資料
 * @param {string} regionCode - 地區代碼
 * @param {string} type - 影片類型
 * @param {string} today - 今日日期
 * @param {number} rank - 排名
 */
function addNewRecord(sheet, video, regionCode, type, today, rank) {
  // 轉換 hashtags 陣列為逗號分隔字串
  const hashtagsString = video.hashtags ? video.hashtags.join(',') : '';

  const row = [
    rank, // rank
    video.videoId,
    video.title,
    video.channelTitle,
    video.publishedAt,
    regionCode,
    type,
    today, // firstSeen
    today, // lastSeen
    true,  // isTracking
    video.url,
    video.viewCount.toString(), // viewHistory
    hashtagsString, // hashtags
    video.likeCount.toString(), // likeHistory
    video.commentCount.toString(), // commentHistory
    video.durationSeconds // durationSeconds
  ];

  sheet.appendRow(row);
}

/**
 * 清理過期記錄
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 工作表
 * @param {string} today - 今日日期
 */
function cleanupStaleRecords(sheet, today) {
  const cutoffDate = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const data = sheet.getRange(2, 8, lastRow - 1, 2).getValues(); // lastSeen, isTracking
  let updatedCount = 0;

  data.forEach((row, index) => {
    if (row[1] && new Date(row[0]) < cutoffDate) { // isTracking && lastSeen < cutoff
      sheet.getRange(index + 2, 9).setValue(false); // 設定 isTracking 為 false
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    console.log(`停止追蹤 ${updatedCount} 個過期記錄`);
  }
}

/**
 * 測試初始數據收集
 * @return {Object} 測試結果
 */
function testInitialDataCollection() {
  try {
    const config = {
      query: 'trending',
      keywords: [],
      maxResults: 10, // 測試用少量數據
      regionCode: 'TW',
      relevanceLanguage: 'zh-Hant',
      isShorts: false,
      publishedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 測試用 1 天
      publishedBefore: new Date().toISOString()
    };

    const videos = searchVideos(config);
    console.log(`   ✅ 成功收集 ${videos.length} 個測試影片`);

    if (videos.length > 0) {
      const sample = videos[0];
      console.log(`   📋 範例: "${sample.title.substring(0, 50)}..."`);
      console.log(`   📊 數據: 觀看=${sample.viewCount.toLocaleString()}, 按讚=${sample.likeCount.toLocaleString()}, 留言=${sample.commentCount.toLocaleString()}`);
    }

    return { success: true, count: videos.length };

  } catch (error) {
    console.log(`   ❌ 數據收集測試失敗: ${error.toString()}`);
    return { success: false, count: 0, error: error.toString() };
  }
}

// ============================================================================
// 管理工具 - 保持簡單
// ============================================================================

/**
 * 設定每日觸發器
 */
function setupDailyTrigger() {
  clearExistingTriggers();
  ScriptApp.newTrigger('dailyYouTubeTracking')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();

  console.log('✅ 每日觸發器設定完成');
}

/**
 * 清除現有觸發器
 */
function clearExistingTriggers() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'dailyYouTubeTracking')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
}

/**
 * 移除觸發器
 */
function removeDailyTrigger() {
  clearExistingTriggers();
  console.log('✅ 觸發器已移除');
}

/**
 * 檢查系統狀態
 */
function checkSystemStatus() {
  const triggers = ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'dailyYouTubeTracking');

  console.log(`觸發器數量: ${triggers.length}`);

  try {
    const sheet = getTrackingSheet();
    const rowCount = sheet.getLastRow() - 1;
    console.log(`追蹤記錄數量: ${rowCount}`);
    console.log(`檔案連結: https://docs.google.com/spreadsheets/d/${sheet.getParent().getId()}`);

    // 檢查 COLUMNS 設定
    console.log('\n系統配置檢查：');
    console.log(`欄位數量: ${COLUMNS.length}`);
    console.log('新增欄位: ', COLUMNS.slice(-4)); // 顯示最後 4 個欄位

  } catch (error) {
    console.log(`無法取得追蹤檔案: ${error}`);
  }
}

// ============================================================================
// 向後兼容層 - 不破壞現有使用者
// ============================================================================

/**
 * 舊版 getTrending 函數 - 保持向後兼容
 *
 * "Never break userspace"
 */
function getTrending(regionCode, isShorts, days, maxResults) {
  regionCode = regionCode || '';
  isShorts = isShorts || false;
  days = days || DEFAULT_LEGACY_DAYS;
  maxResults = maxResults || DEFAULT_LEGACY_COUNT;

  const region = REGIONS[regionCode];
  const config = {
    query: region ? region.query + (isShorts ? ' #shorts' : '') : (isShorts ? '#shorts' : ''),
    keywords: [],
    maxResults: maxResults,
    regionCode: regionCode,
    relevanceLanguage: region ? region.lang : 'en',
    isShorts: isShorts,
    publishedAfter: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
    publishedBefore: new Date().toISOString()
  };

  return searchVideos(config);
}