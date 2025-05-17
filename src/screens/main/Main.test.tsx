import { describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Main } from './Main';
import { AppInsightsContext, ReactPlugin } from '@microsoft/applicationinsights-react-js';

describe('Main', () => {
    test.skip('on change cart quantity by +1 sets product once', async () => {
        renderMain();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    });
});

function renderMain() {
    const reactPlugin = new ReactPlugin();
    render(
        <AppInsightsContext.Provider value={reactPlugin}>
            <Main />
        </AppInsightsContext.Provider>
    );
}