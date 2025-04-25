import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, MessageSquarePlus, Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
          <MessageSquarePlus className="h-7 w-7" />
          DesaConnect
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" passHref>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">
              <Home className="mr-2 h-4 w-4 hidden sm:inline" /> Beranda
            </Button>
          </Link>
          <Link href="/submit" passHref>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">
              <MessageSquarePlus className="mr-2 h-4 w-4 hidden sm:inline" /> Buat Laporan
            </Button>
          </Link>
          <Link href="/track" passHref>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">
              <Search className="mr-2 h-4 w-4 hidden sm:inline" /> Lacak Laporan
            </Button>
          </Link>
          {/* Optional: Add Admin link later */}
          {/* <Link href="/admin" passHref>
            <Button variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Admin
            </Button>
          </Link> */}
        </div>
      </nav>
    </header>
  );
}
