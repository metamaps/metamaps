{ @metacodes = user_metacodes() }

{ form_for Topic.new, url: topics_url, remote: true do |form| }
  <div className="openMetacodeSwitcher openLightbox" data-open="switchMetacodes">
    <div className="tooltipsAbove">Switch Metacodes</div>
  </div>

  <div className="pinCarousel">
    <div className="tooltipsAbove helpPin">Pin Open</div>
    <div className="tooltipsAbove helpUnpin">Unpin</div>
  </div>

  <div id="metacodeImg">
    { @metacodes.each do |metacode| }
      <img className="cloudcarousel" width="40" height="40" src="{ asset_path metacode.icon }" alt="{ metacode.name }" title="{ metacode.name }" data-id="{ metacode.id }" />
    { end }
  </div>

  { form.text_field :name, :maxlength => 140, :placeholder => "title..." }

  <div id="metacodeImgTitle"></div>
  <div className="clearfloat"></div>

  <script>
    { @metacodes.each do |metacode| }
      Metamaps.Create.selectedMetacodes.push("{ metacode.id }");
      Metamaps.Create.newSelectedMetacodes.push("{ metacode.id }");
      Metamaps.Create.selectedMetacodeNames.push("{ metacode.name }");
      Metamaps.Create.newSelectedMetacodeNames.push("{ metacode.name }");
    { end } 
  </script>
{ end }
