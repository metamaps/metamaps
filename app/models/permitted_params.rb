# frozen_string_literal: true

class PermittedParams
  %w[map synapse topic mapping token].each do |kind|
    define_method(kind) do
      permitted_attributes = send("#{kind}_attributes")
      @params.require(kind).permit(*permitted_attributes)
    end
    alias_method :"api_#{kind}", kind.to_sym
  end

  def initialize(params)
    @params = params
  end

  alias read_attribute_for_serialization send

  def token_attributes
    [:description]
  end

  def map_attributes
    %i[name desc permission arranged]
  end

  def synapse_attributes
    %i[desc category weight permission topic1_id topic2_id]
  end

  def topic_attributes
    %i[name desc link permission metacode_id]
  end

  def mapping_attributes
    %i[xloc yloc map_id mappable_type mappable_id]
  end
end
