Metamaps.currentSection = "topic"
Metamaps.currentPage = { @topic.id.to_s }
Metamaps.ServerData = Metamaps.ServerData || {}
Metamaps.ServerData.ActiveTopic = { @topic.to_json(user: current_user).html_safe }
Metamaps.ServerData.Creators = { @allcreators.to_json.html_safe }
Metamaps.ServerData.Topics = { @alltopics.to_json(user: current_user).html_safe }
Metamaps.ServerData.Synapses = { @allsynapses.to_json.html_safe }
Metamaps.ServerData.VisualizeType = "RGraph"
