import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CalendarDays,
  Mail,
  MoreHorizontal,
  Sparkles,
  SquareActivity,
  UserRound,
} from "lucide-react";
import { IconBoltFilled, IconCircleCheckFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { type Application } from "./page";

export const columns: ColumnDef<Application>[] = [
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
    id: "Name",
    accessorFn: (row) => row.user,
    header: () => (
      <div className="flex justify-start items-center gap-1">
        <UserRound size={`15`} color="#948979" />
        <p className="text-[#948979]">Name</p>
      </div>
    ),
    cell: ({ row }) => {
      const { Firstname, Lastname, Avatar } = row.original.user;

      return (
        <div className="capitalize flex justify-start items-center gap-2">
          <Image
            src={Avatar}
            alt="profile-picture"
            width={150}
            height={150}
            className="rounded-full w-8 h-8 object-cover"
            unoptimized
          />
          <p className="text-black capitalize">
            {Firstname} {Lastname}
          </p>
        </div>
      );
    },
  },
  {
    id: "email",
    accessorFn: (row) => row.user.Email,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-[#948979]"
        >
          <Mail /> Email
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ getValue }) => (
      <div className="lowercase">{getValue<string>()}</div>
    ),
  },
  {
    id: "status",
    accessorFn: (row) => row?.status,
    accessorKey: "post",
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
        {getValue<string>() == "active" ? (
          <IconCircleCheckFilled className="fill-green-500" />
        ) : (
          getValue<string>() === "reviewed" && (
            <IconBoltFilled className="fill-orange-400" />
          )
        )}
        {getValue<string>()}
      </Badge>
    ),
  },
  {
    id: "match_score",
    accessorFn: (row) => Number(row?.rating_data?.match_score ?? 0),
    header: () => (
      <div className="flex justify-start items-center gap-1">
        <Sparkles size={`15`} color="#948979" />
        <p className="text-[#948979]">Score</p>
      </div>
    ),
    sortingFn: "basic",
    cell: ({ getValue }) => {
      const score = getValue<number>();
      return <div>{score ? score : "-"}</div>;
    },
  },
  {
    id: "CreatedAt",
    accessorFn: (row) => row.CreatedAt,
    header: () => (
      <div className="flex justify-start items-center gap-1">
        <CalendarDays size={`15`} color="#948979" />
        <p className="text-[#948979]">Applied</p>
      </div>
    ),
    cell: ({ getValue }) => {
      const formattedDate = new Date(getValue<string>()).toLocaleDateString();
      return <div>{formattedDate}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const application = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(application.user.Email)
              }
            >
              Copy user email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View application</DropdownMenuItem>
            {/* <DropdownMenuItem>View payment details</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
