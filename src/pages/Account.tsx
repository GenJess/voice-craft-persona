
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Eye, EyeOff, Upload } from 'lucide-react';

const Account = () => {
  const [visibility, setVisibility] = useState('private');
  const [hasPersona, setHasPersona] = useState(false); // This will be replaced with actual data

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-display mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and persona settings</p>
      </div>

      {/* Profile Information */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john@example.com" />
            </div>
          </div>
          <Button>Update Profile</Button>
        </CardContent>
      </Card>

      {/* Persona Management */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Your Persona
          </CardTitle>
          <CardDescription>
            {hasPersona 
              ? "Manage your professional persona and its visibility" 
              : "You haven't created a persona yet"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasPersona ? (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Create your first persona to get started
              </p>
              <Button asChild>
                <a href="/create-persona">Create Persona</a>
              </Button>
            </div>
          ) : (
            <>
              <div className="p-4 border border-border rounded-lg bg-background/50">
                <h3 className="font-semibold mb-2">Professional Persona</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Last updated: 2 days ago
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Preview</Button>
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
                <Button>Save Visibility Settings</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
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
            <Button variant="outline">Update</Button>
          </div>
          <div className="flex justify-between items-center p-4 border border-destructive/20 rounded-lg">
            <div>
              <h3 className="font-medium text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
