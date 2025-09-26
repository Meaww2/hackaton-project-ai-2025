class Users::SessionsController < Devise::SessionsController
  skip_before_action :verify_authenticity_token
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    render json: { user: serialized_user(resource) }, status: :ok
  end

  def respond_to_on_destroy
    head :no_content
  end

  def serialized_user(user)
    Api::V1::UserSerializer.new(user).as_json
  end

  def verify_signed_out_user
    # no-op to avoid errors when API clients sign out without session
  end

end
