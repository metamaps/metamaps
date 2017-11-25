# frozen_string_literal: true

module SynapsesHelper
  ## this one is for building our custom JSON autocomplete format for typeahead
  def autocomplete_synapse_generic_json(unique)
    unique.map do |s|
      { label: s.desc, value: s.desc }
    end
  end

  ## this one is for building our custom JSON autocomplete format for typeahead
  def autocomplete_synapse_array_json(synapses)
    synapses.map do |s|
      {
        id: s.id,
        label: s.desc.blank? ? '(no description)' : s.desc,
        value: s.desc,
        permission: s.permission,
        mapCount: s.maps.count,
        originator: s.user.name,
        originatorImage: s.user.image.url(:thirtytwo),
        rtype: 'synapse'
      }
    end
  end
end
