import styles from "./ProjectPreviewHeader.module.css";

const ProjectPreviewHeader = ({ code, title }) => {
  if (!title && !code) return null;

  return (
    <div className={styles.header} aria-hidden="true" typo="h3">
      <span className={styles.title}>{title}</span>
      <span className={styles.code}>{code}</span>
    </div>
  );
};

export default ProjectPreviewHeader;
