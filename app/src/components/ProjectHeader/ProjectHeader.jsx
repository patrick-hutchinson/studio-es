import { AnimatePresence, motion } from "framer-motion";

import styles from "./ProjectHeader.module.css";

const ProjectHeader = ({ code, isPinned = false, title }) => {
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

      <AnimatePresence mode="wait">
        {isPinned && title ? (
          <motion.span
            key={title}
            className={styles.title}
            data-project-title=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {title}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ProjectHeader;
