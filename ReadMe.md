# TedX Cart API

This repository exposes a cart API for adding, updating, removing, clearing, and fetching a user's cart.

## Base Route

All cart routes are mounted under `/cart`.

## Common Response Shape

The API now follows a consistent response format across cart endpoints:

```json
{
	"success": true,
	"message": "Human readable message",
	"data": null
}
```

For errors:

```json
{
	"success": false,
	"message": "Human readable error message",
	"data": null
}
```

`data` is always present. It contains either the returned resource, a small metadata object, or `null`.
Cart fetch/add/update/remove endpoints return the full cart object. Cart clear returns deletion metadata.

## Cart Data Model

### Cart Object

```json
{
	"_id": "ObjectId",
	"userId": "ObjectId",
	"items": [],
	"subtotal": 0,
	"total": 0,
	"status": "PENDING | ORDERED",
	"createdAt": "ISODate",
	"updatedAt": "ISODate"
}
```

### Cart Item Object

```json
{
	"productId": "ObjectId",
	"quantity": 1,
	"selectedSize": "M",
	"priceAtPurchase": 499,
	"productType": "MERCH | TICKET"
}
```

## Frontend Contract

The frontend should always send valid MongoDB ObjectId values for `userId` and should expect the cart fetch endpoint to refresh `priceAtPurchase` from the current `Product.price` before the cart is returned.

If a cart is not `PENDING`, the backend deletes it and returns a non-success cart-status response instead of cart data.

## Endpoints

### 1. Get Cart for a User

`GET /cart/:userId`

Fallback supported: `GET /cart?userId=...`

#### Purpose

Fetches the cart for the given user, refreshes item prices from the product collection, recalculates totals, saves the updated cart, and returns the data.

#### Frontend Sends

No body is required when using the path parameter.

Optional fallback query:

```json
{
	"userId": "66b..."
}
```

#### Successful Response

```json
{
	"success": true,
	"message": "Cart fetched successfully",
	"data": {
		"_id": "...",
		"userId": "...",
		"items": [
			{
				"productId": "...",
				"quantity": 2,
				"selectedSize": "M",
				"priceAtPurchase": 499,
				"productType": "MERCH"
			}
		],
		"subtotal": 998,
		"total": 998,
		"status": "PENDING"
	}
}
```

#### Non-Pending Cart Response

If the cart status is not `PENDING`, the backend deletes the cart and returns:

```json
{
	"success": false,
	"message": "Cart is not pending and was removed",
	"data": null
}
```

#### Common Errors

```json
{
	"success": false,
	"message": "Invalid or missing User ID"
}
```

```json
{
	"success": false,
	"message": "Cart not found"
}
```

### 2. Add Item To Cart

`POST /cart/add`

#### Frontend Sends

```json
{
	"userId": "66b...",
	"productId": "product-slug",
	"quantity": 2,
	"productType": "MERCH",
	"selectedSize": "M"
}
```

#### Required Fields

- `userId`
- `productId` as product slug
- `quantity`
- `productType`
- `selectedSize` for `MERCH` products

#### Successful Response

```json
{
	"success": true,
	"message": "Item added to cart successfully",
	"data": {
		"_id": "...",
		"userId": "...",
		"items": [],
		"subtotal": 0,
		"total": 0,
		"status": "PENDING"
	}
}
```

If a new cart is created, the message is:

```json
{
	"success": true,
	"message": "Cart created successfully",
	"data": {
		"_id": "...",
		"userId": "...",
		"items": [],
		"subtotal": 0,
		"total": 0,
		"status": "PENDING"
	}
}
```

### 3. Update Item Quantity

`PATCH /cart/update`

#### Frontend Sends

```json
{
	"userId": "66b...",
	"productId": "product-slug",
	"quantity": 3
}
```

#### Successful Response

```json
{
	"success": true,
	"message": "Cart item updated successfully",
	"data": {
		"_id": "...",
		"userId": "...",
		"items": [],
		"subtotal": 0,
		"total": 0,
		"status": "PENDING"
	}
}
```

### 4. Remove One Item

`DELETE /cart/remove/:productId`

#### Frontend Sends

Request params:

```json
{
	"productId": "product-slug"
}
```

Request body:

```json
{
	"userId": "66b..."
}
```

#### Successful Response

```json
{
	"success": true,
	"message": "Cart item removed successfully",
	"data": {
		"_id": "...",
		"userId": "...",
		"items": [],
		"subtotal": 0,
		"total": 0,
		"status": "PENDING"
	}
}
```

### 5. Clear Entire Cart

`DELETE /cart/clear`

#### Frontend Sends

```json
{
	"userId": "66b..."
}
```

#### Successful Response

```json
{
	"success": true,
	"message": "Cart cleared successfully",
	"data": {
		"deletedCount": 1
	}
}
```

## Product API

All product routes are mounted under `/products`.

### Common Response Shape

```json
{
	"success": true,
	"message": "Products fetched successfully",
	"data": []
}
```

### 1. Get All Products

`GET /products`

#### Frontend Sends

No body required.

#### Successful Response

```json
{
	"success": true,
	"message": "Products fetched successfully",
	"data": [
		{
			"_id": "...",
			"name": "Merch Name",
			"slug": "merch-name",
			"price": 499,
			"type": "MERCH"
		}
	]
}
```

### 2. Get Product By Slug

`GET /products/:id`

#### Frontend Sends

Path param:

```json
{
	"id": "product-slug"
}
```

#### Successful Response

```json
{
	"success": true,
	"message": "Product fetched successfully",
	"data": {
		"_id": "...",
		"name": "Merch Name",
		"slug": "merch-name",
		"price": 499,
		"type": "MERCH"
	}
}
```

## Admin Product API

All admin product routes are mounted under `/admin/products`.

### 1. Create Product

`POST /admin/products`

#### Frontend Sends

```json
{
	"name": "Merch Name",
	"slug": "merch-name",
	"type": "MERCH",
	"price": 499,
	"stock": 10,
	"sizes": "S,M,L",
	"images": "https://example.com/a.jpg,https://example.com/b.jpg"
}
```

`sizes` and `images` may be sent either as comma-separated strings or arrays.

#### Successful Response

```json
{
	"success": true,
	"message": "Product created successfully",
	"data": {
		"_id": "...",
		"name": "Merch Name",
		"slug": "merch-name",
		"type": "MERCH",
		"price": 499,
		"stock": 10
	}
}
```

### 2. Update Product

`PATCH /admin/products/:id`

#### Frontend Sends

```json
{
	"price": 599,
	"stock": 12,
	"images": "https://example.com/c.jpg"
}
```

#### Successful Response

```json
{
	"success": true,
	"message": "Product updated successfully",
	"data": {
		"_id": "...",
		"slug": "merch-name",
		"price": 599,
		"stock": 12
	}
}
```

### 3. Delete Product

`DELETE /admin/products/:id`

#### Frontend Sends

Path param:

```json
{
	"id": "product-slug"
}
```

#### Successful Response

```json
{
	"success": true,
	"message": "Product deleted successfully",
	"data": {
		"deletedCount": 1
	}
}
```

## Notes for Frontend Implementation

- Use `GET /cart/:userId` as the primary fetch route.
- Treat `priceAtPurchase` as the final saved product price for that cart snapshot.
- After every cart mutation, re-fetch the cart so the UI displays the saved totals from the backend.
- Keep request bodies strictly numeric where `quantity` is expected.
- Expect `409` when a cart exists but is no longer pending.

## Validation Status

The cart controller and route files have been aligned with the current TypeScript build and response shape conventions.
