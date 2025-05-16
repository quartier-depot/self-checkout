import { render, screen } from '@testing-library/react';
import { SearchPad } from './SearchPad';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('SearchPad', () => {

    it('renders text', () => {
        render(<SearchPad onSearch={vi.fn()} />);
        
        expect(screen.getByText('Suche mit Artikelnummer ohne führenden Buchstaben')).toBeInTheDocument();
    });


    it('adds button value at the end when number button is clicked', async () => {
        render(<SearchPad onSearch={vi.fn()} />);
        
        const numberButton = screen.getByText('1');
        const user = userEvent.setup();
        await user.click(numberButton);
        await user.click(numberButton);
        
        expect(screen.getByText('11')).toBeInTheDocument();
    });

    it('removes last number when backspace button is clicked', async () => {
        render(<SearchPad onSearch={vi.fn()} />);

        const numberButton = screen.getByText('2');
        const user = userEvent.setup();
        await user.click(numberButton);
        await user.click(numberButton);
        await user.click(numberButton);
        
        const backspaceButton = screen.getByText('⌫');
        await user.click(backspaceButton);
        
        expect(screen.getByText('22')).toBeInTheDocument();
    });

    it('calls onSearch when search button is clicked', async () => {
        const onSearch = vi.fn();
        render(<SearchPad onSearch={onSearch} />);
        
        const numberButton = screen.getByText('3');
        const user = userEvent.setup();
        await user.click(numberButton);
        await user.click(numberButton);
        await user.click(numberButton);

        const searchButton = screen.getByText('Suchen');
        await user.click(searchButton);
        
        expect(onSearch).toHaveBeenCalledWith("333");
    });
}); 