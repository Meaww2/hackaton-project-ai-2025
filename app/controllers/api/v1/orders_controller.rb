# frozen_string_literal: true

module Api
  module V1
    class OrdersController < Api::ApplicationController
      before_action :set_order, only: %i[show update destroy]

      # GET /api/v1/orders
      def index
        orders = Order.includes(:product, :user).all
        render json: orders.as_json(include: { product: { only: %i[id sku name price] },
                                               user: { only: %i[id email] } }),
               status: :ok
      end

      # GET /api/v1/orders/:id
      def show
        render json: @order.as_json(include: { product: { only: %i[id sku name price] },
                                               user: { only: %i[id email] } }),
               status: :ok
      end

      # POST /api/v1/orders
      def create
        order = current_user.orders.build(order_params)
        order.total_price = order.product.price * order.quantity

        if order.save
          render json: order.as_json(include: { product: { only: %i[id sku name price] } }),
                 status: :created
        else
          render json: { errors: order.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/orders/:id
      def update
        if @order.update(order_params)
          @order.update(total_price: @order.product.price * @order.quantity)
          render json: @order, status: :ok
        else
          render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/orders/:id
      def destroy
        @order.destroy
        head :no_content
      end

      private

      def set_order
        @order = Order.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        handle_request('Order not found', :not_found)
      end

      def order_params
        params.require(:order).permit(:product_id, :quantity, :status)
      end
    end
  end
end
