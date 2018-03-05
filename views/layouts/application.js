

{ render :partial => 'layouts/head' }
<body className="{ current_user ? "authenticated" : "unauthenticated" } controller-{ controller_name } action-{ action_name }">
    <div className="main" id="react-app"></div>
    { yield }
    { if current_user }
        { # for creating and pulling in topics and synapses }
        { if controller_name == 'maps' && action_name == "conversation" }
          { render :partial => 'maps/newtopicsecret' }
        { else }
          { render :partial => 'maps/newtopic' }
        { end }
        { render :partial => 'maps/newsynapse' }
        { render :partial => 'shared/metacodeoptions' }
    { end }
{ render :partial => 'layouts/foot' }
