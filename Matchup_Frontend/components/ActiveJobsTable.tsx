"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  Globe,
  MoreHorizontal,
  SquareActivity,
  Tally5,
  Target,
  Trash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/providers/axios";
import { useCompanyStore } from "@/stores/company.store";
import { Badge } from "./ui/badge";
import { PostType } from "@/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { Spinner } from "./ui/spinner";

export type Post = {
  post: PostType;
  applicants_count: number;
};

export const columns: ColumnDef<Post>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "title",
    accessorFn: (row) => row.post?.title,
    header: () => (
      <div className="flex justify-start items-center gap-1">
        <Target size={`15`} color="#948979" />
        <p className="text-[#948979]">Title</p>
      </div>
    ),
    cell: ({ getValue }) => {
      return <div className="capitalize">{getValue<string>()}</div>;
    },
  },
  {
    id: "status",
    accessorFn: (row) => row.post?.status,
    accessorKey: "post",
    enableColumnFilter: true,
    filterFn: "equalsString",
    header: () => (
      <div className="flex justify-start items-center gap-1">
        <SquareActivity size={`15`} color="#948979" />
        <p className="text-[#948979]">Status</p>
      </div>
    ),
    cell: ({ getValue }) => (
      <Badge
        variant="outline"
        className="capitalize text-muted-foreground px-1.5"
      >
        <IconCircleCheckFilled className="fill-green-500" />
        {getValue<string>()}
      </Badge>
    ),
  },
  {
    id: "empType",
    accessorFn: (row) => row.post?.empType,
    header: () => (
      <div className="flex justify-start items-center gap-1">
        <BriefcaseBusiness size={`15`} color="#948979" />
        <p className="text-[#948979]">Type</p>
      </div>
    ),
    cell: ({ getValue }) => (
      <Badge variant="outline" className="capitalize">
        {getValue<string>()}
      </Badge>
    ),
  },
  {
    id: "workMode",
    accessorFn: (row) => row.post?.workMode,
    header: () => (
      <div className="flex justify-start items-center gap-1">
        <Globe size={`15`} color="#948979" />
        <p className="text-[#948979]">Mode</p>
      </div>
    ),
    cell: ({ getValue }) => (
      <Badge variant="secondary" className="capitalize">
        {getValue<string>()}
      </Badge>
    ),
  },
  {
    accessorKey: "applicant_count",
    header: () => (
      <div className="flex justify-start items-center gap-1">
        <Tally5 size={`15`} color="#948979" />
        <p className="text-[#948979]">Applicants</p>
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="capitalize">{row.getValue("applicant_count")}</div>
      );
    },
  },
  {
    id: "createdAt",
    accessorFn: (row) => row.post?.CreatedAt,
    header: () => (
      <div className="flex justify-start items-center gap-1">
        <CalendarDays size={`15`} color="#948979" />
        <p className="text-[#948979]">Published</p>
      </div>
    ),
    cell: ({ getValue }) => (
      <div className="capitalize">
        {new Date(getValue<string>()).toLocaleDateString()}
      </div>
    ),
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const post = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-4 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(post.post.publicID)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ActiveJobsTable() {
  const company = useCompanyStore((state) => state.company);
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "applicant_count",
      desc: true,
    },
  ]);
  const searchParams = useSearchParams();
  const statusFromURL = searchParams.get("status")?? "active";

  const [isDeleteButtonOpen, setIsDeleteButtonOpen] =
    React.useState<boolean>(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
  { id: "status", value: "active" }
  ]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [jobType, setJobType] = React.useState(statusFromURL);
  const router = useRouter();
  const pathname = usePathname()

  React.useEffect(() => {
    const hasSelection = Object.keys(rowSelection).length > 0;
    setIsDeleteButtonOpen(hasSelection);
  }, [rowSelection]);

  const jobsQuery = useQuery({
    queryKey: ["active_jobs"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/posts/company/posts/${company?.PublicID}`,
        {
          params: {
            type: "active",
          },
        }
      );

      return res.data;
    },
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  const table = useReactTable({
    data: jobsQuery.data?.posts ? jobsQuery.data?.posts : [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const onFilterChange = (status: string) => {
    setJobType(status);
    if (status == "all") {
      table.getColumn("status")?.setFilterValue(undefined);
    } else {
      table.getColumn("status")?.setFilterValue(status);
    }

    const params = new URLSearchParams(searchParams.toString())

    params.set("status",status)
    router.replace(`${pathname}?${params.toString()}`,{scroll : false})
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-4">
        <Input
          placeholder="Filter titles..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="w-auto flex justify-center items-center gap-5">
          {isDeleteButtonOpen && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash color="white" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the job and remove job data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Select
            value={jobType ?? "active"}
            defaultValue="active"
            onValueChange={onFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Active" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Type</SelectLabel>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {jobsQuery.data?.posts && table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() =>
                    router.push(
                      `/dashboard/jobs/${row.original.post.publicID}`
                    )
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="w-full h-24 text-center relative"
                >
                  <Spinner className="absolute top-1/2 left-1/2"/>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {jobsQuery.data?.posts &&
            table.getFilteredSelectedRowModel()?.rows?.length}{" "}
          of {jobsQuery.data?.posts && table.getFilteredRowModel().rows.length}{" "}
          row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
