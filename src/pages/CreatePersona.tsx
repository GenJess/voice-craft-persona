
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';

const CreatePersona = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    } else {
      setFileName('');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    // Simulate API call for demonstration
    setTimeout(() => {
      setIsLoading(false);
      // In a real application, you would handle the generation response here.
    }, 3000);
  };

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
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input id="openai-key" type="password" placeholder="sk-..." required />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
              <Input id="elevenlabs-key" type="password" placeholder="Enter your ElevenLabs API key" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button type="submit" disabled={isLoading} size="lg" className="font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Professional Persona'
              )}
            </Button>
            <div id="persona-output" className="mt-6 p-4 border border-dashed border-border rounded-lg min-h-[100px] flex items-center justify-center bg-background/50">
              <div className="text-center text-muted-foreground">
                <Sparkles className="mx-auto h-6 w-6 mb-2" />
                <p>Your generated persona will appear here.</p>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreatePersona;
