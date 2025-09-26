class User < ApplicationRecord
  rolify
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_secure_token :refresh_token
  scope :with_refresh_token, -> { where.not(refresh_token: nil) }

  def generate_token_for(_type)
    regenerate_refresh_token
    refresh_token
  end

  def manager?
    has_role?(:manager)
  end

  def warehouse_staff?
    has_role?(:warehouse_staff)
  end

  def employee?
    has_role?(:employee)
  end

  has_many :orders, dependent: :destroy
end
