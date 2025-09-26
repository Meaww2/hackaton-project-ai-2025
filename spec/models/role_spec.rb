require 'rails_helper'

RSpec.describe Role, type: :model do
  it 'can be created and assigned to a user' do
    role = described_class.create!(name: 'manager')
    user = User.create!(email: 'role-assignment@example.com', password: 'Password123!', password_confirmation: 'Password123!')
    user.roles << role

    expect(user.roles).to include(role)
  end
end
