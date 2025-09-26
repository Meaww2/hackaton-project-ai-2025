class ApplicationController < ActionController::API
  include ActionController::Cookies
  include ActionController::RequestForgeryProtection
  include CanCan::ControllerAdditions

  respond_to :json

  protect_from_forgery with: :null_session

  rescue_from CanCan::AccessDenied, with: :render_forbidden

  private

  def render_forbidden(exception)
    render json: {
      error: {
        code: 'forbidden',
        message: exception.message
      }
    }, status: :forbidden
  end
end
