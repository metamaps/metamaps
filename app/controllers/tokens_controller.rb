# frozen_string_literal: true
class TokensController < ApplicationController
  before_action :require_user, only: [:new]

  def new
    @token = Token.new(user: current_user)
    render :new, layout: false
  end
end
