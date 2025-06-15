
import { Link, useLocation } from 'react-router-dom';
import { BotMessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Header = () => {
  const location = useLocation();
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/personas', label: 'Personas' },
  ];

  // TODO: Replace with actual auth state
  const isSignedIn = false; // This will be replaced with actual auth logic

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <BotMessageSquare className="h-6 w-6 text-primary" />
          <span className="font-bold font-display">ProPersona</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'transition-colors hover:text-primary',
                location.pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {isSignedIn ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/create-persona">Create Persona</Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/account">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
