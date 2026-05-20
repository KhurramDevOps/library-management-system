function StatCard({ icon, label, value, color = 'var(--info)', trend }) {
  return (
    <div className="stat-card card-custom">
      <div className="stat-icon" style={{ background: color }}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {trend && <small className="text-secondary">{trend}</small>}
      </div>
    </div>
  );
}

export default StatCard;
