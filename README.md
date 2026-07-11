# LocalLens

LocalLens is an AI travel planning MVP that helps users **travel like a local**. It uses Gemini 2.5 Flash with structured JSON output and function-calling mock tools to generate personalized destination recommendations and itineraries.

## Tech stack

- Next.js 15 (App Router)
- React + TypeScript
- Tailwind CSS
- shadcn/ui-style reusable UI primitives
- Framer Motion
- Gemini 2.5 Flash via `@google/genai`

## Features

- Landing page (`/`) with prompt input and loading state
- Planning API (`/api/plan`) using Gemini and mock tool calling
- Results page (`/results`) with:
  - Destination recommendation
  - Reasoning panel
  - Trip summary
  - Budget visualization
  - Timeline itinerary
  - Restaurants and activities
  - Packing list, warnings, and alternatives

## Installation

```bash
npm install
```

## Gemini API setup

1. Create a Gemini API key in Google AI Studio.
2. Add it to a local `.env.local` file:

```bash
GEMINI_API_KEY=your_key_here
```

If no API key is set, LocalLens still returns a believable fallback plan for local development.

## Running locally

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Build & lint

```bash
npm run lint
npm run build
```

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import project into Vercel.
3. Set environment variable `GEMINI_API_KEY` in Vercel project settings.
4. Deploy.

## Architecture

```text
app/
  api/plan/route.ts      # Gemini planning endpoint
  page.tsx               # Landing page
  results/page.tsx       # Results view
components/
  ...                    # Reusable UI components
hooks/
  useTripPlanner.ts      # Client planning flow
lib/
  prompts.ts             # System prompt
  utils.ts               # UI utility helpers
services/
  geminiPlanner.ts       # Gemini orchestration + tool-calling loop
  mockTools.ts           # searchFlights/searchHotels/searchActivities/searchWeather
types/
  travel.ts              # Strict response/request interfaces
```

## Future improvements

- Persist plans to a database so results survive refresh
- Add real flight/hotel/activity providers
- Add map + transit integration
- Add localization and multi-currency support
- Add automated end-to-end tests
