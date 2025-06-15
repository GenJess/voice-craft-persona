
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const dummyPersonas = [
  { name: 'Jane Doe', title: 'Software Engineer' },
  { name: 'John Smith', title: 'Product Manager' },
  { name: 'Alex Johnson', title: 'UX/UI Designer' },
];

const PublicPersonas = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold font-display mb-8 text-center">Explore Public Personas</h1>
      
      <div className="text-center mb-12 p-6 bg-secondary rounded-lg">
        <p className="text-lg text-secondary-foreground">Public personas are coming soon!</p>
        <p className="text-muted-foreground">For now, you can see some examples below or create your own.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyPersonas.map((persona, index) => (
          <Card key={index} className="bg-card/50">
            <CardHeader>
              <CardTitle>{persona.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{persona.title}</p>
            </CardContent>
            <CardFooter>
              <Button disabled variant="outline" className="w-full">View Persona (Coming Soon)</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PublicPersonas;
