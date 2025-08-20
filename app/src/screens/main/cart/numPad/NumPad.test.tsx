import { render, screen } from '@testing-library/react';
import { NumPad } from './NumPad';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Unit } from '../../../../store/api/products/Unit.ts';

describe('NumPad', () => {

    it('renders initial value, text and unit', () => {
        render(<NumPad value={42} text="Test Text" unit={Unit.Gram} onChange={vi.fn()} />);
        
        expect(screen.getByText('Test Text')).toBeInTheDocument();
        expect(screen.getByText('42 g')).toBeInTheDocument();
    });

    it('increases value when + button is clicked', async () => {
        render(<NumPad value={42} text="Test Text" unit={Unit.NoUnit} onChange={vi.fn()} />);
        
        const plusButton = screen.getByText('+');
        const user = userEvent.setup();
        await user.click(plusButton);
        
        expect(screen.getByText('43')).toBeInTheDocument();
    });

    it('decreases value when - button is clicked', async () => {
        render(<NumPad value={42} text="Test Text" unit={Unit.NoUnit} onChange={vi.fn()} />);
        
        const minusButton = screen.getByText('-');
        const user = userEvent.setup();
        await user.click(minusButton);
        
        expect(screen.getByText('41')).toBeInTheDocument();
    });

    it('leaves value at 0 when - button is clicked', async () => {
        render(<NumPad value={0} text="Test Text" unit={Unit.NoUnit} onChange={vi.fn()} />);
        
        const minusButton = screen.getByText('-');
        const user = userEvent.setup();
        await user.click(minusButton);
        
        expect(screen.getAllByText('0')).toHaveLength(2);
        expect(screen.queryByText('-1')).not.toBeInTheDocument();
    });

    it('adds button value at the end when number button is clicked', async () => {
        render(<NumPad value={42} text="Test Text" unit={Unit.NoUnit} onChange={vi.fn()} />);
        
        const numberButton = screen.getByText('1');
        const user = userEvent.setup();
        await user.click(numberButton);
        
        expect(screen.getByText('421')).toBeInTheDocument();
    });

    it('removes last number when backspace button is clicked', async () => {
        render(<NumPad value={421} text="Test Text" unit={Unit.NoUnit} onChange={vi.fn()} />);
        
        const backspaceButton = screen.getByText('⌫');
        const user = userEvent.setup();
        await user.click(backspaceButton);
        
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('calls onChange when ok button is clicked', async () => {
        const onChange = vi.fn();
        render(<NumPad value={42} text="Test Text" unit={Unit.NoUnit} onChange={onChange} />);
        
        const okButton = screen.getByText('OK');
        const user = userEvent.setup();
        await user.click(okButton);
        
        expect(onChange).toHaveBeenCalledWith(42);
    });
}); 