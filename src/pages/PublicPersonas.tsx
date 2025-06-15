
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Users } from "lucide-react";

const dummyPersonas = [
  { name: 'Jane Doe', title: 'Software Engineer', location: 'San Francisco' },
  { name: 'John Smith', title: 'Product Manager', location: 'New York' },
  { name: 'Alex Johnson', title: 'UX/UI Designer', location: 'London' },
];

const PublicPersonas = () => {
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
        <p className="text-lg text-secondary-foreground">Public personas are coming soon!</p>
        <p className="text-muted-foreground">For now, you can see some examples below or create your own.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyPersonas.map((persona, index) => (
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
    </div>
  );
};

export default PublicPersonas;
