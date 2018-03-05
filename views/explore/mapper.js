Metamaps.currentSection = "explore";
Metamaps.currentPage = "mapper";
Metamaps.ServerData.Mapper = {
  models: { @maps.to_json.html_safe },
  mapperId: { params[:id] }
};
