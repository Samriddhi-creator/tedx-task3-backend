import {Types }from"mongoose";

export interface ICartItem {
  productId:Types.ObjectId;

  productName:string;

  quantity:number;

  selectedSize?:string;

  priceAtPurchase:number;

  productType:"MERCH"|"TICKET";
}

export interface IUserDetails {
  fullName: string;
  email: string;
  phone: string;
}

export interface IDeliveryDetails {
  type: "in-campus" | "out-of-campus";
  hostel?: string;
  roomNumber?: string;
  notes?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface ICart {
  _id?:Types.ObjectId;

  userId:Types.ObjectId;

  customerName?:string;

  items:ICartItem[];

  subtotal:number;

  total:number;

  status:"ORDERED"|"PENDING";

  userDetails?: IUserDetails;
  deliveryDetails?: IDeliveryDetails;

  createdAt?:Date;
  updatedAt?:Date;
}