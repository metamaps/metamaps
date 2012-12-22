class MainController < ApplicationController
  include ItemsHelper

  before_filter :require_user, only: [:invite] 
   
  respond_to :html, :js, :json
  
  #homepage pick a random map and show it
  def console	
	
    @current = current_user
    
    if authenticated? 
      @synapses = Synapse.visibleToUser(@current, nil)
      @synapses = @synapses.slice(0, 50)
	    @items = synapses_as_json(@current, @synapses).html_safe
     
      respond_to do |format|
        format.html { respond_with(@current) }
        format.json { respond_with(@items) }
      end
    else 
      @maps = Map.visibleToUser(@current, nil)
      @map = @maps.sample
    
      @mapjson = @map.self_as_json(@current).html_safe if @map
    
      respond_to do |format|
        format.html { respond_with(@map) }
        format.json { respond_with(@mapjson) }
      end
    end
  end
  
  def metamap
    @current = current_user
    
	@item = Item.visibleToUser(@current, nil).first
	@alljson = all_as_json(@current).html_safe
	
	respond_to do |format|
      format.html { respond_with(@item) }
      format.json { respond_with(@alljson) }
    end
  end
  
  def allmaps	
	@current = current_user
    @maps = Map.visibleToUser(@current, nil)
	
	respond_to do |format|
      format.html { respond_with(@maps) }
    end
  end
  
  def invite	
	@user = current_user
	
	respond_to do |format|
      format.html { respond_with(@user) }
    end
  end
  

end
