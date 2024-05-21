'use client';

import type { HTMLAttributes } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Settings } from 'lucide-react';

import { formatPayrollsPath } from '@documenso/lib/utils/teams';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

export type DesktopNavProps = {
  params: {
    id: string;
    teamUrl?: string;
  };
} & HTMLAttributes<HTMLDivElement>;

export const DesktopNav = ({ params, className, ...props }: DesktopNavProps) => {
  const { id, teamUrl } = params;

  const pathname = usePathname();

  const payrollId = Number(id);
  const payrollRootPath = formatPayrollsPath(teamUrl);

  const settingsPath = `${payrollRootPath}/${payrollId}/settings`;

  return (
    <div className={cn('flex flex-col gap-y-2', className)} {...props}>
      <Link href={settingsPath}>
        <Button
          variant="ghost"
          className={cn('w-full justify-start', pathname === settingsPath && 'bg-secondary')}
        >
          <Settings className="mr-2 h-5 w-5" />
          General
        </Button>
      </Link>
    </div>
  );
};
