
interface AlertMessageProps {
  type: "error" | "info";
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function AlertMessage({
  type,
  title,
  message,
  onRetry,
  retryLabel = "Retry",
}: AlertMessageProps) {
  const color =
    type === "error"
      ? "red"
      : "blue";
  return (
    <div
      className={`bg-${color}-100 border border-${color}-400 text-${color}-700 px-4 py-3 rounded relative`}
      role="alert"
    >
      <strong className="font-bold">{title} </strong>
      <span className="block sm:inline">{message}</span>
      {onRetry && (
        <button
          className="ml-4 underline text-sm cursor-pointer"
          onClick={onRetry}
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}