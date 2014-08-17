define(function(require, exports, module) {
    
var t = {};

t.logoContent = '<div class="logo">METAMAPS</div>';
t.logoContent += '<ul class="bottomLinks">';
t.logoContent += '<li class="openLightbox" data-open="about">About /&nbsp;</li>';
t.logoContent += '<li><a href="/maps/blank">Terms of Use /&nbsp;</a></li>';
t.logoContent += '<li class="openLightbox" data-open="colophon">Colophon /&nbsp;</li>';
t.logoContent += '<li class="openLightbox" data-open="getInvolved">Get Involved!</li>';
t.logoContent += '</ul>';

/* logged out explore maps bars */
  t.activeContent = '<a href="/explore/active" class="active myMaps">Recently Active Maps</a>';
  t.activeContent += '<a href="/explore/featured" class="featuredMaps">Featured Maps</a>';

  t.featuredContent = '<a href="/explore/active" class="activeMaps">Recently Active Maps</a>';
  t.featuredContent += '<a href="/explore/featured" class="active featuredMaps">Featured Maps</a>';

/* logged in explore maps bars */
  t.mineAuthContent = '<a href="/" class="active myMaps">My Maps</a>';
  t.mineAuthContent += '<a href="/explore/active" class="activeMaps">Recently Active</a>';
  t.mineAuthContent += '<a href="/explore/featured" class="featuredMaps">Featured</a>';

  t.activeAuthContent = '<a href="/" class="myMaps">My Maps</a>';
  t.activeAuthContent += '<a href="/explore/active" class="active activeMaps">Recently Active</a>';
  t.activeAuthContent += '<a href="/explore/featured" class="featuredMaps">Featured</a>';

  t.featuredAuthContent = '<a href="/" class="myMaps">My Maps</a>';
  t.featuredAuthContent += '<a href="/explore/active" class="activeMaps">Recently Active</a>';
  t.featuredAuthContent += '<a href="/explore/featured" class="active featuredMaps">Featured</a>';

    module.exports = t;
});
