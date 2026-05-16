# Leaderboard And Profile

## Leaderboard Purpose

The leaderboard gamifies recycling by ranking local users and seeded demo participants.

## Ranking Windows

- Weekly sums transactions from the current week.
- Monthly sums transactions from the current month.
- All-time uses each user's stored total points and total recycled weight.
- Ties sort by recycled weight.

## Profile Purpose

Profile summarizes the current account and provides logout.

## Profile Stats

- Username
- Eco badge
- Total points
- Total recycled weight
- Reward redemption count
- App runtime note for offline demo and Android BLE support

## Logout Behavior

- Logout clears the SecureStore session key.
- The user is returned to `/auth`.
- Offline SQLite data remains on the device.

## Test Cases

- Confirm seeded demo users appear on the leaderboard.
- Confirm the current user rank changes after saving transactions.
- Confirm weekly and monthly views respond to transaction dates.
- Confirm profile points and total recycled weight match dashboard values.
- Confirm logout blocks access to tab screens.
