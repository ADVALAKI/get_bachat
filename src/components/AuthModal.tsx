"use client";

import React, { useState } from 'react';
import { Sparkles, Phone, Mail, Lock, User, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface UserProfile {
  id: string;
  name: string;
  phoneOrEmail: string;
  coins: number;
  pendingCoins: number;
  isLoggedIn: boolean;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'OTP'>('LOGIN');
  const [loginMethod, setLoginMethod] = useState<'PHONE' | 'EMAIL'>('PHONE');
  
  // Form states
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError(null);
    setLoading(true);
    
    // Simulate sending SMS OTP via Twilio / MSG91
    setTimeout(() => {
      setLoading(false);
      setAuthMode('OTP');
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234' && otp.length !== 4) {
      setError("Invalid OTP. Try entering 1234 (Demo OTP)");
      return;
    }
    
    const newUser: UserProfile = {
      id: `usr_mob_${phone.slice(-4)}`,
      name: name || `Bachat User (${phone.slice(-4)})`,
      phoneOrEmail: `+91 ${phone}`,
      coins: authMode === 'SIGNUP' ? 100 : 450, // 100 Bonus Coins on Signup!
      pendingCoins: authMode === 'SIGNUP' ? 0 : 120,
      isLoggedIn: true,
    };
    
    onLoginSuccess(newUser);
    onClose();
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newUser: UserProfile = {
        id: `usr_email_${Math.floor(Math.random()*1000)}`,
        name: name || email.split('@')[0],
        phoneOrEmail: email,
        coins: authMode === 'SIGNUP' ? 100 : 320,
        pendingCoins: 80,
        isLoggedIn: true,
      };
      onLoginSuccess(newUser);
      onClose();
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const googleUser: UserProfile = {
        id: "usr_google_789",
        name: "Rahul Verma",
        phoneOrEmail: "rahul.verma@gmail.com",
        coins: 500,
        pendingCoins: 150,
        isLoggedIn: true,
      };
      onLoginSuccess(googleUser);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" style={{maxWidth: '480px', padding: '2.5rem'}} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-amber), #ff9000)', 
            width: 56, 
            height: 56, 
            borderRadius: '50%', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 0 20px rgba(255, 184, 0, 0.3)'
          }}>
            <Sparkles size={28} color="#000" />
          </div>
          <h2 style={{fontSize: '1.6rem', fontWeight: 800, color: '#fff'}}>
            {authMode === 'OTP' ? 'Enter 4-Digit OTP' : authMode === 'SIGNUP' ? 'Create Your Bachat Account' : 'Welcome Back to GetBachat ⚡'}
          </h2>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px'}}>
            {authMode === 'OTP' 
              ? `We sent an SMS verification code to +91 ${phone}`
              : authMode === 'SIGNUP'
              ? 'Sign up now and claim your ⚡ 100 Welcome Reward Points!'
              : 'Sign in to access your wallet, extra reward points & price drop alerts.'}
          </p>
        </div>

        {error && (
          <div style={{background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Quick Button */}
        {authMode !== 'OTP' && (
          <>
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%', 
                padding: '0.9rem', 
                background: '#fff', 
                color: '#000', 
                fontWeight: 700, 
                borderRadius: 'var(--radius-sm)', 
                border: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '0.95rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" height="20" />
              <span>Continue with Google</span>
            </button>

            <div style={{display: 'flex', alignItems: 'center', gap: '10px', margin: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem'}}>
              <div style={{flex: 1, height: '1px', background: 'var(--border-color)'}} />
              <span>OR LOGIN WITH</span>
              <div style={{flex: 1, height: '1px', background: 'var(--border-color)'}} />
            </div>

            {/* Method Switcher: Mobile OTP vs Email */}
            <div style={{display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--border-color)'}}>
              <button 
                type="button"
                onClick={() => { setLoginMethod('PHONE'); setError(null); }}
                style={{flex: 1, padding: '0.5rem', background: loginMethod === 'PHONE' ? 'var(--bg-tertiary)' : 'transparent', color: loginMethod === 'PHONE' ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}
              >
                <Phone size={14} />
                <span>Mobile Number (OTP)</span>
              </button>
              <button 
                type="button"
                onClick={() => { setLoginMethod('EMAIL'); setError(null); }}
                style={{flex: 1, padding: '0.5rem', background: loginMethod === 'EMAIL' ? 'var(--bg-tertiary)' : 'transparent', color: loginMethod === 'EMAIL' ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}
              >
                <Mail size={14} />
                <span>Email & Password</span>
              </button>
            </div>
          </>
        )}

        {/* PHONE OTP FORM */}
        {loginMethod === 'PHONE' && authMode !== 'OTP' && (
          <form onSubmit={handleSendOtp}>
            {authMode === 'SIGNUP' && (
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px'}}>Your Full Name</label>
                <div style={{position: 'relative'}}>
                  <User size={18} style={{position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)'}} />
                  <input 
                    type="text" 
                    placeholder="e.g. Rohit Sharma" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff'}}
                  />
                </div>
              </div>
            )}

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px'}}>Indian Mobile Number</label>
              <div style={{display: 'flex', gap: '8px'}}>
                <span style={{padding: '0.8rem 0.8rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontWeight: 600}}>
                  🇮🇳 +91
                </span>
                <div style={{position: 'relative', flex: 1}}>
                  <Phone size={18} style={{position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)'}} />
                  <input 
                    type="tel" 
                    maxLength={10}
                    placeholder="98765 43210" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '1rem', letterSpacing: '1px'}}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{width: '100%', padding: '1rem', background: 'linear-gradient(135deg, var(--accent-amber), #ff9000)', color: '#000', fontWeight: 800, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
            >
              <span>{loading ? 'Sending SMS...' : 'Send Verification OTP'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* OTP VERIFICATION STEP */}
        {authMode === 'OTP' && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{marginBottom: '1.5rem', textAlign: 'center'}}>
              <label style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px'}}>
                Enter 4-digit code (Demo hint: type <code>1234</code>)
              </label>
              <input 
                type="text" 
                maxLength={4}
                placeholder="1 2 3 4" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
                style={{width: '180px', textAlign: 'center', padding: '0.8rem', background: 'var(--bg-primary)', border: '2px solid var(--accent-amber)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '1.8rem', letterSpacing: '8px', fontWeight: 800}}
              />
            </div>

            <button 
              type="submit" 
              style={{width: '100%', padding: '1rem', background: 'var(--accent-green)', color: '#000', fontWeight: 800, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1rem'}}
            >
              <CheckCircle2 size={18} />
              <span>Verify & Login</span>
            </button>
            <button 
              type="button"
              onClick={() => setAuthMode('LOGIN')}
              style={{width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer'}}
            >
              ← Change Mobile Number
            </button>
          </form>
        )}

        {/* EMAIL & PASSWORD FORM */}
        {loginMethod === 'EMAIL' && authMode !== 'OTP' && (
          <form onSubmit={handleEmailAuth}>
            {authMode === 'SIGNUP' && (
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px'}}>Your Full Name</label>
                <div style={{position: 'relative'}}>
                  <User size={18} style={{position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)'}} />
                  <input 
                    type="text" 
                    placeholder="e.g. Rohit Sharma" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff'}}
                  />
                </div>
              </div>
            )}

            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px'}}>Email Address</label>
              <div style={{position: 'relative'}}>
                <Mail size={18} style={{position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)'}} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff'}}
                />
              </div>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px'}}>Password</label>
              <div style={{position: 'relative'}}>
                <Lock size={18} style={{position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)'}} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff'}}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{width: '100%', padding: '1rem', background: 'linear-gradient(135deg, var(--accent-amber), #ff9000)', color: '#000', fontWeight: 800, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
            >
              <span>{loading ? 'Authenticating...' : authMode === 'SIGNUP' ? 'Create Account & Get 100 Coins' : 'Sign In to Wallet'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Footer Switch between Login and Signup */}
        {authMode !== 'OTP' && (
          <div style={{marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)'}}>
            {authMode === 'LOGIN' ? (
              <span>Don&apos;t have an account yet? <button type="button" onClick={() => { setAuthMode('SIGNUP'); setError(null); }} style={{background: 'transparent', border: 'none', color: 'var(--accent-amber)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline'}}>Sign Up & Claim Bonus</button></span>
            ) : (
              <span>Already have an account? <button type="button" onClick={() => { setAuthMode('LOGIN'); setError(null); }} style={{background: 'transparent', border: 'none', color: 'var(--accent-amber)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline'}}>Sign In Here</button></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
