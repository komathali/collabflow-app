import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle, BrainCircuit, GanttChartSquare, KanbanSquare, Network } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-card border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <GanttChartSquare className="h-6 w-6 text-primary" />
          <span className="sr-only">CollabFlow</span>
        </Link>
        <h1 className="ml-4 text-xl font-bold text-foreground">CollabFlow</h1>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            <Button>Go to App</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Unify Your Workflow, Amplify Your Results
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    CollabFlow is the all-in-one project management tool designed to bring your team together and streamline your projects from start to finish.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/dashboard"
                    prefetch={false}
                  >
                     <Button size="lg">Get Started</Button>
                  </Link>
                </div>
              </div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  width={600}
                  height={400}
                  alt={heroImage.description}
                  data-ai-hint={heroImage.imageHint}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              )}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything you need to succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From task management to personal dashboards, CollabFlow provides the tools for modern teams to excel.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <div className="grid gap-1">
                <KanbanSquare className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">Project Views</h3>
                <p className="text-sm text-muted-foreground">Visualize your work your way with dynamic Tables, Kanban boards, and Calendars.</p>
              </div>
              <div className="grid gap-1">
                <Network className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">Program Management</h3>
                <p className="text-sm text-muted-foreground">Oversee multiple projects, track cross-team dependencies, and manage timelines.</p>
              </div>
              <div className="grid gap-1">
                <CheckCircle className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">Personal Dashboards</h3>
                <p className="text-sm text-muted-foreground">Stay on top of your day with a personal "Me View" showing your tasks, agenda, and notes.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-card">
        <p className="text-xs text-muted-foreground">&copy; 2024 CollabFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
