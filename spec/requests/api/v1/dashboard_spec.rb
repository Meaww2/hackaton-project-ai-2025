require 'rails_helper'

RSpec.describe 'Api::V1::Dashboard', type: :request do
  let(:manager) do
    User.create!(email: 'manager_dashboard@example.com', password: 'Password123!', password_confirmation: 'Password123!').tap do |user|
      user.add_role(:manager)
    end
  end

  let!(:low_stock_product) do
    Product.create!(sku: 'SKU-LOW', name: 'Low Product', unit: 'pcs', reorder_level: 10, stock_on_hand: 3)
  end
  let!(:movement_product) do
    Product.create!(sku: 'SKU-MVT', name: 'Movement Product', unit: 'pcs', reorder_level: 5, stock_on_hand: 20)
  end

  before do
    sign_in manager
    StockMovements::Creator.new(
      product: movement_product,
      params: { kind: 'OUT', quantity: 2, reference: 'dashboard-spec', moved_at: Time.current }
    ).call
  end

  it 'returns low stock and recent movements summary' do
    get '/api/v1/dashboard/stock'

    expect(response).to have_http_status(:ok)
    json = JSON.parse(response.body)
    expect(json.fetch('low_stock')).to be_an(Array)
    expect(json.fetch('recent_movements')).to be_an(Array)
    expect(json.fetch('low_stock').first.fetch('sku')).to eq('SKU-LOW')
    expect(json.fetch('recent_movements').first.fetch('product').fetch('sku')).to eq('SKU-MVT')
  end
end
