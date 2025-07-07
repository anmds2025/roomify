import { forwardRef, ReactNode } from 'react';

interface ModalContentProps {
  className?: string;
  children: ReactNode;
  tabIndex?: number;
}

// Forwarding ref to ensure this component can hold a ref
const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, tabIndex = -1 }, ref) => {
    return (
      <div ref={ref} tabIndex={tabIndex} className={`modal-content ${className}`}>
        {children}
      </div>
    );
  }
);

export { ModalContent };
