class User < ApplicationRecord
  rolify
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  def manager?
    has_role?(:manager)
  end

  def warehouse_staff?
    has_role?(:warehouse_staff)
  end

  def employee?
    has_role?(:employee)
  end
end
