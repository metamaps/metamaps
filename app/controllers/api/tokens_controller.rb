class Api::TokensController < API::RestfulController
  def my_tokens
    raise Pundit::NotAuthorizedError unless current_user
    instantiate_collection page_collection: false, timeframe_collection: false
    respond_with_collection
  end

  private

  def resource_serializer
    "#{resource_name}_serializer".camelize.constantize
  end

  def visible_records
    current_user.tokens
  end
end
