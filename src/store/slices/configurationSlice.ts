import { createSlice } from '@reduxjs/toolkit';
import { Configuration } from '../../state/reducer';

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