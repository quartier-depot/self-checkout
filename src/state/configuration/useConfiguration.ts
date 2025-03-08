import { useAppContext } from '../../context/useAppContext';

export function useConfiguration() {
  const { state } = useAppContext();

  if (!state.configuration) {
    throw new Error('configuration undefined');
  }

  return state.configuration;
}