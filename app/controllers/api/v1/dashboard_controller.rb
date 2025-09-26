module Api
  module V1
    class DashboardController < BaseController
      def stock
        authorize! :read, :dashboard
        snapshot = Dashboard::StockSnapshot.new.call
        render json: snapshot
      end
    end
  end
end
