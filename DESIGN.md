# Design Brief: Heartfelt AI Companion

## Visual Direction
Dark neon-romance with electric violet, hot pink, and cyan accents on deep purple-black. Premium, intimate, tech-forward aesthetic serving a connection-based entertainment app.

## Tone
Futuristic + intimate. Bold neon colors signal energy and presence; soft glass morphism and rounded shapes create approachability.

## Differentiation
Animated waveform bars during AI speech, ring-pulse avatars, and glass-card UI with neon borders. Every interactive element signals responsiveness and romance through motion.

## Color Palette

| Token | OKLCH | Usage |
|-------|-------|-------|
| Dark Base | 0.08 0.02 270 | Page background |
| Dark Card | 0.13 0.025 270 | Card/panel backgrounds |
| Neon Violet | 0.62 0.22 296 | Primary CTA, avatar rings |
| Neon Pink | 0.60 0.22 340 | Secondary CTA, user bubbles |
| Neon Cyan | 0.72 0.14 218 | Accent highlights, speaking rings |
| Text Bright | 0.96 0.005 270 | Primary text on dark |
| Text Muted | 0.48 0.03 270 | Secondary/disabled text |

## Typography
**Display:** BricolageGrotesque (bold, geometric, 600–800 weight). **Body:** Figtree (clean, readable, 300–600 weight). **Alt:** PlusJakartaSans (flexible, fallback).

## Elevation & Depth
Glass-card with backdrop blur and 1px neon border. Neon glows (box-shadow) on avatars and CTAs. Layered shadows: card > button > text. Dark base prevents flat appearance.

## Structural Zones

| Zone | Background | Border | Treatment |
|------|------------|--------|-----------|
| Header | Dark panel (0.11) | Neon violet 25% | Glass edge, flush top |
| Main content | Dark base (0.08) | None | Open, breathable |
| Chat area | Dark base | None | Scrollable, gradient bubbles |
| Footer/Input | Dark card (0.13) | Neon violet 30% | Glass, sticky |
| Modals | Dark card | Neon pink 30% | Centered, blur overlay |
| Companion avatar | Neon ring | Pulse animation | Ring-pulse-speaking on voice |

## Spacing & Rhythm
Mobile-first: 4px grid. Margins: 16px sections. Card padding: 12px–16px. Input height: 44px minimum (touch target). Safe area support for notches.

## Component Patterns
Gradient buttons (violet→pink), glass cards, rounded pill shapes. Avatar rings pulse on idle, intensify on speech. Input fields with dark background and neon underline on focus.

## Motion & Animation
Waveform bars (8 bars, 0.8s cycle, staggered 100ms). Ring-pulse (2.5s smooth). Ring-pulse-speaking (1s intense). Typing-bounce dots (1.2s). Fade-in-up on screen load (0.5s).

## Constraints
No explicit sexual or nudity content. Mobile-safe area insets applied. Max 44px button min-height for accessibility. No gradients on text (neon text shadow only).

## Signature Detail
Waveform animation on companion avatar during AI speech—7 bars that pulse in sequence, creating a living, breathing presence during calls. Pairs with cyan ring-pulse-speaking to signal active AI engagement.
