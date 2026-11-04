import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { permissionStatusLabel } from '../../permissions/PermissionProvider';
import { AppPermissionStatuses } from '../../permissions/requestPermissions';
import { colors } from '../../../theme/colors';

type PermissionStatusCardProps = {
  statuses: AppPermissionStatuses;
  locationName: { city: string | null; district: string | null } | null;
  locationError: string | null;
  addressError: string | null;
  requesting: boolean;
  error: string | null;
  onRequest: () => void;
  onOpenSettings: () => void;
  onOpenDeviceLocationSettings: () => void;
  onRetryLocation: () => void;
};

export function PermissionStatusCard({
  statuses,
  locationName,
  locationError,
  addressError,
  requesting,
  error,
  onRequest,
  onOpenSettings,
  onOpenDeviceLocationSettings,
  onRetryLocation,
}: PermissionStatusCardProps) {
  const isBlocked = statuses.location === 'blocked' || statuses.notifications === 'blocked';
  const isDenied = statuses.location === 'denied' || statuses.notifications === 'denied';
  const blockedPermissions = [
    statuses.location === 'blocked' ? 'location' : null,
    statuses.notifications === 'blocked' ? 'notifications' : null,
  ].filter((permission): permission is string => permission !== null);
  const blockedLabel = blockedPermissions.join(' and ');

  return (
    <View style={styles.card}>
      <Text style={styles.title}>PERMISSION STATUS</Text>
      <Text style={styles.status}>
        Location: {permissionStatusLabel(statuses.location)} · Notifications: {permissionStatusLabel(statuses.notifications)}
      </Text>
      {locationName && (
        <Text style={styles.coordinate}>
          Delivering to: {[
            locationName.city ? `City: ${locationName.city}` : null,
            locationName.district ? `District: ${locationName.district}` : null,
          ].filter(Boolean).join(' · ')}
        </Text>
      )}
      {statuses.location === 'granted' && !locationName && !locationError && !addressError && (
        <Text style={styles.rationale}>
          Finding your city and district…
        </Text>
      )}
      {statuses.location === 'granted' && locationError && (
        <>
          <Text style={styles.rationale}>Turn on device location to show your city and district.</Text>
          <Pressable accessibilityRole="button" onPress={onOpenDeviceLocationSettings} style={styles.action}>
            <Text style={styles.actionText}>TURN ON DEVICE LOCATION</Text>
          </Pressable>
        </>
      )}
      {statuses.location === 'granted' && addressError && (
        <>
          <Text style={styles.rationale}>{addressError}</Text>
          <Pressable accessibilityRole="button" onPress={onRetryLocation} style={styles.action}>
            <Text style={styles.actionText}>RETRY LOCATION</Text>
          </Pressable>
        </>
      )}
      {isBlocked && (
        <>
          <Text style={styles.rationale}>
            {blockedPermissions.length === 1
              ? `${blockedLabel.charAt(0).toUpperCase() + blockedLabel.slice(1)} permission is blocked. Allow it in App Settings.`
              : `${blockedLabel.charAt(0).toUpperCase() + blockedLabel.slice(1)} permissions are blocked. Allow them in App Settings.`}
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
  error: { color: colors.error, fontSize: 11, lineHeight: 15, marginTop: 6 },
});
