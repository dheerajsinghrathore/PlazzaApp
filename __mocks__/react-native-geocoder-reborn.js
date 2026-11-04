const geocoder = {
  geocodePosition: jest.fn().mockResolvedValue([]),
  geocodeAddress: jest.fn().mockResolvedValue([]),
  fallbackToGoogle: jest.fn(),
  forceGoogleOnIos: jest.fn(),
  setLanguage: jest.fn(),
};

export default geocoder;
