import oraclipIcon from "@/assets/oraclip-icon.png";

type LogoProps = {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export function Logo({
  size = 28,
  className = "",
  showWordmark = true,
  wordmarkClassName = "",
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={oraclipIcon}
        alt="Oraclip"
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: "contain" }}
        className="select-none"
        draggable={false}
      />
      {showWordmark && (
        <span
          className={`font-bold tracking-tight ${wordmarkClassName}`}
          style={{ color: "var(--mint)" }}
        >
          Oraclip
        </span>
      )}
    </span>
  );
}
