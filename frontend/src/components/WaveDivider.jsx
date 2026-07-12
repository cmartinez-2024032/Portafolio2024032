export default function WaveDivider({ fill = "var(--color-base)", flip = false }) {
  const d = flip
    ? "M-100 0C-100 0 218.416 55.835 693.5 55.835C1168.58 55.835 1487 0 1487 0V79H-100V0Z"
    : "M-100 79C-100 79 218.416 23.165 693.5 23.165C1168.58 23.165 1487 79 1487 79V0H-100V79Z";
  return (
    <div className="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1440 79" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d={d} fill={fill} />
      </svg>
    </div>
  );
}
