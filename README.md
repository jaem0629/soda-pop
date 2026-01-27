# Soda Pop

Real-time 2-player puzzle battle game

## Demo

[https://soda-pop-kappa.vercel.app](https://soda-pop-kappa.vercel.app)

## Features

- **Real-time Multiplayer** - Battle with friends in real-time
- **Match-3 Puzzle** - Connect 3 or more blocks to pop them
- **60-Second Time Attack** - Compete for the highest score
- **Room Code System** - Play with friends using 6-digit codes

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (Database + Realtime)
- **Rendering**: HTML5 Canvas
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase project

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Supabase URL and Key to .env.local

# Run development server
pnpm dev
```

## How to Play

1. Enter your nickname
2. **Create a room** or **Join a room** (6-digit code)
3. Wait for opponent to join, then start the game
4. Match 3 or more same-colored blocks to pop them
5. Get the higher score within 60 seconds to win!

## License

Copyright (c) 2026 Jaem. All rights reserved.

This source code is provided for reference only.
Unauthorized copying, modification, or distribution is prohibited without explicit permission.
