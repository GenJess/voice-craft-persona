
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
import { Textarea } from '@/components/ui/textarea';
import { processDocument } from '@/services/documentService';

const CreatePersona = () => {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isPublic, setIsPublic] = useState('private');
  const [personaOutput, setPersonaOutput] = useState<{status: 'idle' | 'success' | 'error', message: string}>({status: 'idle', message: ''});
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/signin');
    }
  }, [session, navigate]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setFileName(file.name);
      setIsProcessingFile(true);

      try {
        const result = await processDocument(file);
        if (result.success) {
          setResumeText(result.text);
          toast({
            title: 'Document processed successfully',
            description: 'Your resume text has been extracted and is ready to use.',
          });
        } else {
          toast({
            title: 'Document processing failed',
            description: result.error || 'Could not extract text from the document.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error processing document',
          description: 'An unexpected error occurred while processing your document.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessingFile(false);
      }
    } else {
      setResumeFile(null);
      setFileName('');
      setResumeText('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resumeText.trim()) {
      toast({ 
        title: 'Resume Required', 
        description: 'Please upload a resume file or paste resume text.', 
        variant: 'destructive'
      });
      return;
    }
    if (!elevenLabsApiKey.trim()) {
      toast({ 
        title: 'API Key Required', 
        description: 'Please provide your ElevenLabs API key.', 
        variant: 'destructive'
      });
      return;
    }
    if (!user) {
      toast({ 
        title: 'Authentication Error', 
        description: 'Please sign in to create a persona.', 
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    setPersonaOutput({ status: 'idle', message: '' });

    try {
      // Get user profile for first/last name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (!profile?.first_name || !profile?.last_name) {
        throw new Error('User profile incomplete. Please ensure your first and last name are set.');
      }

      // Create ElevenLabs agent
      const { data: agentData, error: agentError } = await supabase.functions.invoke('create-agent', {
        body: {
          resume_text: resumeText,
          first_name: profile.first_name,
          last_name: profile.last_name,
          elevenlabs_api_key: elevenLabsApiKey,
        },
      });

      if (agentError) throw agentError;
      
      // Store persona in database
      const { error: insertError } = await supabase
        .from('personas')
        .insert({
          user_id: user.id,
          is_public: isPublic === 'public',
          elevenlabs_api_key: elevenLabsApiKey,
          agent_id: agentData.agent_id,
          conversation_link: agentData.conversation_link,
        });
      
      if (insertError) {
        throw insertError;
      }

      setPersonaOutput({ 
        status: 'success', 
        message: 'Your persona has been created successfully! You can now view it in your account page.' 
      });
      toast({ title: 'Success!', description: 'Persona created successfully.' });
      setTimeout(() => navigate('/account'), 3000);

    } catch (error: any) {
      console.error("Error creating persona:", error);
      setPersonaOutput({ 
        status: 'error', 
        message: `An error occurred: ${error.message}` 
      });
      toast({ 
        title: 'Error Creating Persona', 
        description: error.message, 
        variant: 'destructive' 
      });
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
          <CardDescription>Upload your resume or paste the text to generate your interactive professional persona.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="resume">Upload Your Resume (PDF, DOCX, TXT)</Label>
              <Input 
                id="resume" 
                type="file" 
                onChange={handleFileChange} 
                className="file:text-primary file:font-semibold cursor-pointer" 
                accept=".pdf,.docx,.txt,.doc" 
                disabled={isProcessingFile}
              />
              {isProcessingFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing document...</span>
                </div>
              )}
              {fileName && !isProcessingFile && (
                <p className="text-sm text-muted-foreground mt-1">File: {fileName}</p>
              )}
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="resume-text">Resume Text (Auto-filled from upload or paste manually)</Label>
              <Textarea
                id="resume-text"
                placeholder="Paste your resume text here or upload a file above..."
                className="min-h-[200px]"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                required
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="elevenlabs-api-key">ElevenLabs API Key</Label>
              <Input 
                id="elevenlabs-api-key" 
                type="password" 
                placeholder="Your ElevenLabs API Key" 
                required 
                value={elevenLabsApiKey} 
                onChange={(e) => setElevenLabsApiKey(e.target.value)} 
              />
              <p className="text-xs text-muted-foreground">
                Needed to create your AI voice agent. Find it <a href="https://elevenlabs.io/subscription" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">here</a>.
              </p>
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

          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button type="submit" disabled={isLoading || isProcessingFile} size="lg" className="font-semibold">
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
