# History

## Purpose

History shows the user's saved recycling transactions from local SQLite storage.

## Transaction Schema

Each transaction stores:

- User id
- Waste type
- Weight in grams
- Points earned
- Creation timestamp

## Display Format

- Transactions are ordered newest first.
- Each row displays material, points earned, date/time, and formatted weight.
- Weight is shown as grams below 1000g and kilograms at 1000g or higher.

## Empty State

New accounts show an empty state until a weigh-and-earn transaction is saved.

## Test Cases

- Save multiple transactions and confirm newest appears first.
- Confirm each material type displays correctly.
- Confirm point values match the material multiplier used at save time.
- Confirm transaction history persists after app restart.
