# frozen_string_literal: true
class MainController < ApplicationController
  after_action :verify_authorized
  after_action :verify_policy_scoped, only: [:home]

  # GET /
  def home
    authorize :Main
    respond_to do |format|
      format.html do
        if !authenticated?
          render 'main/home'
        else
          @maps = policy_scope(Map).order(updated_at: :desc).page(1).per(20)
          render 'explore/active'
        end
      end
    end
  end
end
