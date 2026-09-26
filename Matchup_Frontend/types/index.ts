import React from "react";
import { UseFormRegister, FieldValues, Path } from "react-hook-form";

export type UserType = {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
  Type: string;
  Gender : "male" | "female"
  Avatar : string;
};

export type LoginRequestType = {
  email: string;
  password: string;
};

export type InputFieldProps<TFieldValues extends FieldValues> = {
  type: string;
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  guide?: string;
  register: UseFormRegister<TFieldValues>;
  name: Path<TFieldValues>;
  icon? :React.ReactNode;
};

export type ChildProp = {
  children: React.ReactNode;
};

export type LabelType = {
  title: string;
  name: string;
  styles?: any;
};

export type JobPostType = {
  title : string,
  empType : string,
  workMode : string,
  salary : {
    currency : 'LKR' | 'USD' | 'AUD',
    max : number,
    min : number
  },
  summary : string,
  description : string
}

export type CompanyType = {
  Name : string,
  PublicID : string,
  Email : string,
  Description : string,
  Username : string,
  Logo : string,
  Location : string,
  AuthorID : string,
  website? : string,
  facebook? : string,
  linkedin? : string,
  twitter? : string
}

export type SalaryType = {
  currency : string,
  min : number,
  max : number
}

export type PostType = {
  publicID : string,
  title : string,
  description : string,
  summary : string,
  empType : string,
  workMode : string,
  companyID : string,
  author : string,
  salary : SalaryType,
  company : CompanyType,
  CreatedAt : string,
  status? : string
}
