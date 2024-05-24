'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { FileSymlink, History, MoreHorizontal, Trash2 } from 'lucide-react';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import { ZBaseTableSearchParamsSchema } from '@documenso/lib/types/search-params';
import { formatDocumentsPath } from '@documenso/lib/utils/teams';
import { trpc } from '@documenso/trpc/react';
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
import { useToast } from '@documenso/ui/primitives/use-toast';

import { LocaleDate } from '~/components/formatter/locale-date';

export type PayeeInvitesDataTableProps = {
  payrollId: number;
  teamUrl?: string;
  teamId?: number;
};

export const PayeeInvitesDataTable = ({
  payrollId,
  teamUrl,
  teamId,
}: PayeeInvitesDataTableProps) => {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  const router = useRouter();

  const { toast } = useToast();

  const parsedSearchParams = ZBaseTableSearchParamsSchema.parse(
    Object.fromEntries(searchParams ?? []),
  );

  const { data, isLoading, isInitialLoading, isLoadingError } =
    trpc.payroll.findPayeeInvites.useQuery(
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

  const { mutateAsync: resendPayeeInvitation } = trpc.payroll.resendPayeeInvitation.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Invitation has been resent',
      });
    },
    onError: () => {
      toast({
        title: 'Something went wrong',
        description: 'Unable to resend invitation. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const { mutateAsync: deletePayeeInvitations } = trpc.payroll.deletePayeeInvitations.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Invitation has been deleted',
      });
    },
    onError: () => {
      toast({
        title: 'Something went wrong',
        description: 'Unable to delete invitation. Please try again.',
        variant: 'destructive',
      });
    },
  });

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
            return (
              <AvatarWithText
                avatarClass="h-12 w-12"
                avatarFallback={row.original.email.slice(0, 1).toUpperCase()}
                primaryText={
                  <span className="text-foreground/80 font-semibold">{row.original.email}</span>
                }
              />
            );
          },
        },
        {
          header: 'Invited At',
          accessorKey: 'createdAt',
          cell: ({ row }) => <LocaleDate date={row.original.createdAt} />,
        },
        {
          header: 'Amount',
          accessorKey: 'amount',
          cell: ({ row }) => row.original.amount,
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

                <DropdownMenuItem
                  onClick={async () =>
                    resendPayeeInvitation({
                      payrollId,
                      invitationId: row.original.id,
                      teamId,
                    })
                  }
                >
                  <History className="mr-2 h-4 w-4" />
                  Resend
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={async () =>
                    deletePayeeInvitations({
                      payrollId,
                      invitationIds: [row.original.id],
                      teamId,
                    })
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
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
                <Skeleton className="ml-2 h-4 w-1/3 max-w-[10rem]" />
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
