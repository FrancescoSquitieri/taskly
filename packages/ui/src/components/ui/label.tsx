import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils.js';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: design-system primitive — htmlFor is supplied by callers
  <label ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = 'Label';

export { Label };
