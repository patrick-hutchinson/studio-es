const Spacing = ({ spacing }) => {
  return <div style={{ height: `var(--spacing-${spacing})`, position: "relative" }} />;
};

export default Spacing;
