import { PortableText } from "@portabletext/react";
import { cloneElement, isValidElement } from "react";

const isPortableTextBlockEmpty = (value) => {
  if (!value?.children?.length) return true;

  return value.children.every((child) => child._type === "span" && !child.text);
};

const renderSoftBreaks = (node) => {
  if (typeof node === "string") {
    return node.split("\n").flatMap((part, index) => (index === 0 ? [part] : [<br key={`br-${index}`} />, part]));
  }

  if (Array.isArray(node)) {
    return node.flatMap((child) => renderSoftBreaks(child));
  }

  if (isValidElement(node) && node.props?.children) {
    return cloneElement(node, {
      children: renderSoftBreaks(node.props.children),
    });
  }

  return [node];
};

const PortableTextParagraph = ({ children, value }) => {
  if (isPortableTextBlockEmpty(value)) return <p aria-hidden="true">&nbsp;</p>;

  return <p>{renderSoftBreaks(children)}</p>;
};

const getLinkAttributes = (value) => {
  const type = value?.type || "link";

  if (type === "email") {
    return value.email ? { href: `mailto:${value.email}` } : null;
  }

  if (type === "file") {
    const href = value.file?.asset?.url;

    return href
      ? {
          href,
          download: value.file.asset.originalFilename || true,
        }
      : null;
  }

  return value.url ? { href: value.url } : null;
};

const Text = ({ text, typo, className, components, style }) => {
  if (!Array.isArray(text)) {
    return text ? (
      <p typo={typo} className={className} style={{ ...style }}>
        {text}
      </p>
    ) : null;
  }

  return (
    <div className={className} typo={typo} style={{ ...style }}>
      <PortableText
        value={text}
        components={{
          ...components,
          block: {
            normal: PortableTextParagraph,
            ...components?.block,
          },
          marks: {
            link: ({ value, children }) => {
              const attributes = getLinkAttributes(value);
              if (!attributes) return children;

              return <a {...attributes}>{children}</a>;
            },
            ...components?.marks,
          },
        }}
      />
    </div>
  );
};

export default Text;
