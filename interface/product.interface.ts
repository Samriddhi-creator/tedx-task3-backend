import {Types } from "mongoose";

export interface IProduct {
  _id?:Types.ObjectId;

  name:string;

  slug:string;

  description?:string;

  type:"MERCH"|"TICKET";

  price:number;

  currency:string;

  stock:number;

  isUnlimitedStock:boolean;

  images:string[];

  sizes?:string[];

  isActive:boolean;

  createdAt?:Date;
  updatedAt?:Date;
}