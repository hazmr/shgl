import { useEffect } from 'react';
import CornerAccents from './CornerAccents';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info' // 'info', 'warning', 'danger', 'success'
}) => {
  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          icon: '!',
          label: 'Warning'
        };
      case 'danger':
        return {
          icon: '×',
          label: 'Danger'
        };
      case 'success':
        return {
          icon: '✓',
          label: 'Success'
        };
      default:
        return {
          icon: 'i',
          label: 'Info'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0A0B]/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#FFFFFF] dark:bg-[#18181B] p-6 sm:p-8 transition-all duration-300 group"
      >
        <CornerAccents className="text-fg/30 group-hover:text-fg/50" />

        {/* Header Icon */}
        <div className="flex h-10 w-10 items-center justify-center border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 text-lg font-bold font-mono text-fg">
          <span aria-hidden>{styles.icon}</span>
        </div>

        <div className="mt-4 inline-flex border border-[#0A0A0B]/10 dark:border-[#ECECEC]/10 bg-[#0A0A0B]/5 dark:bg-[#ECECEC]/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#8C8C8E]">
          // {styles.label.toUpperCase()}
        </div>

        {/* Title */}
        <h3 className="mt-4 text-lg font-bold font-mono text-fg uppercase tracking-tight">
          {title}
        </h3>

        {/* Message */}
        <p className="mt-3 font-mono text-xs text-[#5C5C5E] dark:text-[#8C8C8E] leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="group/btn relative inline-flex min-h-10 items-center justify-center border border-[#0A0A0B]/20 dark:border-[#ECECEC]/20 bg-transparent px-5 py-2 font-mono text-xs uppercase font-bold tracking-wider text-[#5C5C5E] dark:text-[#8C8C8E] hover:border-fg hover:text-fg transition-all duration-300 cursor-pointer"
          >
            <CornerAccents className="opacity-0 group-hover/btn:opacity-100" />
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`group/btn2 relative inline-flex min-h-10 items-center justify-center border transition-all duration-300 cursor-pointer px-5 py-2 font-mono text-xs uppercase font-bold tracking-wider ${
              type === 'danger'
                ? 'border-red-500 bg-red-500 text-[#FFFFFF] hover:bg-transparent hover:text-red-500'
                : 'border-[#0A0A0B] dark:border-[#ECECEC] bg-[#0A0A0B] text-[#ECECEC] dark:bg-[#ECECEC] dark:text-[#0A0A0B] hover:bg-transparent hover:text-fg'
            }`}
          >
            <CornerAccents className="opacity-0 group-hover/btn2:opacity-100" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
