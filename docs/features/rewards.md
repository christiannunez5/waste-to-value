# Rewards

## Purpose

Rewards let users exchange earned points for seeded catalog items.

## Catalog

Rewards are seeded into SQLite on first database initialization.

| Reward | Points Required |
| --- | --- |
| Eco Bag | 100 |
| School Supplies | 200 |
| Rice 1kg | 300 |
| Canned Goods | 500 |
| GCash ₱50 | 800 |

## Redemption Rules

- Users must be logged in.
- Users must have enough points for the selected reward.
- Successful redemption deducts points from the user row.
- A redemption record is saved with reward name, points spent, and timestamp.

## History Behavior

- Redemptions appear newest first.
- Empty state appears until the first reward is claimed.
- The profile screen also uses redemption history to show the claimed count.

## Test Cases

- A reward with insufficient points shows a locked action.
- Redeeming an affordable reward deducts the correct point amount.
- Redemption history shows the claimed reward and timestamp.
- User points remain unchanged when redemption fails.
