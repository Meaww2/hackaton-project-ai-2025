class Product < ApplicationRecord
  LOW_STOCK_STATUS = :low
  OK_STATUS = :ok

  has_many :stock_movements, dependent: :restrict_with_exception

  before_validation :normalize_sku

  validates :sku, presence: true, uniqueness: { case_sensitive: false }
  validates :name, presence: true
  validates :reorder_level, numericality: { greater_than_or_equal_to: 0 }
  validates :stock_on_hand, numericality: { greater_than_or_equal_to: 0 }

  scope :low_stock, -> { where('products.stock_on_hand < products.reorder_level') }
  scope :matching_query, lambda { |query|
    next all if query.blank?

    sanitized = "%#{query.strip.downcase}%"
    where('LOWER(products.sku) LIKE :q OR LOWER(products.name) LIKE :q', q: sanitized)
  }

  def status
    stock_on_hand < reorder_level ? LOW_STOCK_STATUS : OK_STATUS
  end

  private

  def normalize_sku
    self.sku = sku.to_s.strip.upcase
  end
end
