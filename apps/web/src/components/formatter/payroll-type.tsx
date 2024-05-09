import type { HTMLAttributes } from 'react';

import { Globe, Lock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react/dist/lucide-react';

import type { PayrollType as PayrollTypePrisma } from '@documenso/prisma/client';
import { cn } from '@documenso/ui/lib/utils';

type PayrollTypeIcon = {
  label: string;
  icon?: LucideIcon;
  color: string;
};

type PayrollTypes = (typeof PayrollTypePrisma)[keyof typeof PayrollTypePrisma];

const PAYROLL_TYPES: Record<PayrollTypes, PayrollTypeIcon> = {
  PRIVATE: {
    label: 'Private',
    icon: Lock,
    color: 'text-blue-600 dark:text-blue-300',
  },
  PUBLIC: {
    label: 'Public',
    icon: Globe,
    color: 'text-green-500 dark:text-green-300',
  },
};

export type PayrollTypeProps = HTMLAttributes<HTMLSpanElement> & {
  type: PayrollTypes;
  inheritColor?: boolean;
};

export const PayrollType = ({ className, type, inheritColor, ...props }: PayrollTypeProps) => {
  const { label, icon: Icon, color } = PAYROLL_TYPES[type];

  return (
    <span className={cn('flex items-center', className)} {...props}>
      {Icon && (
        <Icon
          className={cn('mr-2 inline-block h-4 w-4', {
            [color]: !inheritColor,
          })}
        />
      )}
      {label}
    </span>
  );
};
