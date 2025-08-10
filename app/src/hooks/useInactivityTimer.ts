
import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { startNewSession } from '../store/slices/appSlice';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

interface UseInactivityTimerOptions {
  timeout?: number; // in milliseconds
}

export function useInactivityTimer({
  timeout = 60 * 1000, // 1 minute default
}: UseInactivityTimerOptions = {}) {
  const [showInactivityDialog, setShowInactivityDialog] = useState(false);
  const dispatch = useAppDispatch();
  const applicationInsights = useAppInsightsContext();

  // Get cart and customer state from store
  const cart = useAppSelector(state => state.cart.cart);
  const customer = useAppSelector(state => state.customer.customer);

  // Check if timer should be active
  const shouldBeActive = cart.quantity > 0 || Boolean(customer);

  const resetTimer = useCallback(() => {
    setShowInactivityDialog(false);
  }, []);

  const handleTimeout = useCallback(() => {
    // Only show dialog and handle timeout if conditions are met
    if (shouldBeActive) {
      setShowInactivityDialog(true);

      // Give user 30 seconds to respond
      const dialogTimeout = setTimeout(() => {
        if (showInactivityDialog) {
          applicationInsights.trackEvent({ name: 'inactivity-timeout' });
          dispatch(startNewSession());
        }
      }, 30000);

      return () => clearTimeout(dialogTimeout);
    }
  }, [dispatch, showInactivityDialog, shouldBeActive]);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleTimeout, timeout);
    };

    // Events to monitor
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];

    // Set up initial timer
    resetInactivityTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer);
    });

    // Reset dialog when conditions are not met
    if (!shouldBeActive) {
      setShowInactivityDialog(false);
    }

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [timeout, handleTimeout, shouldBeActive]);

  return {
    showInactivityDialog,
    resetTimer,
  };
}