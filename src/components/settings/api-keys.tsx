"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import type { ApiKey } from '@/lib/types';

interface ApiKeysProps {
  keys: ApiKey[];
}

export default function ApiKeys({ keys }: ApiKeysProps) {
  const [visibleKeys, setVisibleKeys] = React.useState<Record<string, boolean>>({});

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">API Credentials</CardTitle>
        <CardDescription>
          Manage your API keys for integrated services. Never share these keys publicly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {keys.map((apiKey) => (
          <div key={apiKey.id} className="space-y-2">
            <Label htmlFor={apiKey.id}>{apiKey.name}</Label>
            <div className="flex items-center gap-2">
              <Input
                id={apiKey.id}
                type={visibleKeys[apiKey.id] ? 'text' : 'password'}
                defaultValue={apiKey.key}
                readOnly
                className="font-code"
              />
              <Button variant="ghost" size="icon" onClick={() => toggleVisibility(apiKey.id)}>
                {visibleKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">Toggle visibility</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
