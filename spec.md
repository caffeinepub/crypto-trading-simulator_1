# AI Companion

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- Landing page with companion selection (girlfriend or boyfriend)
- Companion customization: name and personality type
- AI-powered chat interface using HTTP outcalls to an LLM API
- Chat history stored per session
- Warm, romantic visual design with pastel tones and chat bubble UI

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko):
   - Store companion profiles (name, type, personality)
   - Store chat history per user
   - HTTP outcall to a public LLM API (e.g., OpenRouter or similar) for AI responses
   - Methods: saveCompanion, getCompanion, sendMessage, getChatHistory

2. Frontend:
   - Landing/onboarding page: choose girlfriend or boyfriend, set name, pick personality
   - Chat page: message input, chat bubbles, companion name/avatar header
   - Companion card with avatar based on chosen type
   - Responsive design with warm pastel aesthetic matching design preview
