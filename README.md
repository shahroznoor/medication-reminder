# Medication Reminder System

A voice-driven medication reminder system using Node.js, Twilio, and real-time communication technologies.

## Features

- Voice call reminders with TTS (Text-to-Speech)
- Patient response capture with STT (Speech-to-Text)
- Call logging and status tracking
- Voicemail and SMS fallback
- REST API for call management

## Prerequisites

- Node.js (v16 or later)
- MongoDB (v4.4 or later)
- Twilio account
- Ngrok (for local testing)
- Deepgram API key (for STT)
- ElevenLabs API key (for TTS)

## Setup Instructions

### 1. Local Project Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/medication-reminder.git
cd medication-reminder

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```
