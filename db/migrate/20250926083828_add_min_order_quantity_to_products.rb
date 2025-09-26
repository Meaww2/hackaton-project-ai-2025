class AddMinOrderQuantityToProducts < ActiveRecord::Migration[7.1]
  def change
    add_column :products, :min_order_quantity, :integer, default: 1, null: false
  end
end
