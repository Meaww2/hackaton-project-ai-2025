module Api
  module V1
    class StockMovementsController < BaseController
      DEFAULT_LIMIT = 20
      MAX_LIMIT = 100

      def index
        authorize! :read, StockMovement
        movements = StockMovement.includes(:product).recent_first
        movements = movements.where(product_id: params[:product_id]) if params[:product_id].present?
        movements = movements.limit(limit_param)

        render json: movements.map { |movement| serialize(movement) }
      end

      def create
        authorize! :create, StockMovement
        product = Product.find(movement_params.fetch(:product_id))
        attributes = movement_params.except(:product_id)
        attributes[:kind] = attributes[:kind].to_s.upcase

        creator = StockMovements::Creator.new(product: product, params: attributes)

        if creator.call
          render json: serialize(creator.movement), status: :created
        else
          render_validation_error(creator.movement)
        end
      end

      private

      def movement_params
        params.require(:movement).permit(:product_id, :kind, :quantity, :reference, :moved_at)
      end

      def limit_param
        requested = params[:limit].to_i
        requested = DEFAULT_LIMIT unless requested.positive?
        [requested, MAX_LIMIT].min
      end

      def serialize(movement)
        Api::V1::StockMovementSerializer.new(movement).as_json
      end
    end
  end
end
