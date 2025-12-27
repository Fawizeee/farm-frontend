/**
 * Utility functions for testing notifications
 * You can call these from the browser console for testing
 */

/**
 * Clear notification modal dismissal and force show modal
 */
export const forceShowNotificationModal = () => {
  localStorage.removeItem('notificationModalDismissed');
  localStorage.removeItem('notificationModalDismissedTime');
  console.log('Notification modal dismissal cleared. Refresh the page to see the modal.');
};

/**
 * Check notification status
 */
export const checkNotificationStatus = () => {
  const status = {
    supported: 'Notification' in window && 'serviceWorker' in navigator,
    permission: Notification.permission,
    dismissed: localStorage.getItem('notificationModalDismissed'),
    dismissedTime: localStorage.getItem('notificationModalDismissedTime'),
  };
  console.table(status);
  return status;
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.forceShowNotificationModal = forceShowNotificationModal;
  window.checkNotificationStatus = checkNotificationStatus;
}

