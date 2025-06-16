
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PublicPersona {
  id: string;
  avatar_url: string | null;
  agent_id: string | null;
  conversation_link: string;
}

const PublicPersonas = () => {
  const [personas, setPersonas] = useState<PublicPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPublicPersonas = async () => {
      setLoading(true);
      
      // Simple query - just get what we need from personas table
      const { data, error } = await supabase
        .from('personas')
        .select('id, avatar_url, agent_id')
        .eq('is_public', true);
      
      if (error) {
        console.error("Error fetching public personas:", error);
        toast({ 
          title: "Error", 
          description: `Could not fetch public personas: ${error.message}`, 
          variant: "destructive"
        });
        setPersonas([]);
      } else {
        // Format the data and build conversation links
        const formattedPersonas = data
          .filter(p => p.agent_id) // Only include personas with agent_id
          .map((p: any) => ({
            id: p.id,
            avatar_url: p.avatar_url,
            agent_id: p.agent_id,
            conversation_link: `https://elevenlabs.io/app/talk-to?agent_id=${p.agent_id}`
          }));

        setPersonas(formattedPersonas);
      }
      setLoading(false);
    };
    
    fetchPublicPersonas();
  }, [toast]);

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-display mb-4 flex items-center justify-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Discover Personas
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore public professional personas from our community. Connect with professionals and discover new opportunities.
        </p>
      </div>
      
      <div className="text-center mb-12 p-6 bg-secondary rounded-lg">
        <p className="text-lg text-secondary-foreground">Public personas are now live!</p>
        <p className="text-muted-foreground">This is a directory of all users who have chosen to make their persona public.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[20vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : personas.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
          <p>No public personas found yet. Be the first to create one and make it public!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <Card key={persona.id} className="bg-card hover:bg-accent transition-colors flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={persona.avatar_url ?? undefined} alt="Persona avatar" />
                    <AvatarFallback>🤖</AvatarFallback>
                  </Avatar>
                  <CardTitle>AI Persona</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground font-medium">Professional Voice Agent</p>
                <p className="text-sm text-muted-foreground">Ready to chat</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <a href={persona.conversation_link} target="_blank" rel="noopener noreferrer">
                    Chat with Persona
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicPersonas;
