import clsx from 'clsx';
import { forwardRef } from 'react';

interface IModalBackdropProps {
  className?: string;
  open: boolean;
  ownerState?: any; // MUI internal prop - không dùng
}

// Forwarding ref to ensure this component can hold a ref
const ModalBackdrop = forwardRef<HTMLDivElement, IModalBackdropProps>(
  ({ className, ownerState, ...props }, ref) => {
    // Filter out MUI internal props để tránh warning
    const { open, ...domProps } = props;

    return (
      <div
        ref={ref}
        className={clsx('modal-backdrop transition-all duration-300 -z-1', className && className)}
        aria-hidden="true"
        {...domProps} // Chỉ pass các props hợp lệ xuống DOM
      />
    );
  }
);

export { ModalBackdrop, type IModalBackdropProps };
