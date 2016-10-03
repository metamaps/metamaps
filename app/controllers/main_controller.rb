# frozen_string_literal: true
class MainController < ApplicationController
  before_action :authorize_main
  after_action :verify_authorized

  # GET /
  def home
    respond_to do |format|
      format.html do
        if authenticated?
          @maps = policy_scope(Map).where.not(name: 'Untitled Map')
                                   .order(updated_at: :desc).page(1).per(20)
          render 'explore/active'
        else
          render 'main/home'
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
