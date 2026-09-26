"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
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
import { useState } from "react";
import Post from "@/components/Post";
import { PostType } from "@/types";
import Image from "next/image";
import EmptyPosts from "@/images/no_posts_img_img.svg";
import { ShieldAlertIcon } from "lucide-react";

export default function Posts() {
  const [page, setPage] = useState<number>(1);

  const postsQuery = useQuery({
    queryKey: ["posts", page],
    queryFn: async ({ queryKey }) => {
      const [, page] = queryKey as ["posts", number];
      const res = await axiosInstance.get(`/posts/all/${page}`);

      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  return (
    <section className="w-full h-auto flex flex-col justify-start items-center gap-4 py-8 px-4">
      {postsQuery.data?.posts?.length > 0 && postsQuery.isFetched ? (
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
              className="w-30 h-30"
            />
          </div>
          <Item variant="outline">
            <ItemMedia variant="icon">
              <ShieldAlertIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>No Job Posts Yet</ItemTitle>
              <ItemDescription>
                No job posts are available yet. Stay tuned for new
                opportunities!
              </ItemDescription>
            </ItemContent>
          </Item>
        </div>
      )}
      {postsQuery.data?.posts?.length > 0 && (
        <div className="w-full h-auto flex justify-center items-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </section>
  );
}
