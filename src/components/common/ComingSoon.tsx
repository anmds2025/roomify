import React from 'react';
import { KeenIcon } from '@/components';

interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: string;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'minimal' | 'card';
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = 'Coming Soon',
  description = 'Tính năng này đang được phát triển và sẽ sớm ra mắt.',
  icon = 'rocket',
  className = '',
  showIcon = true,
  variant = 'default'
}) => {
  const baseClasses = 'flex flex-col items-center justify-center text-center';
  
  const variantClasses = {
    default: 'p-12 space-y-8 rounded-2xl',
    minimal: 'p-6 space-y-3',
    card: 'p-8 space-y-5 bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-md bg-white/60 border border-blue-200 shadow-2xl'
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${className}
        transition-all duration-300
      `}
      style={{
        // boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        border: '1px solid rgba(255,255,255,0.18)'
      }}
    >
      {showIcon && (
        <div className="flex items-center justify-center mb-2">
          <div className="bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full p-6 shadow-lg animate-bounce-slow">
            <KeenIcon
              icon={icon}
              className="w-16 h-16 text-blue-500 drop-shadow-lg"
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-4xl font-extrabold text-blue-700 drop-shadow-sm tracking-wide">
          {title}
        </h3>
        <p className="text-gray-700 max-w-xl text-lg leading-relaxed mx-auto">
          {description}
        </p>
      </div>

      {variant === 'default' && (
        <div className="flex items-center gap-2 text-blue-600 text-base font-medium mt-4">
          <span className="animate-pulse">●</span>
          <span>Đang phát triển</span>
          <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
          <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
        </div>
      )}
    </div>
  );
};

export { ComingSoon };

// Thêm animation bounce-slow vào global css nếu muốn icon lắc nhẹ:
// @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
// .animate-bounce-slow { animation: bounce-slow 2s infinite; } 