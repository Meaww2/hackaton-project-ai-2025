# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user)
    user ||= User.new # guest

    if user.manager?
      can :manage, :all
    elsif user.warehouse_staff?
      can :manage, Product   # เจ้าหน้าที่คลัง จัดการสินค้า
      can :read, Order       # อ่านออเดอร์
    elsif user.employee?
      can :read, Product     # พนักงานทั่วไปดูสินค้า
    else
      can :read, :home       # guest
    end
  end
end
