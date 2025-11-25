/**
 * PageSpeed Insights API Service
 * Uses the free PageSpeed Insights API (no authentication required, but API key recommended for higher quotas)
 */

const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

/**
 * Get PageSpeed Insights for a URL
 * @param {string} url - The URL to analyze
 * @param {string} strategy - 'mobile' or 'desktop'
 */
export const getPageSpeedInsights = async (url, strategy = 'mobile') => {
  const apiKey = process.env.GOOGLE_API_KEY || '';

  const params = new URLSearchParams({
    url,
    strategy,
  });

  // Add multiple category parameters
  ['performance', 'accessibility', 'best-practices', 'seo'].forEach(cat => {
    params.append('category', cat);
  });

  if (apiKey) {
    params.append('key', apiKey);
  }

  const apiUrl = `${PAGESPEED_API_URL}?${params}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch PageSpeed data');
  }

  const data = await response.json();

  // Extract Lighthouse scores
  const lighthouse = data.lighthouseResult;
  const categories = lighthouse?.categories || {};

  return {
    url: data.id,
    strategy,
    scores: {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
    },
    metrics: {
      firstContentfulPaint: lighthouse?.audits?.['first-contentful-paint']?.displayValue || 'N/A',
      largestContentfulPaint: lighthouse?.audits?.['largest-contentful-paint']?.displayValue || 'N/A',
      totalBlockingTime: lighthouse?.audits?.['total-blocking-time']?.displayValue || 'N/A',
      cumulativeLayoutShift: lighthouse?.audits?.['cumulative-layout-shift']?.displayValue || 'N/A',
      speedIndex: lighthouse?.audits?.['speed-index']?.displayValue || 'N/A',
      timeToInteractive: lighthouse?.audits?.['interactive']?.displayValue || 'N/A',
    },
    coreWebVitals: {
      lcp: {
        value: lighthouse?.audits?.['largest-contentful-paint']?.numericValue || 0,
        displayValue: lighthouse?.audits?.['largest-contentful-paint']?.displayValue || 'N/A',
        score: lighthouse?.audits?.['largest-contentful-paint']?.score || 0,
      },
      fid: {
        value: lighthouse?.audits?.['max-potential-fid']?.numericValue || 0,
        displayValue: lighthouse?.audits?.['max-potential-fid']?.displayValue || 'N/A',
        score: lighthouse?.audits?.['max-potential-fid']?.score || 0,
      },
      cls: {
        value: lighthouse?.audits?.['cumulative-layout-shift']?.numericValue || 0,
        displayValue: lighthouse?.audits?.['cumulative-layout-shift']?.displayValue || 'N/A',
        score: lighthouse?.audits?.['cumulative-layout-shift']?.score || 0,
      },
    },
    fetchTime: new Date().toISOString(),
  };
};

/**
 * Get both mobile and desktop scores
 */
export const getFullPageSpeedReport = async (url) => {
  const [mobile, desktop] = await Promise.all([
    getPageSpeedInsights(url, 'mobile'),
    getPageSpeedInsights(url, 'desktop'),
  ]);

  return {
    url,
    mobile,
    desktop,
    fetchTime: new Date().toISOString(),
  };
};
