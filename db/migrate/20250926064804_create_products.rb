class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products do |t|
      t.string :sku, null: false, index: { unique: true }
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.integer :stock_on_hand, null: false, default: 0
      t.integer :reorder_level, null: false, default: 0
      t.integer :weekly_out , null: false, default: 0

      t.timestamps
    end
  end
end
