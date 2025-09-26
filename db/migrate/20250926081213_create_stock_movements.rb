class CreateStockMovements < ActiveRecord::Migration[7.1]
  def change
    create_table :stock_movements do |t|
      t.references :product, null: false, foreign_key: true
      t.string :kind, null: false
      t.integer :quantity, null: false
      t.string :reference
      t.datetime :moved_at, null: false

      t.timestamps
    end

    add_index :stock_movements, :moved_at
  end
end
