import React from 'react';
import { Modal } from '@/components/modal';

/**
 * TenantModalOverlay - Modal wrapper với z-index cao
 * Đảm bảo modal luôn hiển thị trên drawer và các overlay khác
 */
interface TenantModalOverlayProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactElement;
}

export const TenantModalOverlay: React.FC<TenantModalOverlayProps> = ({ 
  open,
  onClose,
  children
}) => {
  return (
    <Modal 
      open={open}
      onClose={onClose}
      zIndex={1500} // Cao hơn drawer (1300) và modal thường (1400)
      className="tenant-modal-overlay"
    >
      {children}
    </Modal>
  );
}; 