require 'rails_helper'

RSpec.describe Product, type: :model do
  describe 'validations' do
    subject(:product) do
      described_class.new(sku: 'SKU-001', name: 'Widget', unit: 'pcs', reorder_level: 5, stock_on_hand: 2)
    end

    it 'is valid with valid attributes' do
      expect(product).to be_valid
    end

    it 'requires a SKU' do
      product.sku = ''
      expect(product).not_to be_valid
      expect(product.errors[:sku]).to include("can't be blank")
    end

    it 'requires SKU to be unique (case insensitive)' do
      described_class.create!(sku: 'SKU-001', name: 'Existing', unit: 'pcs', reorder_level: 5, stock_on_hand: 1)
      duplicate = described_class.new(sku: 'sku-001', name: 'Duplicate', unit: 'pcs', reorder_level: 5, stock_on_hand: 1)

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:sku]).to include('has already been taken')
    end

    it 'requires a name' do
      product.name = ''
      expect(product).not_to be_valid
      expect(product.errors[:name]).to include("can't be blank")
    end

    it 'requires reorder_level to be >= 0' do
      product.reorder_level = -1
      expect(product).not_to be_valid
      expect(product.errors[:reorder_level]).to include('must be greater than or equal to 0')
    end

    it 'requires stock_on_hand to be >= 0' do
      product.stock_on_hand = -3
      expect(product).not_to be_valid
      expect(product.errors[:stock_on_hand]).to include('must be greater than or equal to 0')
    end
  end

  describe 'scopes' do
    let!(:low_stock_product) { described_class.create!(sku: 'LOW-1', name: 'Low Stock', unit: 'pcs', reorder_level: 10, stock_on_hand: 2) }
    let!(:ok_product) { described_class.create!(sku: 'OK-1', name: 'Healthy Stock', unit: 'pcs', reorder_level: 5, stock_on_hand: 10) }

    describe '.low_stock' do
      it 'returns products where stock_on_hand is below reorder_level' do
        expect(described_class.low_stock).to contain_exactly(low_stock_product)
      end
    end

    describe '.matching_query' do
      it 'returns all products when query blank' do
        expect(described_class.matching_query(nil)).to contain_exactly(low_stock_product, ok_product)
      end

      it 'matches SKU case-insensitively' do
        results = described_class.matching_query('low-1')
        expect(results).to contain_exactly(low_stock_product)
      end

      it 'matches by name' do
        results = described_class.matching_query('healthy')
        expect(results).to contain_exactly(ok_product)
      end
    end
  end

  describe '#status' do
    it 'returns :low when stock_on_hand < reorder_level' do
      product = described_class.new(stock_on_hand: 1, reorder_level: 3)
      expect(product.status).to eq(:low)
    end

    it 'returns :ok when stock_on_hand >= reorder_level' do
      product = described_class.new(stock_on_hand: 5, reorder_level: 5)
      expect(product.status).to eq(:ok)
    end
  end

  describe 'callbacks' do
    it 'normalizes SKU by stripping and uppercasing' do
      product = described_class.create!(sku: ' sku-123 ', name: 'Sample', unit: 'pcs', reorder_level: 5, stock_on_hand: 0)
      expect(product.sku).to eq('SKU-123')
    end
  end
end
