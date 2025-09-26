require 'rails_helper'

RSpec.describe User, type: :model do
  it 'supports role assignments via rolify' do
    user = described_class.create!(email: 'role-test@example.com', password: 'Password123!', password_confirmation: 'Password123!')
    user.add_role(:manager)

    expect(user.has_role?(:manager)).to be(true)
  end
end
