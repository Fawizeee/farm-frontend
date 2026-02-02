import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './components/css/App.css';
import Navbar from './components/js/Navbar';
import HomePage from './components/js/HomePage';
import OrderPage from './components/js/OrderPage';
import ContactPage from './components/js/ContactPage';
import AboutPage from './components/js/AboutPage';
import Footer from './components/js/Footer';

import AdminLogin from './components/js/AdminLogin';
import AdminHome from './components/js/AdminHome';
import AdminOrdersPage from './components/js/AdminOrdersPage';
import AddProduct from './components/js/AddProduct';
import EditProductsPage from './components/js/EditProductsPage';
import NotificationAnalyticsPage from './components/js/NotificationAnalyticsPage';
import OrderConfirmationPage from './components/js/OrderConfirmationPage';
import { initializeDeviceId } from './utils/deviceCookie';
import NotificationPermissionModal from './components/js/NotificationPermissionModal';
import ProtectedRoute from './components/js/ProtectedRoute';
import {
  initializeNotifications,
  isNotificationSupported,
  isNotificationDenied
} from './services/notificationService';
import './utils/testNotifications'; // Import test utilities

// Create a wrapper component that can use useLocation
function AppContent() {
  const location = useLocation();

  // Load cart from localStorage on mount
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Initialize device cookie when app loads
  useEffect(() => {
    initializeDeviceId();
  }, []);

  // Initialize notifications and check if modal should be shown
  useEffect(() => {
    const setupNotifications = async () => {
      // Don't show notification modal on admin login page
      if (location.pathname === '/admin') {
        console.log('On admin login page, skipping notification modal');
        return;
      }

      console.log('Setting up notifications...');
      console.log('User agent:', navigator.userAgent);
      console.log('Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

      // Check if notifications are supported
      if (!isNotificationSupported()) {
        console.log('Notifications are not supported in this browser');
        // On mobile, still try to show modal if Notification API exists
        if ('Notification' in window && !isNotificationDenied()) {
          console.log('Notification API exists, will show modal anyway');
        } else {
          return;
        }
      }

      console.log('Notification permission status:', Notification.permission);
      console.log('Service worker support:', 'serviceWorker' in navigator);

      // Initialize notifications (for users who already granted permission)
      // This might fail if Firebase isn't configured, but that's okay
      try {
        await initializeNotifications();
      } catch (error) {
        console.warn('Failed to initialize notifications (Firebase might not be configured):', error);
        // Continue anyway - we can still show the modal
      }

      // Check if we should show the notification modal
      // Logic update: We want to show the modal if:
      // 1. Permission is NOT granted OR
      // 2. Permission IS granted, but we don't have a valid token (user treated as unsubscribed)
      // AND we haven't dismissed it recently.

      const checkAndShowModal = async () => {
        let shouldShow = false;

        if (Notification.permission === 'default') {
          shouldShow = true;
        } else if (Notification.permission === 'granted') {
          // If permission is granted, checking for token usually regenerates it.
          // Instead, we check our intent flag 'mufu_push_subscribed'.
          // If permission is granted but this flag is missing, we consider them unsubscribed.
          const isSubscribedLocally = localStorage.getItem('mufu_push_subscribed') === 'true';

          if (!isSubscribedLocally) {
            console.log('Permission granted but intent flag missing (unsubscribed). Showing modal to re-subscribe.');
            shouldShow = true;
          }
        }

        if (isNotificationDenied()) {
          shouldShow = false; // Don't annoy if denied
        }

        if (shouldShow) {
          console.log('Conditions met to potentially show modal...');
          const dismissed = localStorage.getItem('notificationModalDismissed');
          const dismissedTime = localStorage.getItem('notificationModalDismissedTime');

          if (dismissed === 'true' && dismissedTime) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
              console.log('Modal was recently dismissed, not showing again yet');
              return;
            }
          }

          console.log('Showing notification modal...');
          const delay = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 1000 : 2000;
          setTimeout(() => {
            setShowNotificationModal(true);
          }, delay);
        } else {
          console.log('Modal conditions not met (Permission granted & token exists, or denied)');
        }
      };

      checkAndShowModal();
    };

    setupNotifications();
  }, [location.pathname]); // Re-run when location changes

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const addPendingOrder = (order) => {
    setPendingOrders(prev => [...prev, order]);
  };

  const handleNotificationPermissionGranted = async () => {
    // Re-initialize notifications after permission is granted
    await initializeNotifications();
  };

  // Debug: Log modal state
  useEffect(() => {
    console.log('Modal should show:', showNotificationModal);
  }, [showNotificationModal]);

  return (
    <div className="App">
      {showNotificationModal && (
        <NotificationPermissionModal
          onClose={() => {
            console.log('Modal closed');
            setShowNotificationModal(false);
          }}
          onPermissionGranted={handleNotificationPermissionGranted}
        />
      )}
      <Routes>
        <Route path="/" element={
          <>
            <Navbar cartCount={getTotalItems()} />
            <HomePage />
          </>
        } />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/home" element={
          <ProtectedRoute>
            <AdminHome orders={pendingOrders} />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute>
            <AdminOrdersPage orders={pendingOrders} />
          </ProtectedRoute>
        } />
        <Route path="/admin/products/add" element={
          <ProtectedRoute>
            <AddProduct />
          </ProtectedRoute>
        } />
        <Route path="/admin/products/edit" element={
          <ProtectedRoute>
            <EditProductsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/notifications/analytics" element={
          <ProtectedRoute>
            <NotificationAnalyticsPage />
          </ProtectedRoute>
        } />
        <Route path="/order" element={
          <OrderPage
            cart={cart}
            setCart={setCart}
            pendingOrders={pendingOrders}
            addPendingOrder={addPendingOrder}
          />
        } />
        <Route path="/order-confirmation" element={<OrderConfirmationPage setCart={setCart} />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

