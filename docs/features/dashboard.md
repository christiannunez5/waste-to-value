# Dashboard

## Purpose

Home is the main hub for current progress, quick actions, and recent recycling activity.

## Displayed Metrics

- Total points from the current user row.
- Eco badge from the current point total.
- Total recycled weight from the current user row.
- Weekly recycled weight from transactions created after the start of the current week.
- Weekly progress against a 2kg demo goal.

## Quick Actions

- Weigh Now routes to `/weigh`.
- View Rewards routes to `/rewards`.
- History routes to `/history`.
- Leaderboard routes to `/leaderboard`.

## Recent Activity

- Shows the three latest recycling transactions.
- Each item displays waste type, weight, date/time, and earned points.
- Empty state points the user toward Weigh Now.

## Test Cases

- New account shows zero points, zero recycled weight, and an empty activity state.
- Saving a transaction updates total points, total weight, weekly progress, and recent activity.
- Quick action buttons navigate to the expected routes.
