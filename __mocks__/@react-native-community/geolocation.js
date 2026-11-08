module.exports = {
  getCurrentPosition: jest.fn(success =>
    success({ coords: { latitude: 37.7749, longitude: -122.4194 } }),
  ),
};
