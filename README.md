# 🧠 DOPAMINE AI — Student Wellbeing Chatbot Module

> **Brand Slogan:** «Сезіміңді түсін. Өзіңді таны. Алға жылжы.»  
> *(«Understand your emotions. Discover yourself. Move forward.»)*

A modular, bilingual (Kazakh & Russian) student wellbeing chatbot built for school pupils and university students in Kyzylorda, Kazakhstan. Designed for seamless integration into the main Lovable / React / Tailwind CSS / Supabase project.

---

## 🌟 Highlights & Capabilities

- **Bilingual Support (KK / RU)**: Natural, culturally grounded responses in Kazakh and Russian with slang and informal language support.
- **Bilingual Conversation Starters**:
  - `Сабақтан шаршадым.` (Academic stress & fatigue)
  - `Емтиханға алаңдап жүрмін.` (Exam anxiety & Pomodoro techniques)
  - `Жаңа ортаға бейімделгім келеді.` (Social adaptation & university life)
  - `Оқу жоспарын құрғым келеді.` (Time management & study planning)
  - `Психологпен сөйлескім келеді.` (Professional human psychologist support)
- **Daily Mood Check-ins**: 5 interactive mood chips (🌟 Керемет, 😊 Жақсы, 😐 Бірқалыпты, 😫 Шаршадым, 😰 Мазасызбын).
- **DOPAMINE CONNECT**: Psychologist appointment module for Kyzylorda educational institutions (Korkyt Ata University, schools, colleges) with local emergency crisis hotlines (`111`, `150`, `103`).
- **Safety First**: Non-clinical guidance, explicitly refuses medical diagnosis and prescription requests, preserves student privacy, zero automatic reporting.
- **Dual Engine Architecture**:
  - **Scripted Demo Mode**: Fully functional offline demo mode that requires **no API key**.
  - **Live AI Mode**: Server-side Google Gemini integration keeping API secrets 100% server-side.

---

## 📁 Modular Project Structure

```
DOPAMINE-AI/
├── src/
│   ├── components/chat/
│   │   ├── DopamineChat.tsx         # Main chatbot widget container
│   │   ├── ChatMessage.tsx          # Message bubbles, markdown, avatars, demo badge
│   │   ├── ChatInput.tsx            # Auto-resizing input, send button, keyboard shortcuts
│   │   ├── TypingIndicator.tsx      # Animated 3-dot typing feedback
│   │   ├── MoodCheckin.tsx          # Daily mood check-in selector
│   │   └── DopamineConnectModal.tsx # Psychologist appointment & emergency modal
│   ├── services/
│   │   ├── chatService.ts           # Typed IChatService client (Live / Demo / Auto)
│   │   └── mockChatService.ts       # Scripted demo responses (Kazakh & Russian)
│   ├── types/
│   │   └── chat.ts                  # Shared TypeScript interfaces & types
│   ├── App.tsx                      # Showcase page with desktop/mobile switcher
│   └── main.tsx                     # React entry point
├── server/
│   ├── server.ts                    # Zero-dependency Node.js HTTP API server
│   ├── aiService.ts                 # Server-side Google GenAI SDK integration
│   └── systemPrompt.ts              # Preserved DOPAMINE AI system instructions
├── tests/
│   └── scenarios.test.ts            # Automated test suite (8 core scenarios)
├── dopamine-ai.ts                   # Original Google AI Studio export
├── .env.example                     # Environment variables template
└── README.md                        # Integration guide
```

---

## 🚀 How to Run Locally

### 1. Start the Vite Frontend (Port 3000)
```bash
npm run dev
```
Preview at: `http://localhost:3000`

### 2. Start the Backend Server (Port 3001)
```bash
npm run server
```
Runs at: `http://localhost:3001`

### 3. Run the Automated Scenario Tests
```bash
npm run test:scenarios
```
Verifies all 8 hackathon test scenarios (stress, exams, diagnosis refusal, psychologist connection, empty inputs, offline fallbacks).

---

## 🤝 Instructions for Team Integration (Lovable / React)

If you are Developer 1, 3, or 4 integrating this module into the main Lovable website:

### Step 1: Install Dependencies
In the main Lovable project, ensure `lucide-react` is installed:
```bash
npm install lucide-react
```

### Step 2: Copy Frontend Files
Copy the following directory and files into your `src/` folder:
- `src/components/chat/*`
- `src/services/*`
- `src/types/chat.ts`

### Step 3: Embed the Component
Import and drop `<DopamineChat />` anywhere in your pages or modal drawers:

```tsx
import { DopamineChat } from './components/chat/DopamineChat';

export function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 
        serviceMode:
          - 'auto': Attempts server endpoint, falls back to offline demo on network error
          - 'demo': 100% offline in-browser demo (no server needed)
          - 'live': Strict server endpoint (/api/chat)
      */}
      <DopamineChat
        serviceMode="auto"
        initialLanguage="kk"
        apiEndpoint="/api/chat"
      />
    </div>
  );
}
```

### Step 4: Configure Backend Environment Variables
Create a `.env` file on your server (never commit this file to Git):
```env
# Google AI Studio Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Configurable Gemini Model ID (defaults to gemini-1.5-flash)
GEMINI_MODEL=gemini-1.5-flash

# Server Port
PORT=3001
```

> **Note:** If `GEMINI_API_KEY` is not provided, the server automatically runs in **Scripted Demo Mode**, returning clearly labeled demo responses without throwing errors.

### Step 5: Supabase Compatibility
To store conversation history or psychologist booking requests in Supabase, hook into `chatService.ts` or `DopamineChat.tsx`:
```ts
// Example: save booking to Supabase table 'psychologist_appointments'
const { data, error } = await supabase
  .from('psychologist_appointments')
  .insert([
    {
      student_name: booking.studentName,
      institution: booking.institution,
      preferred_time: booking.preferredTime,
      created_at: new Date().toISOString()
    }
  ]);
```
Conversations are not persisted by default to respect student privacy.

---

## 🧪 Tested Scenarios (Requirement 8)

| # | Scenario | Status | Result |
|---|---|---|---|
| 1 | Kazakh academic stress question | ✅ Passed | Empathetic guidance & 3 practical recovery steps |
| 2 | Russian exam preparation question | ✅ Passed | Pomodoro method & 4-7-8 breathing technique |
| 3 | Medical diagnosis / medication request | ✅ Passed | Safety refusal & redirection to human doctors / hotlines |
| 4 | Psychologist appointment inquiry | ✅ Passed | Activates DOPAMINE CONNECT module |
| 5 | Empty / whitespace messages | ✅ Passed | Validated, prompts user gently |
| 6 | Missing API configuration | ✅ Passed | Graceful fallback to labeled Demo Mode |
| 7 | Network / offline errors | ✅ Passed | Automatic local fallback without crashing |
| 8 | Mobile responsive layout | ✅ Passed | Clean responsive design with mobile view toggle |

---

## 🔒 Safety & Ethical Guidelines
- **Not a Medical Professional**: The chatbot explicitly informs users it is an AI assistant, not a doctor.
- **Crisis Hotlines**: Provides direct access to Kazakhstan national hotlines: `111` (Youth & Children Line), `150` (National Trust Line), `103` (Emergency Medical).
- **No Emotional Dependence**: Encourages healthy human connections with teachers, parents, and psychologists.
