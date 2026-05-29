import { motion, AnimatePresence } from "framer-motion";

/**
 * ToastNotifications — renders a stack of floating toast notifications.
 * Positioned top-right. Auto-dismisses after 5s. Click to dismiss immediately.
 *
 * Props:
 * - toasts: [{ id, type, title, message, photo }]
 * - onDismiss: (id) => void
 */
const ToastNotifications = ({ toasts, onDismiss }) => {
  const getTypeStyles = (type) => {
    switch (type) {
      case "match":
        return "border-l-4 border-pink-500 bg-base-200";
      case "request":
        return "border-l-4 border-info bg-base-200";
      case "message":
        return "border-l-4 border-primary bg-base-200";
      case "interest":
        return "border-l-4 border-warning bg-base-200";
      case "system":
        return "border-l-4 border-accent bg-base-200";
      default:
        return "border-l-4 border-base-content/20 bg-base-200";
    }
  };

  const getTypeEmoji = (type) => {
    switch (type) {
      case "match": return "🎉";
      case "request": return "🤝";
      case "message": return "💬";
      case "interest": return "👀";
      case "system": return "📢";
      default: return "🔔";
    }
  };

  return (
    <div
      className="fixed top-16 right-4 z-[60] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`rounded-lg shadow-xl p-3 flex items-start gap-3 cursor-pointer pointer-events-auto hover:shadow-2xl transition-shadow ${getTypeStyles(toast.type)}`}
            onClick={() => onDismiss(toast.id)}
            role="alert"
            aria-label={`${toast.title}: ${toast.message}`}
          >
            {/* Avatar or emoji */}
            {toast.photo ? (
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-base-content/10">
                <img
                  src={toast.photo}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {getTypeEmoji(toast.type)}
              </span>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{toast.title}</p>
              <p className="text-xs opacity-70 truncate">{toast.message}</p>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(toast.id);
              }}
              className="btn btn-ghost btn-xs btn-circle flex-shrink-0 opacity-50 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotifications;
