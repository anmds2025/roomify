import React, { forwardRef, useCallback } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader } from '@/components/modal';
import { KeenIcon } from '@/components';

interface ModalConfirmCreateUserProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

// Component cho action buttons
const ConfirmActionButtons = React.memo(({ 
  onCancel, 
  onConfirm, 
  isLoading = false 
}: {
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}) => (
  <div className="w-full flex gap-2 justify-end pt-4">
    <button 
      onClick={onCancel} 
      className="py-2 px-3 border border-[#F4F4F4] rounded text-base font-bold text-[#1A2B49]"
      disabled={isLoading}
    >
      Hủy bỏ
    </button>
    <button 
      onClick={onConfirm} 
      className="py-2 px-3 border border-[#F4F4F4] rounded text-base font-bold bg-green-600 text-white hover:bg-green-700"
      disabled={isLoading}
    >
      {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
    </button>
  </div>
));

const ModalConfirmCreateUser = forwardRef<HTMLDivElement, ModalConfirmCreateUserProps>(
  ({ open, onClose, onConfirm, title, message, isLoading = false }, ref) => {
    
    const handleConfirm = useCallback(() => {
      onConfirm();
    }, [onConfirm]);

    const handleClose = useCallback(() => {
      if (!isLoading) {
        onClose();
      }
    }, [onClose, isLoading]);

    return (
      <Modal open={open} onClose={handleClose}>
        <ModalContent className="max-w-[500px] top-[20%]">
          <ModalHeader className="py-4 px-5">
            <div className="text-[#1A2B49] text-lg font-semibold flex items-center gap-2">
              <KeenIcon icon="add-notepad" className="text-green-600" />
              {title}
            </div>
            <button 
              className="btn btn-sm btn-icon btn-light btn-clear shrink-0" 
              onClick={handleClose}
              disabled={isLoading}
            >
              <KeenIcon icon="cross" />
            </button>
          </ModalHeader>
          
          <ModalBody className="py-4 px-5">
            <div className="text-[#404041] text-base mb-4">
              {message}
            </div>
            
            <ConfirmActionButtons
              onCancel={handleClose}
              onConfirm={handleConfirm}
              isLoading={isLoading}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);

export { ModalConfirmCreateUser };
