# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user)
    user ||= User.new

    return unless user.persisted?

    if user.has_role?(:manager)
      can :manage, :all
      can :read, :dashboard
      can :suggest, Product
    end

    if user.has_role?(:inventory_officer)
      can :read, Product
      can [:read, :create], StockMovement
      can :read, :dashboard
      can :suggest, Product
    end

    if user.has_role?(:viewer)
      can :read, Product
      can :read, StockMovement
      can :read, :dashboard
    end
  end
end
