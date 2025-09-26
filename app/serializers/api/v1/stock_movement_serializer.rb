module Api
  module V1
    class StockMovementSerializer
      ATTRIBUTES = %i[id kind quantity reference moved_at created_at].freeze

      def initialize(stock_movement)
        @stock_movement = stock_movement
      end

      def as_json(_options = nil)
        @stock_movement.slice(*ATTRIBUTES).merge(
          product: {
            id: @stock_movement.product_id,
            sku: @stock_movement.product.sku,
            name: @stock_movement.product.name
          }
        )
      end
    end
  end
end
