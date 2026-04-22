import Loader from "./Loader";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

function DataTable({
	columns,
	data,
	rowKey = "_id",
	emptyTitle = "No data found",
	emptyText = "There is nothing to display yet.",
	isLoading = false,
}) {
	const hasRows = Array.isArray(data) && data.length > 0;

	return (
		<div className="rounded-xl border border-slate-200 bg-white shadow-sm">
			<Table>
				<TableHeader>
					<TableRow>
						{columns.map((column) => (
							<TableHead
								key={column.key}
								className={cn(
									"bg-slate-50 font-semibold text-slate-700",
									column.headerClassName
								)}>
								{column.header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading ? (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="py-10 text-center">
								<Loader />
							</TableCell>
						</TableRow>
					) : hasRows ? (
						data.map((row, index) => (
							<TableRow key={row[rowKey] ?? `${rowKey}-${index}`}>
								{columns.map((column) => (
									<TableCell
										key={column.key}
										className={column.cellClassName}>
										{column.render
											? column.render(row, index)
											: row[column.key] ?? "-"}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="py-10 text-center">
								<h3 className="text-base font-semibold text-slate-900">
									{emptyTitle}
								</h3>
								<p className="mt-1 text-sm text-slate-500">{emptyText}</p>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export default DataTable;
