import FormatDate from "../FormatDate/FormatDate";
import Text from "../Text/Text";
import styles from "./Post.module.scss";

const Post = ({ post }) => {
  const background = post.appearance?.background?.hex || "#ffffff";
  const foreground = post.appearance?.font?.hex || "#000000";

  return (
    <article className={styles.post} style={{ "--post-background": background, "--post-foreground": foreground }}>
      {post.date ? <FormatDate className={styles.date} date={post.date} typo="h3 compensate" /> : null}
      <Text className={styles.title} text={post.title} typo="h2 compensate" />
    </article>
  );
};

export default Post;
