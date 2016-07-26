class PermittedParams < Struct.new(:params)
  %w(map synapse topic mapping token).each do |kind|
    define_method(kind) do
      permitted_attributes = send("#{kind}_attributes")
      params.require(kind).permit(*permitted_attributes)
    end
    alias_method :"api_#{kind}", kind.to_sym
  end

  alias read_attribute_for_serialization send

  def token_attributes
    [:description]
  end

  def map_attributes
    [:name, :desc, :permission, :arranged]
  end

  def synapse_attributes
    [:desc, :category, :weight, :permission, :node1_id, :node2_id]
  end

  def topic_attributes
    [:name, :desc, :link, :permission, :metacode_id]
  end

  def mapping_attributes
    [:xloc, :yloc, :map_id, :mappable_type, :mappable_id]
  end
end
