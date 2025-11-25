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
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
};

// Get GA4 Analytics Data API client
const getAnalyticsDataClient = async () => {
  const auth = getAuth();
  return google.analyticsdata({
    version: 'v1beta',
    auth,
  });
};

/**
 * Get traffic overview for the last 30 days
 * @param {string} propertyId - GA4 Property ID (e.g., "123456789")
 */
export const getTrafficOverview = async (propertyId) => {
  if (!propertyId) {
    throw new Error('GA4_PROPERTY_ID is not configured');
  }

  const analyticsData = await getAnalyticsDataClient();

  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [
        { startDate: '30daysAgo', endDate: 'today' },
        { startDate: '60daysAgo', endDate: '31daysAgo' }, // For comparison
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    },
  });

  const rows = response.data.rows || [];

  // Parse current period (first date range)
  const current = {
    activeUsers: parseInt(rows[0]?.metricValues?.[0]?.value || '0'),
    sessions: parseInt(rows[0]?.metricValues?.[1]?.value || '0'),
    pageViews: parseInt(rows[0]?.metricValues?.[2]?.value || '0'),
    bounceRate: parseFloat(rows[0]?.metricValues?.[3]?.value || '0'),
    avgSessionDuration: parseFloat(rows[0]?.metricValues?.[4]?.value || '0'),
  };

  // Parse previous period (second date range) for comparison
  const previous = {
    activeUsers: parseInt(rows[1]?.metricValues?.[0]?.value || '0'),
    sessions: parseInt(rows[1]?.metricValues?.[1]?.value || '0'),
    pageViews: parseInt(rows[1]?.metricValues?.[2]?.value || '0'),
    bounceRate: parseFloat(rows[1]?.metricValues?.[3]?.value || '0'),
    avgSessionDuration: parseFloat(rows[1]?.metricValues?.[4]?.value || '0'),
  };

  // Calculate changes
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    current,
    previous,
    changes: {
      activeUsers: calculateChange(current.activeUsers, previous.activeUsers),
      sessions: calculateChange(current.sessions, previous.sessions),
      pageViews: calculateChange(current.pageViews, previous.pageViews),
      bounceRate: calculateChange(current.bounceRate, previous.bounceRate),
      avgSessionDuration: calculateChange(current.avgSessionDuration, previous.avgSessionDuration),
    },
    period: '30 days',
  };
};

/**
 * Get daily traffic data for the last 30 days (for charts)
 */
export const getDailyTraffic = async (propertyId) => {
  if (!propertyId) {
    throw new Error('GA4_PROPERTY_ID is not configured');
  }

  const analyticsData = await getAnalyticsDataClient();

  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    },
  });

  const rows = response.data.rows || [];

  return rows.map(row => ({
    date: row.dimensionValues?.[0]?.value || '',
    activeUsers: parseInt(row.metricValues?.[0]?.value || '0'),
    sessions: parseInt(row.metricValues?.[1]?.value || '0'),
    pageViews: parseInt(row.metricValues?.[2]?.value || '0'),
  }));
};

/**
 * Get top pages by page views
 */
export const getTopPages = async (propertyId, limit = 10) => {
  if (!propertyId) {
    throw new Error('GA4_PROPERTY_ID is not configured');
  }

  const analyticsData = await getAnalyticsDataClient();

  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit,
    },
  });

  const rows = response.data.rows || [];

  return rows.map(row => ({
    pagePath: row.dimensionValues?.[0]?.value || '',
    pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
    activeUsers: parseInt(row.metricValues?.[1]?.value || '0'),
    avgDuration: parseFloat(row.metricValues?.[2]?.value || '0'),
  }));
};
