class SynapsesController < ApplicationController

  before_filter :require_user, only: [:new, :create, :edit, :update]
    
  respond_to :html, :js, :json
  
  # GET /synapses
  def index
    @user = current_user
    @synapses = Synapse.all
     
    respond_with(@synapses)
  end
  
  # Get /synapse/new
  def new
  	@synapse = Synapse.new
    @user = current_user
	@allitems = Item.all
    
    respond_with(@synapse, @allitems)
  end
  
  # GET /synapse/:id
  def show
  	@synapse = Synapse.find(params[:id])
	
	@node1 = nil
	@node2 = nil
	
	if @synapse
		@node1 = @synapse.item1
		@node2 = @synapse.item2
	end
	
	respond_to do |format|
      format.html { respond_with(@synapse, @node1, @node2) }
      # format.json { respond_with(@relatives) }
    end
  end
  
  # POST /synapses
  def create
	
    @user = current_user
	@synapse = Synapse.new()
	@synapse.desc = params[:synapse][:desc]
	@synapse.category = params[:category]
	@synapse.item1 = Item.find(params[:node1_id])
	@synapse.item2 = Item.find(params[:node2_id])
    @synapse.user = @user	
	@synapse.save   
    
    respond_to do |format|
      format.html { respond_with(@user, location: synapse_url(@synapse)) }
      format.js { respond_with(@synapse) }
    end
    
  end
  
  # GET /synapses/:id/edit
  def edit
	@synapse = Synapse.find_by_id(params[:id])
	
	@items = nil
	
	if @synapse 
		@items = Item.all
	end
  
	respond_with(@synapse, @items)
  end
  
  # PUT /actions/:id
  def update
	@synapse = Synapse.find_by_id(params[:id])
    
	if @synapse 
		@synapse.desc = params[:synapse][:desc]
		@synapse.item1 = Item.find(params[:node1_id][:node1])
		@synapse.item2 = Item.find(params[:node2_id][:node2])
	
		@synapse.save
    end
	
    respond_with(@user, location: synapse_url(@synapse)) do |format|
    end
	
  end
  
  # DELETE /synapses/:id
  def destroy
	@synapse = Synapse.find_by_id(params[:id])
	
	@synapse.delete
  end

end
