import {Schema,model }from "mongoose";
import type {ICart } from "../interface/cart.interface.js";

export const CartItemSchema=new Schema(
  {
    productId: {
      type:Schema.Types.ObjectId,
      ref:"Product",
      required:true,
    },

    quantity: {
      type:Number,
      required:true,
      min:1,
    },

    selectedSize: {
      type:String,
    },

    priceAtPurchase: {
      type:Number,
      required:true,
    },

    productType: {
      type:String,
      enum: ["MERCH","TICKET"],
      required:true,
    },
  },
  {
    _id:false,
  }
);

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type:Schema.Types.ObjectId,
      required:true,
      unique:true,
      index:true,
    },

    items: {
      type: [CartItemSchema],
      default: [],
    },

    subtotal: {
      type:Number,
      default:0,
    },

    total: {
      type:Number,
      default:0,
    },

    status:{
      type:String,
      enum:["ORDERED","PENDING"],
      default:"PENDING",
    },
  },
  {
    timestamps:true,
  }
);


export const CartModel=model<ICart>("Cart",CartSchema);