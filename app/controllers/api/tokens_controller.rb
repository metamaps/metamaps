class Api::TokensController < API::RestfulController

  skip_authorization
 
  def my_tokens
    raise Pundit::NotAuthorizedError.new unless current_user
    instantiate_collection page_collection: false, timeframe_collection: false
    respond_with_collection
  end

  def visible_records
    current_user.tokens
  end

end
