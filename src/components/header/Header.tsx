import styles from "./Header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <img className={styles.logo} src="logo.png" alt="logo" />
      <h1 className={styles.title}>Monk Upsell & Cross-sell</h1>
    </header>
  );
}

export default Header;
