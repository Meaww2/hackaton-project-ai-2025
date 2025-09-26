class Users::RegistrationsController < Devise::RegistrationsController
  skip_before_action :verify_authenticity_token
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: { user: serialized_user(resource) }, status: :created
    else
      render json: {
        error: {
          code: 'validation_error',
          message: resource.errors.full_messages.first || 'Registration failed',
          details: resource.errors.to_hash
        }
      }, status: :unprocessable_content
    end
  end

  def respond_to_on_destroy
    head :no_content
  end

  def serialized_user(user)
    Api::V1::UserSerializer.new(user).as_json
  end

  def account_update_params
    params.require(:user).permit(:email, :password, :password_confirmation, :current_password)
  end

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end
end
