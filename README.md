# TravelMate

<img src="./images/logo.png" alt="TravelMate logo" width="180" />

**Independent AI Travel Planner**

Plan your own trips with AI, local-style guidance, budget estimates, and real-time travel information.

---

## 🌎 Overview

TravelMate is a multimodal AI-powered travel planning web application built as part of the VoiceAgent assessment.

The application helps independent travelers explore destinations, estimate travel budgets, get local-style recommendations, and interact conversationally with an AI travel copilot using both text and voice.

Users can:
- Chat with an AI travel assistant
- Speak to the assistant using voice input
- Receive responses in text or synthesized voice
- Get travel budget estimations
- Search real-time travel information
- Explore destinations through a modern dashboard experience

---

## ✨ Features

### 🤖 AI Conversational Assistant
- OpenAI Responses API integration
- Context-aware conversations
- Memory of the last 7 messages
- Floating AI assistant widget

### 🎙️ Voice Interaction
- Browser Speech Recognition API for voice input
- OpenAI TTS for voice responses
- Text mode and Voice mode

### 🛠️ Real Tools Integration
The assistant can autonomously decide when to use tools.

#### 1. Calculator Tool
Used for:
- Travel budget calculations
- Hotel cost estimates
- Food and transportation estimates
- General arithmetic operations

#### 2. Web Search Tool
Used for:
- Current travel recommendations
- Destination safety updates
- Weather and travel information
- Local travel insights

Powered by Tavily API.

### 🧠 Conversational Memory
- Stores the last 7 chat messages
- Persistent session memory using localStorage
- Chat history survives widget close/open and page refresh

### 🗺️ Travel Dashboard
- Featured destinations
- Local-style travel inspiration
- Budget planner section
- Real-time travel update section
- Floating AI travel copilot

---

## 🧩 Selected Use Case

TravelMate is designed as an **independent AI travel planning platform**.

Unlike a traditional travel agency, TravelMate does not sell travel packages or process bookings directly.

Instead, it helps users:
- Plan trips independently
- Estimate travel costs
- Discover destinations
- Access real-time travel information
- Receive AI-guided travel recommendations

The AI assistant acts as a travel copilot integrated into the application experience.

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- TailwindCSS
- shadcn/ui

### AI & APIs
- OpenAI Responses API
- OpenAI TTS
- Tavily Search API

### Browser APIs
- Web Speech API (Speech Recognition)

---

## 🚀 Setup

### 1. Clone the repository

```bash
git clone https://github.com/Nataliavos/VoiceAgent.git
cd VoiceAgent
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Configure environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_USE_MOCK_CHAT=false

OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini

TAVILY_API_KEY=your_tavily_key

OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=nova
OPENAI_TTS_SPEED=1.15
```

---

### 4. Run the development server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## 🎤 How to Use

### Text Interaction
- Open the floating TravelMate assistant
- Type a travel-related request
- The assistant may answer directly or use tools automatically

### Voice Interaction
- Click the microphone button
- Speak naturally
- The message is transcribed and sent automatically
- If Voice Mode is enabled, the assistant responds with synthesized speech

---

## 🧪 Example Prompts

### Budget Calculation
```txt
Plan a 4-day trip to Cartagena for two people with a medium budget.
```

### Web Search
```txt
Search current travel recommendations for Medellín.
```

### Voice Interaction
```txt
Quiero planear un viaje romántico a Cartagena para dos personas.
```

---

## 📂 Project Links

### GitHub Repository
https://github.com/Nataliavos/VoiceAgent.git

### Live Deployment (Vercel)
[ADD VERCEL URL HERE]

---

## 📌 Notes

- This project was developed as an MVP for the VoiceAgent technical assessment.
- Voice input depends on browser support for the Web Speech API.
- The application currently focuses on Colombia destinations as part of the demo experience.

---

## 👩‍💻 Author

Developed by Natalia Vargas Osorio.