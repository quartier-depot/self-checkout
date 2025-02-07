import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

describe("", () => {
  test('adds 1 + 2 to equal 3', () => {
    expect((3)).toBe(3);
  });

  test('hi', () => {
    render(<p>hi</p>);
    expect(screen.getByText('hi')).toBeInTheDocument();
  });

  test('hi2', () => {
    render(<p>hi</p>);
    expect(screen.getByText('hi')).toBeInTheDocument();
  });

});