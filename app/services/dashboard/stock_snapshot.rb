module Dashboard
  class StockSnapshot
    LOW_STOCK_LIMIT = 5

    def initialize(low_stock_limit: LOW_STOCK_LIMIT)
      @low_stock_limit = low_stock_limit
    end

    def call
      {
        low_stock: low_stock_products,
        recent_movements: recent_movements
      }
    end

    private

    def low_stock_products
      Product
        .where('stock_on_hand < reorder_level')
        .order('stock_on_hand ASC, reorder_level ASC, name ASC')
        .limit(@low_stock_limit)
        .map do |product|
          {
            id: product.id,
            sku: product.sku,
            name: product.name,
            unit: product.unit,
            stock_on_hand: product.stock_on_hand,
            reorder_level: product.reorder_level
          }
        end
    end

    def recent_movements
      StockMovement
        .includes(:product)
        .recent_first
        .limit(10)
        .map do |movement|
          {
            id: movement.id,
            kind: movement.kind,
            quantity: movement.quantity,
            reference: movement.reference,
            moved_at: movement.moved_at,
            product: {
              id: movement.product_id,
              sku: movement.product.sku,
              name: movement.product.name
            }
          }
        end
    end
  end
end
