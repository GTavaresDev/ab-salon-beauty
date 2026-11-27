export function TimeButton({
  time,
  selected,
  disabled,
  onClick,
}: {
  time: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  let className =
    "h-11 rounded-lg border border-[#E7C5CF] bg-white text-sm font-medium text-[#7A3350] transition hover:border-[#9B4A68] hover:bg-[#FFF4F7]";

  if (disabled) {
    className =
      "h-11 cursor-not-allowed rounded-lg border border-transparent bg-zinc-100 text-sm font-medium text-zinc-300 line-through transition";
  } else if (selected) {
    className =
      "h-11 rounded-lg border border-[#5C1A33] bg-[#5C1A33] text-sm font-medium text-white shadow-sm transition";
  }

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={className}>
      {time}
    </button>
  );
}
