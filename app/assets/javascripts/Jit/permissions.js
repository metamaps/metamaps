
function authorizeToEdit(obj) {
  if (userid && (obj.data.$permission == "commons" || obj.data.$userid == userid)) return true;
  else return false;
}

function mk_permission(obj) {
  if (obj.getData("permission") == "commons") return "co";
  else if (obj.getData("permission") == "public") return "pu";
  else if (obj.getData("permission") == "private") return "pr";
}