-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to delete orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to delete order items" ON order_items;

-- Allow authenticated users (admin) to delete orders
CREATE POLICY "Allow authenticated users to delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

-- Allow authenticated users (admin) to delete order items
CREATE POLICY "Allow authenticated users to delete order items"
  ON order_items FOR DELETE
  TO authenticated
  USING (true); 