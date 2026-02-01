import { describe, it, expect } from 'vitest';
import { formatCustomer } from './formatCustomer';

describe('formatCustomer', () => {

  it('should return first and last name', () => {
    const actual = formatCustomer({ first_name: 'John', last_name: 'Doe' });
    expect(actual).toBe('John Doe');
  });
});
