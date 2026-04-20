import { PortableText } from "@portabletext/react";

import { isValidElement } from "react";

const Text = ({ text, className, typo }) => {
  if (isValidElement(text)) {
    return text;
  }

  if (!Array.isArray(text)) {
    return text ? (
      <p typo={typo} className={className}>
        {text}
      </p>
    ) : null;
  }

  return (
    <div className={className} typo={typo}>
      <PortableText
        value={text}
        components={{
          block: {
            normal: ({ children }) => <p>{children}</p>,
          },
          marks: {
            link: ({ value, children }) => {
              const href = value?.href;
              if (!href) return children;

              // Check if external (optional)
              const isExternal = href.startsWith("http");

              return (
                <a
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                >
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
