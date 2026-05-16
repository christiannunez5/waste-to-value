# Authentication

## Purpose

Authentication protects the offline user profile and keeps the active session available after app restarts.

## Routes

- `src/app/auth.tsx` handles both login and registration.
- Authenticated screens redirect to `/auth` when no user session exists.
- Successful login or registration redirects the user into the tabbed app at `/`.

## Local Auth Model

- Users are stored in SQLite in the `users` table.
- Passwords are hashed with `expo-crypto` SHA-256 using `username:password` as the demo salt input.
- The app stores only the active user id in `expo-secure-store`.
- Seeded leaderboard users use the `seeded-demo-user` password marker and cannot log in.

## Validation

- Username must be at least 3 characters.
- Password must be at least 6 characters.
- Usernames are matched case-insensitively.
- Duplicate usernames are rejected.
- Login returns the same generic error for unknown username and wrong password.

## Test Cases

- Register a new account and confirm the app opens Home.
- Close and reopen the app and confirm the session restores.
- Logout and confirm the app returns to Auth.
- Attempt duplicate registration and confirm an error appears.
- Attempt login with a wrong password and confirm access is denied.
