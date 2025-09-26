class Api::V1::StockMovementsController < ApplicationController
  before_action :set_order, only: [:show, :update]

  # GET /api/v1/stock_movements
  def index
    @orders = Order.includes(:product, :user).order(created_at: :desc).limit(50)
    render json: @orders.as_json(
      include: {
        product: { only: [:sku, :name] },
        user: { only: [:email] }
      },
      only: [:id, :quantity, :total_price, :status, :reference, :created_at]
    )
  end

  # GET /api/v1/stock_movements/:id
  def show
    render json: @order.as_json(
      include: {
        product: { only: [:sku, :name] },
        user: { only: [:email] }
      },
      only: [:id, :quantity, :total_price, :status, :reference, :created_at]
    )
  end

  # POST /api/v1/stock_movements
  def create
    movement_type = params[:movement_type]
    qty = params[:quantity].to_i

    return render json: { error: "Quantity must be greater than 0" }, status: :unprocessable_entity if qty <= 0

    @product = Product.find_or_create_by!(sku: params[:product_code]) do |p|
      p.name = params[:product_name] || "Unnamed Product"
      p.price = params[:price] || 0
      p.stock_on_hand = 0
      p.reorder_level = 0
      p.weekly_out = 0
    end

    if movement_type == "OUT" && @product.stock_on_hand < qty
      return render json: { error: "Insufficient stock. Available: #{@product.stock_on_hand}" }, status: :unprocessable_entity
    end

    total_price = @product.price * qty

    order = Order.new(
      product: @product,
      user: current_user,
      quantity: qty,
      status: movement_type == "IN" ? "received" : "issued",
      reference: params[:reference]
    )

    ActiveRecord::Base.transaction do
      if order.save
        update_stock(@product, movement_type, qty)
        render_order(order, :created)
      else
        render json: { errors: order.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end

  private

  def set_order
    @order = Order.includes(:product, :user).find(params[:id])
  end

  def render_order(order, status)
    render json: order.as_json(
      include: { product: { only: [:sku, :name] }, user: { only: [:email] } },
      only: [:id, :quantity, :total_price, :status, :reference, :created_at]
    ), status: status
  end

  def update_stock(product, movement_type, qty)
    if movement_type == "IN"
      product.increment!(:stock_on_hand, qty)
    elsif movement_type == "OUT"
      product.decrement!(:stock_on_hand, qty)
      product.increment!(:weekly_out, qty)
    end
  end

  def rollback_stock(product, old_status, qty)
    if old_status == "received"
      product.decrement!(:stock_on_hand, qty)
    elsif old_status == "issued"
      product.increment!(:stock_on_hand, qty)
      product.decrement!(:weekly_out, qty)
    end
  end
end
