import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { startNewSession } from '../store/slices/appSlice';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

export function useInactivityTimer() {
  const configuration = useAppSelector(state => state.configuration.configuration);
  const [showInactivityDialog, setShowInactivityDialog] = useState(false);
  const dispatch = useAppDispatch();
  const applicationInsights = useAppInsightsContext();

  const cart = useAppSelector(state => state.cart.cart);
  const customer = useAppSelector(state => state.customer.customer);
  const shouldBeActive = cart.quantity > 0 || Boolean(customer);

  const resetTimer = useCallback(() => {
    setShowInactivityDialog(false);
  }, []);

  // Handle the dialog timeout in a separate effect
  useEffect(() => {
    let dialogTimeout: NodeJS.Timeout | undefined;

    if (showInactivityDialog) {
      dialogTimeout = setTimeout(() => {
        applicationInsights.trackEvent({ name: 'inactivity-timeout' });
        dispatch(startNewSession());
      }, configuration?.inactivityConfirmationTimeout);
    }

    return () => {
      if (dialogTimeout) {
        clearTimeout(dialogTimeout);
      }
    };
  }, [showInactivityDialog, configuration?.inactivityConfirmationTimeout, dispatch]);

  const handleTimeout = useCallback(() => {
    if (shouldBeActive) {
      setShowInactivityDialog(true);
    }
  }, [shouldBeActive]);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleTimeout, configuration?.inactivityTimeout);
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];

    resetInactivityTimer();

    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer);
    });

    if (!shouldBeActive) {
      setShowInactivityDialog(false);
    }

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [configuration?.inactivityTimeout, handleTimeout, shouldBeActive]);

  return {
    showInactivityDialog,
    resetTimer,
  };
}