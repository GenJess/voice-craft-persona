import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Users, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PublicPersona {
  name: string; // Combined first_name and last_name
  title: string | null; // Placeholder for now, or fetched from somewhere else
  location: string | null; // Placeholder for now
  conversation_link: string | null;
  avatar_url: string | null;
  // Raw fields from personas table:
  id: string; // Add id for keying
  first_name_from_profile: string | null; // To store first_name from joined profiles
  last_name_from_profile: string | null; // To store last_name from joined profiles
  // Other fields you might fetch directly from personas if you had them there, e.g., random_persona_name
}

const PublicPersonas = () => {
  const [personas, setPersonas] = useState<PublicPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPublicPersonas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('personas')
        .select(`
          id, // REMOVED COMMENT: Was "//SelectpersonaID", caused 400 error.
          conversation_link,
          avatar_url,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('is_public', true);
      
      if (error) {
        console.error("Error fetching public personas:", error);
        // Provide more detail if possible, e.g., error.details
        toast({ title: "Error", description: `Could not fetch public personas: ${error.message}`, variant: "destructive"});
        setPersonas([]); // Ensure personas are cleared on error
      } else {
        const formattedPersonas = data.map((p: any) => {
          // Safely access profile data, as it might be null if no matching profile exists
          const firstName = p.profiles?.first_name || '';
          const lastName = p.profiles?.last_name || '';

          return {
            id: p.id, // Use the persona ID as key
            name: `${firstName} ${lastName}`.trim(),
            title: 'Professional Persona', // This seems to be a static value in your current setup
            location: 'Remote', // This seems to be a static value in your current setup
            conversation_link: p.conversation_link,
            avatar_url: p.avatar_url,
            first_name_from_profile: firstName, // Store for debugging if needed
            last_name_from_profile: lastName, // Store for debugging if needed
            // If your 'personas' table had 'random_persona_name', you'd map it like:
            // random_persona_name: p.random_persona_name,
          };
        }).filter(p => p.name.length > 0); // Filter out personas that have no name from profiles

        setPersonas(formattedPersonas);
      }
      setLoading(false);
    };
    
    fetchPublicPersonas();
  }, [toast]); // Add toast to dependency array as it's used inside useEffect

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
          {personas.map((persona) => ( // Removed index here, use persona.id as key
            <Card key={persona.id} className="bg-card hover:bg-accent transition-colors flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={persona.avatar_url ?? undefined} alt={`${persona.name}'s avatar`} />
                    <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <CardTitle>{persona.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground font-medium">{persona.title}</p>
                <p className="text-sm text-muted-foreground">{persona.location}</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full" disabled={!persona.conversation_link}>
                  <a href={persona.conversation_link ?? '#'} target="_blank" rel="noopener noreferrer">
                    {persona.conversation_link ? 'Chat with Persona' : 'Agent Not Available'}
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