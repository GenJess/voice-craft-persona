
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Eye, EyeOff, Upload, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  first_name: string;
  last_name: string;
  elevenlabs_agent_id: string;
  elevenlabs_agent_link: string;
}

interface Persona {
  id: string;
  is_public: boolean;
  updated_at: string;
  avatar_url: string;
  conversation_link: string;
}

const Account = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibility, setVisibility] = useState('private');

  useEffect(() => {
    if (!session) {
      navigate('/signin');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, elevenlabs_agent_id, elevenlabs_agent_link')
        .eq('id', user!.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({ title: 'Error', description: 'Could not fetch your profile data.', variant: 'destructive'});
      } else {
        setProfile(profileData);
      }

      const { data: personaData, error: personaError } = await supabase
        .from('personas')
        .select('id, is_public, updated_at, avatar_url, conversation_link')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (personaError) {
        console.error('Error fetching persona:', personaError);
        toast({ title: 'Error', description: 'Could not fetch your persona data.', variant: 'destructive'});
      } else if (personaData) {
        setPersona(personaData);
        setVisibility(personaData.is_public ? 'public' : 'private');
      }

      setLoading(false);
    };

    fetchData();
  }, [session, user, navigate, toast]);

  const handleVisibilitySave = async () => {
    if (!persona) return;
    const { error } = await supabase
      .from('personas')
      .update({ is_public: visibility === 'public' })
      .eq('id', persona.id);

    if (error) {
      toast({ title: 'Error', description: 'Could not update visibility.', variant: 'destructive'});
    } else {
      toast({ title: 'Success', description: 'Visibility settings saved.'});
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-display mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and persona settings</p>
      </div>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Your account details and avatar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={persona?.avatar_url} alt="Your avatar" />
              <AvatarFallback>{profile?.first_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{profile?.first_name} {profile?.last_name}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              {profile?.elevenlabs_agent_link && (
                <Button asChild className="mt-2">
                  <a href={profile.elevenlabs_agent_link} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with me
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Your Persona
          </CardTitle>
          <CardDescription>
            {persona 
              ? "Manage your professional persona and its visibility" 
              : "You haven't created a persona yet"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!persona ? (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Create your first persona to get started
              </p>
              <Button asChild>
                <Link to="/create-persona">Create Persona</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="p-4 border border-border rounded-lg bg-background/50">
                <h3 className="font-semibold mb-2">Professional Persona</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Last updated: {new Date(persona.updated_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>Edit (Coming Soon)</Button>
                  <Button variant="outline" size="sm" disabled>Preview (Coming Soon)</Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Persona Visibility</Label>
                <RadioGroup value={visibility} onValueChange={setVisibility}>
                  <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                    <RadioGroupItem value="private" id="private" />
                    <div className="flex items-center gap-2 flex-1">
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="private" className="font-medium">Private</Label>
                        <p className="text-sm text-muted-foreground">Only you can see and share your persona</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                    <RadioGroupItem value="public" id="public" />
                    <div className="flex items-center gap-2 flex-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="public" className="font-medium">Public</Label>
                        <p className="text-sm text-muted-foreground">Anyone can discover your persona in the public directory</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
                <Button onClick={handleVisibilitySave}>Save Visibility Settings</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium">Change Password</h3>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
            <Button variant="outline" disabled>Update (Coming Soon)</Button>
          </div>
          <div className="flex justify-between items-center p-4 border border-destructive/20 rounded-lg">
            <div>
              <h3 className="font-medium text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" disabled>Delete (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
