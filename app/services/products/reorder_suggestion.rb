module Products
  class ReorderSuggestion
    DEFAULT_WINDOW_DAYS = 7

    def initialize(product:, window_days: DEFAULT_WINDOW_DAYS)
      @product = product
      @window_days = window_days
    end

    def call
      weekly_out = recent_out_quantity
      target_stock = [@product.reorder_level, 0].max + weekly_out
      suggested_quantity = [target_stock - @product.stock_on_hand, 0].max

      {
        product: product_payload,
        suggestion: {
          quantity: suggested_quantity
        },
        basis: {
          window_days: @window_days,
          weekly_out: weekly_out,
          reorder_level: @product.reorder_level,
          stock_on_hand: @product.stock_on_hand
        }
      }
    end

    private

    def recent_out_quantity
      from = Time.zone.now - @window_days.days
      @product
        .stock_movements
        .where(kind: 'OUT')
        .where('moved_at >= ?', from)
        .sum(:quantity)
        .to_i
    end

    def product_payload
      {
        id: @product.id,
        sku: @product.sku,
        name: @product.name,
        unit: @product.unit,
        stock_on_hand: @product.stock_on_hand,
        reorder_level: @product.reorder_level
      }
    end
  end
end
