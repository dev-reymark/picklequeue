# Changelog

All notable changes to the **PICKLEQUEUE** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0-beta] - 2026-09-15

### Added
- **Procedural Sound Suite**: Web Audio API oscillator synthesis for clicks, confirmations, timer chimes, double beeps, and game-over buzzers without external audio files.
- **Sound Profiles**:
  - `Minimal` (Venue Recommended & Default): Restricts audio to timer warnings and court assignments.
  - `Standard`: Full UI and event audio feedback.
  - `Silent`: Mutes all audio output.
- **Timer Milestone Guards**: Persistent `useRef` flags preventing alert repetition during overtime or UI re-renders.
- **Device Vibration**: Optional mobile/tablet haptic feedback for game endings.
- **Light Mode Pin-Dot Grid**: Subtle 1px dot-matrix background pattern for clean venue display.
- **GitHub Documentation & CI**: Architecture spec, queue system docs, pull request templates, and GitHub Actions CI workflow.

### Fixed
- Defensive fallbacks for `venueName` and `sessionName` preventing runtime exceptions when saving settings with legacy `localStorage` state.

---

## [0.2.0-alpha] - 2026-09-15

### Added
- **Multi-Tab Settings Console**: General venue rules, game timing, queue mode, custom court names, and data backup.
- **Custom Court Naming**: Ability to rename courts (e.g. *Center Court*) and dynamically add/delete courts.
- **Post-Match Rotation Dialog**: Options to Return to Waiting Pool, Requeue, Mark as Resting, or Check Out.
- **Data Export & Import**: Complete session backup export and restore via JSON.
- **First-Run Onboarding Tutorial**: 5-step interactive spotlight tour with replay support.
- **Component-Driven UI Primitives**: Standardized `Button`, `Badge`, `Input`, `Select`, `Modal`, `Switch`, `Card`, and `Tooltip` in `src/components/ui/`.

---

## [0.1.0-alpha] - 2026-09-15

### Added
- Initial project architecture with Next.js 16 (App Router), TypeScript, Tailwind CSS, and Zustand.
- Real-time court cards with drift-free countdown timers based on absolute system timestamps.
- Waiting players pool with multi-select grouping and 1-click Auto-Balance (4 players).
- FIFO queue panel with drag reordering and 1-click court dispatch.
- Light, Dark, and System theme switching via `next-themes`.
- Strictly zero emojis and minimal Lucide icon aesthetic.
