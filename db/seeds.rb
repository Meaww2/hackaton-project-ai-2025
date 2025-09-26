# ลบข้อมูลเก่า
User.delete_all
Role.delete_all
Product.delete_all

# ==== Roles ====
roles = %w[admin manager staff]
roles.each { |r| Role.find_or_create_by!(name: r) }

# ==== Users ====
admin = User.create!(
  email: 'admin@example.com',
  password: '123456',
  password_confirmation: '123456'
)
admin.add_role :admin
admin.generate_token_for(:refresh_token)

manager = User.create!(
  email: 'manager@example.com',
  password: '123456',
  password_confirmation: '123456'
)
manager.add_role :manager
manager.generate_token_for(:refresh_token)

staff = User.create!(
  email: 'staff@example.com',
  password: '123456',
  password_confirmation: '123456'
)
staff.add_role :staff
staff.generate_token_for(:refresh_token)

puts "✅ Users created: #{User.count}"

# ==== Products ====
products = [
  {
    sku: 'SKU001',
    name: 'โต๊ะไม้สัก',
    description: 'โต๊ะไม้สักแท้ แข็งแรง ทนทาน',
    price: 1500.00,
    stock_on_hand: 10,
    reorder_level: 5,
    weekly_out: 2
  },
  {
    sku: 'SKU002',
    name: 'เก้าอี้เหล็ก',
    description: 'เก้าอี้เหล็กพับได้ น้ำหนักเบา',
    price: 450.00,
    stock_on_hand: 25,
    reorder_level: 10,
    weekly_out: 5
  },
  {
    sku: 'SKU003',
    name: 'พัดลมตั้งพื้น',
    description: 'พัดลมตั้งพื้น 16 นิ้ว ประหยัดไฟ',
    price: 990.00,
    stock_on_hand: 20,
    reorder_level: 10,
    weekly_out: 6
  }
]

products.each { |attrs| Product.create!(attrs) }
puts "✅ Products created: #{Product.count}"
