'use client';

import type { HTMLAttributes } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Key, User } from 'lucide-react';

import { formatPayrollsPath } from '@documenso/lib/utils/teams';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

export type MobileNavProps = {
  params: {
    id: string;
    teamUrl?: string;
  };
} & HTMLAttributes<HTMLDivElement>;

export const MobileNav = ({ params, className, ...props }: MobileNavProps) => {
  const { id, teamUrl } = params;

  const pathname = usePathname();

  const payrollId = Number(id);
  const payrollRootPath = formatPayrollsPath(teamUrl);

  const settingsPath = `${payrollRootPath}/${payrollId}/settings`;
  const payeesPath = `${payrollRootPath}/${payrollId}/settings/payees`;

  return (
    <div
      className={cn('flex flex-wrap items-center justify-start gap-x-2 gap-y-4', className)}
      {...props}
    >
      <Link href={settingsPath}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            pathname?.startsWith(settingsPath) &&
              pathname.split('/').length === 4 &&
              'bg-secondary',
          )}
        >
          <User className="mr-2 h-5 w-5" />
          General
        </Button>
      </Link>

      <Link href={payeesPath}>
        <Button
          variant="ghost"
          className={cn('w-full justify-start', pathname?.startsWith(payeesPath) && 'bg-secondary')}
        >
          <Key className="mr-2 h-5 w-5" />
          Payees
        </Button>
      </Link>
    </div>
  );
};
