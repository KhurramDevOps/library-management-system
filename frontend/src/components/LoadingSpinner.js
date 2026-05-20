function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="loading-shell">
      <div className="loading-ring" />
      <p>{label}</p>
    </div>
  );
}

export default LoadingSpinner;
