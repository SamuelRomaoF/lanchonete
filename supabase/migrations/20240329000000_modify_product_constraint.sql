-- Modify the foreign key constraint on order_items to SET NULL on product deletion
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES products(id) 
    ON DELETE SET NULL; 