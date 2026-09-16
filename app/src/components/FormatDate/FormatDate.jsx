const FormatDate = ({ date, className, typo }) => {
  const [year, month, day] = String(date).slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) return null;

  const yearStart = Date.UTC(year, 0, 1);
  const dateInYear = Date.UTC(year, month - 1, day);
  const dayOfYear = Math.floor((dateInYear - yearStart) / 86_400_000) + 1;
  const code = `C-${String(dayOfYear).padStart(3, "0")}-${String(year).slice(-2)}`;

  return (
    <time className={className} dateTime={String(date).slice(0, 10)} typo={typo}>
      {code}
    </time>
  );
};

export default FormatDate;
