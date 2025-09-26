module Api
  module V1
    class ProductsController < BaseController
      DEFAULT_PER_PAGE = 10
      MAX_PER_PAGE = 100
      SORTABLE_COLUMNS = %w[sku name unit reorder_level stock_on_hand created_at].freeze

      def index
        authorize! :read, Product
        products = Product.all
        products = products.low_stock if boolean_param(params[:low_stock])
        products = products.matching_query(params[:query])
        products = products.order(build_ordering)
        products = products.page(page_param).per(per_page_param)

        render json: {
          data: products.map { |product| serialize(product) },
          pagination: pagination_meta(products)
        }
      end

      def create
        authorize! :create, Product
        product = Product.new(product_params)

        if product.save
          render json: serialize(product), status: :created
        else
          render_validation_error(product)
        end
      end

      def update
        product = Product.find(params[:id])
        authorize! :update, product

        if product.update(update_product_params)
          render json: serialize(product)
        else
          render_validation_error(product)
        end
      end

      def reorder_suggestion
        product = find_product_for_suggestion
        authorize! :suggest, product
        suggestion = Products::ReorderSuggestion.new(product: product).call

        render json: suggestion
      rescue ActiveRecord::RecordNotFound => e
        render_not_found(e)
      end

      private

      def product_params
        params.require(:product).permit(:sku, :name, :unit, :reorder_level)
      end

      def update_product_params
        params.require(:product).permit(:name, :unit, :reorder_level)
      end

      def serialize(product)
        Api::V1::ProductSerializer.new(product).as_json
      end

      def find_product_for_suggestion
        identifier = params.require(:product).permit(:id, :sku)

        if identifier[:id].present?
          Product.find(identifier[:id])
        elsif identifier[:sku].present?
          Product.find_by!('UPPER(sku) = ?', identifier[:sku].to_s.strip.upcase)
        else
          raise ActiveRecord::RecordNotFound, 'Product not found'
        end
      end

      def pagination_meta(scope)
        {
          current_page: scope.current_page,
          per_page: scope.limit_value,
          total_pages: scope.total_pages,
          total_count: scope.total_count
        }
      end

      def build_ordering
        column = sort_column
        direction = sort_direction
        arel_column = Product.arel_table[column]

        direction == 'asc' ? arel_column.asc : arel_column.desc
      end

      def sort_column
        requested = params[:sort_column].to_s
        return requested if SORTABLE_COLUMNS.include?(requested)

        'sku'
      end

      def sort_direction
        direction = params[:sort_direction].to_s.downcase
        return direction if %w[asc desc].include?(direction)

        'asc'
      end

      def page_param
        page = params[:page].to_i
        page.positive? ? page : 1
      end

      def per_page_param
        per_page = params[:per_page].to_i
        per_page = DEFAULT_PER_PAGE unless per_page.positive?
        [[per_page, 1].max, MAX_PER_PAGE].min
      end
    end
  end
end
