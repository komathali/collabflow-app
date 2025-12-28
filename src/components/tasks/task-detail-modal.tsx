
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Task, User, Comment } from '@/lib/types';
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
import { SendHorizonal } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface TaskDetailModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  task: Task;
}

export function TaskDetailModal({ isOpen, setIsOpen, task }: TaskDetailModalProps) {
    const dataService = useDataService();
    const { user } = useUser();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (!task || !isOpen) return;

        const unsubscribe = dataService.onTaskComments(task.projectId, task.id, setComments);

        return () => unsubscribe();
    }, [task, isOpen, dataService]);


    const handleCommentSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (newComment.trim() === '') return;

        dataService.addTaskComment(task.projectId, task.id, newComment);
        setNewComment('');
    };

    if (!task) return null;

    const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
    const priority = priorities.find(p => p.value === task.priority);
    const status = statuses.find(s => s.value === task.status);

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
                <div className="md:col-span-2 space-y-6 overflow-y-auto pr-4">
                    {/* Description Section */}
                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className='text-sm text-muted-foreground'>{task.description || "No description provided."}</p>
                    </div>

                     <Separator />

                    {/* Comments Section */}
                    <div>
                        <h3 className="font-semibold mb-4">Comments</h3>
                        <div className="space-y-4">
                            <ScrollArea className="h-64 pr-4">
                                <div className='space-y-4'>
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
                            </ScrollArea>
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

    