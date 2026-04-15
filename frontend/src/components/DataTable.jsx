function DataTable({
	columns,
	data,
	rowKey = "_id",
	emptyTitle = "No data found",
	emptyText = "There is nothing to display yet.",
}) {
	const hasRows = Array.isArray(data) && data.length > 0;

	return (
		<div className='data-table-shell'>
			<div className='data-table-scroll'>
				<table className='data-table'>
					<thead>
						<tr>
							{columns.map((column) => (
								<th
									key={column.key}
									className={column.headerClassName || ""}>
									{column.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{hasRows ? (
							data.map((row, index) => (
								<tr key={row[rowKey] ?? `${rowKey}-${index}`}>
									{columns.map((column) => (
										<td
											key={column.key}
											className={column.cellClassName || ""}>
											{column.render
												? column.render(row, index)
												: row[column.key] ?? "-"}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={columns.length}
									className='data-table-empty'>
									<h3>{emptyTitle}</h3>
									<p>{emptyText}</p>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default DataTable;
