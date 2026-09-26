"use client";

import SearchAnimation from "@/components/SearchAnimaiton";
import SubmitButton from "@/components/SubmitButton";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import Image from "next/image";
import ArrowAvatars from "@/images/arrow_avatars.svg";
import { Separator } from "@/components/ui/separator";
import { MapPin, SearchIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import axiosInstance from "@/providers/axios";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import Post from "@/components/Post";
import { PostType } from "@/types";
import EmptyPosts from "@/images/no_posts_img_img.svg";
import { ShieldAlertIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { jobSearchSchema } from "@/providers/schemas";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/ui/grid-pattern";
import { toast } from "sonner";
import { useUserStore } from "@/stores/user.store";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserStore();

  const { control, register, watch, reset, setValue } = useForm<
    z.infer<typeof jobSearchSchema>
  >({
    resolver: zodResolver(jobSearchSchema),
    mode: "onChange",
    defaultValues: {
      workMode:
        searchParams.get("workMode") !== null
          ? (searchParams.get("workMode") as "on-site" | "hybrid" | "remote")
          : "",
      empType:
        searchParams.get("empType") !== null
          ? (searchParams.get("empType") as
              | "full-time"
              | "part-time"
              | "internship"
              | "contract"
              | "freelance")
          : "",
      minSalary:
        searchParams.get("minSalary") != null
          ? Number(searchParams.get("minSalary"))
          : 0,
      maxSalary:
        searchParams.get("maxSalary") != null
          ? Number(searchParams.get("maxSalary"))
          : 0,
      createdAt: "",
      currency: "",
      page: 1,
      location: "",
    },
  });

  const params: Record<string, any> = {};

  const q = watch("q");
  const location = watch("location");
  const workMode = watch("workMode");
  const empType = watch("empType");
  const minSalary = watch("minSalary");
  const maxSalary = watch("maxSalary");
  const currency = watch("currency");
  const createdAt = watch("createdAt");
  const page = watch("page");

  if (q) params.q = q;
  if (location) params.location = location;
  if (workMode) params.workMode = workMode;
  if (empType) params.empType = empType;
  if (minSalary && minSalary > 0) params.minSalary = Number(minSalary);
  if (maxSalary && maxSalary > 0) params.maxSalary = Number(maxSalary);
  if (currency) params.currency = currency;
  if (createdAt) params.createdAt = createdAt;

  const postsQuery = useQuery({
    queryKey: [
      "posts",
      page,
      q ?? null,
      workMode ?? null,
      empType ?? null,
      minSalary !== undefined && minSalary > 0 ? minSalary : null,
      maxSalary !== undefined && maxSalary > 0 ? maxSalary : null,
      currency ?? null,
      createdAt ?? null,
    ],
    queryFn: async () => {
      const res = await axiosInstance.get(`/posts/all/${page}`, {
        params,
      });

      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const handleSearch = useRef(
    debounce(() => {
      if (
        (q && q.trim().length > 0) ||
        (location && location.trim().length > 0)
      ) {
        postsQuery.refetch();
      }
    }, 100)
  ).current;

  useEffect(() => {
    handleSearch();
  }, [q]);

  const setSearchParams = (key: string, value: string) => {
    if (key && value) {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const changePage = (pageNumber: number) => {
    setValue("page", pageNumber);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageNumber));
    router.replace(`${pathname}?${params.toString()}`);
    postsQuery.refetch();
  };

  const handlePublish = () => {
    if (user === null) {
      router.push("/login");
    } else if (user?.Type === "employer") {
      router.push("/dashboard");
    } else {
      toast.warning("Signup as an employer to publish jobs!");
      router.push("/signup");
    }
  };

  const pages = Array.from(
    { length: postsQuery.data?.meta?.totalPages },
    (_, i) => i + 1
  );

  const avatars = [
    {
      imageUrl: "https://avatars.githubusercontent.com/u/16860528",
      profileUrl: "https://github.com/dillionverma",
    },
    {
      imageUrl: "https://avatars.githubusercontent.com/u/20110627",
      profileUrl: "https://github.com/tomonarifeehan",
    },
    {
      imageUrl: "https://avatars.githubusercontent.com/u/106103625",
      profileUrl: "https://github.com/BankkRoll",
    },
    {
      imageUrl: "https://avatars.githubusercontent.com/u/59228569",
      profileUrl: "https://github.com/safethecode",
    },
    {
      imageUrl: "https://avatars.githubusercontent.com/u/59442788",
      profileUrl: "https://github.com/sanjay-mali",
    },
    {
      imageUrl: "https://avatars.githubusercontent.com/u/89768406",
      profileUrl: "https://github.com/itsarghyadas",
    },
  ];

  return (
    <main className="w-full h-auto flex flex-col justify-center items-center">
      <div className="w-full h-[450px] flex flex-col justify-center items-center gap-5">
        <GridPattern
          squares={[
            [6, 20],
            [5, 19],
            [6, 19],
            [7, 18],
            [7, 17],
            [8, 18],

            [6, 10],
            [5, 11],
            [5, 12],
            [4, 11],
            [6, 9],
            [7, 10],

            [6, 2],
            [5, 2],
            [6, 3],
            [7, 1],
            [7, 0],
            [8, 1],

            [26, 10],
            [27, 11],
            [26, 11],
            [25, 12],
            [25, 13],
            [24, 12],

            [17, 17],
            [17, 16],
            [18, 17],
            [16, 18],
            [16, 19],
            [15, 18],
            [9, 26],
            [8, 26],
            [9, 27],
            [10, 25],
            [10, 24],
            [11, 25],
            [36, 26],
            [35, 26],
            [36, 27],
            [27, 25],
            [27, 24],
            [23, 25],

            [40, 17],
            [40, 18],
            [39, 17],
            [41, 16],
            [42, 16],
            [31, 15],

            [25, 2],
            [25, 1],
            [24, 1],
            [26, 0],
            [27, 0],
          ]}
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
            "lg:[mask-image:radial-gradient(550px_circle_at_center,white,transparent)]",
            "lg:inset-x-0 inset-y-[9%] xl:inset-y-[15%] 2xl:inset-y-[10%] h-[52%] xl:h-[88%] 2xl:h-[52%]",
            "2xl:[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
          )}
        />
        <div className="w-auto flex justify-start items-center gap-4 relative mb-5 z-[1000]">
          <SearchAnimation />
          <h6 className="lg:text-sm font-normal tracking-tight text-zinc-400 text-center">
            Where talent meets opportunity
          </h6>
        </div>
        <h1 className="text-6xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-[#222222] text-center z-[1000]">
          Jobs. Talent. <br /> <span className="text-[#c8d746]">Matched</span>{" "}
          Instantly.
        </h1>
        <p className="text-sm font-normal text-[#6a6a6a] w-[90%] lg:w-[60%] text-center z-[1000]">
          The future of work is fast, and we’re here to keep up. Discover talent
          or land your next role with powerful tools built for modern hiring.
        </p>

        <div className="flex justify-center items-center gap-3 z-[1000]">
          <SubmitButton />
          <Button
            variant="ghost"
            onClick={handlePublish}
            className="w-auto h-[32px] px-3 text-[#6a6a6a] font-medium hover:bg-zinc-100 rounded-full  text-sm flex items-center justify-center gap-2"
          >
            Post a Position
          </Button>
        </div>
      </div>
      <div className="w-full h-auto flex justify-center items-center mt-8">
        <Separator
          orientation="horizontal"
          className="lg:max-w-[30%] max-w-[60%] h-full z-[1000]"
        />
      </div>
      <div className="w-full h-auto mt-8">
        <div className="relative w-full h-auto flex flex-col justify-start items-center gap-5">
          <div className="hidden lg:block md:block absolute w-auto h-auto lg:left-[28%] 2xl:left-[35%] lg:top-[25%] md:left-[28%] md:top-[25%]">
            <Image
              alt="arrow-avatars"
              src={ArrowAvatars}
              width={144}
              height={141}
              className="lg:w-[7rem] lg:h-[7rem] w-[4rem] h-[4rem] rotate-[15deg]"
            />
          </div>
          <h6 className="text-xl font-semibold text-center text-[#222222]">
            ✨ The talent on our platform
          </h6>
          <div className="w-auto h-full flex justify-center items-center">
            <AvatarCircles avatarUrls={avatars} numPeople={99} />
          </div>
        </div>
      </div>

      <section className="w-full h-auto mt-15 px-4 flex flex-col justify-start items-center">
        <div className="lg:w-[85%] md:w-[85%] w-[90%] h-[4rem] border border-zinc-200 bg-zinc-50 rounded-xl flex justify-start items-center p-4 py-3 shadow-amber-50 shadow-xs">
          <SearchIcon color="#6a6a6a" className="size-8 lg:size-5" />
          <input
            type="text"
            className="lg:w-[40%] md:w-[40%] w-full focus:outline-none ml-4 placeholder:text-sm lg:placeholder:text-lg"
            placeholder="Start finding your next job..."
            onChange={(e) => setValue("q", e.target.value)}
          />
          <Separator
            orientation="vertical"
            className="h-full hidden lg:block"
          />
          <MapPin color="#6a6a6a" size={22} className="ml-4 hidden lg:block" />
          <input
            type="text"
            className="lg:w-[40%] md:w-[40%] hidden lg:block focus:outline-none ml-4"
            placeholder="Your preferred location..."
            onChange={(e) => {
              const query = e.target.value;
              setValue("q", query);
            }}
          />
          <Button
            onClick={() => postsQuery.refetch()}
            size="lg"
            variant="default"
            className="bg-[#c8d746]"
          >
            Find Jobs
          </Button>
        </div>
        <div className="lg:w-[85%] md:w-[85%] w-[95%] h-auto flex flex-wrap justify-center items-center gap-4 mt-5">
          <div className="w-auto h-auto flex justify-center items-center">
            <Controller
              name="empType"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSearchParams("empType", value);
                  }}
                  value={field.value}
                >
                  <SelectTrigger className="lg:w-[180px] w-auto">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Job Types</SelectLabel>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="w-auto h-auto flex justify-center items-center">
            <Controller
              name="workMode"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSearchParams("workMode", value);
                  }}
                  value={field.value}
                >
                  <SelectTrigger className="lg:w-[180px] w-auto">
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Work Modes</SelectLabel>
                      <SelectItem value="on-site">On-site</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="w-auto h-auto flex justify-center items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="text-muted-foreground" variant="outline">
                  Salary
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="leading-none font-medium">Salary Range</h4>
                    <p className="text-muted-foreground text-sm">
                      Define your salary expectations
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="width">Currency</Label>
                      <Controller
                        name="currency"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSearchParams("currency", value);
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="LKR" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Supported currencies</SelectLabel>
                                <SelectItem value="LKR">LKR</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="AUD">AUD</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="maxWidth">Max</Label>
                      <Input
                        id="maxSalary"
                        defaultValue="0"
                        className="col-span-2 h-8"
                        {...register("maxSalary", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="height">Min</Label>
                      <Input
                        id="minSalary"
                        defaultValue="0"
                        className="col-span-2 h-8"
                        {...register("minSalary", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="w-auto h-auto flex justify-center items-center">
            <Controller
              name="createdAt"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSearchParams("createdAt", value);
                  }}
                >
                  <SelectTrigger className="lg:w-[180px] md:w-[180px] w-auto">
                    <SelectValue placeholder="Date posted" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Post duration</SelectLabel>
                      <SelectItem value="24-hours">Last 24 hours</SelectItem>
                      <SelectItem value="7-days">Last 7 days</SelectItem>
                      <SelectItem value="30-days">Last 30 days</SelectItem>
                      <SelectItem value="anytime">Anytime</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {searchParams.toString().length > 0 && (
            <div className="w-auto h-auto flex justify-center items-center">
              <Button
                onClick={() => {
                  router.replace("?", { scroll: false });
                  reset();
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
      <div className="w-full flex justify-center items-center mt-8">
        <div className="w-full min-h-[28rem] flex flex-col justify-start items-center gap-4 py-8 px-4">
          {postsQuery.isFetching ? (
            <div className="w-full min-h-[28rem] flex justify-center items-center">
              <Spinner />
            </div>
          ) : postsQuery.data?.posts?.length > 0 && postsQuery.isFetched ? (
            postsQuery.data?.posts.map((post: PostType) => (
              <Post
                key={post.publicID}
                publicID={post.publicID}
                title={post.title}
                description={post.description}
                summary={post.summary}
                empType={post.empType}
                workMode={post.workMode}
                salary={post.salary}
                companyID={post.companyID}
                company={post.company}
                author={post.author}
                CreatedAt={post.CreatedAt}
              />
            ))
          ) : (
            <div className="w-full h-auto flex flex-col justify-center items-center gap-4">
              <div className="w-full h-auto flex justify-center items-center">
                <Image
                  src={EmptyPosts}
                  alt="no-posts"
                  width={800}
                  height={800}
                  className="w-30 h-32"
                />
              </div>
              <Item variant="outline">
                <ItemMedia variant="icon">
                  <ShieldAlertIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>No Job Posts Found</ItemTitle>
                  <ItemDescription>
                    No job posts are found!. Stay tuned for new opportunities!
                  </ItemDescription>
                </ItemContent>
              </Item>
            </div>
          )}

          {postsQuery.data?.posts?.length >= 10 && (
            <div className="w-full h-auto flex justify-center items-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => changePage(page - 1)} />
                  </PaginationItem>
                  {pages.length > 0 &&
                    pages?.map((index: number, p: number) => (
                      <PaginationItem key={index} onClick={() => changePage(p)}>
                        <PaginationLink isActive={p === page}>
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
