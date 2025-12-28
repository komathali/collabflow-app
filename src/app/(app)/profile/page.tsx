
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useUser, useAuth } from '@/firebase';
import { useDataService } from '@/hooks/useDataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, Loader2 } from 'lucide-react';
import type { User as UserType } from '@/lib/types';

export default function ProfilePage() {
  const { user: authUser, isUserLoading } = useUser();
  const [user, setUser] = useState<UserType | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const dataService = useDataService();
  const { toast } = useToast();

  useEffect(() => {
    if (authUser) {
      dataService.getUserById(authUser.uid).then(userData => {
        if (userData) {
          setUser(userData);
          setDisplayName(userData.name);
          setAvatarPreview(userData.avatarUrl || null);
        }
      });
    }
  }, [authUser, dataService]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!authUser || !user) return;
    setIsSaving(true);

    try {
      const updates: Partial<UserType> = { name: displayName };
      
      // In a real app, you would upload the avatarFile to Firebase Storage and get the URL
      // For now, we'll just show a success message.
      if (avatarFile) {
         toast({ title: "Note", description: "Avatar upload is a demo and won't be saved." });
      }

      await dataService.updateUser(authUser.uid, updates);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isUserLoading || !user) {
      return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <UserIcon className="w-8 h-8" />
          My Profile
        </h1>
        <p className="text-muted-foreground">View and edit your personal information.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>This is how others will see you on the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarPreview || authUser?.photoURL || undefined} />
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button asChild variant="outline">
              <label htmlFor="avatar-upload">
                Change Avatar
                <Input id="avatar-upload" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/*" />
              </label>
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled />
          </div>
           <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={user.role} disabled />
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
