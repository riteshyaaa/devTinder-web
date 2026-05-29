/**
 * Reusable shimmer/skeleton loading components.
 * Used to show placeholder UI while data is being fetched.
 */

// Generic skeleton card (used in Feed)
export const CardSkeleton = () => (
  <div className="card bg-base-300 w-96 shadow-xl animate-pulse">
    <figure>
      <div className="w-full h-64 bg-base-content/10" />
    </figure>
    <div className="card-body">
      <div className="h-6 bg-base-content/10 rounded w-3/4" />
      <div className="h-4 bg-base-content/10 rounded w-1/2 mt-2" />
      <div className="h-4 bg-base-content/10 rounded w-full mt-2" />
      <div className="h-4 bg-base-content/10 rounded w-5/6 mt-1" />
      <div className="card-actions justify-end mt-6">
        <div className="h-10 bg-base-content/10 rounded w-24" />
        <div className="h-10 bg-base-content/10 rounded w-24" />
      </div>
    </div>
  </div>
);

// Skeleton row for connections/requests list
export const ListItemSkeleton = () => (
  <div className="bg-base-300 m-4 flex w-full md:w-6/12 mx-auto h-24 md:h-32 rounded animate-pulse">
    <div className="flex items-center p-3">
      <div className="w-20 h-20 rounded-full bg-base-content/10" />
    </div>
    <div className="flex-1 flex flex-col justify-center mx-4 gap-2">
      <div className="h-5 bg-base-content/10 rounded w-40" />
      <div className="h-4 bg-base-content/10 rounded w-24" />
      <div className="h-4 bg-base-content/10 rounded w-56" />
    </div>
    <div className="flex items-center p-4">
      <div className="h-10 bg-base-content/10 rounded w-20" />
    </div>
  </div>
);

// Multiple list skeletons
export const ListSkeleton = ({ count = 4 }) => (
  <div className="my-10">
    <div className="h-8 bg-base-content/10 rounded w-48 mx-auto mb-6 animate-pulse" />
    {Array.from({ length: count }).map((_, i) => (
      <ListItemSkeleton key={i} />
    ))}
  </div>
);

// Full page spinner (used as fallback)
export const Spinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
    <span className="loading loading-spinner loading-lg text-primary" />
    <p className="text-base-content/70 text-sm">{text}</p>
  </div>
);

// Error state with retry button
export const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4">
    <div className="text-error text-5xl">⚠️</div>
    <p className="text-error text-center text-lg max-w-md">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-primary btn-sm mt-2">
        Try Again
      </button>
    )}
  </div>
);

// Empty state with optional action
export const EmptyState = ({ icon = "🔍", title, description, action }) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 px-4">
    <div className="text-5xl">{icon}</div>
    <h3 className="text-xl font-semibold text-base-content">{title}</h3>
    {description && (
      <p className="text-base-content/60 text-center max-w-sm">{description}</p>
    )}
    {action && (
      <button onClick={action.onClick} className="btn btn-primary btn-sm mt-2">
        {action.label}
      </button>
    )}
  </div>
);
