# Avenix Style Hub

A modern e-commerce fashion web application built with React + TypeScript + Vite, using Supabase as the backend.

## Project Structure

The main project lives in `avenix-style-hub-main/`.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui, Radix UI
- **State:** React Query (TanStack), React Context API
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage)
- **Routing:** React Router DOM v6
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion

## Development

The dev server runs on port 5000.

```bash
cd avenix-style-hub-main && npm run dev
```

## Deployment

Configured as a static site deployment:
- **Build:** `cd avenix-style-hub-main && npm run build`
- **Public Dir:** `avenix-style-hub-main/dist`

## Features

- Customer-facing: product browsing, category filtering, search, cart, wishlist, checkout
- Admin dashboard at `/admin`: product management, orders, advertisements, reviews, payment settings
- Role-based access via Supabase Auth (Admin vs Customer)
- Admin registration protected by code: `TRENDING2026`

## Environment Variables

Supabase credentials are configured in `src/integrations/supabase/client.ts`.
