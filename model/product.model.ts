import {Schema,model } from "mongoose";
import type {IProduct} from "../interface/product.interface.js";

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type:String,
      required:true,
      trim:true,
    },

    slug: {
      type:String,
      required:true,
      unique:true,
    },

    description: {
      type:String,
    },

    type: {
      type:String,
      enum: ["MERCH","TICKET"],
      required:true,
    },

    price: {
      type:Number,
      required:true,
      min:0,
    },

    currency: {
      type:String,
      default:"INR",
    },

    stock: {
      type:Number,
      default:0,
    },

    isUnlimitedStock: {
      type:Boolean,
      default:false,
    },

    images: {
      type: [String],
      default: [],
    },

    sizes: {
      type: [String],
      default: [],
    },

    isActive: {
      type:Boolean,
      default:true,
    },
  },
  {
    timestamps:true,
  }
);

export const ProductModel = model<IProduct>("Product",ProductSchema);