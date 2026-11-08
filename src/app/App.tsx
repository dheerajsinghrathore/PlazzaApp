import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { PermissionProvider } from '../features/permissions/PermissionProvider';
import { colors } from '../theme/colors';
import { loadPersistedState, persistState } from '../store/persistence';
import { store } from '../store/store';
import { BottomTabs } from './navigation/BottomTabs';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      try {
        await loadPersistedState(store.dispatch);
      } finally {
        if (!active) {
          return;
        }

        setReady(true);
        unsubscribe = store.subscribe(() => {
          persistState(store.getState()).catch(() => undefined);
        });
      }
    };

    initialize();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PermissionProvider>
          <StatusBar barStyle="dark-content" />
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            {ready ? (
              <BottomTabs />
            ) : (
              <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.loadingText}>Getting your shop ready…</Text>
              </View>
            )}
          </SafeAreaView>
        </PermissionProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
  },
});
