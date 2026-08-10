import styles from "./Footer.module.scss";

const Footer = ({ page = {}, site = {} }) => {
  return <footer className={styles.footer}></footer>;
};

export default Footer;
