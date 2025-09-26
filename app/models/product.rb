class Product < ApplicationRecord
  has_many :orders, dependent: :destroy

  validates :min_order_quantity, numericality: { greater_than_or_equal_to: 1 }
end
