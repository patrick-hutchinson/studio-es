# Studio Es Web (Next.js)

This folder now runs as a Next.js app using the App Router.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Notes

- Sanity data is fetched through `src/lib/sanity.ts`.
- A compatibility API endpoint exists at `src/app/api/sanity/route.ts`.
- Routes:
  - `/` home/projects index
  - `/[slug]` project detail
  - `/legal`
