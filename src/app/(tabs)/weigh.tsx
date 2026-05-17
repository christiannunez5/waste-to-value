import { Redirect } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BodyText, Card, LoadingState, PrimaryButton, Screen, SectionTitle } from '@/components/waste-ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBleScale } from '@/lib/ble-scale';
import { addRecyclingTransaction } from '@/lib/database';
import { calculatePoints, MATERIAL_MULTIPLIERS } from '@/lib/recycling';
import type { WasteType } from '@/types/recycling';
import { useAuth } from '@/providers/auth-provider';

const DEFAULT_WASTE_TYPE: WasteType = 'Sachet';

export default function WeighScreen() {
  const theme = useTheme();
  const { user, initializing, refreshUser } = useAuth();
  const [weightGrams, setWeightGrams] = React.useState(0);
  const [message, setMessage] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const ble = useBleScale((nextWeightGrams) => setWeightGrams(nextWeightGrams));
  const points = calculatePoints(weightGrams, DEFAULT_WASTE_TYPE);

  if (initializing) {
    return <LoadingState />;
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  async function handleSave() {
    setMessage('');
    setSaving(true);

    try {
      await addRecyclingTransaction(user!.id, DEFAULT_WASTE_TYPE, weightGrams);
      await refreshUser();
      setWeightGrams(0);
      setMessage(`Saved ${points} points from sachet waste.`);
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : 'Unable to save transaction.');
    } finally {
      setSaving(false);
    }
  }

  const connected = ble.status === 'connected';
  const measurementLabel = weightGrams > 0 ? `${weightGrams.toFixed(1)} grams measured.` : 'No HX711 reading yet.';

  return (
    <Screen title="Weigh & Earn" subtitle="Connect the ESP32 HX711 scale and save sachet waste points.">
      <Card style={styles.scaleCard}>
        <View style={styles.statusRow}>
          <SectionTitle>ESP32 HX711 Scale</SectionTitle>
          <View style={[styles.statusPill, { backgroundColor: connected ? '#DFF3E3' : '#F3FAF4' }]}>
            <Text style={[styles.statusText, { color: connected ? theme.primaryDark : theme.textSecondary }]}>
              {connected ? 'Connected' : ble.status === 'scanning' ? 'Scanning' : 'Not Connected'}
            </Text>
          </View>
        </View>

        <View style={styles.weightPanel}>
          <Text style={styles.scaleIcon}>HX711</Text>
          <Text selectable style={styles.weightValue}>
            {weightGrams > 0 ? weightGrams.toFixed(1) : '0.0'}
          </Text>
          <Text style={[styles.weightUnit, { color: theme.primaryDark }]}>grams</Text>
        </View>

        <BodyText muted>{ble.message}</BodyText>
        <View style={styles.bluetoothActions}>
          <PrimaryButton
            title={ble.status === 'scanning' ? 'Looking for ESP32...' : connected ? 'Find Another ESP32' : 'Connect ESP32 Scale'}
            onPress={ble.startScan}
            disabled={ble.status === 'scanning'}
          />
          <PrimaryButton
            title="Read HX711 Weight"
            onPress={() => setMessage(measurementLabel)}
            disabled={!connected}
          />
          <PrimaryButton title="Disconnect" onPress={ble.disconnect} variant="secondary" disabled={!connected} />
        </View>

        {ble.devices.map((device) => (
          <Pressable key={device.id} onPress={() => ble.connect(device.id)} style={styles.deviceRow}>
            <View>
              <BodyText>{device.name ?? 'ESP32 Scale'}</BodyText>
              <BodyText muted>{device.id}</BodyText>
            </View>
            <Text style={[styles.connectText, { color: theme.primaryDark }]}>Connect</Text>
          </Pressable>
        ))}
      </Card>

      <Card style={styles.pointsCard}>
        <BodyText style={styles.centerText}>Points Earned</BodyText>
        <View style={styles.pointsRow}>
          <Text selectable style={[styles.points, { color: theme.primaryDark }]}>
            {points.toLocaleString()}
          </Text>
          <Text style={[styles.pts, { color: theme.primaryDark }]}>PTS</Text>
        </View>
        <BodyText style={styles.centerText}>
          {weightGrams.toFixed(1)}g x {MATERIAL_MULTIPLIERS[DEFAULT_WASTE_TYPE]} (Sachet) = {points} pts
        </BodyText>
      </Card>

      <PrimaryButton title={saving ? 'Saving...' : 'Save & Earn Points'} onPress={handleSave} disabled={saving || points <= 0} />
      {message ? <BodyText style={{ color: message.startsWith('Saved') ? theme.primary : theme.danger }}>{message}</BodyText> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scaleCard: {
    gap: Spacing.three,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  statusText: {
    fontFamily: Fonts.black,
    fontSize: 12,
    fontWeight: 900,
  },
  weightPanel: {
    minHeight: 190,
    borderRadius: 16,
    backgroundColor: '#F3FAF4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  scaleIcon: {
    color: '#2E8B3C',
    fontFamily: Fonts.black,
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: 1,
  },
  weightValue: {
    color: '#1F2937',
    fontFamily: Fonts.black,
    fontSize: 62,
    lineHeight: 68,
    fontWeight: 900,
    fontVariant: ['tabular-nums'],
  },
  weightUnit: {
    fontFamily: Fonts.black,
    fontSize: 18,
    fontWeight: 900,
  },
  bluetoothActions: {
    gap: Spacing.two,
  },
  deviceRow: {
    minHeight: 62,
    borderRadius: 12,
    backgroundColor: '#F3FAF4',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  connectText: {
    fontFamily: Fonts.black,
    fontSize: 13,
    fontWeight: 900,
  },
  pointsCard: {
    alignItems: 'center',
    backgroundColor: '#DFF3E3',
  },
  centerText: {
    textAlign: 'center',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  points: {
    fontFamily: Fonts.black,
    fontSize: 43,
    lineHeight: 50,
    fontWeight: 900,
    fontVariant: ['tabular-nums'],
  },
  pts: {
    fontFamily: Fonts.black,
    fontSize: 15,
    fontWeight: 900,
    paddingBottom: 8,
  },
});
