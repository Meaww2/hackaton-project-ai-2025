class CreateOrders < ActiveRecord::Migration[7.1]
  def change
    create_table :orders do |t|
      t.references :product, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :quantity, null: false
      t.decimal :total_price, precision: 10, scale: 2, null: false
      t.string :status, null: false, default: "pending"

      t.timestamps
    end
  end
end
