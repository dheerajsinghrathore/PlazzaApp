import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { RESULTS } from 'react-native-permissions';
import { PermissionStatusCard } from './PermissionStatusCard';
import { AppPermissionStatus } from '../../permissions/requestPermissions';

function renderCard(
  location: AppPermissionStatus,
  notifications: AppPermissionStatus,
  locationError: string | null = null,
  locationName: { city: string | null; district: string | null } | null = null,
) {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <PermissionStatusCard
        statuses={{ location, notifications }}
        locationName={locationName}
        locationError={locationError}
        addressError={null}
        requesting={false}
        error={null}
        onRequest={jest.fn()}
        onOpenSettings={jest.fn()}
        onOpenDeviceLocationSettings={jest.fn()}
        onRetryLocation={jest.fn()}
      />,
    );
  });
  if (!renderer) throw new Error('Permission status card did not render.');
  return renderer;
}

describe('permission status card', () => {
  it('offers retry for denied permissions', () => {
    const renderer = renderCard(RESULTS.DENIED, RESULTS.GRANTED);
    expect(renderer.root.findByProps({ accessibilityRole: 'button' }).props.children.props.children).toBe('TRY AGAIN');
  });

  it('explains blocked permissions and links to settings', () => {
    const renderer = renderCard(RESULTS.BLOCKED, RESULTS.GRANTED);
    const text = renderer.root.findAllByType(Text).map(node => node.props.children).join(' ');
    expect(text).toContain('Location permission is blocked');
    expect(renderer.root.findByProps({ accessibilityRole: 'button' }).props.children.props.children).toBe('OPEN APP SETTINGS');
  });

  it('keeps retry available for a denied permission alongside a blocked one', () => {
    const renderer = renderCard(RESULTS.BLOCKED, RESULTS.DENIED);
    const text = renderer.root.findAllByType(Text).map(node => node.props.children).join(' ');
    expect(text).toContain('Location permission is blocked');
    expect(text).toContain('OPEN APP SETTINGS');
    expect(text).toContain('TRY AGAIN');
  });

  it('prompts to turn on device location when permission is granted but location is off', () => {
    const renderer = renderCard(RESULTS.GRANTED, RESULTS.GRANTED, 'Device location is turned off.');
    const text = renderer.root.findAllByType(Text).map(node => node.props.children).join(' ');
    expect(text).toContain('Turn on device location to show your city and district.');
    expect(text).toContain('TURN ON DEVICE LOCATION');
    expect(renderer.root.findByProps({ accessibilityRole: 'button' }).props.children.props.children)
      .toBe('TURN ON DEVICE LOCATION');
  });

  it('shows the resolved city and district when location is available', () => {
    const renderer = renderCard(RESULTS.GRANTED, RESULTS.GRANTED, null, {
      city: 'Pune',
      district: 'Pune',
    });
    const text = renderer.root.findAllByType(Text).map(node => node.props.children).join(' ');
    expect(text).toContain('City: Pune');
    expect(text).toContain('District: Pune');
  });
});
