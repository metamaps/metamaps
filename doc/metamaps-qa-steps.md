# Metamaps Tests

Run these tests to be reasonably sure that your code changes haven't broken anything.

### Users & Accounts

 - Create an account using your join code
 - Log in to the interface
 - Check your user's "generation"
 - Edit your profile picture, email, name, and password
 - Remove your profile picture

### Maps, Topics, Synapses, and Permissions

 - Create three maps: private, public, and another public
 - Change the last map's permissions to commons
 - Change a map's name
 - Create a topic on map #1
 - Verify (in a private window or another browser) that the second user can't acccess map #1
 - Create a topic on map #2
 - Verify that the second user **can't** edit map #2
 - Create a topic on map #3
 - Verify that the second user **can** edit map #3
 - Pull a topic from map #1 to map #3
 - Create a private topic on map #1
 - Verify that the private topic can be pulled from map #1 by the same user
 - Verify that the private topic can't be pulled from map #1 by another user

### Mappings

 - Add a number of topics to one of your maps. Reload to see if they are still there.
 - Add a number of synapses to one of your maps. Reload to see if they are still there.
 - Rearrange one of your maps and save the layout. Reload to see if the layout is preserved.

### Misc

 - Login as admin. Change metacode sets.
 - Set the screenshot for one of your maps, and verify the index of maps is updated.
 - Open two browsers on map #3 and verify that realtime editing works (you'll need to be running the realtime server for this to work).
