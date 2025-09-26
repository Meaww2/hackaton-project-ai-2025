require 'rails_helper'

RSpec.describe Products::ReorderSuggestion do
  let(:product) do
    Product.create!(sku: 'SKU-SUG', name: 'Suggest Product', unit: 'pcs', reorder_level: 15, stock_on_hand: 4)
  end

  describe '#call' do
    subject(:suggestion) { described_class.new(product: product, window_days: 7).call }

    context 'when there are recent OUT movements' do
      before do
        StockMovement.create!(
          product: product,
          kind: 'OUT',
          quantity: 5,
          reference: 'spec',
          moved_at: 1.day.ago
        )
        product.update!(stock_on_hand: 4)
      end

      it 'returns suggestion including weekly_out and quantity to reach target stock' do
        expect(suggestion.dig(:basis, :weekly_out)).to eq(5)
        expect(suggestion.dig(:suggestion, :quantity)).to eq(16)
      end
    end

    context 'when there are no recent movement outs' do
      it 'suggests replenishing up to reorder level' do
        expect(suggestion.dig(:suggestion, :quantity)).to eq(11)
        expect(suggestion.dig(:basis, :weekly_out)).to eq(0)
      end
    end

    context 'when stock_on_hand already exceeds target' do
      before do
        product.update!(stock_on_hand: 40)
      end

      it 'suggests zero quantity' do
        expect(suggestion.dig(:suggestion, :quantity)).to eq(0)
      end
    end
  end
end
