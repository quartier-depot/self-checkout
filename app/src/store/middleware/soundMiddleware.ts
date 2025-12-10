import { Middleware } from '@reduxjs/toolkit';
import { changeCartQuantity } from '../slices/cartSlice';
import { setCartQuantity } from '../slices/cartSlice';
import { setCustomer } from '../slices/customerSlice';
import { showFailure, showSuccess } from '../slices/sessionSlice.ts';

// Create an Audio object for the success sound
const add = new Audio('/assets/sounds/add.mp3');
const remove = new Audio('/assets/sounds/remove.mp3');
const confirm = new Audio('/assets/sounds/confirm.mp3');
const alert = new Audio('/assets/sounds/alert.mp3');

export const soundMiddleware: Middleware = () => (next) => (action) => {
  if (changeCartQuantity.match(action) || setCartQuantity.match(action)) {
    if (action.payload.quantity > 0) {
        add.play().catch(error => {
            console.warn('Failed to play add sound:', error);
          });
    }
    if (action.payload.quantity <= 0) {
        remove.play().catch(error => {
            console.warn('Failed to play remove sound:', error);
          });
    }
  }

  if (setCustomer.match(action)) {
    confirm.play().catch(error => {
      console.warn('Failed to play confirm sound:', error);
    });
  }
  
  if (showSuccess.match(action)) {
    confirm.play().catch(error => {
      console.warn('Failed to play confirm sound:', error);
    });
  }

  if (showFailure.match(action)) {
    alert.play().catch(error => {
      console.warn('Failed to play confirm sound:', error);
    });
  }
  
  return next(action);
};
