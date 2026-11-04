import { Platform } from 'react-native';
import {
  check,
  checkMultiple,
  checkNotifications,
  Permission,
  PermissionStatus,
  PERMISSIONS,
  request,
  requestMultiple,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';

export type AppPermissionStatus = PermissionStatus | 'unknown';
export type AppPermissionStatuses = {
  location: AppPermissionStatus;
  notifications: AppPermissionStatus;
};

const locationPermissions: Permission[] = Platform.OS === 'ios'
  ? [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
  : Platform.OS === 'android'
    ? [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION]
    : [];

export async function checkAppPermissions(): Promise<AppPermissionStatuses> {
  if (locationPermissions.length === 0) {
    return { location: RESULTS.UNAVAILABLE, notifications: RESULTS.UNAVAILABLE };
  }

  const [location, notificationResponse] = await Promise.all([
    (async () => {
      if (Platform.OS !== 'android') return check(locationPermissions[0]);
      const locationStatuses = await checkMultiple(locationPermissions);
      return Object.values(locationStatuses).includes(RESULTS.GRANTED)
        ? RESULTS.GRANTED
        : RESULTS.DENIED;
    })(),
    checkNotifications(),
  ]);

  return { location, notifications: notificationResponse.status };
}

export async function requestAppPermissions(): Promise<AppPermissionStatuses> {
  if (locationPermissions.length === 0) {
    return { location: RESULTS.UNAVAILABLE, notifications: RESULTS.UNAVAILABLE };
  }

  let location: PermissionStatus;
  if (Platform.OS === 'android') {
    const locationStatuses = await requestMultiple(locationPermissions);
    const locationValues = Object.values(locationStatuses);
    location = locationValues.includes(RESULTS.GRANTED)
      ? RESULTS.GRANTED
      : locationValues.includes(RESULTS.BLOCKED)
        ? RESULTS.BLOCKED
        : locationValues[0] ?? RESULTS.UNAVAILABLE;
  } else {
    location = await request(locationPermissions[0]);
  }
  const notificationResponse = await requestNotifications(['alert', 'badge', 'sound']);

  return { location, notifications: notificationResponse.status };
}
