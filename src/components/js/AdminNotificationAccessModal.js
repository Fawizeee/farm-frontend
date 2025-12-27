import React from 'react';
import '../css/AdminNotificationAccessModal.css';
import { FaExclamationTriangle } from 'react-icons/fa';

const AdminNotificationAccessModal = ({ onClose }) => {
  return (
    <div className="admin-notification-access-modal-overlay" onClick={onClose}>
      <div className="admin-notification-access-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-notification-access-modal-header">
          <div className="admin-notification-access-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Notification Access Not Granted</h2>
        </div>
        
        <div className="admin-notification-access-modal-body">
          <p>
            You need to grant notification permission to send notifications to users.
          </p>
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
            Please enable notifications in your browser settings to use this feature.
          </p>
        </div>

        <div className="admin-notification-access-modal-footer">
          <button
            className="admin-notification-access-btn-ok"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationAccessModal;

