import { Redirect } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BodyText, Card, LoadingState, Pill, Screen, SectionTitle } from '@/components/waste-ui';
import { Fonts, Spacing } from '@/constants/theme';
import { getLeaderboard, LeaderboardRow } from '@/lib/database';
import { formatWeight, getEcoBadge } from '@/lib/recycling';
import { useAuth } from '@/providers/auth-provider';

type Period = 'weekly' | 'monthly' | 'all-time';

const periods: { label: string; value: Period }[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'All-Time', value: 'all-time' },
];

export default function LeaderboardScreen() {
  const { user, initializing } = useAuth();
  const [period, setPeriod] = React.useState<Period>('weekly');
  const [rows, setRows] = React.useState<LeaderboardRow[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      getLeaderboard(period).then(setRows);
    }, [period]),
  );

  if (initializing) {
    return <LoadingState />;
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Screen title="Leaderboard" subtitle="Compare recycling impact across weekly, monthly, and all-time views.">
      <View style={styles.pills}>
        {periods.map((item) => (
          <Pressable key={item.value} onPress={() => setPeriod(item.value)}>
            <Pill selected={period === item.value}>{item.label}</Pill>
          </Pressable>
        ))}
      </View>

      <Card style={styles.podium}>
        {rows.slice(0, 3).map((row, index) => (
          <View key={row.userId} style={[styles.podiumPerson, index === 0 && styles.podiumFirst]}>
            <View style={[styles.medal, { backgroundColor: index === 0 ? '#F7B718' : index === 1 ? '#AEB7BA' : '#D46E1E' }]}>
              <Text style={styles.medalText}>{index + 1}</Text>
            </View>
            <View style={styles.avatar}><Text style={styles.avatarText}>{row.username.slice(0, 1)}</Text></View>
            <Text style={styles.podiumName}>{row.username.split(' ')[0]}</Text>
            <Text style={styles.podiumPoints}>{row.totalPoints.toLocaleString()} PTS</Text>
          </View>
        ))}
      </Card>

      {rows.slice(3).map((row, index) => (
        <Card key={row.userId}>
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 4}</Text>
            <View style={styles.details}>
              <SectionTitle>{row.username}</SectionTitle>
              <BodyText muted>{getEcoBadge(row.totalPoints)} • {formatWeight(row.totalWeight)}</BodyText>
            </View>
            <BodyText style={styles.points}>{row.totalPoints.toLocaleString()} pts</BodyText>
          </View>
        </Card>
      ))}

      <Card style={styles.encourageCard}>
        <Text style={styles.trophy}>♕</Text>
        <BodyText style={styles.encourageText}>Keep recycling and climb the leaderboard!</BodyText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  podium: {
    minHeight: 210,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: '#F1F8E8',
    paddingBottom: Spacing.four,
  },
  podiumPerson: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  podiumFirst: {
    paddingBottom: Spacing.four,
  },
  medal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: 900,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCEFE0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#102E1A',
    fontFamily: Fonts.sans,
    fontSize: 24,
    fontWeight: 900,
  },
  podiumName: {
    color: '#102E1A',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: 800,
    textAlign: 'center',
  },
  podiumPoints: {
    color: '#0E6E27',
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: 900,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rank: {
    width: 42,
    color: '#2E8B3C',
    fontSize: 20,
    fontWeight: 900,
    fontFamily: Fonts.sans,
  },
  details: {
    flex: 1,
    gap: Spacing.one,
  },
  points: {
    fontWeight: 900,
    color: '#0E6E27',
  },
  encourageCard: {
    minHeight: 80,
    backgroundColor: '#CDEDBF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  trophy: {
    color: '#F7B718',
    fontSize: 42,
  },
  encourageText: {
    flex: 1,
    fontWeight: 900,
  },
});
