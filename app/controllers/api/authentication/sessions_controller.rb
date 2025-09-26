# frozen_string_literal: true

class Api::Authentication::SessionsController < Api::ApplicationController
  skip_before_action :authenticate_user, only: %i[sign_in]

  # POST /api/authentication/sign_in
  def sign_in
    user = User.find_by(email: params[:user][:email])

    if user&.valid_password?(params[:user][:password])
      token = user.generate_token_for(:refresh_token)
      render json: { user: user_field(user), token: }, status: :ok
    else
      handle_request('Invalid email or password', :unauthorized)
    end
  rescue StandardError => e
    handle_request(e.message, :bad_request)
  end

  # DELETE /api/authentication/sign_out
  def sign_out
    if current_user&.regenerate_refresh_token
      render json: { success: true }, status: :ok
    else
      handle_request('Logout failed', :unprocessable_entity)
    end
  end

  # GET /api/authentication/current
  def current
    render json: user_field(current_user), status: :ok
  end

  private

  def user_field(user)
    {
      id: user.id,
      email: user.email,
      role: user.roles.pick(:name)
    }
  end
end
