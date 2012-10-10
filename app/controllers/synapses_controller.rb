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
  	@synapse1 = Synapse.new
	@synapse1.category = "Group"
	@synapse2 = Synapse.new
	@synapse2.category = "Person"
	@synapse3 = Synapse.new
	@synapse3.category = "Item"
    @user = current_user
	@allgroups = Group.all
	@allpeople = Person.all
	@allitems = Item.all
    
    respond_with(@synapse1, @synapse2, @synapse3, @allgroups, @allpeople, @allitems)
  end
  
  # GET /synapse/:id
  def show
  	@synapse = Synapse.find(params[:id])
	
	@node1 = nil
	@node2 = nil
	
	if @synapse
		if (@synapse.category == "Group") 
			@node1 = @synapse.group1
			@node2 = @synapse.group2
		end
		if (@synapse.category == "Person") 
			@node1 = @synapse.person1
			@node2 = @synapse.person2
		end
		if (@synapse.category == "Item") 
			@node1 = @synapse.item1
			@node2 = @synapse.item2
		end
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
	if ( @synapse.category == "Group" )
		@synapse.group1 = Group.find(params[:node1_id])
		@synapse.group2 = Group.find(params[:node2_id])
	end
	if ( @synapse.category == "Person" )
		@synapse.person1 = Person.find(params[:node1_id])
		@synapse.person2 = Person.find(params[:node2_id])
	end
	if ( @synapse.category == "Item" )
		@synapse.item1 = Item.find(params[:node1_id])
		@synapse.item2 = Item.find(params[:node2_id])
	end
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
	
	@collection1 = nil
	@collection2 = nil
	
	if @synapse
		if (@synapse.category == "Group") 
			@collection = Group.all
		end
		if (@synapse.category == "Person") 
			@collection = Person.all
		end
		if (@synapse.category == "Item") 
			@collection = Item.all
		end
	end
  
	respond_with(@synapse, @collection)
  end
  
  # PUT /actions/:id
  def update
	@synapse = Synapse.find_by_id(params[:id])
    
	if @synapse 
		@synapse.desc = params[:synapse][:desc]
		if ( @synapse.category == "Group" )
			@synapse.group1 = Group.find(params[:node1_id][:node1])
			@synapse.group2 = Group.find(params[:node2_id][:node2])
		end
		if ( @synapse.category == "Person" )
			@synapse.person1 = Person.find(params[:node1_id][:node1])
			@synapse.person2 = Person.find(params[:node2_id][:node2])
		end
		if ( @synapse.category == "Item" )
			@synapse.item1 = Item.find(params[:node1_id][:node1])
			@synapse.item2 = Item.find(params[:node2_id][:node2])
		end 
	
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
