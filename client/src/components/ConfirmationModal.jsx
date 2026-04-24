import { useEffect } from 'react';

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

  const confirmButtonClass =
    type === 'danger'
      ? 'bg-[#404040] text-[#F2F2F2] hover:bg-[#404040]/90 dark:bg-[#BFBFBF] dark:text-[#0D0D0D] dark:hover:bg-[#BFBFBF]/90'
      : 'bg-[#0D0D0D] text-[#F2F2F2] hover:bg-[#0D0D0D]/90 dark:bg-[#F2F2F2] dark:text-[#0D0D0D] dark:hover:bg-[#F2F2F2]/90';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0D0D0D]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-[32px] border border-[#BFBFBF]/60 dark:border-[#404040]/70 bg-[#F2F2F2] dark:bg-[#0D0D0D] p-6 sm:p-7 shadow-lg"
      >
        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#BFBFBF]/35 dark:bg-[#404040]/55 text-xl font-semibold text-[#404040] dark:text-[#F2F2F2]">
          <span aria-hidden>{styles.icon}</span>
        </div>

        <div className="mt-3 inline-flex rounded-full border border-[#BFBFBF]/70 dark:border-[#404040]/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-[#8C8C8C]">
          {styles.label}
        </div>

        {/* Title */}
        <h3 className="mt-4 text-xl font-semibold text-[#0D0D0D] dark:text-[#F2F2F2]">
          {title}
        </h3>

        {/* Message */}
        <p className="mt-3 text-sm leading-relaxed text-[#404040] dark:text-[#BFBFBF]">
          {message}
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#BFBFBF] dark:border-[#404040] px-5 py-2 text-sm font-medium text-[#404040] dark:text-[#F2F2F2] hover:bg-[#0D0D0D]/10 dark:hover:bg-[#F2F2F2]/10 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2]"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-medium active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#F2F2F2] ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
