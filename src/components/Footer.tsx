const Footer = () => {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MatchaMew
        </p>
      </div>
    </footer>
  );
};

export default Footer;
