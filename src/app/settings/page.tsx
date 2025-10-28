'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { Header } from '@/components/header';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import {
  updatePassword,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
} from 'firebase/auth';

export default function SettingsPage() {
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');
  const [storyTone, setStoryTone] = useState('Casual');
  const [adStyle, setAdStyle] = useState('Minimalist');
  const [contactMessage, setContactMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const isEmailProvider = user?.providerData.some((p) => p.providerId === 'password');
  const isOAuthUser = user?.providerData.some(
    (p) => p.providerId !== 'password' && p.providerId !== 'firebase'
  );

  const handleChangePassword = async () => {
    if (!user) return;

    if (!isEmailProvider) {
      toast({
        title: 'Unavailable for Google Sign-In',
        description:
          'Since you signed in using Google, please update your password through your Google Account settings.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentPassword || !newPassword || !reNewPassword) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== reNewPassword) {
      toast({
        title: 'Mismatch',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (!/^[A-Za-z0-9]{8,15}$/.test(newPassword)) {
      toast({
        title: 'Weak Password',
        description: 'Password must be 8–15 characters and alphanumeric.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Reauthenticate before updating
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      toast({
        title: 'Password Updated ✅',
        description: 'Your password has been successfully changed.',
      });

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setReNewPassword('');
    } catch (err: any) {
      console.error('Password change error:', err);
      let message = 'Failed to update password. Please try again.';
      if (err.code === 'auth/wrong-password') message = 'The current password is incorrect.';
      if (err.code === 'auth/requires-recent-login')
        message = 'Please sign out and sign back in before changing your password.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = () => {
    if (!contactMessage.trim()) {
      toast({
        title: 'Validation',
        description: 'Please enter a message before sending.',
      });
      return;
    }
    toast({
      title: 'Message Sent 📩',
      description: 'We received your message and will get back to you soon.',
    });
    setContactMessage('');
  };

  const isPasswordChangeDisabled = loading || !user || !isEmailProvider;

  if (!isAuthReady) {
    return (
      <div className="w-full px-6 md:px-12 flex flex-col gap-10">
        <h1 className="text-4xl font-extrabold text-foreground mb-6">Settings</h1>
        <div className="flex justify-center items-center h-40">
          <p className="text-xl text-muted-foreground">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <div className="w-full px-6 md:px-12 flex flex-col gap-10">
        <h1 className="text-4xl font-extrabold text-foreground mb-6">Settings</h1>

        {/* CHANGE PASSWORD */}
        <Card className="w-full shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="text-xl">Change Password</CardTitle>
            {!user ? (
              <CardDescription className="text-red-500">
                Please sign in to access security settings.
              </CardDescription>
            ) : isOAuthUser ? (
              <CardDescription className="text-yellow-600 dark:text-yellow-400">
                You signed in using a social account (e.g., Google). Please change your password
                directly in your Google Account.
              </CardDescription>
            ) : (
              <CardDescription>
                Enter your current password, then choose a new one.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-4 w-full">
            {user && !isOAuthUser && (
              <>
                <Input
                  value={currentPassword}
                  type="password"
                  placeholder="Current Password"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                />
                <Input
                  value={newPassword}
                  type="password"
                  placeholder="New Password (8–15 chars)"
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <Input
                  value={reNewPassword}
                  type="password"
                  placeholder="Re-enter New Password"
                  onChange={(e) => setReNewPassword(e.target.value)}
                  disabled={loading}
                />
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleChangePassword}
              disabled={isPasswordChangeDisabled}
              className="ml-auto"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </CardFooter>
        </Card>

        {/* PREFERENCES */}
        <Card className="w-full shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="text-xl">Preferences</CardTitle>
            <CardDescription>
              Customize your AI generation preferences and theme.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 w-full">
            <div>
              <label className="block mb-1 font-medium">Default Story Tone</label>
              <select
                value={storyTone}
                onChange={(e) => setStoryTone(e.target.value)}
                className="w-full rounded border border-border p-2 focus:outline-none focus:ring focus:ring-primary bg-card"
              >
                <option value="Casual">Casual</option>
                <option value="Formal">Formal</option>
                <option value="Playful">Playful</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Default Ad Style</label>
              <select
                value={adStyle}
                onChange={(e) => setAdStyle(e.target.value)}
                className="w-full rounded border border-border p-2 focus:outline-none focus:ring focus:ring-primary bg-card"
              >
                <option value="Minimalist">Minimalist</option>
                <option value="Colorful">Colorful</option>
                <option value="Trendy">Trendy</option>
              </select>
            </div>

            {/* THEME SWITCHER */}
            <div>
            <label className="">Interface Theme</label>
            <div className="">
              <ThemeSwitcher />
            </div>
          </div>

          </CardContent>
        </Card>

        {/* CONTACT US */}
        <Card className="w-full shadow-lg border border-border mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Contact Us</CardTitle>
            <CardDescription>Send us a message below.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 w-full">
            <Textarea
              placeholder="Your message..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={6}
              className="w-full"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleContactSubmit} className="ml-auto">
              Send Message
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
