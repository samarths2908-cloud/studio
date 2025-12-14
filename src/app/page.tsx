import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Bus, Users } from 'lucide-react';

export default function RoleSelectionPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="text-center mb-10 sm:mb-16">
        <h1 className="font-headline text-5xl sm:text-7xl font-bold text-primary tracking-tight">BusTrack</h1>
        <p className="text-muted-foreground mt-2 text-lg sm:text-xl">Real-time school bus tracking</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-sm md:max-w-3xl">
        <Link href="/driver" className="h-full">
          <Card className="h-full text-center hover:bg-card/80 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-2xl rounded-xl group">
            <CardHeader className="p-6">
              <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Bus className="h-12 w-12 text-primary" strokeWidth={1.5} />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <CardTitle className="text-2xl font-bold text-foreground/90">I am a Driver</CardTitle>
              <p className="text-muted-foreground mt-2 text-sm">Share your bus's location in real-time.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/student" className="h-full">
          <Card className="h-full text-center hover:bg-card/80 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-2xl rounded-xl group">
            <CardHeader className="p-6">
              <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Users className="h-12 w-12 text-primary" strokeWidth={1.5} />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <CardTitle className="text-2xl font-bold text-foreground/90">I am a Student</CardTitle>
              <p className="text-muted-foreground mt-2 text-sm">Find your bus and track it live on the map.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
       <footer className="absolute bottom-4 text-center text-muted-foreground text-sm">
        <p>Select a role to get started.</p>
      </footer>
    </main>
  );
}
