import { DeviceContext } from "@/context/DeviceContext";

import styles from "./Header.module.scss";

import Link from "next/link";
import { useContext } from "react";

const Header = ({ site = {} }) => {
  const { isMobile } = useContext(DeviceContext);

  const DesktopNav = () => {
    return (
      <nav className={`${styles.nav} grid`}>
        <Link href="/studio">The Studio</Link>
        <Link href="/id">The ID</Link>
      </nav>
    );
  };

  const MobileNav = () => {
    return <nav className={styles.nav}></nav>;
  };

  return (
    <header className={`${styles.header} grid`} typo="h3">
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </header>
  );
};

export default Header;
