# frozen_string_literal: true
class MainController < ApplicationController
  before_action :authorize_main
  after_action :verify_authorized
  after_action :verify_policy_scoped, only: [:home]

  # GET /
  def home
    respond_to do |format|
      format.html do
        if !authenticated?
          skip_policy_scope
          render 'main/home'
        else
          @maps = policy_scope(Map).order(updated_at: :desc).page(1).per(20)
          render 'explore/active'
        end
      end
    end
  end

  # GET /request
  def requestinvite
  end

  private

  def authorize_main
    authorize :Main
  end
end
