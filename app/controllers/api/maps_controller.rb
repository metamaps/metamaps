class Api::MapsController < API::RestfulController

  def create
    raise CanCan::AccessDenied.new unless current_user.is_logged_in?
    instantiate_resouce
    resource.user = current_user
    create_action
    respond_with_resource
  end

end
