import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';

import { calculatePoints, getStartOfMonth, getStartOfWeek } from '@/lib/recycling';
import type { LeaderboardRowRaw, RedemptionRow, RewardRow, TransactionRow, UserRow } from '@/types/database';
import type { RecyclingTransaction } from '@/types/recycling-transaction';
import type { Redemption } from '@/types/redemption';
import type { Reward } from '@/types/reward';
import type { WasteType } from '@/types/recycling';
import type { User } from '@/types/user';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

const rewards: Omit<Reward, 'id'>[] = [
  { name: 'Eco Bag', pointsRequired: 100 },
  { name: 'School Supplies', pointsRequired: 200 },
  { name: 'Rice 1kg', pointsRequired: 300 },
  { name: 'Canned Goods', pointsRequired: 500 },
  { name: 'GCash ₱50', pointsRequired: 800 },
];

const demoUsers = [
  { username: 'Barangay Green Team', points: 1780, totalWeight: 14100 },
  { username: 'Eco Club', points: 1220, totalWeight: 8300 },
  { username: 'Volunteer Ana', points: 640, totalWeight: 4100 },
];

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    points: row.points,
    totalWeight: row.total_weight,
    createdAt: row.created_at,
  };
}

function mapTransaction(row: TransactionRow): RecyclingTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    wasteType: row.waste_type,
    weightGrams: row.weight_grams,
    points: row.points,
    createdAt: row.created_at,
  };
}

function mapReward(row: RewardRow): Reward {
  return {
    id: row.id,
    name: row.name,
    pointsRequired: row.points_required,
  };
}

function mapRedemption(row: RedemptionRow): Redemption {
  return {
    id: row.id,
    userId: row.user_id,
    rewardId: row.reward_id,
    rewardName: row.reward_name,
    pointsSpent: row.points_spent,
    createdAt: row.created_at,
  };
}

async function getDatabase() {
  databasePromise ??= SQLite.openDatabaseAsync('waste-to-value.db');
  return databasePromise;
}

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      username_key TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      total_weight REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recycling_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      waste_type TEXT NOT NULL,
      weight_grams REAL NOT NULL,
      points INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      points_required INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reward_redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      reward_id INTEGER NOT NULL,
      reward_name TEXT NOT NULL,
      points_spent INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (reward_id) REFERENCES rewards(id)
    );
  `);

  for (const reward of rewards) {
    await db.runAsync(
      'INSERT OR IGNORE INTO rewards (name, points_required) VALUES (?, ?)',
      reward.name,
      reward.pointsRequired,
    );
  }

  const demoCount = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM users WHERE password_hash = 'seeded-demo-user'",
  );

  if (!demoCount?.count) {
    for (const user of demoUsers) {
      const createdAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * (demoUsers.indexOf(user) + 1)).toISOString();
      const result = await db.runAsync(
        'INSERT INTO users (username, username_key, password_hash, points, total_weight, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        user.username,
        user.username.toLowerCase(),
        'seeded-demo-user',
        user.points,
        user.totalWeight,
        createdAt,
      );

      await seedDemoTransactions(result.lastInsertRowId, user.points, user.totalWeight);
    }
  }
}

async function seedDemoTransactions(userId: number, targetPoints: number, targetWeight: number) {
  const db = await getDatabase();
  const weight = Math.round(targetWeight / 4);
  const wasteTypes: WasteType[] = ['Plastic Bottle', 'Sachet', 'Aluminum', 'Mixed Waste'];

  for (let index = 0; index < wasteTypes.length; index += 1) {
    const wasteType = wasteTypes[index];
    const createdAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * index).toISOString();
    await db.runAsync(
      'INSERT INTO recycling_transactions (user_id, waste_type, weight_grams, points, created_at) VALUES (?, ?, ?, ?, ?)',
      userId,
      wasteType,
      weight,
      Math.round(targetPoints / 4),
      createdAt,
    );
  }
}

async function hashPassword(username: string, password: string) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${username.trim().toLowerCase()}:${password}`,
  );
}

export async function registerUser(username: string, password: string) {
  const cleanUsername = username.trim();
  const usernameKey = cleanUsername.toLowerCase();

  if (cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const db = await getDatabase();
  const existing = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE username_key = ?', usernameKey);

  if (existing) {
    throw new Error('That username is already registered.');
  }

  const now = new Date().toISOString();
  const passwordHash = await hashPassword(cleanUsername, password);
  const result = await db.runAsync(
    'INSERT INTO users (username, username_key, password_hash, points, total_weight, created_at) VALUES (?, ?, ?, 0, 0, ?)',
    cleanUsername,
    usernameKey,
    passwordHash,
    now,
  );

  return getUserById(result.lastInsertRowId);
}

export async function loginUser(username: string, password: string) {
  const cleanUsername = username.trim();
  const row = await (await getDatabase()).getFirstAsync<UserRow & { password_hash: string }>(
    'SELECT * FROM users WHERE username_key = ?',
    cleanUsername.toLowerCase(),
  );

  if (!row || row.password_hash === 'seeded-demo-user') {
    throw new Error('Invalid username or password.');
  }

  const passwordHash = await hashPassword(cleanUsername, password);
  if (passwordHash !== row.password_hash) {
    throw new Error('Invalid username or password.');
  }

  return mapUser(row);
}

export async function getUserById(userId: number) {
  const row = await (await getDatabase()).getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', userId);
  return row ? mapUser(row) : null;
}

export async function addRecyclingTransaction(userId: number, wasteType: WasteType, weightGrams: number) {
  if (!Number.isFinite(weightGrams) || weightGrams <= 0) {
    throw new Error('Weight must be greater than 0 grams.');
  }

  const db = await getDatabase();
  const points = calculatePoints(weightGrams, wasteType);
  const createdAt = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO recycling_transactions (user_id, waste_type, weight_grams, points, created_at) VALUES (?, ?, ?, ?, ?)',
      userId,
      wasteType,
      weightGrams,
      points,
      createdAt,
    );

    await db.runAsync(
      'UPDATE users SET points = points + ?, total_weight = total_weight + ? WHERE id = ?',
      points,
      weightGrams,
      userId,
    );
  });

  return { points, user: await getUserById(userId) };
}

export async function getTransactions(userId: number, limit?: number) {
  const sql = limit
    ? 'SELECT * FROM recycling_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
    : 'SELECT * FROM recycling_transactions WHERE user_id = ? ORDER BY created_at DESC';
  const params = limit ? [userId, limit] : [userId];
  const rows = await (await getDatabase()).getAllAsync<TransactionRow>(sql, params);
  return rows.map(mapTransaction);
}

export async function getWeeklyStats(userId: number) {
  const row = await (await getDatabase()).getFirstAsync<{ weight: number | null; points: number | null }>(
    'SELECT SUM(weight_grams) AS weight, SUM(points) AS points FROM recycling_transactions WHERE user_id = ? AND created_at >= ?',
    userId,
    getStartOfWeek(),
  );

  return {
    weight: row?.weight ?? 0,
    points: row?.points ?? 0,
  };
}

export async function getRewards() {
  const rows = await (await getDatabase()).getAllAsync<RewardRow>('SELECT * FROM rewards ORDER BY points_required ASC');
  return rows.map(mapReward);
}

export async function redeemReward(userId: number, rewardId: number) {
  const db = await getDatabase();
  const user = await getUserById(userId);
  const reward = await db.getFirstAsync<RewardRow>('SELECT * FROM rewards WHERE id = ?', rewardId);

  if (!user || !reward) {
    throw new Error('Reward is no longer available.');
  }

  if (user.points < reward.points_required) {
    throw new Error(`You need ${reward.points_required - user.points} more points.`);
  }

  const createdAt = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE users SET points = points - ? WHERE id = ?', reward.points_required, userId);
    await db.runAsync(
      'INSERT INTO reward_redemptions (user_id, reward_id, reward_name, points_spent, created_at) VALUES (?, ?, ?, ?, ?)',
      userId,
      reward.id,
      reward.name,
      reward.points_required,
      createdAt,
    );
  });

  return getUserById(userId);
}

export async function getRedemptions(userId: number) {
  const rows = await (await getDatabase()).getAllAsync<RedemptionRow>(
    'SELECT * FROM reward_redemptions WHERE user_id = ? ORDER BY created_at DESC',
    userId,
  );
  return rows.map(mapRedemption);
}

export async function getLeaderboard(period: 'weekly' | 'monthly' | 'all-time') {
  const since = period === 'weekly' ? getStartOfWeek() : period === 'monthly' ? getStartOfMonth() : null;
  const db = await getDatabase();
  const rows = since
    ? await db.getAllAsync<LeaderboardRowRaw>(
        `SELECT users.id AS user_id, users.username, COALESCE(SUM(recycling_transactions.points), 0) AS total_points,
          COALESCE(SUM(recycling_transactions.weight_grams), 0) AS total_weight
          FROM users
          LEFT JOIN recycling_transactions ON recycling_transactions.user_id = users.id
            AND recycling_transactions.created_at >= ?
          GROUP BY users.id
          ORDER BY total_points DESC, total_weight DESC
          LIMIT 20`,
        since,
      )
    : await db.getAllAsync<LeaderboardRowRaw>(
        `SELECT id AS user_id, username, points AS total_points, total_weight
          FROM users
          ORDER BY total_points DESC, total_weight DESC
          LIMIT 20`,
      );

  return rows.map((row) => ({
    userId: row.user_id,
    username: row.username,
    totalPoints: row.total_points ?? 0,
    totalWeight: row.total_weight ?? 0,
  }));
}
