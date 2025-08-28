// components/LoadingOverlay.tsx
import React, { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  title: string;
  visible: boolean;
  maxSeconds?: number;
  onTimeout?: () => void;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ title, visible, maxSeconds = 60, onTimeout }) => {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (visible) {
      setShow(true);
      timeout = setTimeout(() => {
        setShow(false);
        onTimeout?.();
      }, maxSeconds * 1000);
    } else {
      setShow(false);
    }

    return () => clearTimeout(timeout);
  }, [visible, maxSeconds, onTimeout]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center`}>
      <div className="text-white text-lg font-semibold animate-pulse">
        {title}
      </div>
    </div>
  );
};

export default LoadingOverlay;
