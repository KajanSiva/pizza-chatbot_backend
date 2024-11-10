1. Pizza Menu Tools
- getPizzas
  - Gets list of available pizzas
  - Uses endpoint from pizza.controller.ts
  - Can include query parameters for filtering in-stock items and sorting
- getPizzaById
  - Gets details of a specific pizza
  - Uses endpoint from pizza.controller.ts
- getToppings
  - Gets list of available toppings
  - Uses endpoint from pizza.controller.ts
- getSizes
  - Gets available pizza sizes
  - Uses endpoint from pizza.controller.ts

2. Cart Management Tools
- createCart
  - Creates a new cart session
  - Uses endpoint from cart.controller.ts
- getCart
  - Retrieves cart contents
  - Uses endpoint from cart.controller.ts
- addItemToCart
  - Adds pizza to cart
  - Uses endpoint from cart.controller.ts
- updateCartItemQuantity
  - Updates quantity of items in cart
  - Uses endpoint from cart.controller.ts
- removeCartItem
  - Removes item from cart
  - Uses endpoint from cart.controller.ts
- clearCart
  - Clears entire cart
  - Uses endpoint from cart.controller.ts

3. Order Management Tools
- createOrder
  - Creates order from cart contents
  - Uses endpoint from order.controller.ts
- getOrder
  - Gets order details
  - Uses endpoint from order.controller.ts
- cancelOrder
  - Cancels an existing order
  - Uses endpoint from order.controller.ts

Each tool should:
1. Handle the API call
2. Process the response
3. Handle potential errors (using the error codes defined in the specs)
4. Return formatted data that's easy for the LLM to understand and respond to the user about

The chatbot would use these tools to:
- Help users browse the menu
- Customize pizzas with toppings
- Manage their cart
- Place and track orders
- Handle order modifications or cancellations