require 'rails_helper'

RSpec.describe 'Api::V1::StockMovements', type: :request do
  let(:manager) do
    User.create!(email: 'manager_movements@example.com', password: 'Password123!', password_confirmation: 'Password123!').tap do |user|
      user.add_role(:manager)
    end
  end

  let!(:product) do
    Product.create!(sku: 'SKU-MOVE', name: 'Movement Product', unit: 'pcs', reorder_level: 5, stock_on_hand: 10)
  end

  before do
    sign_in manager
  end

  describe 'GET /api/v1/stock_movements' do
    let!(:movement_one) do
      StockMovements::Creator.new(product: product, params: { kind: 'IN', quantity: 5, reference: 'GET1', moved_at: 1.day.ago }).tap(&:call).movement
    end
    let!(:movement_two) do
      StockMovements::Creator.new(product: product, params: { kind: 'OUT', quantity: 2, reference: 'GET2', moved_at: Time.zone.now }).tap(&:call).movement
    end

    it 'returns recent movements with product details' do
      get '/api/v1/stock_movements'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.first.fetch('id')).to eq(movement_two.id)
      expect(json.first.fetch('product').fetch('sku')).to eq('SKU-MOVE')
    end

    it 'filters by product_id and applies limit' do
      get '/api/v1/stock_movements', params: { product_id: product.id, limit: 1 }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.size).to eq(1)
      expect(json.first.fetch('id')).to eq(movement_two.id)
    end
  end

  describe 'POST /api/v1/stock_movements' do
    it 'creates an IN movement and updates stock' do
      payload = {
        movement: {
          product_id: product.id,
          kind: 'IN',
          quantity: 3,
          reference: 'PO-123'
        }
      }

      expect do
        post '/api/v1/stock_movements', params: payload
      end.to change(StockMovement, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json.fetch('kind')).to eq('IN')
      expect(product.reload.stock_on_hand).to eq(13)
    end

    it 'returns validation error when OUT would go negative' do
      payload = {
        movement: {
          product_id: product.id,
          kind: 'OUT',
          quantity: 99,
          reference: 'ADJ-OVER'
        }
      }

      expect do
        post '/api/v1/stock_movements', params: payload
      end.not_to change(StockMovement, :count)

      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json.fetch('error').fetch('code')).to eq('validation_error')
      expect(json.fetch('error').fetch('message')).to include('OUT would go negative')
    end
  end
end
