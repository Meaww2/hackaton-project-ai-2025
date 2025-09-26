module Api
  module V1
    class BaseController < ApplicationController
      skip_before_action :verify_authenticity_token
      before_action :authenticate_user!
      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActionController::ParameterMissing, with: :render_bad_request

      private

      def boolean_param(value)
        ActiveModel::Type::Boolean.new.cast(value)
      end

      def render_validation_error(record)
        render json: {
          error: {
            code: 'validation_error',
            message: record.errors.full_messages.first || 'Validation failed',
            details: record.errors.to_hash
          }
        }, status: :unprocessable_content
      end

      def render_not_found(exception)
        render json: {
          error: {
            code: 'not_found',
            message: exception.message
          }
        }, status: :not_found
      end

      def render_bad_request(exception)
        render json: {
          error: {
            code: 'bad_request',
            message: exception.message
          }
        }, status: :bad_request
      end

      def authenticate_user!(opts = {})
        return if user_signed_in?

        user = warden.authenticate(scope: :user)
        return if user

        render json: {
          error: {
            code: 'unauthorized',
            message: 'You need to sign in or sign up before continuing.'
          }
        }, status: :unauthorized
      end
    end
  end
end
