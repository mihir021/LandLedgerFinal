/**
 * analyticsController.js
 * Admin-only analytics aggregation endpoint.
 * Runs 12 parallel MongoDB pipelines and returns clean JSON
 * shaped for direct chart consumption.
 *
 * GET /api/analytics?range=30d|90d|1y|all
 */
import Property from '../models/Property.js';
import Transfer from '../models/Transfer.js';
import User from '../models/User.js';
import Dispute from '../models/Dispute.js';

// ── Helpers ──────────────────────────────────────────────
const getDateFilter = (range) => {
  const now = new Date();
  const map = { '30d': 30, '90d': 90, '1y': 365 };
  if (!map[range]) return null; // 'all'
  const from = new Date(now);
  from.setDate(from.getDate() - map[range]);
  return from;
};

const getPreviousFilter = (range) => {
  const now = new Date();
  const map = { '30d': 30, '90d': 90, '1y': 365 };
  const days = map[range];
  if (!days) return null;
  const from = new Date(now);
  from.setDate(from.getDate() - days * 2);
  const to = new Date(now);
  to.setDate(to.getDate() - days);
  return { from, to };
};

// Determine grouping bucket based on range
const getBucketFormat = (range) => {
  if (range === '30d') return { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  if (range === '90d') return { $dateToString: { format: '%Y-%V', date: '$createdAt' } }; // ISO week
  return { $dateToString: { format: '%Y-%m', date: '$createdAt' } }; // monthly for 1y / all
};

// Normalize transfer status variants into clean labels
const normalizeTransferStatus = (status) => {
  if (!status) return 'Pending';
  const s = status.toLowerCase();
  if (s === 'completed') return 'Completed';
  if (s === 'rejected' || s === 'failed') return 'Rejected';
  if (s.includes('officer')) return 'Officer Approved';
  if (s.includes('buyer')) return 'Buyer Approved';
  if (s.includes('seller')) return 'Seller Approved';
  return 'Pending';
};

// ── Main Handler ──────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const range = req.query.range || '30d';
    const dateFrom = getDateFilter(range);
    const prevPeriod = getPreviousFilter(range);
    const dateMatch = dateFrom ? { createdAt: { $gte: dateFrom } } : {};
    const bucketFormat = getBucketFormat(range);

    // ── Run all pipelines in parallel ──────────────────────
    const [
      propertiesOverTime,
      transfersOverTimeRaw,
      transfersByStatusRaw,
      kycFunnelRaw,
      usersByRoleRaw,
      userGrowthOverTime,
      propertyTypeBreakdownRaw,
      geoDistributionRaw,
      disputeStatsRaw,
      officerPerfRaw,
      scatterRaw,
      topLineCurrent,
      topLinePrev,
    ] = await Promise.all([
      // 1. Properties registered over time
      Property.aggregate([
        { $match: dateMatch },
        { $group: { _id: bucketFormat, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', value: '$count' } },
      ]),

      // 2. Transfers over time + avg approval time
      Transfer.aggregate([
        { $match: dateMatch },
        {
          $group: {
            _id: {
              $dateToString: {
                format: range === '30d' ? '%Y-%m-%d' : range === '90d' ? '%Y-%V' : '%Y-%m',
                date: '$createdAt',
              },
            },
            count: { $sum: 1 },
            avgMs: {
              $avg: {
                $cond: [
                  { $and: ['$completedAt', '$initiatedAt'] },
                  { $subtract: ['$completedAt', '$initiatedAt'] },
                  null,
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', value: '$count', avgMs: 1 } },
      ]),

      // 3. Transfers by status
      Transfer.aggregate([
        { $match: dateMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // 4. KYC funnel
      User.aggregate([
        { $group: { _id: '$kycStatus', count: { $sum: 1 } } },
      ]),

      // 5. Users by role
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),

      // 6. User growth over time
      User.aggregate([
        { $match: dateMatch },
        { $group: { _id: { $dateToString: { format: range === '30d' ? '%Y-%m-%d' : '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', value: '$count' } },
      ]),

      // 7. Property type breakdown
      Property.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$landDetails.landType', { $ifNull: ['$landType', 'Unknown'] }] },
            count: { $sum: 1 },
          },
        },
      ]),

      // 8. Geographic distribution (top 15 cities)
      Property.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$location.city', { $ifNull: ['$city', 'Unknown'] }] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),

      // 9. Dispute stats
      Dispute.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgResolutionMs: {
              $avg: {
                $cond: [
                  { $and: ['$resolvedAt'] },
                  { $subtract: ['$resolvedAt', '$createdAt'] },
                  null,
                ],
              },
            },
          },
        },
      ]),

      // 10. Officer performance (approvals per officer)
      Transfer.aggregate([
        { $match: dateMatch },
        { $unwind: { path: '$timeline', preserveNullAndEmptyArrays: false } },
        { $match: { 'timeline.stage': { $in: ['officer_approved', 'officer_approve', 'Officer Approved', 'officerApproved'] } } },
        {
          $group: {
            _id: '$timeline.actor',
            approvals: { $sum: 1 },
            name: { $first: '$timeline.actorName' },
          },
        },
        { $sort: { approvals: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $project: {
            _id: 0,
            label: { $ifNull: [{ $arrayElemAt: ['$user.name', 0] }, { $ifNull: ['$name', 'Unknown Officer'] }] },
            value: '$approvals',
          },
        },
      ]),

      // 11. 3D scatter data — price, area, days-to-verify
      Property.aggregate([
        {
          $match: {
            $or: [
              { 'pricing.priceINR': { $gt: 0 } },
              { price: { $gt: 0 } },
            ],
            'verification.verificationDate': { $exists: true, $ne: null }
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'ownerId',
            foreignField: '_id',
            as: 'ownerDoc'
          }
        },
        {
          $project: {
            propertyId: 1,
            price: { $ifNull: ['$pricing.priceINR', { $ifNull: ['$price', 0] }] },
            area: { $ifNull: ['$landDetails.areaSqft', { $ifNull: ['$area', 0] }] },
            daysToVerify: {
              $divide: [
                { $subtract: ['$verification.verificationDate', '$createdAt'] },
                86400000,
              ],
            },
            type: { $ifNull: ['$landDetails.landType', { $ifNull: ['$landType', 'Unknown'] }] },
            verStatus: { $ifNull: ['$verification.status', { $ifNull: ['$verificationStatus', 'Pending'] }] },
            ownerName: { $arrayElemAt: ['$ownerDoc.name', 0] }
          },
        },
        { $match: { price: { $gt: 0 }, area: { $gt: 0 } } },
        { $limit: 500 },
      ]),

      // 12a. Top-line stats — current period
      Promise.all([
        Property.countDocuments(dateMatch),
        Transfer.countDocuments(dateMatch),
        User.countDocuments(dateMatch),
        Transfer.aggregate([
          { $match: { ...dateMatch, completedAt: { $exists: true }, initiatedAt: { $exists: true } } },
          {
            $group: {
              _id: null,
              avgMs: { $avg: { $subtract: ['$completedAt', '$initiatedAt'] } },
            },
          },
        ]),
      ]),

      // 12b. Top-line stats — previous period (for trend)
      prevPeriod
        ? Promise.all([
            Property.countDocuments({ createdAt: { $gte: prevPeriod.from, $lt: prevPeriod.to } }),
            Transfer.countDocuments({ createdAt: { $gte: prevPeriod.from, $lt: prevPeriod.to } }),
            User.countDocuments({ createdAt: { $gte: prevPeriod.from, $lt: prevPeriod.to } }),
          ])
        : Promise.resolve([0, 0, 0]),
    ]);

    // ── Shape / normalize results ──────────────────────────

    // Transfer over time — compute avg days
    const transfersOverTime = transfersOverTimeRaw.map((t) => ({
      date: t.date,
      value: t.value,
      avgDays: t.avgMs ? Math.round(t.avgMs / 86400000) : null,
    }));

    // Global avg approval time
    const overallAvgMs = transfersOverTimeRaw.reduce((acc, t) => acc + (t.avgMs || 0), 0);
    const overallAvgDays = overallAvgMs > 0
      ? Math.round(overallAvgMs / (transfersOverTimeRaw.filter((t) => t.avgMs).length || 1) / 86400000)
      : null;

    // Transfers by status — normalize variants
    const statusMap = {};
    for (const s of transfersByStatusRaw) {
      const normalized = normalizeTransferStatus(s._id);
      statusMap[normalized] = (statusMap[normalized] || 0) + s.count;
    }
    const transfersByStatus = Object.entries(statusMap).map(([label, value]) => ({ label, value }));

    // KYC funnel — cap to known statuses
    const kycMap = { pending: 0, verified: 0, rejected: 0, suspended: 0 };
    for (const k of kycFunnelRaw) {
      const key = (k._id || 'pending').toLowerCase();
      if (kycMap[key] !== undefined) kycMap[key] += k.count;
    }
    const kycFunnel = Object.entries(kycMap).map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value,
    }));

    // Users by role
    const usersByRole = usersByRoleRaw
      .filter((u) => u._id)
      .map((u) => ({
        label: u._id.charAt(0).toUpperCase() + u._id.slice(1),
        value: u.count,
      }));

    // Property type breakdown with percentages
    const totalProps = propertyTypeBreakdownRaw.reduce((a, b) => a + b.count, 0);
    const propertyTypeBreakdown = propertyTypeBreakdownRaw
      .filter((p) => p._id)
      .map((p) => ({
        label: p._id,
        value: p.count,
        pct: totalProps > 0 ? Math.round((p.count / totalProps) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    // Geo distribution
    const geoDistribution = geoDistributionRaw
      .filter((g) => g._id && g._id !== 'Unknown')
      .map((g) => ({ label: g._id, value: g.count }));

    // Dispute stats
    const disputeMap = { open: 0, resolved: 0, 'in-progress': 0, rejected: 0, closed: 0 };
    let disputeAvgResolutionDays = null;
    let resolvedAvgCount = 0;
    let resolvedAvgSum = 0;
    for (const d of disputeStatsRaw) {
      const key = (d._id || 'open').toLowerCase();
      if (disputeMap[key] !== undefined) disputeMap[key] += d.count;
      if ((key === 'resolved' || key === 'closed') && d.avgResolutionMs) {
        resolvedAvgSum += d.avgResolutionMs * d.count;
        resolvedAvgCount += d.count;
      }
    }
    if (resolvedAvgCount > 0) {
      disputeAvgResolutionDays = Math.round(resolvedAvgSum / resolvedAvgCount / 86400000);
    }
    const disputeStats = {
      breakdown: Object.entries(disputeMap)
        .filter(([, v]) => v > 0)
        .map(([label, value]) => ({
          label: label.charAt(0).toUpperCase() + label.slice(1),
          value,
        })),
      avgResolutionDays: disputeAvgResolutionDays,
      open: disputeMap.open + disputeMap['in-progress'],
      resolved: disputeMap.resolved + disputeMap.closed,
    };

    // Officer performance
    const officerPerformance = officerPerfRaw.filter((o) => o.label && o.label !== 'Unknown Officer');

    // 3D Scatter — clean nulls and extreme outliers
    const scatterData = scatterRaw
      .filter((p) => p.price > 0 && p.area > 0)
      .map((p) => ({
        id: p.propertyId || p._id,
        price: p.price,
        area: p.area,
        daysToVerify: p.daysToVerify != null ? Math.max(0, Math.round(p.daysToVerify)) : 0,
        type: p.type || 'Unknown',
        status: p.verStatus || 'Pending',
        ownerName: p.ownerName || 'Unknown Owner',
      }));

    // Top-line stats
    const [curProps, curTransfers, curUsers, avgApprovalRes] = topLineCurrent;
    const [prevProps, prevTransfers, prevUsers] = topLinePrev;
    const avgApprovalDays =
      avgApprovalRes?.[0]?.avgMs
        ? Math.round(avgApprovalRes[0].avgMs / 86400000)
        : overallAvgDays;

    const topLine = {
      totalProperties: { value: curProps, prev: prevProps, trend: prevProps > 0 ? (curProps >= prevProps ? 'up' : 'down') : 'neutral' },
      totalTransfers:  { value: curTransfers, prev: prevTransfers, trend: prevTransfers > 0 ? (curTransfers >= prevTransfers ? 'up' : 'down') : 'neutral' },
      totalUsers:      { value: curUsers, prev: prevUsers, trend: prevUsers > 0 ? (curUsers >= prevUsers ? 'up' : 'down') : 'neutral' },
      avgApprovalDays: { value: avgApprovalDays, trend: 'neutral' },
    };

    res.json({
      success: true,
      range,
      data: {
        topLine,
        propertiesOverTime,
        transfersOverTime,
        transfersByStatus,
        kycFunnel,
        usersByRole,
        userGrowthOverTime,
        propertyTypeBreakdown,
        geoDistribution,
        disputeStats,
        officerPerformance,
        scatterData,
      },
    });
  } catch (err) {
    console.error('[Analytics] Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
