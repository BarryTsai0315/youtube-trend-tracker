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

// 測試函數
function testGetData() {
  const result = getVideoData();
  console.log(result.getContent());
}

function testGetFilters() {
  const result = getFilterOptions();
  console.log(result.getContent());
}