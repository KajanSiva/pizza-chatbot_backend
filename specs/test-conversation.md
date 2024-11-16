# Test Conversation Flow for Pizza Order Creation

1. Initial Menu Browse:
"What pizzas do you have available?"
- This will trigger getPizzasTool
- Helps verify available options

2. Add to Cart:
"I'd like to order a Margherita pizza, medium size"
- This will trigger:
  - createCartTool (if no cart exists)
  - getPizzas (to get pizza UUID)
  - getSizes (to get size UUID)
  - addItemToCart

3. Check Cart:
"What's in my cart?"
- This triggers getCartTool
- Verifies the item was added correctly

4. Optional Add More:
"Can I add a large Pepperoni pizza too?"
- Similar flow to step 2, but won't create new cart

5. Final Cart Check:
"Show me my cart one more time"
- Verifies all items are present

6. Place Order:
"I'd like to place my order now"
- Assistant should ask for delivery details

7. Provide Details:
"Here's my delivery info:
Name: John Smith
Address: 123 Pizza Street
City: New York
Postal Code: 12345"
- This will trigger createOrderTool

8. Check Order Status:
"Can you show me my order status?"
- This triggers getOrderTool
- Verifies order was created successfully

Optional Test Cases:

9. Cancel Order:
"I need to cancel my order"
- This triggers cancelOrderTool
- Only works if order is still pending

10. Error Cases:
"Place order" (with empty cart)
- Should show appropriate error message

"Deliver to: 123"
- Should prompt for complete address information

"Cancel order XYZ"
- Should handle non-existent order gracefully