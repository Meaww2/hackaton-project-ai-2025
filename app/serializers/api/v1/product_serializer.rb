module Api
  module V1
    class ProductSerializer
      ATTRIBUTES = %i[id sku name unit reorder_level stock_on_hand].freeze

      def initialize(product)
        @product = product
      end

      def as_json(_options = nil)
        @product.slice(*ATTRIBUTES).merge(status: @product.status)
      end
    end
  end
end
