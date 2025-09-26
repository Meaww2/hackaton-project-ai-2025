require 'rails_helper'

RSpec.describe Dashboard::StockSnapshot do
  let!(:healthy_product) do
    Product.create!(sku: 'SKU-OK', name: 'Healthy Product', unit: 'pcs', reorder_level: 10, stock_on_hand: 12)
  end
  let!(:low_stock_products) do
    (1..6).map do |i|
      Product.create!(
        sku: format('SKU-LS-%<n>02d', n: i),
        name: "Low Stock #{i}",
        unit: 'pcs',
        reorder_level: 10,
        stock_on_hand: i - 1
      )
    end
  end
  let!(:movement_product) do
    Product.create!(sku: 'SKU-MOVE', name: 'Movement Product', unit: 'pcs', reorder_level: 5, stock_on_hand: 40)
  end
  let!(:movements) do
    Array.new(12) do |index|
      params = {
        kind: index.even? ? 'OUT' : 'IN',
        quantity: 1 + (index % 3),
        reference: "spec-#{index}",
        moved_at: Time.zone.now - index.hours
      }
      StockMovements::Creator.new(product: movement_product, params: params).tap(&:call).movement
    end
  end

  describe '#call' do
    subject(:snapshot) { described_class.new.call }

    it 'returns up to 5 low-stock products ordered by stock_on_hand asc' do
      low_stock = snapshot.fetch(:low_stock)

      expect(low_stock.length).to eq(5)
      expect(low_stock.map { |item| item.fetch(:sku) }).to eq(%w[SKU-LS-01 SKU-LS-02 SKU-LS-03 SKU-LS-04 SKU-LS-05])
      expect(low_stock.map { |item| item.fetch(:stock_on_hand) }).to eq([0, 1, 2, 3, 4])
    end

    it 'returns the 10 most recent movements with product info' do
      recent_movements = snapshot.fetch(:recent_movements)

      expect(recent_movements.length).to eq(10)
      expect(recent_movements.first.fetch(:id)).to eq(movements.first.id)
      expect(recent_movements.first.fetch(:product).fetch(:sku)).to eq('SKU-MOVE')
      expect(recent_movements.last.fetch(:id)).to eq(movements[9].id)
    end
  end
end
