import { createSlice } from '@reduxjs/toolkit';

interface Configuration {
  woocommerce?: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  };
  applicationInsights?: {
    connectionString: string;
  };
  inactivityTimeout: number;
  inactivityConfirmationTimeout: number;
}

interface ConfigurationState {
  configuration: Configuration | null;
}

const initialState: ConfigurationState = {
  configuration: {
    inactivityConfirmationTimeout: 30 * 1000,
    inactivityTimeout: 60 * 1000,
  }
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

export const { setConfiguration } = configurationSlice.actions;
export default configurationSlice.reducer; 