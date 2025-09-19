/**
 * YouTube 熱門影片搜尋 API
 * 讀取 Google Sheets 資料並提供篩選介面
 */

const SHEET_ID = '1GFb9Hxn1bcJbGHfGuePlSJO7vfqFadIlxKWa2mqTj-4';
const SHEET_NAME = 'Sheet1'; // 根據實際工作表名稱調整

function doGet(e) {
  try {
    const action = e.parameter.action || 'getData';

    switch (action) {
      case 'getData':
        return getVideoData();
      case 'getFilters':
        return getFilterOptions();
      case 'filter':
        return handleFilterRequest(e.parameter);
      default:
        return ContentService
          .createTextOutput(JSON.stringify({error: 'Invalid action'}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getVideoData() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();

  if (data.length === 0) {
    return ContentService
      .createTextOutput(JSON.stringify({error: 'No data found'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = data[0];
  const videos = [];

  // 轉換資料為物件陣列
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const video = {};

    headers.forEach((header, index) => {
      video[header] = row[index];
    });

    // 處理 hashtags 字串轉陣列
    if (video.hashtags && typeof video.hashtags === 'string') {
      video.hashtags = video.hashtags.split(',').map(tag => tag.trim());
    } else {
      video.hashtags = [];
    }

    // 確保數值欄位為數字
    video.viewCount = parseInt(video.viewCount) || 0;
    video.likeCount = parseInt(video.likeCount) || 0;
    video.commentCount = parseInt(video.commentCount) || 0;
    video.durationSeconds = parseInt(video.durationSeconds) || 0;
    video.rank = parseInt(video.rank) || 0;

    // 生成 YouTube 縮圖 URL
    video.thumbnailUrl = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;

    videos.push(video);
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      data: videos,
      count: videos.length
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getFilterOptions() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();

  if (data.length === 0) {
    return ContentService
      .createTextOutput(JSON.stringify({error: 'No data found'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = data[0];
  const regionIndex = headers.indexOf('region');
  const typeIndex = headers.indexOf('type');
  const viewCountIndex = headers.indexOf('viewCount');

  const regions = new Set();
  const types = new Set();
  let maxViewCount = 0;

  // 分析所有唯一值
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    if (regionIndex >= 0 && row[regionIndex]) {
      regions.add(row[regionIndex]);
    }

    if (typeIndex >= 0 && row[typeIndex]) {
      types.add(row[typeIndex]);
    }

    if (viewCountIndex >= 0 && row[viewCountIndex]) {
      const viewCount = parseInt(row[viewCountIndex]) || 0;
      if (viewCount > maxViewCount) {
        maxViewCount = viewCount;
      }
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      filters: {
        regions: Array.from(regions).sort(),
        types: Array.from(types).sort(),
        maxViewCount: Math.ceil(maxViewCount / 1000000) * 1000000 // 四捨五入到百萬
      }
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 新的篩選 API 處理函數
 */
function handleFilterRequest(params) {
  const filters = normalizeFilterParams(params);
  const result = getFilteredData(filters);
  return createJsonResponse(result);
}

/**
 * 標準化篩選參數
 */
function normalizeFilterParams(params) {
  return {
    dateFrom: params.dateFrom || null,
    dateTo: params.dateTo || null,
    viewMin: params.viewMin ? parseInt(params.viewMin) : 0,
    viewMax: params.viewMax ? parseInt(params.viewMax) : Number.MAX_SAFE_INTEGER,
    region: params.region || null,
    type: params.type || null,
    keyword: params.keyword || null,
    page: Math.max(1, parseInt(params.page) || 1),
    size: Math.min(100, Math.max(1, parseInt(params.size) || 50))
  };
}

/**
 * 獲取篩選後的數據
 */
function getFilteredData(filters) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();

  if (data.length === 0) {
    return { total: 0, page: filters.page, size: filters.size, totalPages: 0, items: [] };
  }

  const headers = data[0];
  const allVideos = [];

  // 轉換所有資料為物件陣列
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const video = convertRowToVideoObject(headers, row);
    allVideos.push(video);
  }

  // 套用篩選條件
  const filteredVideos = allVideos.filter(video => applyFilters(video, filters));

  // 計算分頁
  const total = filteredVideos.length;
  const totalPages = Math.ceil(total / filters.size);
  const startIndex = (filters.page - 1) * filters.size;
  const endIndex = startIndex + filters.size;
  const pageItems = filteredVideos.slice(startIndex, endIndex);

  return {
    total: total,
    page: filters.page,
    size: filters.size,
    totalPages: totalPages,
    items: pageItems
  };
}

/**
 * 轉換資料列為影片物件
 */
function convertRowToVideoObject(headers, row) {
  const video = {};

  headers.forEach((header, index) => {
    video[header] = row[index];
  });

  // 處理 hashtags
  if (video.hashtags && typeof video.hashtags === 'string') {
    video.hashtags = video.hashtags.split(',').map(tag => tag.trim());
  } else {
    video.hashtags = [];
  }

  // 確保數值欄位為數字
  video.viewCount = parseInt(video.viewCount) || 0;
  video.likeCount = parseInt(video.likeCount) || 0;
  video.commentCount = parseInt(video.commentCount) || 0;
  video.durationSeconds = parseInt(video.durationSeconds) || 0;
  video.rank = parseInt(video.rank) || 0;

  // 生成 YouTube URL 和縮圖
  video.url = `https://www.youtube.com/watch?v=${video.videoId}`;
  video.thumbnailUrl = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;

  // 處理縮圖物件格式（兼容前端）
  video.thumbnails = {
    medium: {
      url: video.thumbnailUrl
    }
  };

  return video;
}

/**
 * 套用篩選條件
 */
function applyFilters(video, filters) {
  // 日期篩選
  if (filters.dateFrom || filters.dateTo) {
    const videoDate = video.recordDate;
    if (videoDate) {
      const recordDateStr = typeof videoDate === 'string' ? videoDate : videoDate.toISOString().split('T')[0];

      if (filters.dateFrom && recordDateStr < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && recordDateStr > filters.dateTo) {
        return false;
      }
    }
  }

  // 觀看數篩選
  if (video.viewCount < filters.viewMin || video.viewCount > filters.viewMax) {
    return false;
  }

  // 地區篩選
  if (filters.region && video.region !== filters.region) {
    return false;
  }

  // 類型篩選
  if (filters.type && video.type !== filters.type) {
    return false;
  }

  // 關鍵字篩選（標題和標籤）
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    const titleMatch = video.title && video.title.toLowerCase().includes(keyword);
    const hashtagMatch = video.hashtags && video.hashtags.some(tag =>
      tag.toLowerCase().includes(keyword)
    );

    if (!titleMatch && !hashtagMatch) {
      return false;
    }
  }

  return true;
}

/**
 * 創建 JSON 回應
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// 測試函數
function testGetData() {
  const result = getVideoData();
  console.log(result.getContent());
}

function testGetFilters() {
  const result = getFilterOptions();
  console.log(result.getContent());
}

function testFilterAPI() {
  const params = {
    action: 'filter',
    dateFrom: '2024-09-01',
    dateTo: '2024-09-30',
    viewMin: '1000',
    page: '1',
    size: '10'
  };
  const result = handleFilterRequest(params);
  console.log(result.getContent());
}