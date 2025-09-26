require 'rails_helper'

RSpec.describe StockMovement, type: :model do
  let(:product) { Product.create!(sku: 'SKU-TEST', name: 'Test Product', reorder_level: 5) }

  describe 'validations' do
    it 'is valid with valid attributes' do
      movement = described_class.new(product: product, kind: 'IN', quantity: 5, moved_at: Time.current)

      expect(movement).to be_valid
    end

    it 'requires a kind within IN/OUT' do
      movement = described_class.new(product: product, kind: 'INVALID', quantity: 3, moved_at: Time.current)

      expect(movement).not_to be_valid
      expect(movement.errors[:kind]).to include('is not included in the list')
    end

    it 'requires quantity to be positive' do
      movement = described_class.new(product: product, kind: 'IN', quantity: 0, moved_at: Time.current)

      expect(movement).not_to be_valid
      expect(movement.errors[:quantity]).to include('must be greater than 0')
    end

    it 'sets moved_at automatically when missing' do
      movement = described_class.create!(product: product, kind: 'IN', quantity: 1)

      expect(movement.moved_at).to be_present
    end
  end

  describe '.recent_first' do
    it 'orders by moved_at descending' do
      older = described_class.create!(product: product, kind: 'IN', quantity: 1, moved_at: 2.days.ago)
      newer = described_class.create!(product: product, kind: 'IN', quantity: 1, moved_at: 1.day.ago)

      expect(described_class.recent_first).to eq([newer, older])
    end
  end
end
