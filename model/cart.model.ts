import {Schema,model }from "mongoose";
import type {ICart } from "../interface/cart.interface.js";

export const CartItemSchema=new Schema(
  {
    productId: {
      type:Schema.Types.ObjectId,
      ref:"Product",
      required:true,
    },

    productName: {
      type: String,
      required: true,
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

const UserDetailsSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
}, { _id: false });

const DeliveryDetailsSchema = new Schema({
  type: { type: String, enum: ["in-campus", "out-of-campus"], required: true },
  hostel: { type: String },
  roomNumber: { type: String },
  notes: { type: String },
  addressLine: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
}, { _id: false });

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type:Schema.Types.ObjectId,
      required:true,
    },

    customerName: {
      type: String,
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

    userDetails: {
      type: UserDetailsSchema,
    },

    deliveryDetails: {
      type: DeliveryDetailsSchema,
    },
  },
  {
    timestamps:true,
  }
);

CartSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" } }
);

export const CartModel=model<ICart>("Cart",CartSchema);