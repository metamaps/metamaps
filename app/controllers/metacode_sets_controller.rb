# frozen_string_literal: true

class MetacodeSetsController < ApplicationController
  include MetacodesHelper
  before_action :require_admin, except: :index

  # GET /metacode_sets
  def index
    @metacode_sets = MetacodeSet.order('name').all
    render json: metacode_sets_json
  end

  # POST /metacode_sets
  def create
    @user = current_user
    @metacode_set = MetacodeSet.new(metacode_set_params)
    @metacode_set.user_id = @user.id
    if @metacode_set.save
      # create the InMetacodeSet for all the metacodes that were selected for the set
      @metacodes = params[:metacodes][:value].split(',')
      @metacodes.each do |m|
        InMetacodeSet.create(metacode_id: m, metacode_set_id: @metacode_set.id)
      end
      render json: @metacode_set, status: :created
    else
      render json: @metacode_set.errors, status: :unprocessable_entity
    end
  end

  # PUT /metacode_sets/1
  def update
    @metacode_set = MetacodeSet.find(params[:id])
    if @metacode_set.update_attributes(metacode_set_params)

      # build an array of the IDs of the metacodes currently in the set
      current_metacodes = @metacode_set.metacodes.map { |m| m.id.to_s }
      # get the list of desired metacodes for the set from the user input and build an array out of it
      new_metacodes = params[:metacodes][:value].split(',')

      # remove the metacodes that were in it, but now aren't
      removed_metacodes = current_metacodes - new_metacodes
      removed_metacodes.each do |m|
        inmetacodeset = InMetacodeSet.find_by(metacode_id: m, metacode_set_id: @metacode_set.id)
        inmetacodeset.destroy
      end

      # add the new metacodes
      added_metacodes = new_metacodes - current_metacodes
      added_metacodes.each do |m|
        InMetacodeSet.create(metacode_id: m, metacode_set_id: @metacode_set.id)
      end

      head :no_content
    else
      render json: @metacode_set.errors, status: :unprocessable_entity
    end
  end

  # DELETE /metacode_sets/1
  def destroy
    @metacode_set = MetacodeSet.find(params[:id])
    # delete everything that tracks what's in the set
    @metacode_set.in_metacode_sets.each(&:destroy)
    @metacode_set.destroy
    head :no_content
  end

  private

  def metacode_set_params
    params.require(:metacode_set).permit(:desc, :mapperContributed, :name)
  end
end
