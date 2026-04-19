import { PortableText } from "@portabletext/react";
import styles from "./Text.module.css";

const Text = ({ text, typo, className }) => {
  return (
    <div className={`${className}`} typo={typo}>
      <PortableText
        value={text}
        components={{
          marks: {
            strong: ({ children }) => {
              return <strong typo="bold">{children}</strong>;
            },
            link: ({ value, children }) => {
              const href = value?.href || value?.url || value?.link;
              if (!href) return <span>{children}</span>;
              return (
                <a className={styles.textLink} href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            },
          },
        }}
      />
    </div>
  );
};

export default Text;
