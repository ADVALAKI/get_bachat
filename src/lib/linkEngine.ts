import { APP_CONFIG, RoutingMode, StoreRule } from '../config/storeConfig';

export interface LinkConversionResult {
  originalUrl: string;
  cloakedRedirectUrl: string;
  finalAffiliateUrl: string;
  storeKey: string;
  storeName: string;
  storeLogo: string;
  storeColor: string;
  estimatedPrice: number;
  expectedUserCashback: number; // in Bachat Coins (1 Coin = ₹1)
  expectedPlatformRevenue: number;
  routingModeUsed: RoutingMode;
  asinOrId?: string;
}

/**
 * Identifies which store a URL belongs to based on hostname
 */
export function identifyStore(rawUrl: string): { key: string; rule: StoreRule } | null {
  try {
    const urlObj = new URL(rawUrl);
    const host = urlObj.hostname.toLowerCase();
    
    for (const [key, rule] of Object.entries(APP_CONFIG.stores)) {
      if (host.includes(rule.domain) || (key === 'amazon' && host.includes('amzn.eu'))) {
        return { key, rule };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts Amazon ASIN from any amazon.in or amzn.eu URL
 */
export function extractAmazonAsin(url: string): string | null {
  const asinMatch = 
    url.match(/(?:dp|gp\/product|exec\/obidos\/asin|product-reviews|pricehistory\.app)\/([A-Z0-9]{10})/i) || 
    url.match(/\/([A-Z0-9]{10})(?:$|\?|\/)/i);
  
  return asinMatch && asinMatch[1] ? asinMatch[1].toUpperCase() : null;
}

/**
 * Generates cloaked redirect URL and final tracking URL
 */
export function processUserLink(
  rawUrl: string, 
  userId: string = "usr_demo_101", 
  customPrice: number = 2499,
  overrideMode?: RoutingMode
): LinkConversionResult | null {
  const storeMatch = identifyStore(rawUrl);
  if (!storeMatch) return null;

  const { key, rule } = storeMatch;
  const mode = overrideMode || APP_CONFIG.activeRoutingMode;
  const clickId = `clk_${Date.now().toString(36)}`;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  let finalAffiliateUrl = rawUrl;
  let asinOrId = undefined;

  if (key === 'amazon') {
    const asin = extractAmazonAsin(rawUrl) || "B08N5W4NNB"; // Fallback demo ASIN
    asinOrId = asin;
    
    // Inject custom branding slug /getbachat.com/ exactly like competitors!
    const brandedBase = `https://www.amazon.in/getbachat.com/dp/${asin}`;
    
    if (mode === 'CUELINKS') {
      // Cuelinks Sub-tag format
      const subtag = `${dateStr}_${userId}_${clickId}`;
      finalAffiliateUrl = `${brandedBase}?tag=${APP_CONFIG.cuelinks.defaultTag}&ascsubtag=${subtag}`;
    } else {
      // Direct Amazon Associates format
      finalAffiliateUrl = `${brandedBase}?tag=${APP_CONFIG.direct.amazonTag}`;
    }
  } else if (key === 'flipkart') {
    try {
      const urlObj = new URL(rawUrl);
      if (mode === 'CUELINKS') {
        urlObj.searchParams.set('subid', userId);
        urlObj.searchParams.set('cuelinks_clk', clickId);
      } else {
        urlObj.searchParams.set('affid', APP_CONFIG.direct.flipkartAffId);
        urlObj.searchParams.set('affExtParam1', userId);
        urlObj.searchParams.set('affExtParam2', clickId);
      }
      finalAffiliateUrl = urlObj.toString();
    } catch {
      finalAffiliateUrl = `${rawUrl}?affid=${APP_CONFIG.direct.flipkartAffId}&affExtParam1=${userId}`;
    }
  } else {
    // Other Indian stores via Cuelinks deep linking
    const encodedDest = encodeURIComponent(rawUrl);
    finalAffiliateUrl = `https://links.cuelinks.com/link?url=${encodedDest}&subid=${userId}&pub_id=${APP_CONFIG.cuelinks.publisherId}`;
  }

  // Calculate cashback rewards
  const totalCommission = (customPrice * rule.defaultCommissionRate) / 100;
  const userCashback = Math.round(totalCommission * rule.userShareRatio);
  const platformRevenue = Math.round(totalCommission * (1 - rule.userShareRatio));

  // Generate our cloaked internal redirect link
  const encodedOriginal = Buffer.from(rawUrl).toString('base64');
  const cloakedRedirectUrl = `https://getbachat.com/api/redirect?utm_content=${encodedOriginal}&utm_id=${clickId}&uid=${userId}&mode=${mode}`;

  return {
    originalUrl: rawUrl,
    cloakedRedirectUrl,
    finalAffiliateUrl,
    storeKey: key,
    storeName: rule.name,
    storeLogo: rule.logo,
    storeColor: rule.color,
    estimatedPrice: customPrice,
    expectedUserCashback: userCashback,
    expectedPlatformRevenue: platformRevenue,
    routingModeUsed: mode,
    asinOrId,
  };
}
