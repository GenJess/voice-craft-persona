
const Footer = () => {
  return (
    <footer className="border-t border-border/40">
      <div className="container flex flex-col items-center justify-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <p className="text-center text-sm leading-loose text-muted-foreground">
          Built for a hackathon. © {new Date().getFullYear()} ProPersona. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
