import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { medicines } from '../../catalog/domain/medicines';
import { MedicineCard } from './MedicineCard';

describe('medicine card quantity limit', () => {
  it('disables adding when the catalog maximum is reached', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <MedicineCard medicine={medicines[2]} quantity={medicines[2].maxQty} onAdd={jest.fn()} />,
      );
    });

    if (!renderer) throw new Error('Medicine card did not render.');
    const addButton = renderer.root.findByProps({
      accessibilityLabel: `${medicines[2].name} maximum quantity reached`,
    });
    expect(addButton.props.disabled).toBe(true);
    expect(addButton.props.children.props.children).toBe('MAX');
  });
});
