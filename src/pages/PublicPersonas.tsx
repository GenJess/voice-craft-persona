
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Users, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

interface PublicPersona {
  name: string;
  title: string | null;
  location: string | null;
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
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('is_public', true);
      
      if (error) {
        console.error("Error fetching public personas:", error);
        toast({ title: "Error", description: "Could not fetch public personas.", variant: "destructive"});
      } else {
        const formattedPersonas = data.map((p: any) => ({
          name: `${p.profiles.first_name || ''} ${p.profiles.last_name || ''}`.trim(),
          title: 'Professional', 
          location: 'Remote'
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
          {personas.map((persona, index) => (
            <Card key={index} className="bg-card hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{persona.name}</span>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-medium">{persona.title}</p>
                <p className="text-sm text-muted-foreground">{persona.location}</p>
              </CardContent>
              <CardFooter>
                <Button disabled variant="outline" className="w-full">
                  View Persona (Coming Soon)
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
