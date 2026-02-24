# Soda Pop

Real-time multiplayer match-3 puzzle battle game.

## Demo

[https://soda-pop-game.vercel.app](https://soda-pop-game.vercel.app)

## Features

- **Real-time Multiplayer** — Battle with friends in real-time using Supabase Realtime
- **Match-3 Puzzle** — Swap pieces on an 8×8 board to match 3 or more of the same color
- **60-Second Time Attack** — Compete for the highest score before time runs out
- **Chain Combos** — Trigger cascading reactions for bonus multipliers
- **Match Code System** — Create or join private matches with 6-digit codes
- **Live Score Sync** — Watch your opponent's score update in real-time

## Game Modes

| Mode       | Players | Description                  | Status       |
| ---------- | ------- | ---------------------------- | ------------ |
| **Battle** | 2       | Ranked PvP                   | Available    |
| **Solo**   | 1       | Practice                     | Coming Soon  |
| **Co-op**  | 4       | Team Up                      | Coming Soon  |
| **Custom** | 2–8     | Private Match                | Coming Soon  |

## Game Mechanics

- **Board**: 8×8 grid with 6 piece types
- **Scoring**: 10 base points per match
  - 3 pieces → ×1, 4 pieces → ×2, 5+ pieces → ×3
  - Combo bonus: ×(1 + combo × 0.5)
- **Duration**: 60 seconds per match

## Tech Stack

- **Framework**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Rendering**: HTML5 Canvas
- **Auth Protection**: Cloudflare Turnstile
- **Analytics**: Vercel Analytics, Speed Insights
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase project

### Environment Variables

| Variable                         | Description                   |
| -------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase project URL          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Supabase anonymous key        |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |

### Installation

```bash
pnpm install
cp .env.local.example .env.local
```

### Database Setup

Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy contents of supabase/schema.sql to Supabase SQL Editor and execute
```

### Development

```bash
pnpm dev
```

## How to Play

1. Sign in and enter the lobby
2. **Create a match** or **Join** an existing one with a 6-digit code
3. Wait for your opponent to join, then the host starts the game
4. Swap adjacent pieces to match 3 or more of the same color
5. Chain combos for higher multipliers
6. Score the most points within 60 seconds to win!

## License

Copyright (c) 2026 Jaem. All rights reserved.

This source code is provided for reference only.
Unauthorized copying, modification, or distribution is prohibited without explicit permission.
