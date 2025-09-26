module Api
  module V1
    class UserSerializer
      def initialize(user)
        @user = user
      end

      def as_json(_options = nil)
        {
          id: @user.id,
          email: @user.email,
          roles: @user.roles.pluck(:name)
        }
      end
    end
  end
end
