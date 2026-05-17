# Waste to Value

Waste to Value is a gamified recycling and rewards mobile app built with Expo SDK 55. The app helps users convert recyclable waste into points, track their recycling activity, redeem rewards, and compare progress through leaderboards.

The current build is an offline-first Expo Router application with local SQLite storage, SecureStore-backed sessions, and Android-first Bluetooth Low Energy support for an ESP32 HX711 weighing scale.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [App Navigation](#app-navigation)
- [Feature Documentation](#feature-documentation)
- [Points and Rewards Logic](#points-and-rewards-logic)
- [Local Data Model](#local-data-model)
- [Bluetooth Scale Integration](#bluetooth-scale-integration)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Development Notes](#development-notes)
- [Troubleshooting](#troubleshooting)

## Features

- User registration, login, persistent sessions, and logout.
- Dashboard with current points, total recycled weight, weekly progress, quick actions, and recent activity.
- Weigh and earn flow that reads recyclable weight from an ESP32 HX711 BLE scale.
- Automatic point calculation for supported recyclable material types.
- Rewards catalog with point-based redemption and redemption history.
- Recycling history with transaction summaries.
- Weekly, monthly, and all-time leaderboards.
- Profile summary with eco badge, total points, total recycled weight, reward count, and app info.
- Local offline persistence using SQLite.
- Secure session persistence using Expo SecureStore.

## Tech Stack

| Area | Technology |
| --- | --- |
| App runtime | Expo SDK 55 |
| UI framework | React Native 0.83, React 19.2 |
| Routing | Expo Router 55 |
| Storage | expo-sqlite |
| Session storage | expo-secure-store |
| Bluetooth | react-native-ble-plx |
| Images | expo-image |
| Fonts | Lexend via @expo-google-fonts/lexend |
| Language | TypeScript |
| Linting | Expo ESLint config |

The project follows Expo SDK 55 compatibility. The Expo v55 reference lists React Native 0.83, React 19.2.0, React Native Web 0.21.0, and Node.js 20.19.x as the matching baseline for SDK 55.

## Requirements

- Node.js 20.19.x or newer compatible with Expo SDK 55.
- npm.
- Android Studio or a connected Android device for native Android development.
- Expo CLI through `npx expo`.
- An Android development build for BLE scale features. Expo Go is not enough for `react-native-ble-plx` because it requires native modules.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

Run on Android:

```bash
npm run android
```

Run on web:

```bash
npm run web
```

Lint the project:

```bash
npm run lint
```

## Available Scripts

| Script | Description |
| --- | --- |
| `npm start` | Starts the Expo development server. |
| `npm run android` | Builds and runs the native Android app with Expo. |
| `npm run ios` | Builds and runs the native iOS app. |
| `npm run web` | Starts the app for web preview. |
| `npm run lint` | Runs Expo linting. |
| `npm run reset-project` | Runs the template reset script. Use carefully because it is intended for starter cleanup. |

## App Navigation

The app uses Expo Router with a root stack and authenticated tab routes.

| Route | Purpose |
| --- | --- |
| `/` | Redirects users to the authenticated tabs or login screen. |
| `/auth` | Login and registration screen. |
| `/(tabs)` | Main authenticated app area. |
| `/(tabs)/index` | Home dashboard. |
| `/(tabs)/weigh` | ESP32 scale connection and point earning. |
| `/(tabs)/rewards` | Rewards catalog and redemption history. |
| `/(tabs)/history` | Recycling transaction history. |
| `/(tabs)/leaderboard` | Weekly, monthly, and all-time rankings. |
| `/(tabs)/profile` | User profile, stats, app info, and logout. |

## Feature Documentation

### Authentication

Authentication is handled by `src/providers/auth-provider.tsx` and `src/lib/database.ts`.

- The app initializes the SQLite database when the auth provider mounts.
- New users register with a username and password.
- Usernames must be at least 3 characters.
- Passwords must be at least 6 characters.
- Passwords are hashed with `expo-crypto` before being stored.
- Session state stores the current user id in `expo-secure-store` under `waste-to-value-user-id`.
- Demo leaderboard users are seeded locally and cannot be used to log in.

### Home Dashboard

The dashboard at `src/app/(tabs)/index.tsx` is the main hub after login.

- Shows the signed-in user's name.
- Displays total available points.
- Shows total recycled weight and weekly recycled weight.
- Tracks progress against a 2,000 gram weekly goal.
- Links to weigh, rewards, history, and leaderboard screens.
- Lists the three most recent recycling transactions.

### Weigh and Earn

The weigh flow is implemented in `src/app/(tabs)/weigh.tsx`.

- Connects to an Android BLE scale using the `useBleScale` hook.
- Reads a weight value from the ESP32 HX711 scale.
- Calculates points for the selected material.
- Saves the recycling transaction to SQLite.
- Updates the user's points and total recycled weight in the same database transaction.

The current screen is configured for sachet waste as the default material type.

### Rewards

Rewards are handled by `src/app/(tabs)/rewards.tsx` and seeded in `src/lib/database.ts`.

- Users can view the full rewards catalog.
- Rewards become redeemable when the user has enough points.
- Redeeming a reward deducts points from the user's account.
- Each redemption is saved to `reward_redemptions`.
- Redemption history is shown below the catalog.

### History

The history screen at `src/app/(tabs)/history.tsx` displays all recycling transactions for the current user.

- Summary card shows total recycled weight, total earned points, and transaction count.
- Each history item shows date, waste type, weight, earned points, and time.
- Empty state appears when no transactions exist yet.

### Leaderboard

The leaderboard at `src/app/(tabs)/leaderboard.tsx` compares recycling impact across users.

- Weekly leaderboard uses transactions from the start of the current week.
- Monthly leaderboard uses transactions from the first day of the current month.
- All-time leaderboard uses each user's stored point and weight totals.
- The top three users are displayed in a podium layout.
- Remaining users are shown in ranked cards.

### Profile

The profile screen at `src/app/(tabs)/profile.tsx` summarizes the user's account.

- Displays username and eco badge.
- Shows total points and total recycled weight.
- Shows number of rewards claimed.
- Links to the leaderboard.
- Provides app info and logout.

## Points and Rewards Logic

Point calculation lives in `src/lib/recycling.ts`.

```text
points = round(weightGrams * materialMultiplier)
```

| Waste Type | Multiplier |
| --- | ---: |
| Sachet | 2 |
| Plastic Bottle | 3 |
| Aluminum | 4 |
| Mixed Waste | 1 |

Reward catalog:

| Reward | Required Points |
| --- | ---: |
| Eco Bag | 100 |
| School Supplies | 200 |
| Rice 1kg | 300 |
| Canned Goods | 500 |
| GCash PHP 50 | 800 |

Eco badge levels:

| Points | Badge |
| ---: | --- |
| 0-249 | Eco Starter |
| 250-749 | Waste Warrior |
| 750-1,999 | Green Builder |
| 2,000-4,999 | Recycling Hero |
| 5,000+ | Eco Champion |

## Local Data Model

The local database is created as `waste-to-value.db` through `expo-sqlite`.

### `users`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER | Primary key. |
| `username` | TEXT | Display username. |
| `username_key` | TEXT | Lowercase unique lookup key. |
| `password_hash` | TEXT | SHA-256 username/password hash or demo seed marker. |
| `points` | INTEGER | Current available points. |
| `total_weight` | REAL | Total recycled weight in grams. |
| `created_at` | TEXT | ISO timestamp. |

### `recycling_transactions`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER | Primary key. |
| `user_id` | INTEGER | References `users.id`. |
| `waste_type` | TEXT | Material type. |
| `weight_grams` | REAL | Recycled weight. |
| `points` | INTEGER | Points earned. |
| `created_at` | TEXT | ISO timestamp. |

### `rewards`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER | Primary key. |
| `name` | TEXT | Reward name. |
| `points_required` | INTEGER | Cost to redeem. |

### `reward_redemptions`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER | Primary key. |
| `user_id` | INTEGER | References `users.id`. |
| `reward_id` | INTEGER | References `rewards.id`. |
| `reward_name` | TEXT | Reward name snapshot. |
| `points_spent` | INTEGER | Points deducted. |
| `created_at` | TEXT | ISO timestamp. |

## Bluetooth Scale Integration

BLE support is implemented in `src/lib/ble-scale.ts`.

| Setting | Value |
| --- | --- |
| Device name | `WasteScale` |
| Service UUID | `7e400001-b5a3-f393-e0a9-e50e24dcca9e` |
| Weight characteristic UUID | `7e400003-b5a3-f393-e0a9-e50e24dcca9e` |
| Expected payload | `WT:123.4` or `123.4` |
| Target platform | Android-first |

Android behavior:

- Android 12 and newer request `BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT`.
- Older Android versions request `ACCESS_FINE_LOCATION`.
- Scanning is limited to 12 seconds.
- Weight notifications are decoded from base64 and parsed as grams.
- If the native BLE module is unavailable, the app tells the user to use an Android development build.

The BLE plugin is configured in `app.json` with central mode and the permission message: "Allow Waste to Value to connect to the ESP32 recycling scale."

## Project Structure

```text
.
|-- app.json
|-- package.json
|-- prd.md
|-- docs/
|   |-- features/
|   `-- reward-image-sources.md
|-- assets/
|   `-- images/
|-- scripts/
|   `-- reset-project.js
`-- src/
    |-- app/
    |   |-- _layout.tsx
    |   |-- auth.tsx
    |   |-- index.tsx
    |   `-- (tabs)/
    |-- components/
    |-- constants/
    |-- hooks/
    |-- lib/
    `-- providers/
```

Important files:

| File | Purpose |
| --- | --- |
| `src/app/_layout.tsx` | Loads fonts, navigation theme, auth provider, and splash overlay. |
| `src/app/auth.tsx` | Login and registration UI. |
| `src/app/(tabs)/index.tsx` | Dashboard UI and recent activity. |
| `src/app/(tabs)/weigh.tsx` | BLE weighing and transaction save flow. |
| `src/app/(tabs)/rewards.tsx` | Reward catalog and redemption history. |
| `src/app/(tabs)/history.tsx` | Transaction history. |
| `src/app/(tabs)/leaderboard.tsx` | Ranking periods and podium. |
| `src/app/(tabs)/profile.tsx` | Profile summary and logout. |
| `src/lib/database.ts` | SQLite schema, seed data, and data access functions. |
| `src/lib/recycling.ts` | Point formulas, badge logic, date helpers, and formatting. |
| `src/lib/ble-scale.ts` | BLE permissions, scan, connection, and payload parsing. |
| `src/providers/auth-provider.tsx` | Authentication context and SecureStore session handling. |

## Configuration

Key Expo configuration lives in `app.json`.

- App name: `elemsys-finals`.
- Scheme: `elemsysfinals`.
- Orientation: portrait.
- Web output: static.
- Android package: `com.mark_christian.elemsysfinals`.
- Plugins:
  - `expo-router`
  - `expo-splash-screen`
  - `expo-sqlite`
  - `expo-secure-store`
  - `react-native-ble-plx`
- Experiments:
  - Typed routes enabled.
  - React Compiler enabled.

## Development Notes

- The app is designed as an offline-first demo, so user accounts, transactions, rewards, and redemptions are local to the device.
- Deleting the local app data removes the SQLite database and SecureStore session.
- Demo users are inserted into the local database to make the leaderboard feel populated.
- Reward images are stored in `assets/images/rewards`.
- Additional feature notes are available under `docs/features`.
- The UI uses Lexend fonts and shared app primitives from `src/components/waste-ui.tsx`.

## Troubleshooting

### Bluetooth scale is unavailable

Use an Android development build instead of Expo Go. The BLE library needs native code that is not included in Expo Go.

### App cannot find the ESP32 scale

- Confirm the scale advertises as `WasteScale`.
- Confirm it exposes service UUID `7e400001-b5a3-f393-e0a9-e50e24dcca9e`.
- Confirm Bluetooth is enabled on the Android device.
- Confirm the requested Bluetooth permissions were granted.
- Restart scanning after powering on the ESP32.

### Weight readings do not appear

- Confirm the ESP32 sends notifications on characteristic UUID `7e400003-b5a3-f393-e0a9-e50e24dcca9e`.
- Send payloads as plain numbers, such as `123.4`, or prefixed values, such as `WT:123.4`.
- Ensure values are positive gram readings.

### Login does not work for seeded demo users

Seeded users are leaderboard examples only. Register a new account to sign in and use the app.

### Web preview has storage limitations

SecureStore and BLE are target-runtime features for native builds. Web preview is useful for layout checks, but Android is the primary runtime for the full app experience.

## References

- [Expo SDK 55 documentation](https://docs.expo.dev/versions/v55.0.0/)
- [Expo Router documentation](https://docs.expo.dev/versions/v55.0.0/sdk/router/)
- [Expo SQLite documentation](https://docs.expo.dev/versions/v55.0.0/sdk/sqlite/)
- [Expo SecureStore documentation](https://docs.expo.dev/versions/v55.0.0/sdk/securestore/)
