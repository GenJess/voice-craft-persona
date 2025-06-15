
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const CreatePersona = () => {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isPublic, setIsPublic] = useState('private');
  const [personaOutput, setPersonaOutput] = useState<{status: 'idle' | 'success' | 'error', message: string}>({status: 'idle', message: ''});


  useEffect(() => {
    if (!session) {
      navigate('/signin');
    }
  }, [session, navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setFileName(file.name);
    } else {
      setResumeFile(null);
      setFileName('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resumeFile || !user) {
      toast({ title: 'Error', description: 'Please upload a resume file.', variant: 'destructive'});
      return;
    }
    
    setIsLoading(true);
    setPersonaOutput({ status: 'idle', message: '' });

    try {
      const filePath = `${user.id}/${Date.now()}_${resumeFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resumeFile);

      if (uploadError) {
        throw uploadError;
      }
      
      const { error: insertError } = await supabase
        .from('personas')
        .insert({
          user_id: user.id,
          resume_path: filePath,
          is_public: isPublic === 'public',
        });
      
      if (insertError) {
        await supabase.storage.from('resumes').remove([filePath]);
        throw insertError;
      }

      setPersonaOutput({ status: 'success', message: 'Your persona has been created successfully! You can now view it in your account page.' });
      toast({ title: 'Success!', description: 'Persona created successfully.' });
      setTimeout(() => navigate('/account'), 3000);

    } catch (error: any) {
      console.error("Error creating persona:", error);
      setPersonaOutput({ status: 'error', message: `An error occurred: ${error.message}` });
      toast({ title: 'Error Creating Persona', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex justify-center items-start">
      <Card className="w-full max-w-2xl bg-card/50">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Create Your Persona</CardTitle>
          <CardDescription>Fill out the form below to generate your interactive professional persona.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="resume">Upload Your Resume (PDF, DOCX, TXT)</Label>
              <Input id="resume" type="file" onChange={handleFileChange} className="file:text-primary file:font-semibold cursor-pointer" accept=".pdf,.docx,.txt" required />
              {fileName && <p className="text-sm text-muted-foreground mt-1">File: {fileName}</p>}
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label>Persona Visibility</Label>
              <RadioGroup value={isPublic} onValueChange={setIsPublic} className="flex gap-4">
                <Label htmlFor="private" className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="private" id="private" />
                  <span>Private (Only you can see)</span>
                </Label>
                <Label htmlFor="public" className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="public" id="public" />
                  <span>Public (Discoverable by others)</span>
                </Label>
              </RadioGroup>
            </div>
            
            <div className="p-4 border-l-4 border-primary bg-primary/10 text-primary-foreground/80 rounded-r-md">
                <p className="text-sm font-semibold text-primary">Note on API Keys</p>
                <p className="text-xs text-primary/80">
                    For now, creating a persona only requires a resume. API key integration for AI generation is coming soon.
                </p>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button type="submit" disabled={isLoading} size="lg" className="font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Persona...
                </>
              ) : (
                'Create Professional Persona'
              )}
            </Button>
            <div id="persona-output" className="mt-6 p-4 border border-dashed border-border rounded-lg min-h-[100px] flex items-center justify-center bg-background/50">
              {personaOutput.status === 'idle' && (
                <div className="text-center text-muted-foreground">
                  <Sparkles className="mx-auto h-6 w-6 mb-2" />
                  <p>Your persona generation status will appear here.</p>
                </div>
              )}
              {personaOutput.status === 'success' && (
                <div className="text-center text-green-600">
                  <CheckCircle className="mx-auto h-6 w-6 mb-2" />
                  <p>{personaOutput.message}</p>
                </div>
              )}
              {personaOutput.status === 'error' && (
                <div className="text-center text-destructive">
                  <AlertCircle className="mx-auto h-6 w-6 mb-2" />
                  <p>{personaOutput.message}</p>
                </div>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreatePersona;
