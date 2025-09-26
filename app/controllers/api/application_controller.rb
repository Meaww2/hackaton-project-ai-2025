# frozen_string_literal: true

class Api::ApplicationController < ActionController::API
  before_action :authenticate_user

  attr_reader :current_user

  rescue_from CanCan::AccessDenied do |_exception|
    handle_request('Access Denied', :forbidden)
  end

  def handle_request(message, status)
    render json: { message: }, status:
  end

  private

  def authenticate_user
    auth_header = request.headers['Authorization']
    token = auth_header.split.last if auth_header

    @current_user = User.with_refresh_token.find_by(refresh_token: token)
    return if @current_user

    handle_request('Invalid authentication token or not logged in', :unauthorized)
  end
end
