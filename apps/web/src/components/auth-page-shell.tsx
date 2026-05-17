import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui';
import { Sparkles } from 'lucide-react';
import type { JSX, ReactNode } from 'react';

interface AuthPageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthPageShell = ({
  title,
  description,
  children,
  footer,
}: AuthPageShellProps): JSX.Element => (
  <div className="grid min-h-screen place-items-center bg-muted/30 p-6">
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden />
          <span className="font-semibold">Taskly</span>
        </div>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <CardFooter className="flex-col items-start gap-2 text-muted-foreground text-sm">
          {footer}
        </CardFooter>
      )}
    </Card>
  </div>
);
