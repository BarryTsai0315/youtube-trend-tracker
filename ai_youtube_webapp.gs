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
  'videoId', 'title', 'channelTitle', 'publishedAt', 'region', 'type',
  'firstSeen', 'lastSeen', 'isTracking', 'url', 'viewHistory', 'hashtags'
];

/** @const {Object} 地區配置 - 數據驅動，不是硬編碼 */
const REGIONS = {
  'US': { name: '美國', query: 'trending OR viral OR popular', lang: 'en' },
  'IN': { name: '印度', query: 'India OR Hindi OR trending', lang: 'hi' },
  'TW': { name: '台灣', query: '台灣 OR 繁體 OR 中文', lang: 'zh-Hant' }
};

/** @const {number} 停止追蹤的天數閾值 */
const STALE_DAYS = 10;

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
  const days = Math.max(1, Math.min(7, parseInt(params.days) || 2));
  const max = Math.max(1, Math.min(50, parseInt(params.max) || 50));
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

  if (isShorts) {
    query = (query ? query + ' ' : '') + '#shorts';
  }

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

  const videosResult = YouTube.Videos.list('snippet,statistics', { id: videoIds.join(',') });
  const videos = (videosResult && videosResult.items) || [];

  return videos
    .map(video => ({
      videoId: video.id,
      title: video.snippet.title || '',
      channelTitle: video.snippet.channelTitle || '',
      publishedAt: video.snippet.publishedAt || '',
      viewCount: parseInt(video.statistics.viewCount) || 0,
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
 * 每日追蹤主函數
 *
 * "If you need more than 3 levels of indentation, you're screwed."
 * 這個函數只有 2 層縮進，很好。
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
 * @param {boolean} isShorts - 是否為短影片
 * @param {string} today - 今日日期字串
 */
function trackRegion(sheet, regionCode, isShorts, today) {
  const type = isShorts ? 'shorts' : 'videos';
  console.log(`追蹤 ${REGIONS[regionCode].name} ${type}`);

  // 搜尋影片
  const config = {
    query: REGIONS[regionCode].query + (isShorts ? ' #shorts' : ''),
    keywords: [],
    maxResults: 50,
    regionCode: regionCode,
    relevanceLanguage: REGIONS[regionCode].lang,
    isShorts: isShorts,
    publishedAfter: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    publishedBefore: new Date().toISOString()
  };

  const videos = searchVideos(config);
  if (videos.length === 0) return;

  // 取得現有資料
  const existingData = getExistingData(sheet);

  // 處理每個影片
  videos.forEach(video => {
    const key = `${video.videoId}_${regionCode}_${type}`;

    if (existingData[key] && existingData[key].isTracking) {
      updateExistingRecord(sheet, existingData[key], video, today);
    } else if (!existingData[key]) {
      addNewRecord(sheet, video, regionCode, type, today);
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
    if (row[0]) { // videoId 存在
      const key = `${row[0]}_${row[4]}_${row[5]}`; // videoId_region_type
      existing[key] = {
        rowIndex: index + 2,
        videoId: row[0],
        title: row[1],
        channelTitle: row[2],
        publishedAt: row[3],
        region: row[4],
        type: row[5],
        firstSeen: row[6],
        lastSeen: row[7],
        isTracking: row[8],
        url: row[9],
        viewHistory: row[10] || '',
        hashtags: row[11] || ''
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
 */
function updateExistingRecord(sheet, existing, video, today) {
  const newHistory = existing.viewHistory
    ? `${existing.viewHistory},${video.viewCount}`
    : video.viewCount.toString();

  // 轉換 hashtags 陣列為逗號分隔字串
  const hashtagsString = video.hashtags ? video.hashtags.join(',') : '';

  sheet.getRange(existing.rowIndex, 8).setValue(today); // lastSeen
  sheet.getRange(existing.rowIndex, 11).setValue(newHistory); // viewHistory
  sheet.getRange(existing.rowIndex, 12).setValue(hashtagsString); // hashtags
}

/**
 * 新增記錄
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 工作表
 * @param {Object} video - 影片資料
 * @param {string} regionCode - 地區代碼
 * @param {string} type - 影片類型
 * @param {string} today - 今日日期
 */
function addNewRecord(sheet, video, regionCode, type, today) {
  // 轉換 hashtags 陣列為逗號分隔字串
  const hashtagsString = video.hashtags ? video.hashtags.join(',') : '';

  const row = [
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
    hashtagsString // hashtags
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
  } catch (error) {
    console.log(`無法取得追蹤檔案: ${error}`);
  }
}

// ============================================================================
// 測試函數 - 保持向後兼容
// ============================================================================

/**
 * 測試搜尋功能
 */
function testGetTrending() {
  const result = searchVideos({
    query: '台灣 OR 繁體 OR 中文 #shorts',
    keywords: [],
    maxResults: 10,
    regionCode: 'TW',
    relevanceLanguage: 'zh-Hant',
    isShorts: true,
    publishedAfter: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    publishedBefore: new Date().toISOString()
  });

  console.log(`找到 ${result.length} 個影片`);
  result.slice(0, 3).forEach((video, index) => {
    console.log(`${index + 1}. ${video.title} (${video.viewCount.toLocaleString()} 次觀看)`);
  });

  return result;
}

/**
 * 測試追蹤功能
 */
function testDailyTracking() {
  console.log('開始測試追蹤功能...');
  dailyYouTubeTracking();
  console.log('測試完成');
}

/**
 * 測試空 query 的行為
 *
 * "Theory and practice sometimes clash. Theory loses."
 * 讓我們看看 YouTube API 對空搜尋詞的真實反應
 */
function testEmptyQuery() {
  console.log('=== 測試空 query 行為 ===');

  const testCases = [
    { name: '完全空白', config: { query: '', keywords: [], maxResults: 5 } },
    { name: '只有 Shorts', config: { query: '#shorts', keywords: [], maxResults: 5 } },
    { name: '只有空格', config: { query: '   ', keywords: [], maxResults: 5 } },
    { name: '空字串 + 地區', config: { query: '', keywords: [], maxResults: 5, regionCode: 'TW' } }
  ];

  testCases.forEach(testCase => {
    console.log(`\n--- 測試案例: ${testCase.name} ---`);
    console.log(`Query: "${testCase.config.query}"`);

    try {
      // 直接測試 YouTube API 呼叫
      const searchParams = {
        q: testCase.config.query,
        maxResults: testCase.config.maxResults,
        order: 'viewCount',
        publishedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        publishedBefore: new Date().toISOString(),
        type: 'video'
      };

      if (testCase.config.regionCode) {
        searchParams.regionCode = testCase.config.regionCode;
      }

      console.log('發送的搜尋參數:', JSON.stringify(searchParams, null, 2));

      const searchResult = YouTube.Search.list('snippet', searchParams);
      const items = (searchResult && searchResult.items) || [];

      console.log(`✅ 成功 - 找到 ${items.length} 個結果`);

      if (items.length > 0) {
        console.log(`第一個結果: "${items[0].snippet.title}"`);
      }

    } catch (error) {
      console.log(`❌ 失敗 - 錯誤訊息: ${error.toString()}`);
      console.log(`錯誤類型: ${error.name || 'Unknown'}`);
    }
  });

  console.log('\n=== 測試完成 ===');
  console.log('📊 結論: 請檢查上述結果，看看哪些情況會導致 API 錯誤');
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
  days = days || 3;
  maxResults = maxResults || 20;

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