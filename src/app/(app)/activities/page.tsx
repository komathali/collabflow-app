
'use client';

import ActivityFeed from '@/components/dashboard/activity-feed';
import { History } from 'lucide-react';

export default function ActivitiesPage() {
  return (
    <div className="flex flex-col gap-8">
       <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <History className="w-8 h-8" />
                All Activities
            </h1>
            <p className="text-muted-foreground">A complete log of all activities across your projects.</p>
        </div>
      <ActivityFeed />
    </div>
  );
}
