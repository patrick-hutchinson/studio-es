import styles from "./Snap.module.css";

const SnapElement = ({ children }) => {
  return <div className={styles.snapElement}>{children}</div>;
};

export default SnapElement;
