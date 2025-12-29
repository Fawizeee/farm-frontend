import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { initializeDeviceId } from './utils/deviceCookie';
import NotificationPermissionModal from './components/js/NotificationPermissionModal';
import { 
  initializeNotifications, 
  isNotificationSupported, 
  hasNotificationPermission,
  isNotificationDenied 
} from './services/notificationService';
import './utils/testNotifications'; // Import test utilities

function App() {
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
      // Don't show if:
      // 1. Permission is already granted
      // 2. Permission is denied
      // 3. User dismissed the modal recently (within 7 days)
      if (!hasNotificationPermission() && !isNotificationDenied()) {
        console.log('Permission not granted or denied, checking if modal should show...');
        
        const dismissed = localStorage.getItem('notificationModalDismissed');
        const dismissedTime = localStorage.getItem('notificationModalDismissedTime');
        
        if (dismissed === 'true' && dismissedTime) {
          const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
          console.log(`Modal was dismissed ${daysSinceDismissed.toFixed(2)} days ago`);
          // Show modal again after 7 days
          if (daysSinceDismissed < 7) {
            console.log('Modal was recently dismissed, not showing again yet');
            return;
          }
        }

        console.log('Showing notification modal...');
        // On mobile, show modal immediately or with shorter delay
        const delay = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 1000 : 2000;
        setTimeout(() => {
          console.log('Setting modal to show');
          setShowNotificationModal(true);
        }, delay);
      } else {
        console.log('Permission already granted or denied, not showing modal');
      }
    };

    setupNotifications();
  }, []);

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
    <Router>
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
          <Route path="/admin/home" element={<AdminHome orders={pendingOrders} />} />
          <Route path="/admin/orders" element={<AdminOrdersPage orders={pendingOrders} />} />
          <Route path="/admin/products/add" element={<AddProduct />} />
          <Route path="/admin/products/edit" element={<EditProductsPage />} />
          <Route path="/admin/notifications/analytics" element={<NotificationAnalyticsPage />} />
          <Route path="/order" element={
            <OrderPage
              cart={cart}
              setCart={setCart}
              pendingOrders={pendingOrders}
              addPendingOrder={addPendingOrder}
            />
          } />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
