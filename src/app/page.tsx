
import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase-server';

export default async function RootPage() {
  try {
    const user = await auth.getCurrentUser();
    if (user) {
      redirect('/dashboard');
    } else {
      redirect('/login');
    }
  } catch (error) {
    // If there's an error getting the user (e.g., Firebase not configured),
    // we'll redirect to the login page as a safe fallback.
    redirect('/login');
  }
}
