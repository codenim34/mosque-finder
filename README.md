# Mosque Finder (moshjid-jamat)

Mosque Finder is an open-source community project to discover nearby mosques, view jamat times, and improve data quality through user contributions.

This project is built with Next.js and MongoDB, and contributions from developers, designers, QA testers, and community moderators are all welcome.

## Features

- Map and list browsing experiences
- Search by mosque name, address, or city
- Prayer-time and facilities display
- Add mosque flow (Bangla/English-friendly UI)
- Community updates for mosque information
- Verification and contribution-driven data quality

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- MongoDB + Mongoose
- Tailwind CSS
- Radix UI primitives

## Local Development

1. Clone the repository:

```bash
git clone <your-fork-or-repo-url>
cd mosque-finder
```

2. Install dependencies:

```bash
npm install
```

3. Add environment variables in `.env.local`:

```bash
MONGODB_URI=your_mongodb_connection_string
```

4. Start the dev server:

```bash
npm run dev
```

5. Open:

`http://localhost:3000`

## Project Routes (Current)

- `/` -> list-first landing experience
- `/map` -> map-first experience
- `/add` -> add mosque
- `/mosque/[id]` -> mosque details

## Contributing

We want this to be easy for everyone to contribute.

### Ways You Can Contribute

- Fix bugs
- Improve UI/UX (especially mobile)
- Add features
- Improve accessibility and translations
- Improve performance
- Improve tests and documentation

### Contribution Workflow

1. Fork the repository
2. Create a branch:

```bash
git checkout -b feat/short-description
```

3. Make focused changes (small and clear PRs are best)
4. Run local checks:

```bash
npm run lint
npm run build
```

5. Commit with clear messages:

```bash
git commit -m "feat: add update suggestion validation"
```

6. Push your branch and open a Pull Request

### Pull Request Checklist

- [ ] The change solves one clear problem
- [ ] Code follows existing style and naming patterns
- [ ] No unrelated files were modified
- [ ] Lint/build passes locally
- [ ] UI changes include screenshots (if applicable)
- [ ] API changes include request/response notes in PR description

## Reporting Bugs / Suggesting Features

Please open an Issue and include:

- Clear title
- Steps to reproduce (for bugs)
- Expected behavior
- Actual behavior
- Screenshots/logs if possible
- Environment details (browser, device, OS)

For features, describe:

- Problem being solved
- Proposed solution
- Any UI/API impact

## Code Style Guidelines

- Keep components small and reusable
- Prefer explicit TypeScript types for API and data models
- Avoid large, mixed-purpose commits
- Keep user-facing text translatable
- Prefer mobile-first responsive design

## Community Guidelines

- Be respectful and constructive
- Assume good intent
- Keep feedback specific and actionable
- Help newcomers with clear review comments

## Need Help?

If you are new and want a good first task, open an issue with:

`good first issue request`

and mention your experience level.

We will suggest beginner-friendly tasks.

---

Built and improved by the open-source community.
