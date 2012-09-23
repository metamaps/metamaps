class PeopleController < ApplicationController

  before_filter :require_user, only: [:new, :create, :edit, :update]
    
  respond_to :html, :js, :json
  
  # GET /people
  def index
    @user = current_user
    @people = Person.all
     
    respond_with(@people)
  end
  
  # Get /people/new
  def new
  	@person = Person.new
    @user = current_user
    
    respond_with(@person)
  end
  
  # GET /people/:id
  def show
  	@person = Person.find(params[:id])
	
	@gparents = @person.groups
	@ichildren = @person.items
	
	respond_with(@person, @gparents, @ichildren)
  end
  
  # POST /people
  def create
    
    @user = current_user
    @person = Person.new()
	@person.name = params[:person][:name]
	@person.desc = params[:person][:desc]
	@person.link = params[:person][:link]
	@person.user = @user
		
	@person.save 
	
	@groups = Group.find(params[:ingroups])
    @groups.each do |g|
      belongs = Groupperson.new
      belongs.group_id = g.id
      belongs.person_id = @person.id
      belongs.save!    
    end  
    
    respond_to do |format|
      format.html {render :index}
      format.js { respond_with(@person) }
    end
    
  end
  
  # GET /people/:id/edit
  def edit
	@person = Person.find_by_id(params[:id])
  
	respond_with(@person)
  end
  
  # PUT /people/:id
  def update
    @user = current_user
	@person = Person.find_by_id(params[:id])
    @person.attributes = params[:person] if @person
    
    @person.save if @person
    
    respond_with(@user, location: restore(default: root_url)) do |format|
    end
  end
  
  # DELETE /people/:id
  def destroy
	@person = Person.find_by_id(params[:id])
	
	@person.delete
  end

end
