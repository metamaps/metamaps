# frozen_string_literal: true
module Api
  module V2
    class StarsController < RestfulController
      skip_before_action :load_resource

      def create
        @map = Map.find(params[:id])
        @star = Star.new(user: current_user, map: @map)
        authorize @map, :star?
        create_action

        if @star.errors.empty?
          render json: @map, scope: default_scope, serializer: MapSerializer, root: serializer_root
        else
          respond_with_errors
        end
      end

      def destroy
        @map = Map.find(params[:id])
        authorize @map, :unstar?
        @star = @map.stars.find_by(user: current_user)
        @star.destroy if @star.present?
        head :no_content
      end
    end
  end
end
