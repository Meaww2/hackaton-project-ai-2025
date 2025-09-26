class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products do |t|
      t.string :sku, null: false
      t.string :name, null: false
      t.string :unit
      t.integer :reorder_level, null: false, default: 10
      t.integer :stock_on_hand, null: false, default: 0

      t.timestamps
    end

    add_index :products, :sku, unique: true
  end
end
