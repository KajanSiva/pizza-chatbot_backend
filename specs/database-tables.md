# Database Specification

## Core Tables

### Pizza
| Column      | Type      | Constraints       | Description                    |
|-------------|-----------|-------------------|--------------------------------|
| id          | UUID      | PK               | Primary key                    |
| name        | STRING    | NOT NULL         | Pizza name                     |
| description | TEXT      |                  | Pizza description              |
| price       | DECIMAL   | NOT NULL         | Base price                     |
| stock       | INTEGER   | NOT NULL         | Available units                |
| is_active   | BOOLEAN   | DEFAULT true     | Whether pizza can be ordered   |
| created_at  | TIMESTAMP | DEFAULT now()    | Record creation timestamp      |

### Sizes
| Column           | Type    | Constraints | Description                    |
|------------------|---------|-------------|--------------------------------|
| id               | UUID    | PK          | Primary key                    |
| name             | STRING  | NOT NULL    | Size name (small/medium/large) |
| price_multiplier | DECIMAL | NOT NULL    | Price multiplier for size      |

### PizzaTopping
| Column     | Type      | Constraints    | Description                    |
|------------|-----------|----------------|--------------------------------|
| id         | UUID      | PK            | Primary key                    |
| name       | STRING    | NOT NULL      | Topping name                   |
| price      | DECIMAL   | NOT NULL      | Additional price               |
| is_active  | BOOLEAN   | DEFAULT true  | Whether topping is available   |

## Order Management

### Orders
| Column       | Type      | Constraints           | Description                    |
|--------------|-----------|----------------------|--------------------------------|
| id           | UUID      | PK                  | Primary key                    |
| client_name  | STRING    | NOT NULL            | Client name                    |
| address_id   | UUID      | FK (Addresses)      | Delivery address               |
| status       | STRING    | NOT NULL            | Order status                   |
| total_amount | DECIMAL   | NOT NULL            | Total order amount             |
| created_at   | TIMESTAMP | DEFAULT now()       | Record creation timestamp      |

### OrderItems
| Column      | Type      | Constraints        | Description                    |
|-------------|-----------|-------------------|--------------------------------|
| id          | UUID      | PK               | Primary key                    |
| order_id    | UUID      | FK (Orders)      | Reference to order            |
| pizza_id    | UUID      | FK (Pizza)       | Reference to pizza            |
| size_id     | UUID      | FK (Sizes)       | Reference to size             |
| quantity    | INTEGER   | NOT NULL         | Number of items               |
| unit_price  | DECIMAL   | NOT NULL         | Price at time of order        |
| created_at  | TIMESTAMP | DEFAULT now()    | Record creation timestamp     |

### OrderItemToppings
| Column        | Type | Constraints           | Description                    |
|---------------|------|----------------------|--------------------------------|
| id            | UUID | PK                  | Primary key                    |
| order_item_id | UUID | FK (OrderItems)     | Reference to order item        |
| topping_id    | UUID | FK (PizzaTopping)   | Reference to topping          |

## Cart Management

### Carts
| Column     | Type      | Constraints     | Description                    |
|------------|-----------|----------------|--------------------------------|
| id         | UUID      | PK            | Primary key                    |
| created_at | TIMESTAMP | DEFAULT now() | Record creation timestamp      |

### CartItems
| Column     | Type      | Constraints     | Description                    |
|------------|-----------|----------------|--------------------------------|
| id         | UUID      | PK            | Primary key                    |
| cart_id    | UUID      | FK (Carts)    | Reference to cart              |
| pizza_id   | UUID      | FK (Pizza)    | Reference to pizza             |
| size_id    | UUID      | FK (Sizes)    | Reference to size              |
| quantity   | INTEGER   | NOT NULL      | Number of items                |
| created_at | TIMESTAMP | DEFAULT now() | Record creation timestamp      |

### CartItemToppings
| Column        | Type | Constraints          | Description                    |
|---------------|------|---------------------|--------------------------------|
| id            | UUID | PK                 | Primary key                    |
| cart_item_id  | UUID | FK (CartItems)     | Reference to cart item         |
| topping_id    | UUID | FK (PizzaTopping)  | Reference to topping          |


## Status Values

### Order Status Options
- `pending`: Initial state when order is created
- `preparing`: Order is being prepared in kitchen
- `delivered`: Order has been delivered
- `cancelled`: Order was cancelled

## Indexes

### Performance Indexes
```sql
CREATE INDEX idx_order_items_order ON OrderItems(order_id);
CREATE INDEX idx_cart_items_cart ON CartItems(cart_id);
```

## Key Relationships


1. **Order Related**
   - Order has many OrderItems

2. **Cart Related**
   - Cart has many CartItems
   - CartItems have many Toppings

3. **Pizza Related**
   - Pizza has many OrderItems
   - Pizza has many CartItems
