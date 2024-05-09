'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useSession } from 'next-auth/react';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import { ZBaseTableSearchParamsSchema } from '@documenso/lib/types/search-params';
import { trpc } from '@documenso/trpc/react';
import { AvatarWithText } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import { DataTable } from '@documenso/ui/primitives/data-table';
import { DataTablePagination } from '@documenso/ui/primitives/data-table-pagination';
import { Skeleton } from '@documenso/ui/primitives/skeleton';
import { TableCell } from '@documenso/ui/primitives/table';

import { LocaleDate } from '~/components/formatter/locale-date';
import { PayrollType } from '~/components/formatter/payroll-type';

import { LeavePayrollDialog } from '../dialogs/leave-payroll-dialog';

type PayrollsDataTableProps = {
  teamId?: number;
  payrollRootPath: string;
};

export const PayrollsDataTable = ({ teamId, payrollRootPath }: PayrollsDataTableProps) => {
  const { data: session } = useSession();

  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  if (!session) {
    return null;
  }

  const parsedSearchParams = ZBaseTableSearchParamsSchema.parse(
    Object.fromEntries(searchParams ?? []),
  );

  const { data, isLoading, isInitialLoading, isLoadingError } = trpc.payroll.findPayrolls.useQuery(
    {
      term: parsedSearchParams.query,
      page: parsedSearchParams.page,
      perPage: parsedSearchParams.perPage,
      teamId,
    },
    {
      keepPreviousData: true,
    },
  );

  const onPaginationChange = (page: number, perPage: number) => {
    updateSearchParams({
      page,
      perPage,
    });
  };

  const results = data ?? {
    data: [],
    perPage: 10,
    currentPage: 1,
    totalPages: 1,
  };

  return (
    <DataTable
      columns={[
        {
          header: 'Created',
          accessorKey: 'createdAt',
          cell: ({ row }) => <LocaleDate date={row.original.createdAt} />,
        },
        {
          header: 'Title',
          accessorKey: 'title',
          cell: ({ row }) => (
            <Link href={`${payrollRootPath}/${row.original.id}`} scroll={false}>
              <AvatarWithText
                avatarClass="h-12 w-12"
                avatarFallback={row.original.title.slice(0, 1).toUpperCase()}
                primaryText={
                  <span className="text-foreground/80 font-semibold">{row.original.title}</span>
                }
              />
            </Link>
          ),
        },
        {
          header: 'Type',
          accessorKey: 'type',
          cell: ({ row }) => <PayrollType type={row.original.type} />,
        },
        {
          header: 'Actions',
          accessorKey: 'actions',
          cell: ({ row }) => {
            const isOwner = row.original.ownerUserId === session.user.id;
            const isTeamPayroll = row.original.ownerTeamId === teamId;
            return (
              <div className="flex items-center gap-x-4">
                {(isOwner || isTeamPayroll) && (
                  <Button variant="outline" asChild>
                    <Link href={`${payrollRootPath}/${row.original.id}/settings`}>Manage</Link>
                  </Button>
                )}

                {row.original.currentPayee && (
                  <LeavePayrollDialog
                    payrollId={row.original.id}
                    payrollTitle={row.original.title}
                    trigger={
                      <Button variant="destructive" onSelect={(e) => e.preventDefault()}>
                        Leave
                      </Button>
                    }
                  />
                )}
              </div>
            );
          },
        },
      ]}
      data={results.data}
      perPage={results.perPage}
      currentPage={results.currentPage}
      totalPages={results.totalPages}
      onPaginationChange={onPaginationChange}
      error={{
        enable: isLoadingError,
      }}
      skeleton={{
        enable: isLoading && isInitialLoading,
        rows: 3,
        component: (
          <>
            <TableCell className="w-1/3 py-4 pr-4">
              <div className="flex w-full flex-row items-center">
                <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />

                <div className="ml-2 flex flex-grow flex-col">
                  <Skeleton className="h-4 w-1/2 max-w-[8rem]" />
                  <Skeleton className="mt-1 h-4 w-2/3 max-w-[12rem]" />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-12 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20 rounded-full" />
            </TableCell>
            <TableCell>
              <div className="flex flex-row justify-end space-x-2">
                <Skeleton className="h-10 w-20 rounded" />
                <Skeleton className="h-10 w-16 rounded" />
              </div>
            </TableCell>
          </>
        ),
      }}
    >
      {(table) => <DataTablePagination additionalInformation="VisibleCount" table={table} />}
    </DataTable>
  );
};
