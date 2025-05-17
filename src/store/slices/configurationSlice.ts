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

export const { setConfiguration } = configurationSlice.actions;
export default configurationSlice.reducer; 