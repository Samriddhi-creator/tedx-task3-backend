import {Types }from"mongoose";

export interface ICartItem {
  productId:Types.ObjectId;

  quantity:number;

  selectedSize?:string;

  priceAtPurchase:number;

  productType:"MERCH"|"TICKET";
}

export interface ICart {
  _id?:Types.ObjectId;

  userId:Types.ObjectId;

  items:ICartItem[];

  subtotal:number;

  total:number;

  status:"ORDERED"|"PENDING";

  createdAt?:Date;
  updatedAt?:Date;
}