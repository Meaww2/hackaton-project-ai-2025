module StockMovements
  class Creator
    attr_reader :movement

    def initialize(product:, params: {})
      @product = product
      @params = params
      @movement = build_movement
    end

    def call
      ActiveRecord::Base.transaction do
        @product.lock!
        validate_stock!
        update_stock_on_hand!
        @movement.save!
      end

      true
    rescue ActiveRecord::RecordInvalid
      false
    end

    private

    def build_movement
      StockMovement.new(@params.merge(product: @product))
    end

    def validate_stock!
      raise ActiveRecord::RecordInvalid, @movement unless @movement.valid?

      return unless @movement.kind == 'OUT'

      projected = @product.stock_on_hand.to_i - @movement.quantity
      return if projected >= 0

      @movement.errors.add(:base, 'OUT would go negative')
      @movement.errors.add(:quantity, 'exceeds stock on hand')
      @movement.errors.add(:stock_on_hand, "available #{@product.stock_on_hand}")
      raise ActiveRecord::RecordInvalid, @movement
    end

    def update_stock_on_hand!
      delta = @movement.kind == 'OUT' ? -@movement.quantity : @movement.quantity
      @product.update!(stock_on_hand: @product.stock_on_hand.to_i + delta)
    end
  end
end
