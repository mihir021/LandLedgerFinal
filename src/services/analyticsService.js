/**
 * analyticsService.js
 * Fetches admin analytics data from the backend.
 * Caches responses in sessionStorage per range key so that
 * switching between admin pages and back avoids redundant refetches.
 */
import api from './api';

const CACHE_PREFIX = 'll_analytics_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch aggregated analytics for a given date range.
 * @param {string} range - '30d' | '90d' | '1y' | 'all'
 * @returns {Promise<object>} - analytics data shaped for charts
 */
export async function getAnalytics(range = '30d') {
  const cacheKey = `${CACHE_PREFIX}${range}`;

  // Check sessionStorage cache
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        return data;
      }
    }
  } catch {
    // sessionStorage unavailable or parse error — fall through to fetch
  }

  const response = await api.get(`/analytics?range=${range}`);
  const data = response.data?.data;

  // Store in sessionStorage for this session
  try {
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // Quota exceeded or unavailable — fine, just skip caching
  }

  return data;
}

/** Clear analytics cache for all ranges (call after data mutations if needed) */
export function clearAnalyticsCache() {
  ['30d', '90d', '1y', 'all'].forEach((r) => {
    try { sessionStorage.removeItem(`${CACHE_PREFIX}${r}`); } catch { /* ignore */ }
  });
}
