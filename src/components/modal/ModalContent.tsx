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
      <div
        ref={ref}
        tabIndex={tabIndex}
        className={`modal-content fixed left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] z-50 grid w-full max-w-lg gap-4 border bg-white p-2 shadow-lg duration-300 sm:rounded-lg transition-all data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut ${className}`}
      >
        {children}
      </div>
    );
  }
);

export { ModalContent };
