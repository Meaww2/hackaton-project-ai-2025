Role.find_or_create_by(name: :manager)
Role.find_or_create_by(name: :warehouse_staff)
Role.find_or_create_by(name: :employee)

u1 = User.create!(email: 'manager@example.com', password: '123456')
u1.add_role :manager

u2 = User.create!(email: 'staff@example.com', password: '123456')
u2.add_role :warehouse_staff

u3 = User.create!(email: 'employee@example.com', password: '123456')
u3.add_role :employee
