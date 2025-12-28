'use client';

import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import type { Calendar as CalendarApi } from '@fullcalendar/core';
import { useDataService } from '@/hooks/useDataService';
import { MOCK_TASKS } from '@/lib/data/mock-data';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const dataService = useDataService();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);
  const [viewTitle, setViewTitle] = useState('');

  useEffect(() => {
    const getTasks = async () => {
      // In a real app, you'd fetch tasks from multiple projects
      setTasks(MOCK_TASKS);
      setLoading(false);
    };

    getTasks();
  }, [dataService]);

  useEffect(() => {
    if (calendarRef.current) {
        const api = calendarRef.current.getApi();
        setViewTitle(api.view.title);
    }
  }, []);

  const calendarEvents = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.startDate || task.createdAt,
    end: task.dueDate,
    allDay: !task.startDate?.includes('T'), // Basic check if it's a date vs datetime
    extendedProps: {
      ...task,
    },
    backgroundColor: getPriorityColor(task.priority),
    borderColor: getPriorityColor(task.priority),
  }));

  function getPriorityColor(priority: Task['priority']) {
    switch (priority) {
      case 'Urgent':
      case 'High':
        return 'hsl(var(--destructive))';
      case 'Medium':
        return 'hsl(var(--primary))';
      case 'Low':
        return 'hsl(var(--muted-foreground))';
      default:
        return 'hsl(var(--secondary-foreground))';
    }
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    const task = tasks.find(t => t.id === clickInfo.event.id);
    if (task) {
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };

  const handleDatesSet = (dateInfo: { view: { title: string } }) => {
    setViewTitle(dateInfo.view.title);
  };

  const changeView = (viewName: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    calendarRef.current?.getApi().changeView(viewName);
  };
  
  const calendarApi = () => calendarRef.current?.getApi();

  if (loading) {
    return <div>Loading Calendar...</div>;
  }

  return (
    <div className="flex flex-col gap-8 h-[calc(100vh-120px)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <CalendarDays className="w-8 h-8" />
                Calendar
            </h1>
            <p className="text-muted-foreground">Manage your schedule across all projects.</p>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => calendarApi()?.prev()}>Prev</Button>
                <h2 className="text-lg font-semibold text-center min-w-[150px]">{viewTitle}</h2>
                <Button variant="outline" size="sm" onClick={() => calendarApi()?.next()}>Next</Button>
            </div>
             <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => changeView('dayGridMonth')}>Month</Button>
              <Button variant="outline" size="sm" onClick={() => changeView('timeGridWeek')}>Week</Button>
              <Button variant="outline" size="sm" onClick={() => changeView('timeGridDay')}>Day</Button>
            </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
          <div className={cn("rounded-lg border overflow-hidden h-full w-full", "[&_.fc]:h-full")}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={false}
              events={calendarEvents}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              height="100%"
              editable={true}
              droppable={true}
              dayMaxEvents={true}
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
            />
          </div>
      </div>
      {selectedTask && (
        <TaskDetailModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} task={selectedTask} />
      )}
    </div>
  );
}
