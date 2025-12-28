
'use client';
import ActivityFeed from "@/components/dashboard/activity-feed";
import MyAgenda from "@/components/dashboard/my-agenda";
import MyTasks from "@/components/dashboard/my-tasks";
import StickyNotes from "@/components/dashboard/sticky-notes";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/firebase";

export default function DashboardPage() {
  const { user } = useUser();

  const displayName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Welcome back, {displayName}!
        </h1>
        <p className="text-muted-foreground">Here's your personal dashboard for today.</p>
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <MyTasks />
          <ActivityFeed />
        </div>
        <div className="grid gap-6">
          <MyAgenda />
          <StickyNotes />
        </div>
      </div>
    </div>
  );
}
