'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Task, User, Comment, TimeEntry } from '@/lib/types';
import { Badge } from '../ui/badge';
import { priorities, statuses } from './data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MOCK_USERS } from '@/lib/data/mock-data';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { FormEvent, useEffect, useState } from 'react';
import { useDataService } from '@/hooks/useDataService';
import { useUser } from '@/firebase';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { SendHorizonal, Clock, PlusCircle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface TaskDetailModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  task: Task;
}

const timeLogSchema = z.object({
  duration: z.coerce.number().min(0.1, "Duration is required"),
  date: z.date(),
  notes: z.string().optional(),
  billable: z.boolean().default(false),
});

type TimeLogFormValues = z.infer<typeof timeLogSchema>;

export function TaskDetailModal({ isOpen, setIsOpen, task }: TaskDetailModalProps) {
    const dataService = useDataService();
    const { user } = useUser();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [timeLogs, setTimeLogs] = useState<TimeEntry[]>([]);
    const [showTimeLogForm, setShowTimeLogForm] = useState(false);
    const { toast } = useToast();

    const timeLogForm = useForm<TimeLogFormValues>({
        resolver: zodResolver(timeLogSchema),
        defaultValues: {
            date: new Date(),
            billable: false,
        }
    });

    useEffect(() => {
        if (!task || !isOpen) return;

        const unsubscribeComments = dataService.onTaskComments(task.projectId, task.id, setComments);
        const unsubscribeTimeLogs = dataService.onTimeEntries(task.projectId, task.id, setTimeLogs);

        return () => {
            unsubscribeComments();
            unsubscribeTimeLogs();
        }
    }, [task, isOpen, dataService]);


    const handleCommentSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (newComment.trim() === '') return;

        dataService.addTaskComment(task.projectId, task.id, newComment);
        setNewComment('');
    };

    const handleTimeLogSubmit = async (values: TimeLogFormValues) => {
        if (!user) return;
        const { date, duration, notes, billable } = values;

        // The date from the form is at midnight, let's set it to the current time to be more accurate
        const startTime = new Date(date);
        startTime.setHours(new Date().getHours() - duration);
        startTime.setMinutes(new Date().getMinutes());
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + duration);

        const timeEntry: Omit<TimeEntry, 'id'> = {
            userId: user.uid,
            taskId: task.id,
            projectId: task.projectId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: duration,
            notes: notes,
            billable: billable,
        };

        try {
            await dataService.addTimeEntry(timeEntry);
            toast({ title: 'Time logged successfully' });
            timeLogForm.reset();
            setShowTimeLogForm(false);
        } catch (error) {
            toast({ title: 'Error logging time', variant: 'destructive' });
        }
    };


    if (!task) return null;

    const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
    const priority = priorities.find(p => p.value === task.priority);
    const status = statuses.find(s => s.value === task.status);

    const totalHours = timeLogs.reduce((acc, log) => acc + log.duration, 0);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>{task.title}</DialogTitle>
                <DialogDescription>
                    Details for task #{task.id.substring(0,5)}
                </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-3 gap-6 flex-1 overflow-hidden">
                <ScrollArea className="md:col-span-2">
                    <div className="space-y-6 pr-6">
                        {/* Description Section */}
                        <div>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className='text-sm text-muted-foreground'>{task.description || "No description provided."}</p>
                        </div>

                        <Separator />
                        
                        {/* Time Tracking Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Time Logs ({totalHours.toFixed(2)} hrs)</h3>
                                <Button variant="outline" size="sm" onClick={() => setShowTimeLogForm(!showTimeLogForm)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Log
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {showTimeLogForm && (
                                    <Card className="p-4">
                                        <Form {...timeLogForm}>
                                            <form onSubmit={timeLogForm.handleSubmit(handleTimeLogSubmit)} className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={timeLogForm.control} name="duration" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Duration (hours)</FormLabel>
                                                            <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={timeLogForm.control} name="date" render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Date</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                                <FormField control={timeLogForm.control} name="notes" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Notes</FormLabel>
                                                        <FormControl><Textarea placeholder="What did you work on?" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={timeLogForm.control} name="billable" render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <FormLabel className='font-normal'>Mark as billable</FormLabel>
                                                    </FormItem>
                                                )} />
                                                <div className="flex justify-end gap-2">
                                                    <Button type="button" variant="ghost" onClick={() => setShowTimeLogForm(false)}>Cancel</Button>
                                                    <Button type="submit">Save Log</Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </Card>
                                )}
                                {timeLogs.map(log => (
                                    <div key={log.id} className="flex items-center text-sm p-2 rounded-md bg-muted/50">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span className="font-medium">{log.duration} hours</span>
                                        <Separator orientation="vertical" className="h-4 mx-2" />
                                        <span>{new Date(log.startTime).toLocaleDateString()}</span>
                                        {log.notes && <span className="text-muted-foreground truncate italic ml-2"> - "{log.notes}"</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Comments Section */}
                        <div>
                            <h3 className="font-semibold mb-4">Comments</h3>
                            <div className="space-y-4">
                                <div className='space-y-4 max-h-64 overflow-y-auto pr-2'>
                                    {comments.map(comment => (
                                        <div key={comment.id} className="flex items-start gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={comment.userAvatar} />
                                                <AvatarFallback>{comment.userName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="rounded-lg p-3 bg-muted w-full">
                                                <div className='flex justify-between items-center mb-1'>
                                                    <p className="text-sm font-semibold">{comment.userName}</p>
                                                     <p className="text-xs text-muted-foreground">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <p className='text-sm'>{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                                    <Textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="min-h-[60px]"
                                    />
                                    <Button type="submit" size="icon" disabled={!newComment.trim()}>
                                        <SendHorizonal className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Right Sidebar with Details */}
                <div className="space-y-6 bg-secondary/50 p-4 rounded-lg overflow-y-auto">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Details</h3>
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <span className="text-muted-foreground">Status</span>
                            {status && <Badge variant="outline" className="w-fit">
                                <status.icon className="mr-2 h-4 w-4" />
                                {status.label}
                            </Badge>}

                            <span className="text-muted-foreground">Priority</span>
                            {priority && <Badge variant="outline" className="w-fit">
                                <priority.icon className="mr-2 h-4 w-4" />
                                {priority.label}
                            </Badge>}

                            <span className="text-muted-foreground">Assignee</span>
                            {assignee ? (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                                        <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {assignee.name}
                                </div>
                            ) : (
                                <span>Unassigned</span>
                            )}

                             <span className="text-muted-foreground">Start Date</span>
                            <span>{task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Not set'}</span>


                            <span className="text-muted-foreground">Due Date</span>
                            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
                        </div>
                    </div>
                    <Separator />
                     <div>
                        <h3 className="font-semibold mb-2">Tags</h3>
                         <div className="flex flex-wrap gap-2">
                            {task.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
        </Dialog>
    );
}
