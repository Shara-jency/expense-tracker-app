# SpendLens

A personal expense tracker built with Expo (SDK 57) and Firebase. SpendLens goes beyond simple expense logging — it separates day-to-day discretionary spending from fixed liabilities (rent, credit cards, loan EMIs), detects recurring "spending leaks," tracks loan payoff timelines, and nudges you with bill and weekly logging reminders.

## Features

- **Email/password auth** via Firebase Authentication, with persisted sessions (AsyncStorage-backed).
- **Daily expenses** — log an expense with title, amount, category, and notes; edit or delete any entry.
- **Fixed bills & liabilities** — track recurring obligations (Credit Card Bill, Loan EMI, House Rent, Utilities, Insurance) with a due date and paid/pending status.
- **Loan EMI tracking** — Loan EMI bills carry a maturity/end date. The app computes months remaining and projected remaining payout, and automatically marks a loan "Completed" once it matures (excluding it from ongoing fixed-obligation totals).
- **Quick Add** — a floating action button available on every tab for fast expense entry, with an optional receipt photo attachment.
- **Search & filter** — filter the dashboard's expense list by category or free-text search.
- **Analytics** — commitment-ratio pie chart (fixed vs. discretionary vs. unspent), a 4-month spending trend bar chart, per-category budget caps with progress bars, detected spending leaks (habits repeated 4+ times in 30 days) with projected yearly cost, and an active loans/EMI payoff summary.
- **CSV export** — export all expenses and liabilities to a CSV file and share it via the native share sheet.
- **Notifications** — a bill reminder the day before a due date, and an optional weekly Saturday check-in reminding you to log any missed expenses (toggle it off from Profile & Settings).
- **Dark/light theme** toggle, persisted for the session via the in-app theme switcher.

## Tech stack

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) / React Native 0.86 / React 19
- [Firebase](https://firebase.google.com/) (Authentication + Firestore) via the Firebase JS SDK
- React Navigation (bottom tabs)
- `react-native-chart-kit` for charts
- `@react-native-async-storage/async-storage` for auth persistence and local preferences
- `expo-notifications`, `expo-image-picker`, `expo-file-system`, `expo-sharing`, `@react-native-community/datetimepicker`

## Project structure

```
App.js                      App shell: auth-state gate, theme, tab navigator, notification bootstrap
src/
  components/                Reusable UI: cards, modals, the Quick Add FAB, loaders
  config/firebase.js          Firebase app/auth/Firestore initialization
  constants/categories.js     Single source of truth for expense & bill category lists
  context/ThemeContext.js     Dark/light theme provider
  screens/                    One file per tab (Dashboard, Add Expense, Analytics, Profile) + Auth
  services/                   Business logic: analytics, leak detection, notifications, CSV export
  styles/                     Per-screen/component StyleSheets, all built from styles/theme.js tokens
```

## Data model (Firestore)

Two collections, both scoped by `userId`:

- **`expenses`** — `{ userId, title, amount, category, notes, expenseDate?, receiptUri?, createdAt }`
- **`mandatory_expenses`** — `{ userId, title, amount, category, dueDate, maturityDate?, isPaid, notes, createdAt }`
  - `maturityDate` (YYYY-MM-DD) is only set for `category: 'Loan EMI'` and marks when the loan is fully repaid.

## Getting started

### Prerequisites

- Node.js (this project's history targets Node 22.12.0)
- A Firebase project with **Authentication (Email/Password)** and **Firestore** enabled
- Expo Go (for quick testing) or an EAS development build (required for native modules like notifications on Android — see below)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Create a `.env` file in the project root (already gitignored) with your Firebase web app config:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

These are read in [src/config/firebase.js](src/config/firebase.js).

### 3. Run the app

```bash
npm start        # Expo dev server — scan the QR code with Expo Go
npm run android   # Build/run a native Android dev client
npm run ios       # Build/run a native iOS dev client
npm run web       # Run in a browser
```

> **Note on notifications:** `expo-notifications` does not support push functionality in Expo Go on Android (SDK 53+). The app detects this at runtime and disables scheduling gracefully — bill and weekly reminders only fire in a development build, preview APK, or production build. See [src/services/notificationService.js](src/services/notificationService.js).

## Firestore security

This project does not ship Firestore security rules. Before using a real Firebase project, add rules that restrict every document in `expenses` and `mandatory_expenses` to `request.auth.uid == resource.data.userId`.
