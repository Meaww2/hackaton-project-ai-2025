require 'rails_helper'

RSpec.describe 'Api::V1::Products', type: :request do
  let(:manager) do
    User.create!(email: 'manager_spec@example.com', password: 'Password123!', password_confirmation: 'Password123!').tap do |user|
      user.add_role(:manager)
    end
  end

  before do
    sign_in manager
  end

  describe 'GET /api/v1/products' do
    let!(:low_stock_product) do
      Product.create!(sku: 'SKU-LOW', name: 'Low Item', unit: 'pcs', reorder_level: 10, stock_on_hand: 2)
    end
    let!(:regular_product) do
      Product.create!(sku: 'SKU-OK', name: 'Okay Item', unit: 'pcs', reorder_level: 5, stock_on_hand: 7)
    end

    it 'returns all products ordered by name' do
      get '/api/v1/products'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.fetch('data')).to be_an(Array)
      expect(json.fetch('data').size).to eq(2)
      expect(json.dig('data', 0, 'sku')).to eq('SKU-LOW')
      expect(json.dig('data', 0, 'status')).to eq('low')
      pagination = json.fetch('pagination')
      expect(pagination.fetch('current_page')).to eq(1)
      expect(pagination.fetch('per_page')).to eq(10)
    end

    it 'filters products by low_stock flag' do
      get '/api/v1/products', params: { low_stock: true }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.fetch('data').size).to eq(1)
      expect(json.dig('data', 0, 'sku')).to eq('SKU-LOW')
    end

    it 'filters by query across sku and name' do
      get '/api/v1/products', params: { query: 'ok' }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.fetch('data').map { |item| item.fetch('sku') }).to contain_exactly('SKU-OK')
    end

    it 'sorts by stock_on_hand descending when requested' do
      get '/api/v1/products', params: { sort_column: 'stock_on_hand', sort_direction: 'desc' }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      stocks = json.fetch('data').map { |item| item.fetch('stock_on_hand') }
      expect(stocks).to eq(stocks.sort.reverse)
    end

    it 'paginates results with custom per_page' do
      3.times do |index|
        Product.create!(
          sku: "SKU-EXTRA-#{index}",
          name: "Extra #{index}",
          unit: 'pcs',
          reorder_level: 1,
          stock_on_hand: index
        )
      end

      get '/api/v1/products', params: { per_page: 2, page: 2, sort_column: 'sku' }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.fetch('data').size).to eq(2)
      pagination = json.fetch('pagination')
      expect(pagination.fetch('current_page')).to eq(2)
      expect(pagination.fetch('per_page')).to eq(2)
      expect(pagination.fetch('total_pages')).to be >= 2
    end
  end

  describe 'POST /api/v1/products' do
    let(:valid_payload) do
      {
        product: {
          sku: 'SKU-NEW',
          name: 'Brand New',
          unit: 'box',
          reorder_level: 3
        }
      }
    end

    it 'creates a product and returns 201' do
      expect do
        post '/api/v1/products', params: valid_payload
      end.to change(Product, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json.fetch('sku')).to eq('SKU-NEW')
      expect(json.fetch('stock_on_hand')).to eq(0)
    end

    it 'returns formatted validation errors' do
      Product.create!(sku: 'SKU-NEW', name: 'Existing', unit: 'pcs', reorder_level: 2, stock_on_hand: 1)

      post '/api/v1/products', params: valid_payload

      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json.fetch('error').fetch('code')).to eq('validation_error')
      expect(json.fetch('error').fetch('details').fetch('sku')).to include('has already been taken')
    end
  end

  describe 'PUT /api/v1/products/:id' do
    let!(:product) do
      Product.create!(sku: 'SKU-EDIT', name: 'Editable', unit: 'pcs', reorder_level: 2, stock_on_hand: 1)
    end

    it 'updates allowed fields' do
      put "/api/v1/products/#{product.id}", params: { product: { name: 'Renamed', reorder_level: 5 } }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.fetch('name')).to eq('Renamed')
      expect(json.fetch('reorder_level')).to eq(5)
    end

    it 'prevents invalid updates and returns formatted errors' do
      put "/api/v1/products/#{product.id}", params: { product: { reorder_level: -1 } }

      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json.fetch('error').fetch('code')).to eq('validation_error')
      expect(json.fetch('error').fetch('details').fetch('reorder_level')).to include('must be greater than or equal to 0')
    end

    it 'returns not found for invalid id' do
      put '/api/v1/products/0', params: { product: { name: 'Nope' } }

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json.fetch('error').fetch('code')).to eq('not_found')
    end
  end

  describe 'POST /api/v1/products/reorder_suggestion' do
    let!(:product) do
      Product.create!(sku: 'SKU-SUG', name: 'Suggestible', unit: 'pcs', reorder_level: 10, stock_on_hand: 3)
    end

    before do
      StockMovement.create!(
        product: product,
        kind: 'OUT',
        quantity: 4,
        reference: 'spec',
        moved_at: 2.days.ago
      )
      product.update!(stock_on_hand: 3)
    end

    it 'returns suggestion data when looked up by id' do
      post '/api/v1/products/reorder_suggestion', params: { product: { id: product.id } }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.fetch('product').fetch('sku')).to eq('SKU-SUG')
      expect(json.fetch('basis').fetch('weekly_out')).to eq(4)
      expect(json.fetch('suggestion').fetch('quantity')).to be > 0
    end

    it 'allows lookup by sku (case insensitive)' do
      post '/api/v1/products/reorder_suggestion', params: { product: { sku: 'sku-sug' } }

      expect(response).to have_http_status(:ok)
    end

    it 'returns bad request when identifier missing' do
      post '/api/v1/products/reorder_suggestion', params: { product: {} }

      expect(response).to have_http_status(:bad_request)
    end
  end
end
