import { motion } from "framer-motion";

import styles from "./ProjectPreviewHeader.module.css";

const ProjectPreviewHeader = ({ code, title }) => {
  if (!title && !code) return null;

  return (
    <div className={styles.header} aria-hidden="true" typo="h3">
      <motion.span
        className={styles.title}
        initial={{ y: "-120%" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ amount: 0.25, once: true }}
        whileInView={{ y: 0 }}
      >
        {title}
      </motion.span>
      <motion.span
        className={styles.code}
        initial={{ y: "-120%" }}
        transition={{ delay: 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ amount: 0.25, once: true }}
        whileInView={{ y: 0 }}
      >
        {code}
      </motion.span>
    </div>
  );
};

export default ProjectPreviewHeader;
