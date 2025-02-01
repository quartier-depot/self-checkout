import React, { createContext, ReactNode, useReducer } from 'react';
import { Actions } from '../actions/actions';
import { initialState, reducer, State } from '../reducer/reducer';

type AppContextType = {
  state: State;
  dispatch: React.Dispatch<Actions>;
};

export const AppContext = createContext<AppContextType | null>(null);

type ContextProviderProps = {
  children: ReactNode;
};

function AppContextProvider({ children }: ContextProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export default AppContextProvider;
