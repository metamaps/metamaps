module SynapsesHelper

  
  ## this one is for building our custom JSON autocomplete format for typeahead
  def autocomplete_synapse_generic_json(unique)
    temp = []
    unique.each do |s|
      synapse = {}
      synapse['label'] = s.desc
      synapse['value'] = s.desc
      
      temp.push synapse
    end
    return temp
  end
  
  ## this one is for building our custom JSON autocomplete format for typeahead
  def autocomplete_synapse_array_json(synapses)
    temp = []
    synapses.each do |s|
      synapse = {}
      synapse['id'] = s.id
      synapse['label'] = s.desc
      synapse['value'] = s.desc
      synapse['permission'] = s.permission
      synapse['mapCount'] = s.maps.count
      synapse['originator'] = s.user.name
      synapse['rtype'] = "synapse"
      
      temp.push synapse
    end
    return temp
  end

end
