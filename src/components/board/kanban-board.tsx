'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { Task, TaskStatus, User } from '@/lib/types';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';
import { statuses } from '../tasks/data';
import { createPortal } from 'react-dom';

type KanbanBoardProps = {
  tasks: Task[];
  users: User[];
  onUpdateTask: (taskId: string, values: Partial<Task>) => void;
};

type TaskContainer = {
  id: string;
  title: TaskStatus;
  tasks: Task[];
};

export function KanbanBoard({ tasks, users, onUpdateTask }: KanbanBoardProps) {
  const [taskContainers, setTaskContainers] = useState<TaskContainer[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  useEffect(() => {
    const initialContainers = statuses.map(status => ({
        id: status.value,
        title: status.value as TaskStatus,
        tasks: tasks.filter(task => task.status === status.value)
    }));
    setTaskContainers(initialContainers);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const tasksId = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTaskContainers((containers) => {
        const activeIndex = containers.findIndex((c) => c.tasks.some(t => t.id === activeId));
        const overIndex = containers.findIndex((c) => c.tasks.some(t => t.id === overId));
        const activeContainer = containers[activeIndex];
        const overContainer = containers[overIndex];
        
        if (!activeContainer || !overContainer || activeIndex !== overIndex) return containers;

        const activeTaskIndex = activeContainer.tasks.findIndex(t => t.id === activeId);
        const overTaskIndex = overContainer.tasks.findIndex(t => t.id === overId);
        
        const newContainers = [...containers];
        newContainers[activeIndex].tasks = arrayMove(newContainers[activeIndex].tasks, activeTaskIndex, overTaskIndex);
        return newContainers;
      });
    }

    const isOverAColumn = over.data.current?.type === 'Column';

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
       setTaskContainers((containers) => {
            const activeContainerIndex = containers.findIndex((c) => c.tasks.some(t => t.id === activeId));
            const activeContainer = containers[activeContainerIndex];
            if (!activeContainer) return containers;

            const overContainerIndex = containers.findIndex((c) => c.id === overId);
            const overContainer = containers[overContainerIndex];
            if (!overContainer) return containers;

            if (activeContainerIndex === overContainerIndex) return containers;

            const newContainers = [...containers];
            const [movedTask] = newContainers[activeContainerIndex].tasks.splice(
                newContainers[activeContainerIndex].tasks.findIndex(t => t.id === activeId),
                1
            );
            newContainers[overContainerIndex].tasks.push(movedTask);
            return newContainers;
       });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.data.current?.type === 'Column' ? over.id as TaskStatus : 
                    taskContainers.find(c => c.tasks.some(t => t.id === over.id))?.title;

    if (newStatus) {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            onUpdateTask(taskId, { status: newStatus });
        }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
        <div className="flex gap-4 overflow-x-auto">
            <SortableContext items={tasksId}>
            {taskContainers.map((container) => (
                <KanbanColumn key={container.id} column={container} tasks={container.tasks} users={users} />
            ))}
            </SortableContext>
        </div>
        {typeof document !== 'undefined' && createPortal(
            <div className="pointer-events-none">
              {activeTask && (
                  <TaskCard task={activeTask} users={users} isOverlay />
              )}
            </div>,
            document.body
        )}
    </DndContext>
  );
}
