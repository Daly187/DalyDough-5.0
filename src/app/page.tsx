
import { redirect } from 'next/navigation';

export default function RootPage() {
  // This page now only redirects to the main dashboard.
  // The authentication check is handled by the layout protecting the dashboard.
  redirect('/dashboard');
}
