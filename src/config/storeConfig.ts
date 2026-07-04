export type RoutingMode = 'CUELINKS' | 'DIRECT';

export interface StoreRule {
  name: string;
  domain: string;
  logo: string;
  defaultCommissionRate: number; // e.g., 3.0 means 3%
  userShareRatio: number; // e.g., 0.20 means user gets 20% of commission (or 0.5% direct)
  cuelinksCampaignId: string;
  directTag?: string;
  color: string;
}

export interface AppConfig {
  siteName: string;
  domain: string;
  activeRoutingMode: RoutingMode;
  cuelinks: {
    publisherId: string;
    defaultTag: string;
    subIdParam: string;
  };
  direct: {
    amazonTag: string;
    flipkartAffId: string;
  };
  stores: Record<string, StoreRule>;
}

export const APP_CONFIG: AppConfig = {
  siteName: "GetBachat ⚡",
  domain: "getbachat.com",
  // Toggle between CUELINKS and DIRECT here or via environment variables
  activeRoutingMode: (process.env.NEXT_PUBLIC_ROUTING_MODE as RoutingMode) || 'CUELINKS',
  
  cuelinks: {
    publisherId: process.env.CUELINKS_PUB_ID || "cl_sudohuman_99",
    defaultTag: process.env.CUELINKS_TAG || "cuelinkss26094-21",
    subIdParam: "subid",
  },
  
  direct: {
    amazonTag: process.env.AMAZON_DIRECT_TAG || "getbachat-21",
    flipkartAffId: process.env.FLIPKART_DIRECT_ID || "getbachat_aff",
  },
  
  stores: {
    amazon: {
      name: "Amazon India",
      domain: "amazon.in",
      logo: "🛒",
      defaultCommissionRate: 3.5, // 3.5% avg affiliate commission
      userShareRatio: 0.60, // User gets 60% of our commission (approx 2.1% cashback)
      cuelinksCampaignId: "cam_amzn_in",
      directTag: "getbachat-21",
      color: "#FF9900",
    },
    flipkart: {
      name: "Flipkart",
      domain: "flipkart.com",
      logo: "🛍️",
      defaultCommissionRate: 4.0,
      userShareRatio: 0.65,
      cuelinksCampaignId: "cam_fk_in",
      directTag: "getbachat_aff",
      color: "#2874F0",
    },
    myntra: {
      name: "Myntra",
      domain: "myntra.com",
      logo: "👗",
      defaultCommissionRate: 6.0,
      userShareRatio: 0.70,
      cuelinksCampaignId: "cam_myn_in",
      color: "#FF3F6C",
    },
    ajio: {
      name: "AJIO",
      domain: "ajio.com",
      logo: "👟",
      defaultCommissionRate: 7.0,
      userShareRatio: 0.70,
      cuelinksCampaignId: "cam_ajio_in",
      color: "#2C4152",
    },
    nykaa: {
      name: "Nykaa",
      domain: "nykaa.com",
      logo: "💄",
      defaultCommissionRate: 5.0,
      userShareRatio: 0.60,
      cuelinksCampaignId: "cam_nykaa_in",
      color: "#FC2779",
    },
    croma: {
      name: "Croma",
      domain: "croma.com",
      logo: "📱",
      defaultCommissionRate: 2.5,
      userShareRatio: 0.50,
      cuelinksCampaignId: "cam_croma_in",
      color: "#00E9DA",
    }
  }
};
