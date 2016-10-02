/* global CanvasLoader, $ */

const Loading = {
  loader: new CanvasLoader('loading'),
  hide: function () {
    $('#loading').hide();
  },
  show: function () {
    $('#loading').show();
  },
  setup: function () {
    Loading.loader.setColor('#4fb5c0'); // default is '#000000'
    Loading.loader.setDiameter(28); // default is 40
    Loading.loader.setDensity(41); // default is 40
    Loading.loader.setRange(0.9); // default is 1.3
    Loading.loader.show(); // Hidden by default
  }
}

export default Loading
