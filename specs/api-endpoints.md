# API Endpoints

## Pizza Menu
```
GET /api/pizzas
  - List all active pizzas
  Query params: 
    - inStock (boolean)
    - sortBy (name, price)

GET /api/pizzas/:id
  - Get single pizza details

GET /api/toppings
  - List all available toppings

GET /api/sizes
  - List available sizes
```

## Cart Management
```
GET /api/cart
  - Get current user's cart with items

POST /api/cart/items
  - Add item to cart
  Body: {
    pizzaId,
    sizeId,
    quantity,
    toppings: [toppingId]
  }

PUT /api/cart/items/:itemId
  - Update cart item quantity
  Body: { quantity }

DELETE /api/cart/items/:itemId
  - Remove item from cart

DELETE /api/cart
  - Clear entire cart
```

## Order Management
```
POST /api/orders
  - Create order from cart
  Body: { address }

GET /api/orders/:id
  - Get single order details

PUT /api/orders/:id/cancel
  - Cancel order (if status is pending)
```

## Chat
```
POST /api/chat
  - Handles LLM chat
```

## Response Structures

### Pizza Object
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "price": "decimal",
  "stock": "integer",
  "isActive": "boolean"
}
```

### Cart Object
```json
{
  "id": "uuid",
  "items": [
    {
      "id": "uuid",
      "pizza": {
        "id": "uuid",
        "name": "string",
        "price": "decimal"
      },
      "size": {
        "id": "uuid",
        "name": "string",
        "priceMultiplier": "decimal"
      },
      "quantity": "integer",
      "toppings": [
        {
          "id": "uuid",
          "name": "string",
          "price": "decimal"
        }
      ],
      "totalPrice": "decimal"
    }
  ],
  "totalAmount": "decimal"
}
```

### Order Object
```json
{
  "id": "uuid",
  "status": "string",
  "items": [
    {
      "pizza": "PizzaObject",
      "size": "SizeObject",
      "quantity": "integer",
      "toppings": ["ToppingObject"],
      "unitPrice": "decimal",
      "totalPrice": "decimal"
    }
  ],
  "address": "AddressObject",
  "totalAmount": "decimal",
  "createdAt": "timestamp"
}
```

## Error Responses
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

## Common Error Codes
```
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
409 - Conflict (e.g., insufficient stock)
422 - Validation Error
500 - Internal Server Error
```


## Query Parameters for Pagination
```
GET /api/orders
  - limit: number (default: 10)
  - offset: number (default: 0)
  - status: string (optional)
  - sort: string (optional)
```

## Stock Management Logic
- Stock is checked when:
  1. Adding to cart
  2. Creating order
  3. Updating cart quantities
- Orders reduce stock upon creation
- Cancelled orders return stock
