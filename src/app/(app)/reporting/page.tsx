'use client';
import { BarChartHorizontal, Calendar, Users } from "lucide-react";
import { WorkloadChart } from "@/components/reporting/workload-chart";
import { TimeSheetTable } from "@/components/reporting/timesheet-table";
import { BurndownChart } from "@/components/reporting/burndown-chart";
import { MOCK_TASKS, MOCK_USERS } from "@/lib/data/mock-data";
import { TimeEntry } from "@/lib/types";

export default function ReportingPage() {

    // Mock time entries for demonstration
    const mockTimeEntries: TimeEntry[] = [
        { id: 'te1', userId: 'user-1', taskId: 'task-1', projectId: 'proj-1', startTime: '2023-05-01T09:00:00Z', endTime: '2023-05-01T11:00:00Z', duration: 2, billable: true, notes: 'Designed landing page mockups' },
        { id: 'te2', userId: 'user-2', taskId: 'task-2', projectId: 'proj-1', startTime: '2023-05-01T10:00:00Z', endTime: '2023-05-01T14:00:00Z', duration: 4, billable: true, notes: 'Backend auth setup' },
        { id: 'te3', userId: 'user-1', taskId: 'task-4', projectId: 'proj-2', startTime: '2023-05-02T13:00:00Z', endTime: '2023-05-02T15:30:00Z', duration: 2.5, billable: false, notes: 'Initial draft of API docs' },
        { id: 'te4', userId: 'user-3', taskId: 'task-3', projectId: 'proj-1', startTime: '2023-04-28T09:00:00Z', endTime: '2023-04-28T17:00:00Z', duration: 8, billable: true, notes: 'CI/CD pipeline implementation' },
        { id: 'te5', userId: 'user-1', taskId: 'task-1', projectId: 'proj-1', startTime: '2023-05-02T09:00:00Z', endTime: '2023-05-02T12:00:00Z', duration: 3, billable: true, notes: 'Refined designs based on feedback' },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <BarChartHorizontal className="w-8 h-8" />
                    Reporting & Analytics
                </h1>
                <p className="text-muted-foreground">Visualize your team's performance and project progress.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <WorkloadChart tasks={MOCK_TASKS} users={MOCK_USERS} />
                <TimeSheetTable timeEntries={mockTimeEntries} users={MOCK_USERS} />
            </div>
            <div>
                <BurndownChart tasks={MOCK_TASKS} />
            </div>
        </div>
    )
}

    