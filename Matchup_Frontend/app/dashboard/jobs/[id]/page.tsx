"use client";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/providers/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { IconLayoutColumns } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { useState } from "react";
import { toast } from "sonner";
import { columns } from "./columns";
import { Spinner } from "@/components/ui/spinner";

export type Application = {
  ID: number;
  publicID: string;
  CreatedAt: string;
  status: "active" | "reviewed" | "closed";
  PostID: string;
  rating_data?: {
    match_score: number;
    matched_skills: [string];
    missing_skills: [string];
    experience_evaluation: string;
    education_evaluation: string;
  };
  user: {
    ID: number;
    PublicID: string;
    Firstname: string;
    Lastname: string;
    Avatar: string;
    Email: string;
  };
};

export default function JobPost() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const postQuery = useQuery({
    queryKey: ["post", id],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as ["post", string];

      const res = await axiosInstance.get(`/posts/${id}`);
      return res.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!id,
  });

  const applicationsQuery = useQuery({
    queryKey: ["applications", id],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as ["applications", string];

      const res = await axiosInstance.get(`/application/post/${id}`);

      return res.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!id,
  });

  const applicationMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.patch(`/posts/${id}`, {
        status: "closed",
      });

      return res.data;
    },
    onSuccess: () => {
      toast.success("Job is closed successfully");
      router.replace("/dashboard/jobs");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Error closing the job : " + error.message);
    },
  });

  const onSubmit = () => {
    applicationMutation.mutate();
  };

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "match_score",
      desc: true,
    },
    {
      id: "status",
      desc: false,
    },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data: applicationsQuery.data?.applications
      ? applicationsQuery.data?.applications
      : [],
    columns,
    enableMultiSort: true,
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

  return (
    <section className="w-full h-auto px-5">
      <div className="w-full flex justify-between items-center">
        <div className="w-full h-auto flex justify-between items-start gap-2">
          <div className="w-[80%]">
            <h1 className="text-lg font-medium text-black">
              {postQuery.data && postQuery.data?.post?.title}
            </h1>
            <p className="w-[80%] text-xs text-[#b0b0b0]">
              {postQuery.data && postQuery.data?.post?.summary}
            </p>
          </div>
          <div className="w-auto h-full flex justify-center items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Close</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onSubmit}
                    className="bg-red-500 hover:bg-red-400"
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={() => router.push(`/dashboard/jobs/${id}/update`)}
              variant="default"
            >
              Update
            </Button>
          </div>
        </div>
      </div>
      <Separator className="w-full mt-5 mb-5" />

      <div className="w-full h-auto">
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter emails..."
              value={
                (table.getColumn("email")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <IconLayoutColumns /> Customize Columns <ChevronDown />
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
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {applicationsQuery.data?.applications &&
                table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() =>
                        router.push(
                          `/dashboard/jobs/${id}/${row.original.publicID}`,
                        )
                      }
                      // className={`${row.original.status === "reviewed" && "opacity-80"}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
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
                      <Spinner className="absolute top-1/2 left-1/2" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-muted-foreground flex-1 text-sm">
              {applicationsQuery.data?.applications &&
                table.getFilteredSelectedRowModel().rows.length}{" "}
              of{" "}
              {applicationsQuery.data?.applications &&
                table.getFilteredRowModel().rows.length}{" "}
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
      </div>
    </section>
  );
}
