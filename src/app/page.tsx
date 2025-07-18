
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Scan, Newspaper } from 'lucide-react';
import Image from 'next/image';

const HeroGraphic = () => (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square">
        <g transform="translate(200, 200)">
            {/* <!-- Body --> */}
            <path d="M -100 80 C -120 -50, 120 -50, 100 80 Z" fill="hsl(var(--primary))" />
            
            {/* <!-- Eyes --> */}
            <g transform="translate(-40, -10)">
                <circle cx="0" cy="0" r="25" fill="white" />
                <circle cx="0" cy="0" r="10" fill="black" />
                <circle cx="5" cy="-5" r="3" fill="white" />
            </g>
            <g transform="translate(40, -10)">
                <circle cx="0" cy="0" r="25" fill="white" />
                <circle cx="0" cy="0" r="10" fill="black" />
                <circle cx="5" cy="-5" r="3" fill="white" />
            </g>

            {/* <!-- Mouth --> */}
            <path d="M -30 40 Q 0 60, 30 40" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />

            {/* <!-- Antenna --> */}
            <line x1="0" y1="-70" x2="0" y2="-100" stroke="hsl(var(--primary))" strokeWidth="5" />
            <circle cx="0" cy="-110" r="10" fill="hsl(var(--accent))" />
            <circle cx="0" cy="-110" r="5" fill="white" />

            {/* <!-- Floating Shapes --> */}
            <g transform="translate(-150, -50) rotate(-15)">
                <rect x="-15" y="-15" width="30" height="30" rx="5" fill="hsl(var(--chart-2))" opacity="0.8" />
            </g>
             <g transform="translate(160, -30) rotate(20)">
                <path d="M 0 -20 L 20 15 L -20 15 Z" fill="hsl(var(--chart-4))" opacity="0.8" />
            </g>
             <g transform="translate(140, 90) rotate(-10)">
                <circle cx="0" cy="0" r="18" fill="hsl(var(--chart-5))" opacity="0.8" />
            </g>
        </g>
    </svg>
);


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-8 w-8 text-primary"><rect width="256" height="256" fill="none"/><path d="M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm-41.25,90.4a16,16,0,1,1,0,23.2,16,16,0,0,1,0-23.2Zm82.5,0a16,16,0,1,1,0,23.2,16,16,0,0,1,0-23.2ZM168,176H88a48,48,0,0,1,0-96h80a48,48,0,0,1,0,96Z" fill="currentColor"/></svg>
          <span className="sr-only">DalyDough</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Trade Smarter, Not Harder with DalyDough
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our AI-powered platform analyzes the market for you, identifying high-probability trades so you can focus on what matters.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                   <Link href="/login">
                    <Button size="lg">Get Started</Button>
                  </Link>
                </div>
              </div>
              <HeroGraphic />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From advanced market scanning to automated bot management, we've got you covered.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="grid gap-1">
                    <CardTitle className="flex items-center gap-2"><Scan /> D-Score System</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  Our proprietary D-Score algorithm scans the market to find the highest probability trade setups for you 24/7.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                   <div className="grid gap-1">
                    <CardTitle className="flex items-center gap-2"><Bot /> Auto Bot Launcher</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  Configure and launch powerful DCA trading bots with advanced features like AI optimization and trailing stops.
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="grid gap-1">
                    <CardTitle className="flex items-center gap-2"><Newspaper /> News & Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  Stay ahead of the curve with a built-in economic calendar and AI-powered analysis of market-moving events.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 DalyDough. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
