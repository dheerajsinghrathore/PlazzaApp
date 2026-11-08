import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Linking, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoder-reborn';
import { openSettings, RESULTS } from 'react-native-permissions';
import {
  AppPermissionStatuses,
  AppPermissionStatus,
  checkAppPermissions,
  requestAppPermissions,
} from './requestPermissions';

const REQUESTED_KEY = '@plazza/permissions-requested-v1';
const BLOCKED_KEY = '@plazza/permissions-blocked-v1';

type PermissionContextValue = {
  statuses: AppPermissionStatuses;
  locationName: { city: string | null; district: string | null } | null;
  locationError: string | null;
  addressError: string | null;
  requesting: boolean;
  error: string | null;
  requestPermissions: () => Promise<void>;
  openAppSettings: () => Promise<void>;
  openDeviceLocationSettings: () => Promise<void>;
  retryLocation: () => void;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

function isBlockedRecord(
  value: unknown,
): value is { location: boolean; notifications: boolean } {
  if (typeof value !== 'object' || value === null) return false;
  const statuses = value as { location?: unknown; notifications?: unknown };
  return (
    typeof statuses.location === 'boolean' &&
    typeof statuses.notifications === 'boolean'
  );
}

function mergeBlockedStatuses(
  current: AppPermissionStatuses,
  previouslyBlocked: AppPermissionStatuses,
): AppPermissionStatuses {
  return {
    location:
      current.location === RESULTS.DENIED &&
      previouslyBlocked.location === RESULTS.BLOCKED
        ? RESULTS.BLOCKED
        : current.location,
    notifications:
      current.notifications === RESULTS.DENIED &&
      previouslyBlocked.notifications === RESULTS.BLOCKED
        ? RESULTS.BLOCKED
        : current.notifications,
  };
}

export function PermissionProvider({ children }: React.PropsWithChildren) {
  const [statuses, setStatuses] = useState<AppPermissionStatuses>({
    location: 'unknown',
    notifications: 'unknown',
  });
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<{
    city: string | null;
    district: string | null;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const mounted = useRef(true);
  const operationInProgress = useRef(false);

  const saveStatuses = useCallback(async (next: AppPermissionStatuses) => {
    await AsyncStorage.setItem(
      BLOCKED_KEY,
      JSON.stringify({
        location: next.location === RESULTS.BLOCKED,
        notifications: next.notifications === RESULTS.BLOCKED,
      }),
    ).catch(() => undefined);
    if (mounted.current) setStatuses(next);
  }, []);

  const refreshCoordinates = useCallback((allowed: boolean) => {
    if (!allowed) {
      setLocationName(null);
      setLocationError(null);
      setAddressError(null);
      return;
    }
    setLocationError(null);
    setAddressError(null);
    Geolocation.getCurrentPosition(
      position => {
        Geocoder.geocodePosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
          .then(results => {
            if (!mounted.current) return;
            const result = results[0];
            const city = result?.locality ?? result?.subLocality ?? null;
            const district = result?.subAdminArea ?? null;
            if (!city && !district) {
              setAddressError(
                'Could not determine your city and district. Please try again.',
              );
              return;
            }
            setLocationName({ city, district });
          })
          .catch(geocoderError => {
            if (mounted.current) {
              setAddressError(
                geocoderError instanceof Error
                  ? geocoderError.message
                  : String(geocoderError),
              );
            }
          });
      },
      positionError => {
        if (mounted.current) {
          setLocationName(null);
          setLocationError(
            positionError.code === 2
              ? 'Device location is turned off or unavailable.'
              : positionError.message,
          );
        }
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
    );
  }, []);

  const retryLocation = useCallback(() => {
    refreshCoordinates(statuses.location === RESULTS.GRANTED);
  }, [refreshCoordinates, statuses.location]);

  const refreshStatuses = useCallback(async () => {
    const [current, storedBlocked] = await Promise.all([
      checkAppPermissions(),
      AsyncStorage.getItem(BLOCKED_KEY).catch(() => null),
    ]);
    let blocked = { location: false, notifications: false };
    if (storedBlocked) {
      try {
        const parsed: unknown = JSON.parse(storedBlocked);
        if (isBlockedRecord(parsed)) blocked = parsed;
      } catch {
        blocked = { location: false, notifications: false };
      }
    }
    const merged = mergeBlockedStatuses(current, {
      location: blocked.location ? RESULTS.BLOCKED : RESULTS.DENIED,
      notifications: blocked.notifications ? RESULTS.BLOCKED : RESULTS.DENIED,
    });
    await saveStatuses(merged);
    refreshCoordinates(merged.location === RESULTS.GRANTED);
    if (mounted.current) setError(null);
  }, [refreshCoordinates, saveStatuses]);

  const requestPermissions = useCallback(async () => {
    if (operationInProgress.current) return;
    operationInProgress.current = true;
    setRequesting(true);
    setError(null);
    try {
      const next = await requestAppPermissions();
      await saveStatuses(next);
      refreshCoordinates(next.location === RESULTS.GRANTED);
      await AsyncStorage.setItem(REQUESTED_KEY, 'true').catch(() => undefined);
    } catch (requestError) {
      if (mounted.current) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : String(requestError),
        );
      }
    } finally {
      operationInProgress.current = false;
      if (mounted.current) setRequesting(false);
    }
  }, [refreshCoordinates, saveStatuses]);

  const openAppSettings = useCallback(async () => {
    setError(null);
    try {
      await openSettings('application');
    } catch (settingsError) {
      if (mounted.current) {
        setError(
          settingsError instanceof Error
            ? settingsError.message
            : String(settingsError),
        );
      }
    }
  }, []);

  const openDeviceLocationSettings = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
      } else {
        await Linking.openSettings();
      }
    } catch (settingsError) {
      if (mounted.current) {
        setLocationError(
          settingsError instanceof Error
            ? settingsError.message
            : String(settingsError),
        );
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const initialize = async () => {
      try {
        await refreshStatuses();
        const alreadyRequested = await AsyncStorage.getItem(
          REQUESTED_KEY,
        ).catch(() => null);
        if (alreadyRequested !== 'true') await requestPermissions();
      } catch (initializationError) {
        if (mounted.current) {
          setError(
            initializationError instanceof Error
              ? initializationError.message
              : String(initializationError),
          );
        }
      }
    };
    initialize();

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && !operationInProgress.current) {
        refreshStatuses().catch(refreshError => {
          if (mounted.current) {
            setError(
              refreshError instanceof Error
                ? refreshError.message
                : String(refreshError),
            );
          }
        });
      }
    });
    return () => {
      mounted.current = false;
      subscription.remove();
    };
  }, [refreshStatuses, requestPermissions]);

  const value = useMemo(
    () => ({
      statuses,
      locationName,
      locationError,
      addressError,
      requesting,
      error,
      requestPermissions,
      openAppSettings,
      openDeviceLocationSettings,
      retryLocation,
    }),
    [
      statuses,
      locationName,
      locationError,
      addressError,
      requesting,
      error,
      requestPermissions,
      openAppSettings,
      openDeviceLocationSettings,
      retryLocation,
    ],
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function useAppPermissions(): PermissionContextValue {
  const context = useContext(PermissionContext);
  if (!context)
    throw new Error('useAppPermissions must be used within PermissionProvider');
  return context;
}

export function permissionStatusLabel(status: AppPermissionStatus): string {
  switch (status) {
    case RESULTS.GRANTED:
      return 'Granted';
    case RESULTS.DENIED:
      return 'Denied';
    case RESULTS.BLOCKED:
      return 'Blocked';
    case RESULTS.LIMITED:
      return 'Limited';
    case RESULTS.UNAVAILABLE:
      return 'Unavailable';
    default:
      return 'Checking…';
  }
}
