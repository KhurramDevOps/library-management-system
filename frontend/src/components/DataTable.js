function DataTable({ columns, data, actions, emptyText = 'No records found.' }) {
  return (
    <div className="table-responsive table-custom bg-white">
      <table className="table mb-0 align-middle">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {actions && <th className="text-end">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="empty-state">{emptyText}</td>
            </tr>
          ) : data.map((row, index) => (
            <tr key={row._id || index} className={row.status === 'overdue' ? 'row-overdue' : ''}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row, index) : row[column.key]}</td>
              ))}
              {actions && <td className="text-end">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
