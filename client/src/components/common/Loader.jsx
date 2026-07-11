import styles from './Loader.module.css';

const Loader = ({ fullscreen = false, size = 'md', text = '' }) => {
  const sizeMap = { sm: 20, md: 36, lg: 56 };
  const px = sizeMap[size] || 36;

  const spinner = (
    <div className={styles.spinnerWrap} style={{ '--size': px + 'px' }}>
      <svg
        className={styles.spinner}
        viewBox="0 0 50 50"
        style={{ width: px, height: px }}
        aria-label="Loading"
        role="status"
      >
        <circle
          className={styles.track}
          cx="25" cy="25" r="20"
          fill="none" strokeWidth="4"
        />
        <circle
          className={styles.arc}
          cx="25" cy="25" r="20"
          fill="none" strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className={styles.fullscreen} role="progressbar">
        <div className={styles.logo}>🍱</div>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loader;
