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
t.activeContent = '<div class="exploreMapsMenu">';
  t.activeContent += '<div class="exploreMapsCenter">';
        t.activeContent += '<a href="/">My Maps</a>';
        t.activeContent += '<a href="/explore/active" class="active">Recently Active</a>';
        t.activeContent += '<a href="/explore/featured">Featured</a>';
        t.activeContent += '<a href="/explore/new">New</a>';
        t.activeContent += '<div class="clearfloat"></div>';
  t.activeContent += '</div';
t.activeContent += '</div>';

t.featuredContent = '<div class="exploreMapsMenu">';
  t.featuredContent += '<div class="exploreMapsCenter">';
        t.featuredContent += '<a href="/">My Maps</a>';
        t.featuredContent += '<a href="/explore/active">Recently Active</a>';
        t.featuredContent += '<a href="/explore/featured" class="active">Featured</a>';
        t.featuredContent += '<a href="/explore/new">New</a>';
        t.featuredContent += '<div class="clearfloat"></div>';
  t.featuredContent += '</div';
t.featuredContent += '</div>';

t.newContent = '<div class="exploreMapsMenu">';
  t.newContent += '<div class="exploreMapsCenter">';
        t.newContent += '<a href="/">My Maps</a>';
        t.newContent += '<a href="/explore/active">Recently Active</a>';
        t.newContent += '<a href="/explore/featured">Featured</a>';
        t.newContent += '<a href="/explore/new" class="active">New</a>';
        t.newContent += '<div class="clearfloat"></div>';
  t.newContent += '</div';
t.newContent += '</div>';

/* logged in explore maps bars */
t.mineAuthContent = '<div class="exploreMapsMenu">';
  t.mineAuthContent += '<div class="exploreMapsCenter">';
        t.mineAuthContent += '<a href="/" class="active">My Maps</a>';
        t.mineAuthContent += '<a href="/explore/active">Recently Active</a>';
        t.mineAuthContent += '<a href="/explore/featured">Featured</a>';
        t.mineAuthContent += '<a href="/explore/new">New</a>';
        t.mineAuthContent += '<div class="clearfloat"></div>';
  t.mineAuthContent += '</div';
t.mineAuthContent += '</div>';

t.activeAuthContent = '<div class="exploreMapsMenu">';
  t.activeAuthContent += '<div class="exploreMapsCenter">';
        t.activeAuthContent += '<a href="/">My Maps</a>';
        t.activeAuthContent += '<a href="/explore/active" class="active">Recently Active</a>';
        t.activeAuthContent += '<a href="/explore/featured">Featured</a>';
        t.activeAuthContent += '<a href="/explore/new">New</a>';
        t.activeAuthContent += '<div class="clearfloat"></div>';
  t.activeAuthContent += '</div';
t.activeAuthContent += '</div>';

t.featuredAuthContent = '<div class="exploreMapsMenu">';
  t.featuredAuthContent += '<div class="exploreMapsCenter">';
        t.featuredAuthContent += '<a href="/">My Maps</a>';
        t.featuredAuthContent += '<a href="/explore/active">Recently Active</a>';
        t.featuredAuthContent += '<a href="/explore/featured" class="active">Featured</a>';
        t.featuredAuthContent += '<a href="/explore/new">New</a>';
        t.featuredAuthContent += '<div class="clearfloat"></div>';
  t.featuredAuthContent += '</div';
t.featuredAuthContent += '</div>';

t.newAuthContent = '<div class="exploreMapsMenu">';
  t.newAuthContent += '<div class="exploreMapsCenter">';
        t.newAuthContent += '<a href="/">My Maps</a>';
        t.newAuthContent += '<a href="/explore/active">Recently Active</a>';
        t.newAuthContent += '<a href="/explore/featured">Featured</a>';
        t.newAuthContent += '<a href="/explore/new" class="active">New</a>';
        t.newAuthContent += '<div class="clearfloat"></div>';
  t.newAuthContent += '</div';
t.newAuthContent += '</div>';

    module.exports = t;
});