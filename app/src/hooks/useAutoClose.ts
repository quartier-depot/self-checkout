import { useEffect } from 'react';
import { useAppSelector } from '../store/store';

export function useAutoClose(onClose: () => void) {
  const configuration = useAppSelector(state => state.configuration.configuration);
  const timeout = configuration?.inactivityTimeout ||  60000;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, timeout);

    return () => clearTimeout(timer);
  }, [onClose]);


  return;
}