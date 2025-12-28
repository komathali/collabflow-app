'use client';
import { useUser } from '@/firebase';
import { useDataService } from '@/hooks/useDataService';
import { ChatMessage as ChatMessageType, User } from '@/lib/types';
import { SendHorizonal, User as UserIcon } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

export default function ProjectChat({ projectId }: { projectId: string }) {
  const dataService = useDataService();
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUsers() {
      const fetchedUsers = await dataService.getUsers();
      setUsers(fetchedUsers);
    }
    fetchUsers();
  }, [dataService]);

  useEffect(() => {
    if (!projectId) return;
    const unsubscribe = dataService.onChatMessages(projectId, setMessages);
    return () => unsubscribe();
  }, [projectId, dataService]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A slight delay to allow the DOM to update
        setTimeout(() => {
             if (scrollAreaRef.current) {
                scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
             }
        }, 100);
    }
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    dataService.sendChatMessage(projectId, newMessage);
    setNewMessage('');
  };
  
  const getUserById = (id: string) => users.find(u => u.id === id);

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
            {messages.map((message, index) => {
                const sender = getUserById(message.senderId);
                const isCurrentUser = message.senderId === user?.uid;
                return (
                    <div key={index} className={cn("flex items-start gap-3", isCurrentUser && "justify-end")}>
                        {!isCurrentUser && (
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={sender?.avatarUrl} />
                                <AvatarFallback>
                                    {sender?.name ? sender.name.charAt(0) : <UserIcon />}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn("rounded-lg p-3 max-w-xs lg:max-w-md", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                            {!isCurrentUser && <p className="text-sm font-semibold mb-1">{sender?.name || 'Unknown User'}</p>}
                            <p>{message.content}</p>
                            <p className="text-xs text-right mt-1 opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                         {isCurrentUser && (
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={sender?.avatarUrl} />
                                <AvatarFallback>
                                    {sender?.name ? sender.name.charAt(0) : <UserIcon />}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                );
            })}
            </div>
        </ScrollArea>
        <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
            />
            <Button type="submit" size="icon">
                <SendHorizonal className="w-4 h-4" />
            </Button>
            </form>
        </div>
    </div>
  );
}
