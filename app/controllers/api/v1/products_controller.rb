# frozen_string_literal: true

module Api
  module V1
    class ProductsController < Api::ApplicationController
      before_action :set_product, only: %i[show update destroy]

      # GET /api/v1/products
      def index
        products = Product.all
        render json: products, status: :ok
      end

      # GET /api/v1/products/:id
      def show
        render json: @product, status: :ok
      end

      # POST /api/v1/products
      def create
        product = Product.new(product_params)
        if product.save
          render json: product, status: :created
        else
          render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/products/:id
      def update
        if @product.update(product_params)
          render json: @product, status: :ok
        else
          render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/products/:id
      def destroy
        @product.destroy
        head :no_content
      end

      private

      def set_product
        @product = Product.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        handle_request('Product not found', :not_found)
      end

      def product_params
        params.require(:product).permit(
          :sku, :name, :description, :price,
          :stock_on_hand, :reorder_level, :weekly_out,
          :min_order_quantity
        )
      end
    end
  end
end
