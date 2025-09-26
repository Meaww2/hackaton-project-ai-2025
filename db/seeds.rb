# ล้างข้อมูล
Order.delete_all
Product.delete_all
User.delete_all
Role.delete_all

# Roles
roles = %w[admin manager staff]
roles.each { |r| Role.find_or_create_by!(name: r) }

# Users
admin = User.create!(email: 'admin@example.com', password: '123456', password_confirmation: '123456')
admin.add_role :admin
admin.generate_token_for(:refresh_token)

manager = User.create!(email: 'manager@example.com', password: '123456', password_confirmation: '123456')
manager.add_role :manager
manager.generate_token_for(:refresh_token)

staff = User.create!(email: 'staff@example.com', password: '123456', password_confirmation: '123456')
staff.add_role :staff
staff.generate_token_for(:refresh_token)

# Products
p1 = Product.create!(sku: 'SKU001', name: 'โต๊ะไม้', description: 'โต๊ะไม้สักแท้', price: 1500.00,
                     stock_on_hand: 10, min_order_quantity: 2)
p2 = Product.create!(sku: 'SKU002', name: 'เก้าอี้เหล็ก', description: 'เก้าอี้เหล็กพับได้', price: 450.00,
                     stock_on_hand: 20, min_order_quantity: 2)

# Orders
Order.create!(product: p1, user: manager, quantity: 2, total_price: p1.price * 2, status: 'pending')
Order.create!(product: p2, user: staff, quantity: 5, total_price: p2.price * 5, status: 'completed')

puts "✅ Seeded: #{User.count} users, #{Product.count} products, #{Order.count} orders"
