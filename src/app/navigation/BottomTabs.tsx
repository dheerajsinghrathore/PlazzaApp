import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { CartScreen } from '../../features/cart/screens/CartScreen';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { RootState } from '../../store/store';
import { colors } from '../../theme/colors';

type MainTabs = { Home: undefined; Cart: undefined };
type TabIconProps = { color: string };
const Tabs = createBottomTabNavigator<MainTabs>();

function HomeTabIcon({ color }: TabIconProps) {
  return <Text style={[styles.tabIcon, { color }]}>⌕</Text>;
}

function CartTabIcon({ color }: TabIconProps) {
  const count = useSelector((state: RootState) =>
    state.cart.lines.reduce((sum, line) => sum + line.quantity, 0),
  );
  return <View>
    <Text style={[styles.tabIcon, { color }]}>▱</Text>
    {count > 0 && <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{count}</Text></View>}
  </View>;
}

export function BottomTabs() {
  return <NavigationContainer>
    <Tabs.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { height: 66, paddingTop: 8, paddingBottom: 8, backgroundColor: '#fff', borderTopColor: '#edf0ea' },
      tabBarLabelStyle: { fontWeight: '700', fontSize: 10 },
    }}>
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home', tabBarIcon: HomeTabIcon }} />
      <Tabs.Screen name="Cart" component={CartScreen} options={{ tabBarLabel: 'Your cart', tabBarIcon: CartTabIcon }} />
    </Tabs.Navigator>
  </NavigationContainer>;
}

const styles = StyleSheet.create({
  tabIcon: { fontSize: 20 },
  tabBadge: { position: 'absolute', right: -9, top: -3, minWidth: 15, height: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
  tabBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
