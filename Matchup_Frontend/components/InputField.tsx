"use client";

import { InputFieldProps } from "@/types";
import { FieldValues } from "react-hook-form";

export default function InputField<TFormValues extends FieldValues>({
  type,
  id,
  label,
  placeholder,
  required,
  guide,
  name,
  register,
  icon,
}: InputFieldProps<TFormValues>) {
  return (
    <div className="w-full h-auto flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-[#222222] flex justify-start items-center gap-1">
        {icon && icon}{" "}{label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none text-sm font-normal text-[#222222] focus:ring-1 focus:ring-[#c8d746]"
        required={required}
        {...register(name)}
      />
      {guide && <p className="text-[10px] text-gray-400 font-light">{guide}</p>}
    </div>
  );
}
