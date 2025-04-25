export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-6 mt-12 border-t border-border">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} Desa Pangkalan Baru. All rights reserved.</p>
        <p className="mt-1">Powered by <span className="text-primary font-semibold">DesaConnect</span></p>
      </div>
    </footer>
  );
}
