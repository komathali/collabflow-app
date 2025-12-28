'use client';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { Task, TaskStatus, User } from '@/lib/types';
import { statuses } from '../tasks/data';
import { useMemo } from 'react';
import { TaskCard } from './task-card';

type KanbanColumnProps = {
  column: {
    id: string;
    title: TaskStatus;
  };
  tasks: Task[];
  users: User[];
};

export function KanbanColumn({ column, tasks, users }: KanbanColumnProps) {
    const tasksIds = useMemo(() => {
        return tasks.map((task) => task.id);
    }, [tasks]);

    const { setNodeRef } = useSortable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
    });

    const statusInfo = statuses.find(s => s.value === column.title);

    return (
        <div
            ref={setNodeRef}
            className="flex w-80 flex-col rounded-lg bg-secondary/70 p-2"
        >
            <div className="mb-4 flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                    {statusInfo?.icon && <statusInfo.icon className="h-5 w-5 text-muted-foreground" />}
                    <h3 className="font-semibold">{column.title}</h3>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground">
                    {tasks.length}
                </span>
            </div>
            <div className="flex flex-grow flex-col gap-4 overflow-y-auto">
                 <SortableContext items={tasksIds}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} users={users} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
