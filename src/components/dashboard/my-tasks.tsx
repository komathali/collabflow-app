import { taskService } from "@/lib/data/service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, CheckCircle2, MoreHorizontal, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/lib/types";

const priorityIcons: Record<TaskPriority, React.ReactNode> = {
  Urgent: <AlertCircle className="text-red-500" />,
  High: <AlertCircle className="text-orange-500" />,
  Medium: <Clock className="text-yellow-500" />,
  Low: <Clock className="text-blue-500" />,
};

const priorityColors: Record<TaskPriority, string> = {
    Urgent: "bg-red-500/10 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-500/20",
    High: "bg-orange-500/10 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-500/20",
    Medium: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-500/20",
    Low: "bg-blue-500/10 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-500/20"
};

export default async function MyTasks() {
  // Assuming 'user-1' is the current logged-in user for this mock.
  const tasks = await taskService.getTasksByAssignee('user-1');
  const openTasks = tasks.filter(t => t.status !== 'Done');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <ListTodo className="w-6 h-6" />
            <CardTitle>My Open Tasks</CardTitle>
        </div>
        <CardDescription>Tasks assigned to you that are not yet completed.</CardDescription>
      </CardHeader>
      <CardContent>
        {openTasks.length > 0 ? (
          <ul className="space-y-4">
            {openTasks.map(task => (
              <li key={task.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-4">
                   <div className={cn("p-1.5 rounded-full", priorityColors[task.priority])}>
                        {priorityIcons[task.priority]}
                   </div>
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <Badge variant="outline">{task.status}</Badge>
                       <span>Due: {new Date(task.dueDate!).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <MoreHorizontal className="text-muted-foreground cursor-pointer" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
             <CheckCircle2 className="w-12 h-12 text-green-500" />
            <h3 className="mt-4 text-lg font-semibold">All Clear!</h3>
            <p className="mt-2 text-sm text-muted-foreground">You have no open tasks.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
