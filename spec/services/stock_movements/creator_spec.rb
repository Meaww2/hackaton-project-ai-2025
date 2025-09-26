require 'rails_helper'

RSpec.describe StockMovements::Creator do
  let(:product) { Product.create!(sku: 'SKU-SVC', name: 'Service Product', reorder_level: 5, stock_on_hand: 10) }

  describe '#call' do
    it 'creates an IN movement and increases stock_on_hand' do
      creator = described_class.new(product: product, params: { kind: 'IN', quantity: 5, reference: 'svc', moved_at: Time.current })

      expect { creator.call }.to change(StockMovement, :count).by(1)
      expect(creator).to be_truthy
      expect(product.reload.stock_on_hand).to eq(15)
    end

    it 'creates an OUT movement and decreases stock_on_hand' do
      creator = described_class.new(product: product, params: { kind: 'OUT', quantity: 4, reference: 'svc', moved_at: Time.current })

      expect { creator.call }.to change(StockMovement, :count).by(1)
      expect(product.reload.stock_on_hand).to eq(6)
    end

    it 'prevents OUT when it would go negative' do
      creator = described_class.new(product: product, params: { kind: 'OUT', quantity: 20, reference: 'svc', moved_at: Time.current })

      expect { creator.call }.not_to change(StockMovement, :count)
      expect(creator.movement.errors[:base]).to include('OUT would go negative')
      expect(product.reload.stock_on_hand).to eq(10)
    end
  end
end
