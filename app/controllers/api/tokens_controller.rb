class Api::TokensController < API::RestfulController
  
  def create
    raise CanCan::AccessDenied.new unless current_user.is_logged_in?
    instantiate_resouce
    resource.user = current_user
    create_action
    respond_with_resource
  end
  
  def my_tokens
    raise CanCan::AccessDenied.new unless current_user.is_logged_in?
    instantiate_collection page_collection: false, timeframe_collection: false
    respond_with_collection
  end

  def visible_records
    current_user.tokens
  end

end
