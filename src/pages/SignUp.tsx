import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { processDocument } from '@/services/documentService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState('public');
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
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
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resumeText.trim()) {
      toast({
        title: 'Resume Required',
        description: 'Please paste your resume or upload a document to create a persona.',
        variant: 'destructive',
      });
      return;
    }
    if (!elevenLabsApiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please provide your ElevenLabs API key.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (authError) {
      setIsLoading(false);
      toast({
        title: 'Error signing up',
        description: authError.message,
        variant: 'destructive',
      });
      return;
    }
    
    const user = authData.user;
    if (!user) {
        setIsLoading(false);
        toast({
          title: 'Success!',
          description: 'Please check your email to verify your account. Once verified, your persona will be created.',
        });
        navigate('/');
        return;
    }
    
    // 3. Create ElevenLabs agent via Edge Function
    try {
      const { data: agentData, error: agentError } = await supabase.functions.invoke('create-agent', {
        body: {
          resume_text: resumeText,
          first_name: firstName,
          last_name: lastName,
          elevenlabs_api_key: elevenLabsApiKey,
        },
      });

      if (agentError) throw agentError;
      
      // Generate avatar URL using user.id as seed
      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}&scale=100`;
      
      // Construct the CORRECT conversation_link format
      const conversationLink = `https://elevenlabs.io/app/talk-to?agent_id=${agentData.agent_id}`;

      // 2. Insert into public.profiles table with agent info
      const { error: profileInsertError } = await supabase
          .from('profiles')
          .insert({ 
              id: user.id, 
              first_name: firstName, 
              last_name: lastName,
              elevenlabs_agent_id: agentData.agent_id,
              elevenlabs_agent_link: conversationLink
          });

      if (profileInsertError) {
          setIsLoading(false);
          toast({
              title: 'Error saving profile',
              description: profileInsertError.message,
              variant: 'destructive',
          });
          return;
      }

      // 4. Store persona in database with agent information
      const { error: insertError } = await supabase
        .from('personas')
        .insert({
          user_id: user.id,
          is_public: isPublic === 'public',
          elevenlabs_api_key: elevenLabsApiKey,
          agent_id: agentData.agent_id,
          conversation_link: conversationLink,
          avatar_url: avatarUrl,
        });

      if (insertError) throw insertError;

    } catch (error: any) {
      setIsLoading(false);
      const description = error.message.includes('agent') ? error.message : 'An unexpected error occurred while creating your persona.';
      toast({ title: 'Error Creating Persona', description, variant: 'destructive' });
      return;
    }

    setIsLoading(false);
    toast({
      title: 'Success!',
      description: 'Your account and persona have been created. Please check your email to verify your account.',
    });
    navigate('/account');
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-lg bg-card/50">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-center">Create Account & Persona</CardTitle>
          <CardDescription className="text-center">
            Join ProPersona to create your professional voice
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" type="text" placeholder="Your first name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" type="text" placeholder="Your last name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            
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
              {resumeFile && !isProcessingFile && (
                <p className="text-sm text-muted-foreground">File: {resumeFile.name}</p>
              )}
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="resume-text">Resume Text (Auto-filled from upload or paste manually)</Label>
               <Textarea
                id="resume-text"
                placeholder="Paste your resume text here or upload a file above..."
                className="min-h-[150px]"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                required
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="elevenlabs-api-key">ElevenLabs API Key</Label>
              <Input id="elevenlabs-api-key" type="password" placeholder="Your ElevenLabs API Key" required value={elevenLabsApiKey} onChange={(e) => setElevenLabsApiKey(e.target.value)} />
              <p className="text-xs text-muted-foreground">Needed to create your AI voice agent. Find it <a href="https://elevenlabs.io/subscription" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">here</a>.</p>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label>Persona Visibility</Label>
              <RadioGroup value={isPublic} onValueChange={setIsPublic} className="flex gap-4 pt-1">
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
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" disabled={isLoading || isProcessingFile} className="w-full font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account & Persona'
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link to="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignUp;
