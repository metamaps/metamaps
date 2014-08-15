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
  t.activeContent = '<a href="/explore/active" class="active">Recently Active Maps</a>';
  t.activeContent += '<a href="/explore/featured">Featured Maps</a>';

  t.featuredContent = '<a href="/explore/active">Recently Active Maps</a>';
  t.featuredContent += '<a href="/explore/featured" class="active">Featured Maps</a>';

/* logged in explore maps bars */
  t.mineAuthContent = '<a href="/" class="active">My Maps</a>';
  t.mineAuthContent += '<a href="/explore/active">Recently Active</a>';
  t.mineAuthContent += '<a href="/explore/featured">Featured</a>';

  t.activeAuthContent = '<a href="/">My Maps</a>';
  t.activeAuthContent += '<a href="/explore/active" class="active">Recently Active</a>';
  t.activeAuthContent += '<a href="/explore/featured">Featured</a>';

  t.featuredAuthContent = '<a href="/">My Maps</a>';
  t.featuredAuthContent += '<a href="/explore/active">Recently Active</a>';
  t.featuredAuthContent += '<a href="/explore/featured" class="active">Featured</a>';

    module.exports = t;
});
