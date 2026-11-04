import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { permissionStatusLabel } from '../../permissions/PermissionProvider';
import { AppPermissionStatuses } from '../../permissions/requestPermissions';
import { colors } from '../../../theme/colors';

type PermissionStatusCardProps = {
  statuses: AppPermissionStatuses;
  coordinates: { latitude: number; longitude: number } | null;
  locationError: string | null;
  requesting: boolean;
  error: string | null;
  onRequest: () => void;
  onOpenSettings: () => void;
};

export function PermissionStatusCard({
  statuses,
  coordinates,
  locationError,
  requesting,
  error,
  onRequest,
  onOpenSettings,
}: PermissionStatusCardProps) {
  const isBlocked = statuses.location === 'blocked' || statuses.notifications === 'blocked';
  const isDenied = statuses.location === 'denied' || statuses.notifications === 'denied';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>PERMISSION STATUS</Text>
      <Text style={styles.status}>
        Location: {permissionStatusLabel(statuses.location)} · Notifications: {permissionStatusLabel(statuses.notifications)}
      </Text>
      {coordinates && (
        <Text style={styles.coordinate}>
          Delivering to: {coordinates.latitude.toFixed(4)},{coordinates.longitude.toFixed(4)}
        </Text>
      )}
      {statuses.location === 'granted' && !coordinates && (
        <Text style={styles.rationale}>
          {locationError ? 'Location unavailable. Check device location settings.' : 'Finding your location…'}
        </Text>
      )}
      {isBlocked && (
        <>
          <Text style={styles.rationale}>
            These permissions are blocked. Allow them in App Settings to enable location-based delivery and notifications.
          </Text>
          <Pressable accessibilityRole="button" onPress={onOpenSettings} style={styles.action}>
            <Text style={styles.actionText}>OPEN APP SETTINGS</Text>
          </Pressable>
        </>
      )}
      {isDenied && (
        <Pressable accessibilityRole="button" disabled={requesting} onPress={onRequest} style={styles.action}>
          <Text style={styles.actionText}>{requesting ? 'REQUESTING…' : 'TRY AGAIN'}</Text>
        </Pressable>
      )}
      {error && <Text style={styles.error}>Permission status unavailable: {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 12, marginBottom: 22 },
  title: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  status: { color: colors.ink, fontSize: 11, fontWeight: '700', marginTop: 5 },
  coordinate: { color: colors.green, fontSize: 11, fontWeight: '700', marginTop: 6 },
  rationale: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 7 },
  action: { alignSelf: 'flex-start', marginTop: 8, paddingVertical: 10, paddingHorizontal: 6, minHeight: 44, justifyContent: 'center' },
  actionText: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  error: { color: '#a43e32', fontSize: 11, lineHeight: 15, marginTop: 6 },
});
