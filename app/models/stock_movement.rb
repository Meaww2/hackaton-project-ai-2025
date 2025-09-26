class StockMovement < ApplicationRecord
  KINDS = %w[IN OUT].freeze

  belongs_to :product

  before_validation :set_default_moved_at

  validates :kind, presence: true, inclusion: { in: KINDS }
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :moved_at, presence: true

  scope :recent_first, -> { order(moved_at: :desc, created_at: :desc) }

  private

  def set_default_moved_at
    self.moved_at ||= Time.current
  end
end
