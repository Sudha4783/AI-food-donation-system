import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md';
import styles from './Toast.module.css';

const ICONS = {
  success: <MdCheckCircle size={20} />,
  error:   <MdError size={20} />,
  warning: <MdWarning size={20} />,
  info:    <MdInfo size={20} />,
};

/**
 * Single Toast message
 */
export const ToastItem = ({ id, type = 'info', message, onRemove }) => {
  const timerRef = useRef(null);

  const remove = useCallback(() => onRemove(id), [id, onRemove]);

  useEffect(() => {
    timerRef.current = setTimeout(remove, 4000);
    return () => clearTimeout(timerRef.current);
  }, [remove]);

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <span className={styles.icon}>{ICONS[type]}</span>
      <p className={styles.message}>{message}</p>
      <button className={styles.closeBtn} onClick={remove} aria-label="Dismiss">
        <MdClose size={16} />
      </button>
    </div>
  );
};

/**
 * Toast container — renders all active toasts in a portal
 */
const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;

  return createPortal(
    <div className={styles.container} aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
