
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload, Users, Shield } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: <Upload className="h-8 w-8 text-primary" />,
      title: "Upload Once",
      description: "Upload your resume once and create your professional persona that you can use anywhere.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Share & Discover",
      description: "Make your persona public to be discovered by others, or keep it private for personal use.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Your Control",
      description: "Full control over your persona's visibility and how your professional information is shared.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="text-center pt-10 md:pt-20">
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-4">
          Your Voice, Your Resume,
          <br />
          <span className="text-primary">Your Professional Persona.</span>
        </h1>
        <p className="max-w-2xl mx-auto mt-6 text-lg text-muted-foreground">
          Transform your static resume into a dynamic, voice-interactive professional persona. Upload once, use everywhere, and control who can discover your professional story.
        </p>
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <Button size="lg" asChild className="font-semibold">
            <Link to="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="font-semibold">
            <Link to="/personas">Explore Personas</Link>
          </Button>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="w-full max-w-5xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">How It Works</h2>
        <p className="mt-4 text-muted-foreground">Create your account and build your professional persona in minutes.</p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center p-6 border border-border rounded-lg bg-card/50">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold font-display">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
