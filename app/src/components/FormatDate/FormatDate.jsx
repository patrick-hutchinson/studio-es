const FormatDate = ({ date, className, typo }) => {
  const d = new Date(date);
  const options = { month: "short", year: "numeric" };
  const monthYear = d.toLocaleDateString("en-US", options);

  function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  const day = getOrdinal(d.getDate());

  return <time className={className} typo={typo}>{`${monthYear.split(" ")[0]} ${day}`}</time>;
};

export default FormatDate;
