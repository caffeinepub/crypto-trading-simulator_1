# Heartfelt AI Companion

## Current State
An AI companion app (girlfriend/boyfriend) with companion selection (Sofia, Ethan, Luna), onboarding flow, real AI chat via Pollinations.ai, Hot Talks mode, text messaging, voice call with live AI speech and subtitles, and video call with companion avatar and camera preview.

The draft has expired and needs to be rebuilt fresh from scratch.

## Requested Changes (Diff)

### Add
- Full rebuild of the Heartfelt AI Companion app
- Landing page with hero section, companion cards (Sofia, Ethan, Luna), features section
- Onboarding/companion selection flow
- AI chat screen with real Pollinations.ai responses
- Hot Talks mode toggle (flame icon)
- Text messaging UI
- Voice call screen: mic button for user speech input, AI speaks responses using Web Speech API (SpeechSynthesis), live AI subtitles, call timer
- Video call screen: user camera preview, animated companion avatar, AI speaks during video call
- Speech recognition (Web Speech API) for voice input on call/video screens
- All AI responses via Pollinations.ai API (https://text.pollinations.ai/)

### Modify
- N/A (fresh rebuild)

### Remove
- N/A (fresh rebuild)

## Implementation Plan
1. Build landing page with companion cards and hero section
2. Build onboarding/companion selection screen
3. Build main chat screen with Pollinations.ai integration and Hot Talks toggle
4. Build text messaging screen
5. Build voice call screen with SpeechSynthesis output and SpeechRecognition input
6. Build video call screen with camera preview and animated avatar
7. Wire all screens together with routing
8. Validate and deploy
