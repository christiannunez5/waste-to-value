# Waste to Value — Product Requirements Document (PRD)

---

# 1. Product Overview

## 1.1 Product Name

Waste to Value

## 1.2 Product Type

Gamified Recycling + Rewards Mobile Application

## 1.3 Vision

Waste to Value aims to encourage proper recycling behavior by converting recyclable waste into redeemable points. Users can weigh recyclable materials such as sachets, plastics, and aluminum and receive points that can later be exchanged for rewards.

---

# 2. Goals & Objectives

## Primary Goals

- Encourage recycling through rewards
- Gamify waste collection
- Track recycling activities
- Promote environmental awareness

## Secondary Goals

- Support barangay recycling programs
- Encourage school/community participation
- Build competitive eco-friendly habits through leaderboards

---

# 3. Target Users

- Students
- Households
- Barangays
- Eco volunteers
- LGUs
- Recycling organizations

---

# 4. Core Features

# 4.1 Authentication System

## Features

- User Registration
- User Login
- Persistent Login Session
- Logout

## Stored Data

- Username
- Password
- Points
- Total Recycled Weight

---

# 4.2 Home Dashboard

## Purpose

Acts as the main hub of the application.

## UI Components

### Header Section

- Welcome Message
- Notification Icon

### Points Card

- Total Points Display
- User Eco Badge

### Recycling Statistics

- Total Recycled Weight
- Weekly Recycling Progress

### Quick Action Buttons

- Weigh Now
- View Rewards
- History
- Leaderboard

---

# 4.3 Weigh & Earn Module

## Purpose

Allows users to weigh recyclable materials and convert them into points.

---

## User Flow

### Step 1 — Select Waste Type

Available Types:

- Sachet
- Plastic Bottle
- Aluminum
- Mixed Waste

---

### Step 2 — Input Weight

The user:

- Inputs weight manually
  OR
- Uses Bluetooth digital scale integration

Example:

- 150 grams

---

### Step 3 — Calculate Points

Formula:

```math
Points = Weight × MaterialMultiplier
```

### Material Multipliers

| Material       | Multiplier |
| -------------- | ---------- |
| Sachet         | x2         |
| Plastic Bottle | x3         |
| Aluminum       | x4         |
| Mixed Waste    | x1         |

Example:

- 150g Sachet = 300 points

---

### Step 4 — Save Transaction

Saved Information:

- Waste Type
- Weight
- Points Earned
- Date & Time

---

# 4.4 Rewards System

## Purpose

Allows users to redeem rewards using earned points.

---

## Reward Catalog

| Reward          | Points Required |
| --------------- | --------------- |
| Eco Bag         | 100             |
| Rice 1kg        | 300             |
| Canned Goods    | 500             |
| GCash ₱50       | 800             |
| School Supplies | 200             |

---

## Redemption Flow

1. User selects reward
2. System checks available points
3. Deduct points
4. Save redemption history
5. Display success message

---

# 4.5 History Module

## Purpose

Displays all recycling transactions.

---

## Stored Information

- Date
- Waste Type
- Weight
- Points Earned

---

## Example Entry

```text
May 16 - Sachet - 200g - +400 pts
```

---

# 4.6 Leaderboard System

## Purpose

Gamifies recycling through competition.

---

## Leaderboard Types

- Weekly
- Monthly
- All-Time

---

## Displayed Information

- Rank
- Username
- Total Points
- Badge

---

# 5. UI/UX Design System

# 5.1 Color Palette

## Primary Colors

| Purpose     | Hex     |
| ----------- | ------- |
| Main Green  | #2E8B3C |
| Dark Green  | #1F6E2A |
| Light Green | #DFF3E3 |
| Background  | #F3FAF4 |

---

## Accent Colors

| Purpose | Hex     |
| ------- | ------- |
| Gold    | #F4C542 |
| Orange  | #E89B2D |
| Blue    | #0057D9 |

---

## Neutral Colors

| Purpose   | Hex     |
| --------- | ------- |
| White     | #FFFFFF |
| Gray Text | #6B7280 |
| Dark Text | #1F2937 |

---

# 5.2 Typography

## Font Suggestions

- Poppins
- Inter

## Font Weights

- Headings: Bold
- Body: Regular
- Point Displays: Extra Bold

---

# 5.3 UI Style

- Rounded Cards
- Soft Shadows
- Large Touch Targets
- Eco-themed Icons
- Minimalistic Design

---

# 6. Navigation Structure

## Bottom Navigation Bar

| Screen  | Purpose          |
| ------- | ---------------- |
| Home    | Dashboard        |
| Weigh   | Scale Module     |
| Rewards | Rewards Page     |
| History | Transaction Logs |
| Profile | User Information |

---

# 7. Database Structure

# 7.1 User Data

```json
{
  "username": "Christian",
  "password": "hashed_password",
  "points": 500,
  "totalWeight": 3.5
}
```

---

# 7.2 Recycling Transaction

```json
{
  "user": "Christian",
  "type": "Sachet",
  "weight": 150,
  "points": 300,
  "date": "2026-05-16"
}
```

---

# 7.3 Rewards

```json
{
  "reward": "Eco Bag",
  "pointsRequired": 100
}
```

---

# 8. System Logic

# 8.1 Points Formula

```math
P = W × M
```

Where:

- P = Points
- W = Weight
- M = Material Multiplier

---

# 8.2 Validation Rules

- Weight must be greater than 0
- User must be logged in
- User must have enough points for redemption

---

# 9. Non-Functional Requirements

## Performance

- Fast UI interactions
- Lightweight storage

## Reliability

- Offline support using TinyDB
- Data persistence

## Security

- Secure password handling
- User authentication validation

---

# 10. Future Enhancements

## AI Features

- AI waste detection using camera
- Automatic material classification

## Hardware Integration

- Bluetooth weighing scale support
- QR code scanning

## Social Features

- Friends system
- Team competitions
- Recycling streaks

## Government Features

- LGU dashboards
- Waste analytics
- Community statistics

---

# 11. Success Metrics

- Daily Active Users
- Total Waste Collected
- Total Rewards Redeemed
- User Retention Rate
- Total Recycled Weight

---

# 12. Conclusion

Waste to Value is a gamified sustainability platform that transforms recyclable waste into measurable rewards. The application combines environmental awareness, reward incentives, and modern UI/UX design to encourage users to participate in proper waste management and recycling initiatives.
