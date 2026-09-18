import styles from "./MiniaturePost.module.scss";

const getPlainText = (value) => {
  if (typeof value === "string") return value.replace(/\s+/g, " ").trim();
  if (!Array.isArray(value)) return "";

  return value
    .flatMap((block) => block?.children || [])
    .map((child) => child?.text || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const MiniaturePost = ({ className = "", post }) => {
  const background = post.appearance?.background?.hex || "#ffffff";
  const foreground = post.appearance?.font?.hex || "#000000";
  const title = getPlainText(post.title);

  return (
    <article
      className={[styles.post, className].filter(Boolean).join(" ")}
      style={{ "--post-background": background, "--post-foreground": foreground }}
    >
      <p className={styles.title} typo="h3 compensate">
        {title}
      </p>
    </article>
  );
};

export default MiniaturePost;
