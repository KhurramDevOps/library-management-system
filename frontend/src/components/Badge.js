function Badge({ status }) {
  const normalized = status ? String(status).toLowerCase() : 'issued';
  return <span className={`status-pill status-${normalized}`}>{normalized}</span>;
}

export default Badge;
