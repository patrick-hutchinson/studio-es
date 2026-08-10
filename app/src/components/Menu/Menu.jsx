import { motion } from "framer-motion";

import styles from "./Menu.module.scss";

const Menu = ({}) => {
  return (
    <motion.div
      className={styles.menu}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24, ease: "easeInOut" }}
    >
      <nav className={styles.nav}></nav>
    </motion.div>
  );
};

export default Menu;
