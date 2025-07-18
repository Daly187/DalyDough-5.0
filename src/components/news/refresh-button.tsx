
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import * as React from 'react';

export default function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // This will re-fetch server components on the current route
    router.refresh();
    // A short delay to give user feedback, then re-enable the button.
    setTimeout(() => setIsRefreshing(false), 500); 
  };

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
      <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </Button>
  );
}
