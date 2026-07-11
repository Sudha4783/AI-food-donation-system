import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';
import styles from './Modal.module.css';

/**
 * Reusable Modal component with portal, backdrop, close on Escape/outside click
 * Props: isOpen, onClose, title, children, size ('sm'|'md'|'lg')
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md', hideClose = false }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={`${styles.modal} ${styles[size]} animate-fade-scale`}>
        {(title || !hideClose) && (
          <div className={styles.header}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {!hideClose && (
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
                <MdClose size={20} />
              </button>
            )}
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
