import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface Configuration {
  woocommerce?: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  };
  applicationInsights?: {
    connectionString: string;
  };
  snap?: {
    version: string;
  };
}

interface ConfigurationState {
  configuration: Configuration | null;
}

const initialState: ConfigurationState = {
  configuration: null,
};

const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    setConfiguration: (state, action) => {
      state.configuration = action.payload;
    },
  },
});

export const selectSnapVersion = (state: RootState) => state.configuration.configuration?.snap?.version;

export const { setConfiguration } = configurationSlice.actions;
export default configurationSlice.reducer; 