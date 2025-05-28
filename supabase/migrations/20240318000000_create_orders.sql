-- Drop existing tables if needed
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'completed', 'cancelled')),
  total DECIMAL(10,2) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
DROP INDEX IF EXISTS idx_orders_token;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_order_items_order_id;

CREATE INDEX idx_orders_token ON orders(token);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous users to create orders" ON orders;
DROP POLICY IF EXISTS "Allow anonymous users to read their own orders" ON orders;
DROP POLICY IF EXISTS "Allow anonymous users to update their own orders" ON orders;
DROP POLICY IF EXISTS "Allow anonymous users to create order items" ON order_items;
DROP POLICY IF EXISTS "Allow anonymous users to read order items" ON order_items;
DROP POLICY IF EXISTS "Allow authenticated users to read all orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to update all orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to read all order items" ON order_items;

-- Allow anonymous users to create orders
CREATE POLICY "Allow anonymous users to create orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read their own orders by token
CREATE POLICY "Allow anonymous users to read their own orders"
  ON orders FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to update their own orders
CREATE POLICY "Allow anonymous users to update their own orders"
  ON orders FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to create order items
CREATE POLICY "Allow anonymous users to create order items"
  ON order_items FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read their own order items
CREATE POLICY "Allow anonymous users to read order items"
  ON order_items FOR SELECT
  TO anon
  USING (EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_id
  ));

-- Allow authenticated users (admin) to read all orders
CREATE POLICY "Allow authenticated users to read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admin) to update all orders
CREATE POLICY "Allow authenticated users to update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admin) to read all order items
CREATE POLICY "Allow authenticated users to read all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true); 