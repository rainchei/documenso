'use client';

import { useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useDebouncedValue } from '@documenso/lib/client-only/hooks/use-debounced-value';
import { formatPayrollsPath } from '@documenso/lib/utils/teams';
import type { Team } from '@documenso/prisma/client';
import { Avatar, AvatarFallback } from '@documenso/ui/primitives/avatar';
import { Input } from '@documenso/ui/primitives/input';

import { CreatePayrollDialog } from '~/components/(payrolls)/dialogs/create-payroll-dialog';
import { PayrollsDataTable } from '~/components/(payrolls)/tables/payrolls-data-table';

import { PayrollInvitations } from './payroll-invitations';

export type PayrollsPageViewProps = {
  team?: Team;
};

export const PayrollsPageView = ({ team }: PayrollsPageViewProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const payrollRootPath = formatPayrollsPath(team?.url);

  const [searchQuery, setSearchQuery] = useState(() => searchParams?.get('query') ?? '');

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 500);

  /**
   * Handle debouncing the search query.
   */
  useEffect(() => {
    if (!pathname) {
      return;
    }

    const params = new URLSearchParams(searchParams?.toString());

    params.set('query', debouncedSearchQuery);

    if (debouncedSearchQuery === '') {
      params.delete('query');
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearchQuery, pathname, router, searchParams]);

  return (
    <div className="mx-auto max-w-screen-xl px-4 md:px-8">
      <div className="flex items-baseline justify-between">
        <div className="flex flex-row items-center">
          {team && (
            <Avatar className="dark:border-border mr-3 h-12 w-12 border-2 border-solid border-white">
              <AvatarFallback className="text-xs text-gray-400">
                {team.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          )}

          <h1 className="truncate text-2xl font-semibold md:text-3xl">Payrolls</h1>
        </div>

        <div>
          <CreatePayrollDialog teamId={team?.id} />
        </div>
      </div>

      <div className="relative mt-5">
        <div className="my-4 flex flex-row items-center justify-between space-x-4">
          <Input
            defaultValue={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Title"
          />
        </div>

        <PayrollsDataTable payrollRootPath={payrollRootPath} teamId={team?.id} />

        <div className="mt-8 space-y-8">
          <PayrollInvitations />
        </div>
      </div>
    </div>
  );
};
