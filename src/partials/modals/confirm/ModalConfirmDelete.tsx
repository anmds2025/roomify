import { forwardRef } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader } from '@/components/modal';
import { KeenIcon } from '@/components';

interface ModalDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;  // Hành động xác nhận xóa
  title: string;  // Tiêu đề modal
  message: string;  // Thông điệp xác nhận
}

const ModalConfirmDelete = forwardRef<HTMLDivElement, ModalDeleteProps>(({ open, onClose, onConfirm, title, message }, ref) => {

  const handleClose = () => {
    onClose();  // Đóng modal
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalContent className="max-w-[600px] top-[15%]">
        <ModalHeader className="py-4 px-5">
          <div className='text-[#1A2B49] text-lg font-semibold'>{title}</div>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={handleClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="py-4 px-5">
          <div className="text-sm text-[#404041] mb-4">
            {message}
          </div>
          <div className='w-full flex gap-2 justify-end pt-4'>
            <button onClick={handleClose} className='py-2 px-3 border border-[#F4F4F4] rounded text-base font-bold text-[#1A2B49]'>Hủy bỏ</button>
            <button onClick={onConfirm} className='py-2 px-3 border border-[#F4F4F4] rounded text-base font-bold bg-[#FF3B30] text-white'>
              Xóa
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export { ModalConfirmDelete };
