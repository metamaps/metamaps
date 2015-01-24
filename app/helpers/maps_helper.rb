module MapsHelper

  ## this one is for building our custom JSON autocomplete format for typeahead
  def autocomplete_map_array_json(maps)
    temp = []
    maps.each do |m|
      map = {}
      map['id'] = m.id
      map['label'] = m.name
      map['value'] = m.name
      map['description'] = m.desc.truncate(30)
      map['permission'] = m.permission
      map['topicCount'] = m.topics.count
      map['synapseCount'] = m.synapses.count
      map['contributorCount'] = m.contributors.count
      map['rtype'] = "map"
      
      contributorTip = ''
      firstContributorImage = '/assets/user.png'
      if m.contributors.count > 0 
        firstContributorImage = m.contributors[0].image.url(:thirtytwo)
        m.contributors.each_with_index do |c, index|
          userImage = c.image.url(:thirtytwo)
          name = c.name
          contributorTip += '<li> <img class="tipUserImage" width="25" height="25" src=' + userImage + ' />' + '<span>' + name + '</span> </li>'         
        end
      end
      map['contributorTip'] = contributorTip
      map['mapContributorImage'] = firstContributorImage

      temp.push map
    end
    return temp
  end

  def linkeddata(map)
  
    @alltopics = map.topics.delete_if {|t| t.permission == "private" && (!authenticated? || (authenticated? && @current.id != t.user_id)) }

    js = Hash.new()
    
    js['@context'] = { "@vocab" => "http://schema.org/", "mm" => "http://ns.metamaps.cc/", "mmc" => "http://metamaps.cc/metacodes/" }
    js['@id'] = "http://metamaps.cc/maps/" + map.id.to_s
    js['@type'] = [ "CreativeWork", "mm:Metamap" ]  
    js['name'] = map.name
    js['description'] = map.desc
    
    graph = []
    
    @alltopics.each do |t|
      topic = Hash.new()
      topic['@id'] = 'http://metamaps.cc/topics/' + t.id.to_s
      topic['@type'] = [
        'mmc:' + t.metacode_id.to_s
      ]
      topic['name'] = t.name
      
      t.synapses2.each do |s|
        topic['http://metamaps.cc/synapses/' + s.id.to_s] = [ 'http://metamaps.cc/topics/' + s.node1_id.to_s ]
      end
      
      graph.push(topic)
    end
    
    js['@graph'] = graph
    
    return js
  end
end


