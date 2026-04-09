/**
 * Cost-per-user thresholds for warning level assignment.
 * A tool is flagged "high" risk when its monthly cost per user
 * exceeds WARNING_HIGH_THRESHOLD (€/user/month).
 */
export const WARNING_HIGH_THRESHOLD = 50;

/**
 * Below WARNING_HIGH_THRESHOLD but above this value → "medium" warning.
 */
export const WARNING_MEDIUM_THRESHOLD = 20;

/**
 * Vendor / tool efficiency bands (cost per user per month, in €).
 * Below EXCELLENT  → rated "excellent"
 * EXCELLENT..GOOD  → rated "good"
 * GOOD..AVERAGE    → rated "average"
 * Above AVERAGE    → rated "below_average"
 */
export const EFFICIENCY_THRESHOLDS = {
  /** Top tier: cost per user < 5 €/month */
  EXCELLENT: 5,
  /** Good tier: cost per user ≤ 15 €/month */
  GOOD: 15,
  /** Average tier: cost per user ≤ 25 €/month */
  AVERAGE: 25,
};

/**
 * Default threshold for the low-usage-tools endpoint
 * (tools with fewer than this many active users are flagged).
 */
export const DEFAULT_LOW_USAGE_THRESHOLD = 5;

/**
 * Hard upper limit accepted via query param for low-usage filtering.
 */
export const MAX_USERS_LIMIT = 100;

/**
 * Default number of results returned by the expensive-tools endpoint.
 */
export const DEFAULT_EXPENSIVE_TOOLS_LIMIT = 10;
