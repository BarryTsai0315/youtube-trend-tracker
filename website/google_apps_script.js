/**
 * YouTube影片資料分析 - Google Apps Script API
 * 
 * 部署說明:
 * 1. 在Google Apps Script中建立新專案
 * 2. 將此程式碼貼入
 * 3. 修改SHEET_ID為你的Google Sheet ID
 * 4. 部署為Web應用程式，設定執行身分為「我」，存取權限為「任何人」
 * 5. 複製部署後的Web應用程式URL
 */

// 設定你的Google Sheet ID
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Sheet1'; // 或你的工作表名稱

/**
 * 主要的doGet函數，處理HTTP GET請求
 */
function doGet(e) {
  try {
    const params = e.parameter;
    const action = params.action || 'getData';
    
    // 設定CORS標頭
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    let result;
    
    switch(action) {
      case 'getData':
        result = getData(params);
        break;
      case 'getTrends':
        result = getTrends(params);
        break;
      case 'getHashtags':
        result = getHashtags(params);
        break;
      case 'getChannels':
        result = getChannels(params);
        break;
      default:
        result = { error: '未知的操作' };
    }
    
    output.setContent(JSON.stringify(result));
    return output;
    
  } catch (error) {
    Logger.log('錯誤: ' + error.toString());
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify({ error: error.toString() }));
    return output;
  }
}

/**
 * 處理POST請求 (如果需要)
 */
function doPost(e) {
  return doGet(e);
}

/**
 * 獲取影片資料
 */
function getData(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return { data: [], total: 0 };
    }
    
    // 第一行是標題
    const headers = data[0];
    const rows = data.slice(1);
    
    // 將資料轉換為物件陣列
    let videos = rows.map(row => {
      let video = {};
      headers.forEach((header, index) => {
        video[header] = row[index];
      });
      return video;
    });
    
    // 應用篩選器
    videos = applyFilters(videos, params);
    
    // 應用排序
    videos = applySorting(videos, params);
    
    // 應用分頁
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedVideos = videos.slice(startIndex, endIndex);
    
    return {
      data: paginatedVideos,
      total: videos.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil(videos.length / limit)
    };
    
  } catch (error) {
    Logger.log('getData錯誤: ' + error.toString());
    throw error;
  }
}

/**
 * 應用篩選器
 */
function applyFilters(videos, params) {
  let filtered = videos;
  
  // 日期範圍篩選
  if (params.startDate || params.endDate) {
    filtered = filtered.filter(video => {
      const recordDate = new Date(video.recordDate);
      const start = params.startDate ? new Date(params.startDate) : new Date('1900-01-01');
      const end = params.endDate ? new Date(params.endDate) : new Date('2100-12-31');
      return recordDate >= start && recordDate <= end;
    });
  }
  
  // 地區篩選
  if (params.region) {
    filtered = filtered.filter(video => video.region === params.region);
  }
  
  // 類型篩選
  if (params.type) {
    filtered = filtered.filter(video => video.type === params.type);
  }
  
  // 頻道篩選
  if (params.channel) {
    filtered = filtered.filter(video => 
      video.channelTitle.toLowerCase().includes(params.channel.toLowerCase())
    );
  }
  
  // Hashtag篩選
  if (params.hashtag) {
    filtered = filtered.filter(video => 
      video.hashtags && video.hashtags.toLowerCase().includes(params.hashtag.toLowerCase())
    );
  }
  
  // 最小觀看次數篩選
  if (params.minViews) {
    const minViews = parseInt(params.minViews);
    filtered = filtered.filter(video => parseInt(video.viewCount) >= minViews);
  }
  
  return filtered;
}

/**
 * 應用排序
 */
function applySorting(videos, params) {
  const sortBy = params.sortBy || 'viewCount';
  const sortOrder = params.sortOrder || 'desc';
  
  return videos.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // 數字欄位轉換
    if (['viewCount', 'likeCount', 'commentCount', 'durationSeconds', 'rank'].includes(sortBy)) {
      aValue = parseInt(aValue) || 0;
      bValue = parseInt(bValue) || 0;
    }
    
    // 日期欄位轉換
    if (['publishedAt', 'recordDate'].includes(sortBy)) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
}

/**
 * 獲取趨勢資料
 */
function getTrends(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return { trends: [] };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // 將資料轉換為物件陣列
    let videos = rows.map(row => {
      let video = {};
      headers.forEach((header, index) => {
        video[header] = row[index];
      });
      return video;
    });
    
    // 按日期分組統計
    const trendData = {};
    
    videos.forEach(video => {
      const date = video.recordDate;
      if (!trendData[date]) {
        trendData[date] = {
          date: date,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          videoCount: 0
        };
      }
      
      trendData[date].totalViews += parseInt(video.viewCount) || 0;
      trendData[date].totalLikes += parseInt(video.likeCount) || 0;
      trendData[date].totalComments += parseInt(video.commentCount) || 0;
      trendData[date].videoCount += 1;
    });
    
    // 轉換為陣列並排序
    const trends = Object.values(trendData).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return { trends: trends };
    
  } catch (error) {
    Logger.log('getTrends錯誤: ' + error.toString());
    throw error;
  }
}

/**
 * 獲取熱門Hashtag統計
 */
function getHashtags(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return { hashtags: [] };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const hashtagCount = {};
    
    rows.forEach(row => {
      const hashtagsIndex = headers.indexOf('hashtags');
      const viewCountIndex = headers.indexOf('viewCount');
      
      if (hashtagsIndex !== -1 && row[hashtagsIndex]) {
        const hashtags = row[hashtagsIndex].split(',');
        const viewCount = parseInt(row[viewCountIndex]) || 0;
        
        hashtags.forEach(hashtag => {
          const cleanHashtag = hashtag.trim();
          if (cleanHashtag) {
            if (!hashtagCount[cleanHashtag]) {
              hashtagCount[cleanHashtag] = {
                hashtag: cleanHashtag,
                count: 0,
                totalViews: 0
              };
            }
            hashtagCount[cleanHashtag].count += 1;
            hashtagCount[cleanHashtag].totalViews += viewCount;
          }
        });
      }
    });
    
    // 轉換為陣列並按使用次數排序
    const hashtags = Object.values(hashtagCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // 取前20個
    
    return { hashtags: hashtags };
    
  } catch (error) {
    Logger.log('getHashtags錯誤: ' + error.toString());
    throw error;
  }
}

/**
 * 獲取熱門頻道統計
 */
function getChannels(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return { channels: [] };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const channelStats = {};
    
    rows.forEach(row => {
      const channelIndex = headers.indexOf('channelTitle');
      const viewCountIndex = headers.indexOf('viewCount');
      const likeCountIndex = headers.indexOf('likeCount');
      
      if (channelIndex !== -1 && row[channelIndex]) {
        const channel = row[channelIndex];
        const viewCount = parseInt(row[viewCountIndex]) || 0;
        const likeCount = parseInt(row[likeCountIndex]) || 0;
        
        if (!channelStats[channel]) {
          channelStats[channel] = {
            channelTitle: channel,
            videoCount: 0,
            totalViews: 0,
            totalLikes: 0,
            avgViews: 0
          };
        }
        
        channelStats[channel].videoCount += 1;
        channelStats[channel].totalViews += viewCount;
        channelStats[channel].totalLikes += likeCount;
      }
    });
    
    // 計算平均觀看次數並排序
    const channels = Object.values(channelStats).map(channel => {
      channel.avgViews = Math.round(channel.totalViews / channel.videoCount);
      return channel;
    }).sort((a, b) => b.totalViews - a.totalViews).slice(0, 10); // 取前10個
    
    return { channels: channels };
    
  } catch (error) {
    Logger.log('getChannels錯誤: ' + error.toString());
    throw error;
  }
}

