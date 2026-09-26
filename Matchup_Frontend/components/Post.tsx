"use client"
import { PostType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Post({
  publicID,
  title,
  summary,
  workMode,
  empType,
  salary,
  company,
  CreatedAt,
}: PostType) {
  const router = useRouter()
  return (
    <div onClick={() => router.push(`/post/${publicID}`)} className="w-full lg:w-[85%] md:w-[85%] h-[10rem] rounded-xl border border-zinc-200 p-4 shadow-sm">
      <div className="w-full h-auto flex justify-between items-center">
        <div className="w-auto h-full flex justify-center items-center gap-3">
          <div className="w-[3rem] h-[3rem] lg:w-[3.5rem] lg:h-[3.5rem] md:w-[3.5rem] md:h-[3.5rem] rounded-lg bg-yellow-400">
            <Image
              src={company.Logo}
              alt="company-logo"
              width={400}
              height={400}
              className="w-full h-full rounded-lg"
            />
          </div>
          <div className="w-auto h-[3.5rem] flex flex-col justify-between items-start">
            <h6 className="text-md font-semibold text-black">{title}</h6>
            <p className="w-full h-auto flex justify-start items-center gap-x-2">
              <span className="text-sm text-muted-foreground font-medium">
                {company.Name}
              </span>
              <br/>
              <span className="text-gray-400 text-xs">●</span>
              <span className="lg:text-sm md:text-sm text-xs font-medium bg-amber-100 text-amber-600 px-3 py-0.5 rounded-lg capitalize">
                {empType}
              </span>
              <span className="text-gray-400 text-xs">●</span>
              <span className="lg:text-sm md:text-sm text-xs  font-medium bg-purple-100 text-purple-600 px-3 py-0.5 rounded-lg capitalize">
                {workMode}
              </span>
              <span className="text-gray-400 text-xs hidden lg:block md:block">●</span>
              <span className="hidden lg:block md:block w-auto lg:text-sm md:text-sm text-xs font-normal rounded-lg text-gray-400">
                {salary?.min} - {salary?.max} {salary?.currency}
              </span>
            </p>
          </div>
        </div>
        <div className="hidden w-auto h-[3.5rem] md:flex lg:flex flex-col justify-start items-start">
          <div className="w-auto h-auto">
            <h6 className="flex justify-center items-center gap-2 font-normal text-md text-black">
              <MapPin color="black" size={20} /> {company.Location}
            </h6>
          </div>
          <div className="w-full h-auto flex justify-end items-center">
            <p className="text-sm text-gray-400">
              {new Date(CreatedAt).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full h-auto flex justify-start items-center pl-0 p-4">
        <p className="text-sm text-gray-500 line-clamp-2">{summary}</p>
      </div>
    </div>
  );
}
