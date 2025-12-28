'use client';

import { useState, useRef, MouseEvent, ChangeEvent, FormEvent, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { UploadCloud, MessageSquare, X } from 'lucide-react';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Textarea } from '../ui/textarea';
import { useDataService } from '@/hooks/useDataService';
import { ProofingComment, User } from '@/lib/types';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface ProofingToolProps {
  projectId: string;
  documentId: string; // This would be dynamic in a real app
}

export default function ProofingTool({ projectId, documentId }: ProofingToolProps) {
  const [imageSrc, setImageSrc] = useState<string | null>("https://picsum.photos/seed/proofing/1200/800");
  const [comments, setComments] = useState<ProofingComment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activePopover, setActivePopover] = useState<string | 'new' | null>(null);
  const [newCommentCoords, setNewCommentCoords] = useState<{ x: number, y: number } | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const dataService = useDataService();
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = dataService.onProofingComments(documentId, setComments);
    dataService.getUsers().then(setUsers);
    return () => unsubscribe();
  }, [documentId, dataService]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setComments([]); // Reset comments for new image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    if ((event.target as HTMLElement).closest('[data-comment-pin]')) {
        return;
    }

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    setNewCommentCoords({ x, y });
    setActivePopover('new');
    setNewCommentText('');
  };

  const handleCommentSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (!newCommentText.trim() || !newCommentCoords || !user) return;
      
      const newComment: Omit<ProofingComment, 'id' | 'createdAt' | 'userId' | 'userName' | 'userAvatar'> = {
        documentId,
        x: newCommentCoords.x,
        y: newCommentCoords.y,
        content: newCommentText,
      };

      try {
        await dataService.addProofingComment(documentId, newComment);
        toast({ title: 'Comment Added' });
      } catch (error) {
        toast({ title: 'Error adding comment', variant: 'destructive' });
      }

      setActivePopover(null);
      setNewCommentCoords(null);
      setNewCommentText('');
  }
  
  const getCommentUser = (userId: string) => users.find(u => u.id === userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Online Proofing</CardTitle>
        <CardDescription>Upload an image to start annotating and reviewing.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            {!imageSrc ? (
                 <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed">
                    <UploadCloud className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 text-muted-foreground">Drag & drop an image or</p>
                    <Button asChild>
                        <label htmlFor="image-upload">
                        Browse Files
                        <Input id="image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*,.pdf" />
                        </label>
                    </Button>
                </div>
            ) : (
                <div
                    ref={imageContainerRef}
                    className="relative w-full aspect-video overflow-hidden rounded-lg border"
                    onClick={handleCanvasClick}
                >
                    <Image src={imageSrc} alt="Proofing document" layout="fill" objectFit="contain" />
                    
                    {comments.map((comment, index) => (
                        <Popover key={comment.id} open={activePopover === comment.id} onOpenChange={(isOpen) => setActivePopover(isOpen ? comment.id : null)}>
                            <PopoverTrigger asChild>
                                <button
                                    data-comment-pin
                                    className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg transition-transform hover:scale-110"
                                    style={{ left: `${comment.x}%`, top: `${comment.y}%` }}
                                >
                                    {index + 1}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-80">
                                <div className="flex items-start gap-3">
                                     <Avatar className="w-8 h-8">
                                        <AvatarImage src={getCommentUser(comment.userId)?.avatarUrl} />
                                        <AvatarFallback>{getCommentUser(comment.userId)?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold">{getCommentUser(comment.userId)?.name}</p>
                                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ))}
                    
                    {newCommentCoords && (
                        <Popover open={activePopover === 'new'} onOpenChange={(isOpen) => !isOpen && setActivePopover(null)}>
                            <PopoverTrigger asChild>
                               <div
                                    className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg animate-pulse"
                                    style={{ left: `${newCommentCoords.x}%`, top: `${newCommentCoords.y}%` }}
                                >
                                    {comments.length + 1}
                                </div>
                            </PopoverTrigger>
                             <PopoverContent align="start" className="w-80" onOpenAutoFocus={(e) => e.preventDefault()}>
                                <form onSubmit={handleCommentSubmit} className="space-y-4">
                                     <Textarea
                                        placeholder="Add your comment..."
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        className="h-24"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setActivePopover(null)}>Cancel</Button>
                                        <Button type="submit" size="sm" disabled={!newCommentText.trim()}>Save</Button>
                                    </div>
                                </form>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            )}
        </div>
        <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Comments</h3>
            <ScrollArea className="h-[calc(100vh-300px)]">
                 <div className="space-y-4 pr-4">
                    {comments.length > 0 ? comments.map((comment, index) => (
                        <div key={comment.id} 
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted",
                                activePopover === comment.id && "bg-muted"
                            )}
                            onClick={() => setActivePopover(activePopover === comment.id ? null : comment.id)}
                        >
                            <div className="w-8 h-8 bg-primary rounded-full text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold">{getCommentUser(comment.userId)?.name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">{comment.content}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-sm text-muted-foreground py-10">
                            No comments yet. Click on the image to add feedback.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
