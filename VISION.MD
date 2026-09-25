# AGAM — Voice-First AI Agriculture Architecture & Vision

```
                        [ Farmer Speaks to Mascot ]
                                     │
                                     ▼
                   [ Groq LLM Intent & Navigation Parser ]
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
[ Ask about Land/Weather ]   [ Ask about Schemes ]      [ Ask about Crop Health ]
         │                           │                           │
  Mascot Speaks Advice        Mascot Explains Scheme     Mascot Triggers Camera
         &                           &                           &
Directs to 3D Map / NASA     Directs to PM-Kisan Portal  Opens Crop Disease Scanner
    Advisory View                  External Link                   Page
```

---

## 1. System Vision Overview

**AGAM** is an AI-guided, voice-first agricultural operating system built for Indian farmers. By replacing complex mobile navigation with an interactive, animated **Desi Hal Champion Cow Mascot**, farmers of any literacy level can interact naturally using local speech, live satellite telemetry, and real-time plant diagnostics.

---

## 2. Core Agentic Workflow

### A. Speech Input & Voice Agent
1. **Farmer Input:** The farmer taps the microphone or speaks in **English**, **Tamil (தமிழ்)**, or **Hindi (हिंदी)**.
2. **Speech Recognition:** Web Speech API captures real-time audio and converts the query to text.
3. **Mascot Acoustic Feedback:** Tapping or interacting with the cow mascot triggers authentic acoustic Web Audio synthesized bovine moos and SoundKit haptic audio feedback.

---

### B. Groq LLM Intent & Navigation Parser (`POST /api/rag-chat`)
Queries are processed through high-speed Groq LPU inference backed by the verified `data/pm_kisan_real_data.json` & `data/pm_kisan_real_data.pkl` vector/tabular dataset:

```json
{
  "spoken_response": "1-2 concise, clear sentences answering the farmer in their chosen language.",
  "intent_action": "REDIRECT_KISAN_PORTAL | NAVIGATE_DISEASE_SCANNER | NAVIGATE_LAND_SURVEY | NONE",
  "portal_url": "https://pmkisan.gov.in",
  "source": "RAG_GROQ_LPU"
}
```

---

### C. Tri-Branch Intent Routing & Mascot Actions

| User Intent | Groq Parser Action | Mascot Action | Target View / Destination |
| :--- | :--- | :--- | :--- |
| **Ask about Land / Weather** | `NAVIGATE_LAND_SURVEY` | Speaks plain-language wind, soil moisture, & solar drying advice | Automatically opens **Land & Weather Intelligence View** with NASA POWER satellite telemetry. |
| **Ask about Schemes** | `REDIRECT_KISAN_PORTAL` | Explains DBT benefits, eligibility, & eKYC rules | Automatically opens **PM-Kisan Schemes View** + provides direct link to `https://pmkisan.gov.in`. |
| **Ask about Crop Health** | `NAVIGATE_DISEASE_SCANNER` | Explains symptoms and prompts for leaf photo | Automatically opens **Crop Doctor Page** & triggers camera/file upload for plant pathology diagnosis. |

---

## 3. Strict Security & Operational Guardrails

1. **In-Scope Agriculture & PM-Kisan Queries:**
   - Grounded strictly in verified government dataset context.
   - Outputs conversational speech + intent routing.
2. **Out-of-Scope / Non-Agricultural Queries:**
   - Queries unrelated to agriculture (e.g., entertainment, gaming, coding) return:
     ```json
     { "spoken_response": "NOT SUPPORTED", "intent_action": "NONE" }
     ```
   - Mascot switches to thinking emotion and displays an amber notification banner.
3. **Confidentiality & Prompt Injection Protection:**
   - Attempts to inspect system instructions, keys, or credentials return:
     ```json
     { "spoken_response": "I CANT ANSWER", "intent_action": "NONE" }
     ```
   - Mascot switches to surprised emotion and locks access.
4. **Broad Agronomic Inquiries (WebMCP Fallback):**
   - Agricultural topics outside local PM-Kisan scope are answered with synthesized expert agronomy guidance tagged with `"source": "WebMCP"`.

---

## 4. Hardware & Mascot Integration API

The application exposes the unified `window.CharacterMascot` interface for browser subagents and programmatic workflows:

```ts
window.CharacterMascot = {
  lookAt: (x: number, y: number) => void,         // Mathematical pupil tracking
  speak: (text: string) => void,                  // Dialogue bubble + Web Speech synthesis
  stopSpeak: () => void,                          // Cancel audio synthesis
  blink: () => void,                              // Realistic eyelid animation
  setEmotion: (name: 'neutral' | 'happy' | 'surprised' | 'thinking') => void,
  getEmotion: () => string,
  togglePlough: (force?: boolean) => void,        // Equip / unequip traditional Desi Hal
  moo: () => void,                                // Web Audio bovine acoustic synthesizer
  setPage: (mode: 'full' | 'passport') => void,   // Full-body vs hip-level docked passport view
  getPage: () => 'full' | 'passport',
  toggleMic: (force?: boolean) => void
};
```
