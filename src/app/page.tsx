
import { redirect } from 'next/navigation';

export default function RootPage() {
  // The root page now redirects to the main dashboard.
  // The authentication check is handled by the layout protecting the dashboard route.
  redirect('/dashboard');
}
