export default function Footer() {
  return (
    <footer className="bg-secondary text-muted-foreground py-4 mt-8 border-t">
      <div className="container mx-auto px-4 text-center text-sm">
        © {new Date().getFullYear()} Desa Pangkalan Baru. All rights reserved. | Powered by DesaConnect
      </div>
    </footer>
  );
}
