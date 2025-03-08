import React, { createContext, ReactNode, useReducer } from 'react';
import { Action } from '../state/action';
import { initialState, reducer, State } from '../state/reducer';

type AppContextType = {
    state: State;
    dispatch: React.Dispatch<Action>;
};

export const AppContext = createContext<AppContextType | null>(null);

type ContextProviderProps = {
    children: ReactNode;
};

function AppContextProvider({ children }: ContextProviderProps) {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
            <AppContext.Provider value={{ state, dispatch }}>
                {children}
            </AppContext.Provider>);
}

export default AppContextProvider;
