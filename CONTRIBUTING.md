# Contributing to PICKLEQUEUE

Thank you for your interest in contributing to **PICKLEQUEUE**!

---

## Code of Conduct & Design Principles

To maintain a focused, professional product interface suitable for venue operations, please adhere to these core rules:

1. **Strictly Zero Emojis**: Do not use emojis in UI components, notifications, buttons, badges, or code comments. Use semantic CSS indicator dots or clean SVG iconography.
2. **Minimal Iconography**: Keep icon usage minimal and purposeful (Settings cog, Volume, Close ✕, Help). Avoid decorative clutter.
3. **High-Contrast Venue Readability**: Court statuses and timers must remain clearly legible from several meters away on court tablets.
4. **Drift-Free Timestamp Math**: Never build countdown timers using incrementing `setInterval` counters. Always calculate time remaining from `endsAt - Date.now()`.
5. **Component-Driven UI**: Place reusable visual primitives in `src/components/ui/`. Reuse existing variants instead of writing ad-hoc styles.

---

## Development Workflow

1. Fork or clone the repository:
   ```bash
   git clone https://github.com/dev-reymark/picklequeue.git
   cd picklequeue
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Verify tests and build before opening a PR:
   ```bash
   npx tsc --noEmit
   npm run build
   ```

---

## Pull Request Guidelines

- Use clear commit messages following Conventional Commits (e.g., `feat: ...`, `fix: ...`, `docs: ...`).
- Ensure all CI checks pass.
- Fill out the provided Pull Request template completely.
