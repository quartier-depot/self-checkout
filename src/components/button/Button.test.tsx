import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './Button';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
    it('calls onClick when clicked', async () => {
        const handleClick = vi.fn();
        render(
            <Button onClick={handleClick} type="primary">
                Click me
            </Button>
        );

        const button = screen.getByText('Click me');

        const user = userEvent.setup()
        await user.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies custom className when provided', () => {
        render(
            <Button onClick={() => {}} type="primary" className="custom-class">
                Custom Class Button
            </Button>
        );

        const button = screen.getByText('Custom Class Button');
        expect(button).toHaveClass('custom-class');
    });
}); 