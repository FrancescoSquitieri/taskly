import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { CheckCircle2 } from 'lucide-react';
import type { JSX } from 'react';

import { useSocket } from '@/hooks/use-socket';
import { useSocketStore } from '@/stores/socket';

export const Dashboard = (): JSX.Element => {
  useSocket();
  const status = useSocketStore((state) => state.status);

  return (
    <main className="min-h-screen bg-background">
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Taskly Dashboard
            </CardTitle>
            <CardDescription>
              Multitenant task manager — connection status:{' '}
              <span className="font-medium text-foreground">{status}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This is the starter dashboard. Replace it with the real workspace once the auth flow
              is wired up.
            </p>
            <div className="flex gap-2">
              <Button>Primary action</Button>
              <Button variant="outline">Secondary</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
