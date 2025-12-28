'use client';

import { useDataService } from '@/hooks/useDataService';
import { WikiPage } from '@/lib/types';
import { Book, FilePlus, Loader2, Trash2 } from 'lucide-react';
import React, { useEffect, useState, Suspense } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const RichTextEditor = React.lazy(() => import('./rich-text-editor').then(module => ({ default: module.RichTextEditor })));

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
);

export default function ProjectNotes({ projectId }: { projectId: string }) {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const dataService = useDataService();
  const { toast } = useToast();

  useEffect(() => {
    if (!projectId) return;

    setIsLoading(true);
    const unsubscribe = dataService.onWikiPages(projectId, (loadedPages) => {
      setPages(loadedPages);
      if (!selectedPage && loadedPages.length > 0) {
        setSelectedPage(loadedPages[0]);
      } else if (selectedPage) {
        // If the current page was deleted, select the first one
        const stillExists = loadedPages.find(p => p.id === selectedPage.id);
        setSelectedPage(stillExists || loadedPages[0] || null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [projectId, dataService, selectedPage]);

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return;
    setIsCreating(true);
    try {
      const newPage = await dataService.createWikiPage(projectId, newPageTitle);
      setSelectedPage(newPage);
      setNewPageTitle('');
    } catch (error) {
      console.error('Failed to create page:', error);
      toast({
        title: 'Error creating page',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      await dataService.deleteWikiPage(projectId, pageId);
      toast({ title: 'Page deleted' });
    } catch (error) {
      console.error('Failed to delete page:', error);
      toast({
        title: 'Error deleting page',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-250px)] border rounded-lg overflow-hidden">
      <aside className="w-64 border-r p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Notes Pages</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2">
            {pages.map((page) => (
              <div key={page.id} className="group flex items-center">
                <Button
                  variant={selectedPage?.id === page.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedPage(page)}
                >
                  <Book className="mr-2 h-4 w-4" />
                  <span className="truncate">{page.title}</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the page "{page.title}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeletePage(page.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="New page title..."
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePage()}
          />
          <Button size="icon" onClick={handleCreatePage} disabled={isCreating || !newPageTitle.trim()}>
            {isCreating ? <Loader2 className="animate-spin h-4 w-4" /> : <FilePlus className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        {selectedPage ? (
           <Suspense fallback={<LoadingSpinner />}>
                <RichTextEditor page={selectedPage} key={selectedPage.id} />
           </Suspense>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Book className="w-16 h-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Page Selected</h3>
            <p className="text-sm text-muted-foreground">Select a page from the list or create a new one.</p>
          </div>
        )}
      </main>
    </div>
  );
}
