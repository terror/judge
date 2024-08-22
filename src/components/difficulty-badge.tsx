export const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const badgeColors = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-orange-100 text-orange-800 border-orange-200',
    hard: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span
      className={`rounded-full border px-2 py-1 text-xs font-semibold ${badgeColors[difficulty as keyof typeof badgeColors]}`}
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
};
