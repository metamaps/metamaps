
function authorizeToEdit(obj) {
  if (userid && (obj.data.$permission == "commons" || obj.data.$userid == userid)) return true;
  else return false;
}