'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, User } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { priorities } from '../tasks/data';
import { PlayCircle, StopCircle, Timer } from 'lucide-react';
import { Button } from '../ui/button';

type TaskCardProps = {
  task: Task;
  users: User[];
  isOverlay?: boolean;
  activeTimerId?: string | null;
  onTimerToggle?: (taskId: string) => void;
};

export function TaskCard({ task, users, isOverlay, activeTimerId, onTimerToggle }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const assignee = users.find((u) => u.id === task.assigneeId);
  const priority = priorities.find((p) => p.value === task.priority);
  const isTimerActive = activeTimerId === task.id;

  const cardContent = (
     <Card
      className={cn(
        "w-[300px] group",
        !isOverlay && "cursor-grab",
        isDragging && "opacity-50 ring-2 ring-primary",
        isOverlay && "ring-2 ring-primary shadow-lg",
        isTimerActive && "border-primary ring-2 ring-primary/50"
      )}
    >
      <CardHeader className="p-3">
        <div className="flex justify-between items-start">
            <p className="font-semibold pr-2">{task.title}</p>
            {onTimerToggle && (
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent dnd-kit drag start
                      onTimerToggle(task.id);
                    }}
                 >
                    {isTimerActive ? <StopCircle className="text-red-500" /> : <PlayCircle className="text-muted-foreground group-hover:text-foreground" />}
                </Button>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex items-center gap-2">
            {priority && (
                <Badge variant="outline" className="flex items-center gap-1">
                    {priority.icon && <priority.icon className="h-3 w-3" />}
                    {priority.label}
                </Badge>
            )}
             {isTimerActive && (
                <Badge variant="secondary" className="flex items-center gap-1 animate-pulse">
                    <Timer className="h-3 w-3" />
                    Active
                </Badge>
            )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-3 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {task.dueDate && (
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            )}
        </div>
        {assignee && (
           <Avatar className="h-6 w-6">
                <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
        )}
      </CardFooter>
    </Card>
  );

  if (isOverlay) return cardContent;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {cardContent}
    </div>
  );
}
