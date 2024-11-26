"use client";

type Props = {
  frequency: number;
};

const SoundFreqDisplayer = ({ frequency }: Props) => {
  return (
    <div className="w-40 h-min bg-purple-500 overflow-hidden rounded-2xl border-4 border-slate-300">
      <svg viewBox="0 0 100 10">
        <circle cx={frequency} cy="50%" r="5" fill="white" />
      </svg>
    </div>
  );
};

export default SoundFreqDisplayer;
