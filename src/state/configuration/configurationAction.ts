import { Configuration } from '../reducer';

export enum ConfigurationActionTypes { SET_CONFIGURATION  = 'SET_CONFIGURATION' }

export type SetConfigurationAction = {
  type: ConfigurationActionTypes.SET_CONFIGURATION;
  payload: Configuration;
};

export type ConfigurationAction =
  | SetConfigurationAction;