import express from "express";

import { CartModel } from "../model/cart.model.js";
import { ProductModel } from "../model/product.model.js";
import { parseObjectId, sendError, sendSuccess } from "../scripts/controllerHelpers.js";

export async function getCartHandler(
  req: express.Request,
  res: express.Response,
) {
  const userId = req.params.userId ?? req.query.userId ?? req.body?.userId;
  const oid = parseObjectId(userId);

  if (!oid) {
    return sendError(res, 400, "Invalid or missing User ID");
  }

  try {
    const cart = await CartModel.findOne({ userId: oid, status: "PENDING" });

    if (!cart) {
      return sendError(res, 404, "Cart not found");
    }

    if (cart.items.length > 0) {
      const productIds = cart.items.map((item) => item.productId);
      const products = await ProductModel.find({ _id: { $in: productIds } }).select(
        "_id price",
      );

      const priceByProductId = new Map(
        products.map((product) => [product._id.toString(), product.price]),
      );

      let subtotal = 0;

      for (const item of cart.items) {
        const currentPrice = priceByProductId.get(item.productId.toString());

        if (typeof currentPrice === "number") {
          item.priceAtPurchase = currentPrice;
        }

        subtotal += item.quantity * item.priceAtPurchase;
      }

      cart.subtotal = subtotal;
      cart.total = subtotal;
      await cart.save();
    }

    return sendSuccess(res, 200, "Cart fetched successfully", cart);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return sendError(res, 500, err.message);
    }

    return sendError(res, 500, "Unknown Error");
  }
}
export async function addItemHandler(
  req: express.Request,
  res: express.Response,
) {
  const body = req.body;
  if (!body.userId || !body.productId || !body.quantity || !body.productType) {
    return sendError(res, 400, "Missing required data to add in cart");
  }

  try {
    const product = await ProductModel.findOne({ slug: body.productId });
    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    if (product.type === "MERCH" && product.sizes && product.sizes.length > 0) {
      if (!body.selectedSize) {
        return sendError(res, 400, "Missing size for merch product");
      }
      if (!product.sizes.includes(body.selectedSize)) {
        return sendError(res, 400, "Invalid size selected");
      }
    }

    const quantity = Number(body.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) {
      return sendError(res, 400, "Invalid quantity");
    }

    const oid = parseObjectId(body.userId);
    if (!oid) {
      return sendError(res, 400, "Invalid User ID");
    }

    const cart = await CartModel.findOne({ userId: oid, status: "PENDING" });
    const existingItem = cart ? cart.items.find((item) =>
      item.productId.equals(product._id) &&
      (item.selectedSize === body.selectedSize || (!item.selectedSize && !body.selectedSize))
    ) : null;

    const cumulativeQty = (existingItem?.quantity || 0) + quantity;
    if (product.stock < cumulativeQty && !product.isUnlimitedStock) {
      return sendError(res, 400, "Exceeds available stock");
    }

    const cartItem = {
      productId: product._id,
      productName: product.name,
      quantity,
      productType: product.type,
      priceAtPurchase: product.price,
      selectedSize: body.selectedSize,
    };

    if (!cart) {
      const newCart = await CartModel.create({
        userId: oid,
        customerName: body.customerName,
        items: [cartItem],
        subtotal: product.price * quantity,
        total: product.price * quantity,
      });

      return sendSuccess(res, 201, "Cart created successfully", newCart);
    }

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push(cartItem);
    }

    cart.subtotal += product.price * quantity;
    cart.total += product.price * quantity;

    await cart.save();
    return sendSuccess(res, 200, "Item added to cart successfully", cart);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return sendError(res, 500, err.message);
    }

    return sendError(res, 500, "Unknown Error");
  }
}

export async function updateItemHandler(
  req: express.Request,
  res: express.Response,
) {
  const body = req.body;
  if (!body.userId || !body.productId || !body.quantity) {
    return sendError(res, 400, "Incomplete data provided");
  }

  const oid = parseObjectId(body.userId);
  if (!oid) {
    return sendError(res, 400, "Invalid User ID");
  }
  try {
    const cart = await CartModel.findOne({
      userId: oid,
      status: "PENDING",
    });
    if (!cart)
      return sendError(res, 404, "Cart not found for user");
    const prod = await ProductModel.findOne({ slug: body.productId });
    if (!prod) {
      return sendError(res, 404, "Product not found");
    }

    const qty = Number(body.quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return sendError(res, 400, "Invalid quantity");
    }

    if (prod.stock < qty && !prod.isUnlimitedStock) {
      return sendError(res, 400, "Exceeds available stock");
    }

    const targetItem = cart.items.find((item) =>
      item.productId.equals(prod._id) &&
      (item.selectedSize === body.selectedSize || (!item.selectedSize && !body.selectedSize))
    );
    if (!targetItem) {
      return sendError(res, 404, "Item not found in cart");
    }

    targetItem.quantity = qty;
    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.priceAtPurchase,
      0,
    );
    cart.total = cart.subtotal;

    await cart.save();
    return sendSuccess(res, 200, "Cart item updated successfully", cart);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return sendError(res, 400, err.message);
    }
    return sendError(res, 500, "Unknown Error");
  }
}

export async function clearCartHandler(
  req: express.Request,
  res: express.Response,
) {
  const userId = req.body.userId;

  if (!userId) {
    return sendError(res, 400, "No User ID given");
  }

  const oid = parseObjectId(userId);
  if (!oid) {
    return sendError(res, 400, "Invalid User ID");
  }

  try {
    const result = await CartModel.deleteOne({ userId: oid, status: "PENDING" });
    return sendSuccess(res, 200, "Cart cleared successfully", {
      deletedCount: result.deletedCount,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return sendError(res, 500, err.message);
    }
    return sendError(res, 500, "Unknown Deletion Error");
  }
}

export async function removeItemHandler(
  req: express.Request,
  res: express.Response,
) {
  try {
    const productId = req.params.productId;
    const userId = req.body.userId;
    const selectedSize = req.body.selectedSize;

    if (!userId) {
      return sendError(res, 400, "No User ID given");
    }
    if (!productId) {
      return sendError(res, 400, "No Product ID given");
    }

    const oid = parseObjectId(userId);
    if (!oid) {
      return sendError(res, 400, "Invalid User ID");
    }

    const cart = await CartModel.findOne({ userId: oid, status: "PENDING" });
    if (!cart) return sendError(res, 404, "Cart not found for user");

    const prod = await ProductModel.findOne({ slug: productId });
    if (!prod) return sendError(res, 404, "Product not available");

    const newItems = cart.items.filter((item) =>
      !(item.productId.equals(prod._id) && (item.selectedSize === selectedSize || (!item.selectedSize && !selectedSize)))
    );

    cart.items = newItems;
    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.priceAtPurchase,
      0,
    );
    cart.total = cart.subtotal;
    await cart.save();
    return sendSuccess(res, 200, "Cart item removed successfully", cart);

  } catch (err: unknown) {
    if (err instanceof Error) {
      return sendError(res, 500, err.message);
    }
    return sendError(res, 500, "Unknown Deletion Error");
  }
}

export async function checkoutHandler(
  req: express.Request,
  res: express.Response,
) {
  const { userId, userDetails, deliveryDetails } = req.body;
  if (!userId || !userDetails || !deliveryDetails) {
    return sendError(res, 400, "Missing required parameters for checkout");
  }

  const oid = parseObjectId(userId);
  if (!oid) {
    return sendError(res, 400, "Invalid User ID");
  }

  try {
    const cart = await CartModel.findOne({ userId: oid, status: "PENDING" });
    if (!cart) {
      return sendError(res, 404, "No active cart found for this user");
    }

    if (cart.items.length === 0) {
      return sendError(res, 400, "Cart is empty");
    }

    // Update cart to ORDERED and save details
    cart.status = "ORDERED";
    cart.customerName = userDetails.fullName;
    cart.userDetails = userDetails;
    cart.deliveryDetails = deliveryDetails;

    await cart.save();

    return sendSuccess(res, 200, "Checkout completed successfully", cart);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return sendError(res, 500, err.message);
    }
    return sendError(res, 500, "Unknown Error during checkout");
  }
}
