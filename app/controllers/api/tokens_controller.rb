class Api::TokensController < API::RestfulController

  skip_authorization
 
  def my_tokens
    raise Pundit::NotAuthorizedError.new unless current_user.is_logged_in?
    instantiate_collection page_collection: false, timeframe_collection: false
    respond_with_collection
  end

  def visible_records
    current_user.tokens
  end

end
