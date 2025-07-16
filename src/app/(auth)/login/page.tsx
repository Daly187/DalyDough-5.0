
import GoogleSignInButton from "@/components/auth/google-sign-in-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-muted/40">
       <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-10 w-10 text-primary"><rect width="256" height="256" fill="none"/><path d="M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm-41.25,90.4a16,16,0,1,1,0,23.2,16,16,0,0,1,0-23.2Zm82.5,0a16,16,0,1,1,0,23.2,16,16,0,0,1,0-23.2ZM168,176H88a48,48,0,0,1,0-96h80a48,48,0,0,1,0,96Z" fill="currentColor"/></svg>
            </div>
            <CardTitle className="text-2xl font-headline">Welcome to DalyDough</CardTitle>
            <CardDescription>Sign in to access your trading dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSignInButton />
        </CardContent>
      </Card>
    </main>
  );
}
