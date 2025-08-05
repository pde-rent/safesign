# Guidelines

## Stack
Package manager, runtime: Bun
Bundler: Vite
Front: Typescript (ESM) + preact + preact/compat + lightweight custom HistoryAPI router + zustand + tailwind + shadcn
Back: Typescript (ESM) + Bun pour le back-end qui génere les documents et stocke (in-memory storage only, mapping that gets dumped to file at regular interval, eg. 5min)
Common: Typescript (ESM) to share models back to front

Be extremely minimal, concise, elegant and generic (reusable, DRY).

## Language
Code in english, concise but clear variable naming.
The default application content (copywriting) and documents are in french.
