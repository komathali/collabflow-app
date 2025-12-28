'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';
import { Task, User, TimeEntry } from '@/lib/types';
import { useDataService } from '@/hooks/useDataService';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  users: User[];
  onUpdateTask: (taskId: string, values: Partial<Task>) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  users,
  onUpdateTask
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const [activeTimerId, setActiveTimerId] = React.useState<string | null>(null);
  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const dataService = useDataService();
  const { user } = useUser();
  const { toast } = useToast();

  const handleTimerToggle = (taskId: string) => {
    if (activeTimerId === taskId) {
      // Stop the timer
      if (startTime && user) {
        const endTime = new Date();
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // in hours
        const task = (data as Task[]).find(t => t.id === taskId);
        if (task) {
          const timeEntry: Omit<TimeEntry, 'id'> = {
            userId: user.uid,
            taskId: taskId,
            projectId: task.projectId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: parseFloat(duration.toFixed(2)),
            billable: false, // Default value
          };
          dataService.addTimeEntry(timeEntry)
            .then(() => toast({ title: 'Time logged successfully' }))
            .catch(() => toast({ title: 'Error logging time', variant: 'destructive' }));
        }
      }
      setActiveTimerId(null);
      setStartTime(null);
    } else {
      // A different timer is running
      if (activeTimerId) {
        toast({ title: "Another timer is already running.", description: "Please stop the active timer before starting a new one.", variant: 'destructive' });
        return;
      }
      // Start a new timer
      setActiveTimerId(taskId);
      setStartTime(new Date());
      const task = (data as Task[]).find(t => t.id === taskId);
      toast({ title: "Timer started!", description: `Timer for task "${task?.title}" has started.` });
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    meta: {
      users,
      activeTimerId,
      handleTimerToggle,
      updateData: (rowIndex: number, columnId: string, value: any) => {
        const task = data[rowIndex] as unknown as Task;
        onUpdateTask(task.id, { [columnId]: value, projectId: task.projectId });
         toast({
            title: 'Task Updated',
            description: `Task "${task.title}" has been updated.`,
        });
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
