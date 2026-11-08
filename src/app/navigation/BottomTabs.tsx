import React from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { CartScreen } from '../../features/cart/screens/CartScreen';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { RootState } from '../../store/store';
import { colors } from '../../theme/colors';

type MainTabs = { Home: undefined; Cart: undefined };
type TabIconProps = { color: string };
const Tabs = createBottomTabNavigator<MainTabs>();

function HomeTabIcon({ color }: TabIconProps) {
  return (
    <Image
      source={require('../../../assets/icons/home.png')}
      style={[styles.icon, { tintColor: color }]}
    />
  );
}

function CartTabIcon({ color }: TabIconProps) {
  const count = useSelector((state: RootState) =>
    state.cart.lines.reduce((sum, line) => sum + line.quantity, 0),
  );
  const translateY = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(1)).current;
  const previousCount = React.useRef(count);

  React.useEffect(() => {
    if (previousCount.current === count) return;
    previousCount.current = count;

    const jump = Animated.parallel([
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -8,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 4,
          tension: 180,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 180,
          useNativeDriver: true,
        }),
      ]),
    ]);
    jump.start();
    return () => jump.stop();
  }, [count, scale, translateY]);

  return (
    <Animated.View
      style={[styles.cartIcon, { transform: [{ translateY }, { scale }] }]}
    >
      <Image
        source={require('../../../assets/icons/cart.png')}
        style={[styles.icon, { tintColor: color }]}
      />
      {count > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{count}</Text>
        </View>
      )}
    </Animated.View>
  );
}

export function BottomTabs() {
  const { bottom: bottomInset } = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: 72 + bottomInset,
            paddingTop: 8,
            paddingBottom: Math.max(bottomInset, 8),
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            elevation: 8,
          },
          tabBarLabelStyle: { fontWeight: '800', fontSize: 12 },
        }}
      >
        <Tabs.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: 'Home', tabBarIcon: HomeTabIcon }}
        />
        <Tabs.Screen
          name="Cart"
          component={CartScreen}
          options={{ tabBarLabel: 'Your cart', tabBarIcon: CartTabIcon }}
        />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  icon: { width: 24, height: 24, resizeMode: 'contain' },
  cartIcon: {
    width: 26,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadge: {
    position: 'absolute',
    right: -8,
    top: -6,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 3,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cartBadge,
    borderColor: colors.white,
    borderWidth: 1,
  },
  tabBadgeText: { color: colors.white, fontSize: 10, fontWeight: '900' },
});
