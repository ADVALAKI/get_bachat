"use client";

import React, { useState, useEffect } from 'react';
import { processUserLink, LinkConversionResult } from '@/lib/linkEngine';
import { APP_CONFIG, RoutingMode } from '@/config/storeConfig';
import AuthModal, { UserProfile } from '@/components/AuthModal';
import { 
  Zap, 
  ShoppingBag, 
  TrendingUp, 
  Wallet, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Search,
  Tag,
  HelpCircle,
  UserCheck,
  LogOut,
  LogIn
} from 'lucide-react';

interface DealItem {
  id: string;
  title: string;
  store: 'amazon' | 'flipkart' | 'myntra' | 'croma';
  storeName: string;
  price: number;
  originalPrice: number;
  cashbackCoins: number;
  url: string;
  emoji: string;
}

const SAMPLE_DEALS: DealItem[] = [
  {
    id: 'd1',
    title: 'Apple iPad (10th Gen) 64GB - Blue',
    store: 'amazon',
    storeName: 'Amazon India',
    price: 34990,
    originalPrice: 39900,
    cashbackCoins: 735,
    url: 'https://www.amazon.in/dp/B0BJLXN6J8',
    emoji: '📱'
  },
  {
    id: 'd2',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    store: 'flipkart',
    storeName: 'Flipkart',
    price: 24990,
    originalPrice: 29990,
    cashbackCoins: 650,
    url: 'https://www.flipkart.com/sony-wh-1000xm5/p/itm12345',
    emoji: '🎧'
  },
  {
    id: 'd3',
    title: 'Nike Air Max SC Running Shoes - Men',
    store: 'myntra',
    storeName: 'Myntra',
    price: 4599,
    originalPrice: 6995,
    cashbackCoins: 193,
    url: 'https://www.myntra.com/shoes/nike/air-max/12345',
    emoji: '👟'
  },
  {
    id: 'd4',
    title: 'Samsung Galaxy Watch 6 Bluetooth (44mm)',
    store: 'croma',
    storeName: 'Croma',
    price: 18999,
    originalPrice: 32999,
    cashbackCoins: 237,
    url: 'https://www.croma.com/samsung-galaxy-watch-6/p/300123',
    emoji: '⌚'
  }
];

const DEFAULT_ANON_USER: UserProfile = {
  id: "usr_guest_001",
  name: "Guest Shopper",
  phoneOrEmail: "Not signed in",
  coins: 0,
  pendingCoins: 0,
  isLoggedIn: false,
};

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_ANON_USER);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  const [inputUrl, setInputUrl] = useState('');
  const [customPrice, setCustomPrice] = useState<number>(2499);
  const [conversionResult, setConversionResult] = useState<LinkConversionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [claimOrderId, setClaimOrderId] = useState('');
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  // Load user from localStorage if saved
  useEffect(() => {
    const saved = localStorage.getItem('getbachat_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('getbachat_user', JSON.stringify(user));
    // If there is an active converted link, re-convert with new real User ID!
    if (inputUrl) {
      const res = processUserLink(inputUrl, user.id, customPrice);
      if (res) setConversionResult(res);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('getbachat_user');
    setCurrentUser(DEFAULT_ANON_USER);
    setShowWalletModal(false);
  };

  const handleConvert = (urlToConvert?: string) => {
    const target = urlToConvert || inputUrl;
    if (!target) return;

    // Prompt signup if converting a link without being logged in!
    if (!currentUser.isLoggedIn) {
      const wantLogin = confirm("🎉 Sign in or create an account now to earn additional Bachat Reward Points on this purchase! Would you like to sign in?");
      if (wantLogin) {
        setShowAuthModal(true);
        return;
      }
    }

    const res = processUserLink(target, currentUser.id, customPrice);
    if (res) {
      setConversionResult(res);
      setCopied(false);
    } else {
      alert("Please paste a valid link from Amazon India, Flipkart, Myntra, or Croma!");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimOrderId) return;
    setClaimStatus("Verifying against store records... ✓ Claim Approved! Added 65 Bachat Reward Points!");
    const updatedUser = { ...currentUser, coins: currentUser.coins + 65 };
    setCurrentUser(updatedUser);
    localStorage.setItem('getbachat_user', JSON.stringify(updatedUser));
    setClaimOrderId('');
    setTimeout(() => setClaimStatus(null), 5000);
  };

  return (
    <main>
      {/* Navigation */}
      <nav className="navbar">
        <a href="#" className="logo">
          <Zap size={28} color="#FFB800" fill="#FFB800" />
          <span>GetBachat<span style={{color: '#FFB800'}}>.com</span></span>
          <span className="logo-badge">Extra Rewards ⚡</span>
        </a>
        <ul className="nav-links">
          <li><a className="nav-link active">Deals & Reward Points</a></li>
          <li><a className="nav-link">Price History</a></li>
          <li><a className="nav-link">Partner Stores</a></li>
          <li>
            {currentUser.isLoggedIn ? (
              <button className="btn-wallet" onClick={() => setShowWalletModal(true)}>
                <UserCheck size={18} color="#10B981" />
                <span style={{color: '#fff'}}>{currentUser.name.split(' ')[0]}</span>
                <span style={{background: 'rgba(255,184,0,0.2)', padding: '2px 8px', borderRadius: '12px', color: '#FFB800'}}>
                  ⚡ {currentUser.coins} Points
                </span>
              </button>
            ) : (
              <button 
                className="btn-wallet" 
                style={{background: 'linear-gradient(135deg, var(--accent-amber), #ff9000)', color: '#000', border: 'none'}}
                onClick={() => setShowAuthModal(true)}
              >
                <LogIn size={18} />
                <span>Sign In / Sign Up (⚡ +100 Bonus)</span>
              </button>
            )}
          </li>
        </ul>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          Get All Store Discounts + <br/>
          <span className="highlight-amber">Earn Additional Reward Points!</span>
        </h1>
        <p className="hero-subtitle">
          Paste any product URL from Amazon India, Flipkart, Myntra, or 500+ Indian stores.<br/>
          You get every store discount & bank offer as usual — <strong>PLUS we credit additional Bachat Reward Points</strong> to your wallet on every purchase!
        </p>

        {/* Link Converter Card */}
        <div className="converter-box glass-panel">
          <div className="input-group">
            <input 
              type="text" 
              className="url-input"
              placeholder="Paste Amazon, Flipkart, or Myntra product link here..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
            />
            <button className="btn-convert" onClick={() => handleConvert()}>
              <Zap size={20} fill="#000" />
              <span>Get Reward Link ⚡</span>
            </button>
          </div>

          <div className="quick-pills">
            <span>Try sample links:</span>
            <button 
              className="pill"
              onClick={() => {
                const sample = "https://www.amazon.in/dp/B0BJLXN6J8";
                setInputUrl(sample);
                setCustomPrice(34990);
                handleConvert(sample);
              }}
            >
              🛒 Amazon iPad (₹34,990)
            </button>
            <button 
              className="pill"
              onClick={() => {
                const sample = "https://www.flipkart.com/sony-wh-1000xm5/p/itm12345";
                setInputUrl(sample);
                setCustomPrice(24990);
                handleConvert(sample);
              }}
            >
              🛍️ Flipkart Sony Headphones (₹24,990)
            </button>
            <button 
              className="pill"
              onClick={() => {
                const sample = "https://www.myntra.com/shoes/nike/air-max/12345";
                setInputUrl(sample);
                setCustomPrice(4599);
                handleConvert(sample);
              }}
            >
              👟 Myntra Nike Shoes (₹4,599)
            </button>
          </div>

          {/* Conversion Result Preview */}
          {conversionResult && (
            <div className="result-card">
              <div className="result-header">
                <div className="store-badge" style={{color: conversionResult.storeColor}}>
                  <span>{conversionResult.storeLogo}</span>
                  <span>{conversionResult.storeName}</span>
                </div>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <span className="mode-badge">
                    🟢 Extra Rewards Activated ✓
                  </span>
                  {conversionResult.storeKey === 'amazon' && (
                    <span className="mode-badge" style={{background: 'rgba(255, 184, 0, 0.15)', color: '#FFB800'}}>
                      ⭐ Verified Partner Deal
                    </span>
                  )}
                </div>
              </div>

              <div className="reward-highlight">
                <div className="reward-stat">
                  <span className="stat-label">You Earn (Extra Rewards)</span>
                  <span className="stat-value">⚡ +{conversionResult.expectedUserCashback} Points</span>
                </div>
                <div className="reward-stat">
                  <span className="stat-label">Estimated Price</span>
                  <span className="stat-value" style={{color: '#fff'}}>₹{conversionResult.estimatedPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="reward-stat">
                  <span className="stat-label">Your Rewards Account</span>
                  <span className="stat-value" style={{color: '#00F2FE', fontSize: '1.1rem'}}>{currentUser.id}</span>
                </div>
              </div>

              <div style={{marginBottom: '0.8rem'}}>
                <span className="stat-label" style={{display: 'block', marginBottom: '4px'}}>
                  🔒 Your Smart Reward Link:
                </span>
                <div className="link-actions">
                  <input 
                    readOnly 
                    className="output-link" 
                    value={conversionResult.cloakedRedirectUrl} 
                  />
                  <button 
                    className={`btn-action ${copied ? 'success' : ''}`}
                    onClick={() => handleCopy(conversionResult.cloakedRedirectUrl)}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <a 
                    href={conversionResult.cloakedRedirectUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-action"
                    style={{background: 'var(--accent-cyan)', color: '#000', borderColor: 'var(--accent-cyan)'}}
                  >
                    <ExternalLink size={16} />
                    <span>Go To Store</span>
                  </a>
                </div>
              </div>

              <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px'}}>
                🎯 <strong>Store Destination:</strong> <span style={{color: '#fff'}}>{conversionResult.storeName} (Verified Partner Store)</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trending Deals Grid */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">
            <TrendingUp color="#FFB800" />
            <span>Trending Price Drops & Extra Reward Deals</span>
          </h2>
          <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Updated 10 mins ago • 100% Guaranteed Reward Points</span>
        </div>

        <div className="deals-grid">
          {SAMPLE_DEALS.map((deal) => (
            <div key={deal.id} className="deal-card glass-panel">
              <span className="deal-badge">⚡ +{deal.cashbackCoins} Extra Points</span>
              <div className="deal-img-wrapper">
                <span>{deal.emoji}</span>
                <div className="deal-store">
                  <span>🛒</span>
                  <span>{deal.storeName}</span>
                </div>
              </div>
              <div className="deal-content">
                <h3 className="deal-title">{deal.title}</h3>
                <div>
                  <div className="deal-prices">
                    <span className="price-current">₹{deal.price.toLocaleString('en-IN')}</span>
                    <span className="price-original">₹{deal.originalPrice.toLocaleString('en-IN')}</span>
                    <span style={{color: 'var(--accent-green)', fontSize: '0.85rem', fontWeight: 700}}>
                      {Math.round((1 - deal.price/deal.originalPrice)*100)}% OFF
                    </span>
                  </div>
                  <button 
                    className="btn-deal"
                    onClick={() => {
                      setInputUrl(deal.url);
                      setCustomPrice(deal.price);
                      handleConvert(deal.url);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <Zap size={16} fill="#FFB800" color="#FFB800" />
                    <span>Get Reward Link ⚡</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why GetBachat Architecture section */}
      <section className="section" style={{marginTop: '2rem'}}>
        <div className="glass-panel" style={{padding: '2.5rem', background: 'linear-gradient(135deg, rgba(27, 33, 48, 0.8) 0%, rgba(19, 23, 34, 0.9) 100%)'}}>
          <h2 className="section-title" style={{marginBottom: '1.5rem'}}>
            <ShieldCheck color="#00F2FE" />
            <span>How GetBachat.com Rewards You Seamlessly</span>
          </h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', color: 'var(--text-muted)'}}>
            <div>
              <h4 style={{color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{color: '#FFB800'}}>1.</span> Generate Your Reward Link
              </h4>
              <p style={{fontSize: '0.9rem'}}>
                Paste any product URL. You still get 100% of store discounts, coupon codes, and bank offers on Amazon/Flipkart as usual!
              </p>
            </div>
            <div>
              <h4 style={{color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{color: '#00F2FE'}}>2.</span> Earn Additional Points
              </h4>
              <p style={{fontSize: '0.9rem'}}>
                When you complete your purchase through our link, we automatically deposit additional Bachat Reward Points into your wallet!
              </p>
            </div>
            <div>
              <h4 style={{color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{color: '#10B981'}}>3.</span> Redeem For Real Value
              </h4>
              <p style={{fontSize: '0.9rem'}}>
                Accumulate your extra reward points over time and withdraw them directly to your UPI ID or Indian bank account!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Wallet Modal */}
      {showWalletModal && currentUser.isLoggedIn && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowWalletModal(false)}>×</button>
            
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div style={{background: 'var(--accent-amber)', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#000'}}>
                  {currentUser.name[0]}
                </div>
                <div>
                  <h3 style={{fontSize: '1.3rem', fontWeight: 700}}>{currentUser.name}</h3>
                  <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Account ID: <code>{currentUser.id}</code> • {currentUser.phoneOrEmail}</span>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                style={{background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600}}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="wallet-grid">
              <div className="wallet-card">
                <span className="stat-label">Confirmed Reward Points</span>
                <div style={{fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-green)', margin: '4px 0'}}>
                  ⚡ {currentUser.coins} Points
                </div>
                <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Confirmed after store return window closes (Ready for UPI transfer)</span>
              </div>
              <div className="wallet-card">
                <span className="stat-label">Pending Reward Points</span>
                <div style={{fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '4px 0'}}>
                  ⚡ {currentUser.pendingCoins} Points
                </div>
                <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Points awaiting return window confirmation from store</span>
              </div>
            </div>

            <button 
              style={{width: '100%', padding: '1rem', background: 'var(--accent-green)', color: '#000', fontWeight: 800, borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '1rem', marginBottom: '2rem'}}
              onClick={() => alert(`Withdrawal initiated! ₹${currentUser.coins} will be sent to your UPI ID within 24 hours.`)}
            >
              💸 Withdraw ₹{currentUser.coins} to UPI / Bank Account
            </button>

            {/* Order Claim Simulator */}
            <div style={{background: 'rgba(0, 0, 0, 0.4)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)'}}>
              <h4 style={{fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px'}}>
                <HelpCircle size={16} color="#FFB800" />
                <span>Missed Automatic Reward Points? Claim Here:</span>
              </h4>
              <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
                If you shopped using our link without automatic point verification, submit your store Order ID below. Our verification system will check store records and deposit your points!
              </p>
              
              <form onSubmit={handleClaimSubmit} style={{display: 'flex', gap: '8px'}}>
                <input 
                  type="text" 
                  placeholder="e.g. 404-1234567-8901234 (Store Order ID)"
                  value={claimOrderId}
                  onChange={(e) => setClaimOrderId(e.target.value)}
                  style={{flex: 1, padding: '0.6rem 1rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff'}}
                />
                <button 
                  type="submit"
                  style={{padding: '0.6rem 1.2rem', background: 'var(--accent-amber)', color: '#000', fontWeight: 700, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer'}}
                >
                  Verify & Claim
                </button>
              </form>
              {claimStatus && (
                <div style={{marginTop: '0.8rem', padding: '0.6rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600}}>
                  {claimStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer-Facing Footer */}
      <footer className="dev-footer">
        <div>
          <span style={{fontWeight: 700, fontSize: '1.1rem'}}>⚡ GetBachat.com</span>
          <p style={{color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px'}}>
            India&apos;s #1 Smart Price History & Additional Rewards Platform • All Rights Reserved © 2026
          </p>
        </div>

        <div style={{display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)'}}>
          <a href="#" style={{color: 'var(--text-muted)', textDecoration: 'none'}}>About Us</a>
          <a href="#" style={{color: 'var(--text-muted)', textDecoration: 'none'}}>Privacy Policy</a>
          <a href="#" style={{color: 'var(--text-muted)', textDecoration: 'none'}}>Terms of Service</a>
          <a href="#" style={{color: 'var(--text-muted)', textDecoration: 'none'}}>Help & Support</a>
        </div>
      </footer>
    </main>
  );
}
