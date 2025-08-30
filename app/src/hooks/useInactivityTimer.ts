import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { startNewSession, logActivity } from '../store/slices/sessionSlice';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';
const alert = new Audio('/assets/sounds/alert.mp3');

export function useInactivityTimer() {
  const configuration = useAppSelector(state => state.configuration.configuration);
  const [showInactivityDialog, setShowInactivityDialog] = useState(false);
  const dispatch = useAppDispatch();
  const applicationInsights = useAppInsightsContext();

  const session = useAppSelector(state => state.session.session);
  const shouldBeActive = !session.initialState;

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
      alert.play();
    }
  }, [shouldBeActive]);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let activityLogged = false;
    
    const resetInactivityTimer = () => {
      if (!activityLogged) {
        dispatch(logActivity());
        activityLogged = true;
      }
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleTimeout, configuration?.inactivityTimeout);
    };

    const events = [
      'mousedown',
      'keypress',
      'touchstart',
    ];

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