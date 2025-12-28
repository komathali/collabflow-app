
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { History, FileText, CheckCircle, Folder } from 'lucide-react';
import { useDataService } from '@/hooks/useDataService';
import { ActivityLog, Project } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import Link from 'next/link';

function ActivityIcon({ resourceType, action }: { resourceType: string, action: string }) {
    if (resourceType === 'project') {
        return <Folder className="h-4 w-4 text-primary" />;
    }
    if (resourceType === 'task') {
        if (action === 'update' && action.includes('Done')) {
             return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
        return <FileText className="h-4 w-4 text-secondary-foreground" />;
    }
    return <History className="h-4 w-4" />;
}

function formatActivity(activity: ActivityLog) {
    const userName = <span className="font-semibold">{activity.userName}</span>;
    const details = typeof activity.details === 'string' ? JSON.parse(activity.details) : activity.details;
    
    switch (activity.resourceType) {
        case 'project':
            if (activity.action === 'create') {
                return <>{userName} created the project <Badge variant="secondary">{details.projectName}</Badge></>;
            }
            break;
        case 'task':
            if (activity.action === 'update' && details.oldStatus) {
                const taskLink = <Link href={`/projects/${activity.projectId}`} className="font-semibold hover:underline">{details.taskTitle}</Link>
                return <>{userName} moved {taskLink} from <Badge variant="outline">{details.oldStatus}</Badge> to <Badge variant="outline">{details.newStatus}</Badge> in {details.projectName}</>;
            }
            break;
        default:
            return <>{userName} performed action: {activity.action}</>;
    }
    return null;
}


export default function ActivityFeed() {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const dataService = useDataService();

    useEffect(() => {
        dataService.getProjects().then(setProjects);
    }, [dataService]);

    useEffect(() => {
        if (projects.length === 0) return;
        
        const projectIds = projects.map(p => p.id);
        const unsubscribe = dataService.onActivityLogs(projectIds, setActivities);

        return () => unsubscribe();

    }, [projects, dataService]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <History className="w-6 h-6" />
                    <CardTitle>Activity Feed</CardTitle>
                </div>
                <CardDescription>A stream of recent activities across your projects.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map(activity => (
                        <div key={activity.id} className="flex items-start gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={activity.userAvatar} />
                                <AvatarFallback>{activity.userName?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-sm">
                                <p>{formatActivity(activity)}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {activities.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
