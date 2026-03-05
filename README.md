# LINE Chat Web Application

Web chat application with LINE Official Account integration for broadcasting messages to all followers.

## Features

- Broadcast messages to all LINE followers from web interface
- Real-time message status (sending/sent/error)
- LINE webhook integration for receiving messages
- TypeScript with strict mode
- Tailwind CSS v4
- Next.js 16 App Router

## Setup

### Prerequisites

- Node.js 18+
- pnpm
- LINE Official Account with Messaging API enabled

### Installation

```bash
pnpm install
```

### Environment Variables

Create `.env.local` file:

```env
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret
```

Get credentials from [LINE Developers Console](https://developers.line.biz/console/)

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
tifa/
├── app/
│   ├── api/
│   │   ├── broadcast/route.ts    # Broadcast API
│   │   └── webhook/route.ts      # LINE webhook
│   ├── page.tsx                  # Main chat page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/ui/                # Chat UI components
├── types/line.ts                 # TypeScript types
└── lib/utils.ts                  # Utilities
```

## Usage

### Broadcast Messages

1. Type message in the web chat input
2. Press Enter
3. Message broadcasts to all LINE followers
4. See confirmation or error message

### API Endpoints

**POST /api/broadcast**
- Broadcasts message to all followers
- Body: `{ message: "text" }`
- Returns: `{ success: boolean, messageId?: string, error?: string }`

**POST /api/webhook**
- Receives LINE webhook events
- Handles incoming messages
- Signature verification included

## Tech Stack

- Next.js 16
- TypeScript (strict mode)
- Tailwind CSS v4
- @line/bot-sdk v10.6.0
- Google Font Kanit
