import { motion } from "framer-motion";

import styles from "./ProjectHeader.module.css";

const ProjectHeader = ({ code, title }) => {
  if (!title && !code) return null;

  return (
    <div className={styles.header} aria-hidden="true" typo="h3 compensate">
      <motion.span
        className={styles.code}
        initial={{ y: "-120%" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ amount: 0.25, once: true }}
        whileInView={{ y: 0 }}
      >
        {code}
      </motion.span>
      {title ? (
        <span className={styles.title} data-project-title="">
          {title}
        </span>
      ) : null}
    </div>
  );
};

export default ProjectHeader;
