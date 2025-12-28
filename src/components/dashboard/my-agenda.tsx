'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useDataService } from "@/hooks/useDataService";
import { useUser } from "@/firebase";
import { Task } from "@/lib/types";
import { DateFormatter } from "react-day-picker";
import { Badge } from "../ui/badge";

const formatDay: DateFormatter = (day) => {
    return <Badge variant="secondary" className="h-6 w-6 rounded-full">{day.getDate()}</Badge>;
};

export default function MyAgenda() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const dataService = useDataService();
    const { user } = useUser();

    useEffect(() => {
        if (!user) return;
        const fetchTasks = async () => {
        const allProjects = await dataService.getProjects();
        const taskPromises = allProjects.map(p => dataService.getTasksByProjectId(p.id));
        const allTasksNested = await Promise.all(taskPromises);
        const allTasks = allTasksNested.flat();
        const myTasks = allTasks.filter(t => t.assigneeId === user.uid);
        setTasks(myTasks);
        }
        fetchTasks();
    }, [user, dataService]);

    const dueDates = tasks
        .filter(task => task.dueDate)
        .map(task => new Date(task.dueDate!));

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-6 h-6" />
                    <CardTitle>My Agenda</CardTitle>
                </div>
                <CardDescription>Your personal calendar for tasks and events.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    modifiers={{
                        due: dueDates,
                    }}
                    modifiersStyles={{
                        due: {
                            color: 'hsl(var(--primary-foreground))',
                            backgroundColor: 'hsl(var(--primary))',
                        }
                    }}
                    formatters={{ formatDay }}
                    
                />
            </CardContent>
        </Card>
    )
}
