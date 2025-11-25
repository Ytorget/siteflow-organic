import { google } from 'googleapis';

// Initialize Google Auth
const getAuth = () => {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!privateKey || !process.env.GOOGLE_CLIENT_EMAIL) {
    throw new Error('Google credentials not configured');
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
};

// Get Search Console API client
const getSearchConsoleClient = async () => {
  const auth = getAuth();
  return google.searchconsole({
    version: 'v1',
    auth,
  });
};

/**
 * Get search performance overview for the last 30 days
 * @param {string} siteUrl - The site URL (e.g., "https://example.com" or "sc-domain:example.com")
 */
export const getSearchPerformance = async (siteUrl) => {
  if (!siteUrl) {
    throw new Error('SEARCH_CONSOLE_SITE_URL is not configured');
  }

  const searchConsole = await getSearchConsoleClient();

  // Get last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  // Get previous 30 days for comparison
  const prevEndDate = new Date(startDate);
  prevEndDate.setDate(prevEndDate.getDate() - 1);
  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevStartDate.getDate() - 30);

  const formatDate = (date) => date.toISOString().split('T')[0];

  // Current period
  const currentResponse = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: [],
    },
  });

  // Previous period
  const previousResponse = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: formatDate(prevStartDate),
      endDate: formatDate(prevEndDate),
      dimensions: [],
    },
  });

  const currentRow = currentResponse.data.rows?.[0] || {};
  const previousRow = previousResponse.data.rows?.[0] || {};

  const current = {
    clicks: currentRow.clicks || 0,
    impressions: currentRow.impressions || 0,
    ctr: (currentRow.ctr || 0) * 100,
    position: currentRow.position || 0,
  };

  const previous = {
    clicks: previousRow.clicks || 0,
    impressions: previousRow.impressions || 0,
    ctr: (previousRow.ctr || 0) * 100,
    position: previousRow.position || 0,
  };

  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    current,
    previous,
    changes: {
      clicks: calculateChange(current.clicks, previous.clicks),
      impressions: calculateChange(current.impressions, previous.impressions),
      ctr: calculateChange(current.ctr, previous.ctr),
      position: calculateChange(previous.position, current.position), // Reversed: lower position is better
    },
    period: '30 days',
  };
};

/**
 * Get daily search performance data (for charts)
 */
export const getDailySearchPerformance = async (siteUrl) => {
  if (!siteUrl) {
    throw new Error('SEARCH_CONSOLE_SITE_URL is not configured');
  }

  const searchConsole = await getSearchConsoleClient();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ['date'],
    },
  });

  const rows = response.data.rows || [];

  return rows.map(row => ({
    date: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100,
    position: row.position || 0,
  }));
};

/**
 * Get top queries (keywords)
 */
export const getTopQueries = async (siteUrl, limit = 10) => {
  if (!siteUrl) {
    throw new Error('SEARCH_CONSOLE_SITE_URL is not configured');
  }

  const searchConsole = await getSearchConsoleClient();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ['query'],
      rowLimit: limit,
    },
  });

  const rows = response.data.rows || [];

  return rows.map(row => ({
    query: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100,
    position: row.position || 0,
  }));
};

/**
 * Get top pages from search
 */
export const getTopSearchPages = async (siteUrl, limit = 10) => {
  if (!siteUrl) {
    throw new Error('SEARCH_CONSOLE_SITE_URL is not configured');
  }

  const searchConsole = await getSearchConsoleClient();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ['page'],
      rowLimit: limit,
    },
  });

  const rows = response.data.rows || [];

  return rows.map(row => ({
    page: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100,
    position: row.position || 0,
  }));
};
