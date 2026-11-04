module.exports = {
  PERMISSIONS: { IOS: { LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE' }, ANDROID: { ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION', ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION' } },
  RESULTS: { UNAVAILABLE: 'unavailable', DENIED: 'denied', GRANTED: 'granted', BLOCKED: 'blocked', LIMITED: 'limited' },
  request: jest.fn(async () => 'granted'),
  requestMultiple: jest.fn(async () => ({ 'android.permission.ACCESS_FINE_LOCATION': 'granted', 'android.permission.ACCESS_COARSE_LOCATION': 'granted' })),
  requestNotifications: jest.fn(async () => ({ status: 'granted', settings: {} })),
  check: jest.fn(async () => 'granted'),
  checkMultiple: jest.fn(async () => ({ 'android.permission.ACCESS_FINE_LOCATION': 'granted', 'android.permission.ACCESS_COARSE_LOCATION': 'granted' })),
  checkNotifications: jest.fn(async () => ({ status: 'granted', settings: {} })),
  openSettings: jest.fn(async () => {}),
};
