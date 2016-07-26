module DeviseHelper
  def devise_error_messages!
    resource.errors.to_a[0]
  end

  def devise_error_messages?
    resource.errors.empty? ? false : true
  end
end
