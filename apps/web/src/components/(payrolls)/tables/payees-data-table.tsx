'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { FileSymlink, MoreHorizontal, Trash2 } from 'lucide-react';
import { DollarSign } from 'lucide-react';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import { ZBaseTableSearchParamsSchema } from '@documenso/lib/types/search-params';
import { extractInitials } from '@documenso/lib/utils/recipient-formatter';
import { formatDocumentsPath } from '@documenso/lib/utils/teams';
import { trpc } from '@documenso/trpc/react';
import { cn } from '@documenso/ui/lib/utils';
import { AvatarWithText } from '@documenso/ui/primitives/avatar';
import { DataTable } from '@documenso/ui/primitives/data-table';
import { DataTablePagination } from '@documenso/ui/primitives/data-table-pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@documenso/ui/primitives/dropdown-menu';
import { Skeleton } from '@documenso/ui/primitives/skeleton';
import { TableCell } from '@documenso/ui/primitives/table';

import { LocaleDate } from '~/components/formatter/locale-date';

import { DeletePayeeDialog } from '../dialogs/delete-payee-dialog';

export type PayeesDataTableProps = {
  payrollId: number;
  payrollTitle: string;
  teamUrl?: string;
  teamId?: number;
};

export const PayeesDataTable = ({
  payrollId,
  payrollTitle,
  teamUrl,
  teamId,
}: PayeesDataTableProps) => {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  const router = useRouter();

  const parsedSearchParams = ZBaseTableSearchParamsSchema.parse(
    Object.fromEntries(searchParams ?? []),
  );

  const { data, isLoading, isInitialLoading, isLoadingError } = trpc.payroll.findPayees.useQuery(
    {
      payrollId,
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
          header: 'Payee',
          cell: ({ row }) => {
            const avatarFallbackText = row.original.user.name
              ? extractInitials(row.original.user.name)
              : row.original.user.email.slice(0, 1).toUpperCase();

            return (
              <AvatarWithText
                avatarClass="h-12 w-12"
                avatarFallback={avatarFallbackText}
                primaryText={
                  <span className="text-foreground/80 font-semibold">{row.original.user.name}</span>
                }
                secondaryText={row.original.user.email}
              />
            );
          },
        },
        {
          header: 'Since',
          accessorKey: 'createdAt',
          cell: ({ row }) => <LocaleDate date={row.original.createdAt} />,
        },
        {
          header: 'Amount (USDC)',
          accessorKey: 'amount',
          cell: ({ row }) => (
            <span className={cn('flex items-center')}>
              <DollarSign className={cn('mr-2 inline-block h-4 w-4')} />
              {row.original.amount}
            </span>
          ),
        },
        {
          header: 'Actions',
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreHorizontal className="text-muted-foreground h-5 w-5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-52" align="start" forceMount>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem
                  onSelect={() =>
                    router.push(`${formatDocumentsPath(teamUrl)}/${row.original.documentId}`)
                  }
                  title="View signed document"
                >
                  <FileSymlink className="mr-2 h-4 w-4" />
                  View Document
                </DropdownMenuItem>

                <DeletePayeeDialog
                  payrollId={payrollId}
                  payrollTitle={payrollTitle}
                  payeeId={row.original.id}
                  payeeName={row.original.user.name ?? ''}
                  payeeEmail={row.original.user.email}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} title="Remove payee">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  }
                  teamId={teamId}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ),
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
            <TableCell className="w-1/2 py-4 pr-4">
              <div className="flex w-full flex-row items-center">
                <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />

                <div className="ml-2 flex flex-grow flex-col">
                  <Skeleton className="h-4 w-1/3 max-w-[8rem]" />
                  <Skeleton className="mt-1 h-4 w-1/2 max-w-[12rem]" />
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
              <Skeleton className="h-4 w-6 rounded-full" />
            </TableCell>
          </>
        ),
      }}
    >
      {(table) => <DataTablePagination additionalInformation="VisibleCount" table={table} />}
    </DataTable>
  );
};
