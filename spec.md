# Crypto Trading Educational Simulator

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- KYC registration flow: multi-step form collecting Name, Email, Phone, PAN/Aadhaar upload, and referral code
- Admin approval panel: view pending KYC submissions, approve/reject users with notes
- UPI joining fee payment section with QR code (rayinfotechoffice-1@oksbi) and payment confirmation upload
- Virtual trading dashboard: $1,00,000 starting balance per approved user
- Real-time crypto prices via HTTP outcalls to a public crypto price API (CoinGecko or similar)
- Candlestick chart for BTC, ETH, BNB, XRP, etc.
- Buy/Sell trading interface with brokerage fee (0.1%) and tax (STT 0.025%) calculations
- Portfolio tracking: current holdings, P&L, transaction history
- Referral system: unique referral link per user, referral tracking, reward credits
- Top cryptocurrencies leaderboard panel
- Role-based access: regular user vs admin
- Onboarding stepper showing: Create Account > Complete KYC > Admin Review > Pay Fee > Start Simulator

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko):
   - User registry with KYC data, approval status (pending/approved/rejected), payment status
   - Admin functions: listPendingKYC, approveUser, rejectUser
   - Trading engine: portfolio per user, buy/sell with fee + tax calculation, transaction history
   - Referral system: generate referral code, track referrals, reward on approval
   - HTTP outcalls: fetch live crypto prices from CoinGecko public API
   - Role management: assign admin role

2. Frontend (React + TypeScript):
   - Landing/onboarding page with stepper
   - KYC registration form
   - Payment page with UPI QR code (/assets/generated/upi-qr-code-transparent.dim_400x450.png) and upload payment screenshot
   - Admin dashboard: pending KYC list, approve/reject actions
   - Trading dashboard: crypto price ticker, candlestick chart, buy/sell panel, portfolio summary, transaction history
   - Referral section with unique link and invited users list
   - Top cryptocurrencies table with real-time prices and 24h change
