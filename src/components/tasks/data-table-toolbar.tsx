'use client';

import { X } from 'lucide-react';
import { Table } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';

import { priorities, statuses } from './data';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { useState } from 'react';
import { Label } from '../ui/label';
import { toast } from '@/hooks/use-toast';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const handleAddColumn = () => {
    if (newColumnName) {
      // In a real application, you would persist this change.
      // For this mock, we are not actually adding a column to the table data.
      toast({
        title: 'Column Added (Simulated)',
        description: `The column "${newColumnName}" would be added to your project schema.`,
      });
      setNewColumnName('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn('priority') && (
          <DataTableFacetedFilter
            column={table.getColumn('priority')}
            title="Priority"
            options={priorities}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setIsModalOpen(true)}
        >
            Add Column
        </Button>
        <DataTableViewOptions table={table} />
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Column</DialogTitle>
            <DialogDescription>
              Enter a name for the new column. This will be added to all tasks in this project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="column-name" className="text-right">
                Name
              </Label>
              <Input
                id="column-name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Budget"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddColumn}>Add Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
