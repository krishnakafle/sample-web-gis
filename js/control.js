/*
  Name: control.js
  Date: April/May 2014
  Description: Functions of the simple webpage page.
  Version: 1.0
*/

var currentEl = 'home-';

function switchDivs(thisEl) {
  document.getElementById(currentEl + 'div').setAttribute("class", "hidediv");
  document.getElementById(currentEl + 'li').setAttribute("class", "");
  document.getElementById(thisEl + 'div').setAttribute("class", "showdiv");
  document.getElementById(thisEl + 'li').setAttribute("class", "active");
  currentEl = thisEl;
};

//-- Mapping functions
Ext.onReady(function() {


  var sm = new OpenLayers.Projection("EPSG:3857"); //Spherical Mercator
  var wgs = new OpenLayers.Projection("EPSG:4326"); //WGS84

  // Bounding box oordinates for your chosen country (i.e., The Netherlands) & The World
  var ctryBbox = new OpenLayers.Bounds(80.0585566380344, 26.3478190101467, 88.2014946472075, 30.4471622139934).transform(wgs, sm);
  var worldExtent = new OpenLayers.Bounds(-185, -89, 185, 89).transform(wgs, sm);

  // Map definition
  var options = {
    controls: [], //Removes all default controls from the map
    projection: sm, //Default map projection to allow overlays on OSM or Google
    units: "m", //required when using Spherical Mercator
    maxExtent: worldExtent //required when using Spherical Mercator
  };
  theMap = new OpenLayers.Map(options);
  theMap.addControl(new OpenLayers.Control.MousePosition({
    numDigits: 2
  }));
  theMap.addControl(new OpenLayers.Control.Navigation()); //Adds zoom & drag functionality to the map
  theMap.addControl(new OpenLayers.Control.Zoom()); //Displays the zoom in & zoom out controls

  var osmLayer = new OpenLayers.Layer.OSM(); //OpenStreetMap as the base layer of the map
  var googleLayer = new OpenLayers.Layer.Google("Google Streets");
  theMap.addLayers([googleLayer, osmLayer]);
  theMap.setBaseLayer(osmLayer);
  var baseWmsUrl = 'https://owsgip.itc.utwente.nl/cgi-bin/mapserv?MAP=/home/owsfiles/mapfiles/world.map';
  worldLayer = new OpenLayers.Layer.WMS(
    'World Borders', baseWmsUrl, {
      layers: 'country_border',
      transparent: true,
      version: '1.3.0'
    }, {
      isBaseLayer: false
    }
  );
  theMap.addLayer(worldLayer);

  ctryLayer = new OpenLayers.Layer.WMS(
    'Netherlands', baseWmsUrl + '&map.layer[country_border].class[0].style[0]=COLOR+0+0+255', {
      layers: 'country_border',
      transparent: true,
      countryname: 'Netherlands',
      version: '1.3.0'
    }, {
      isBaseLayer: false
    }
  );

  beLayer = new OpenLayers.Layer.WMS(
    'Province', 'https://db2map.gistemp.com/geoserver/nepal/wms', {
      layers: 'nepal:province',
      transparent: true,
      countryname: 'Belgium',
      version: '1.1.1'
    }, {
      isBaseLayer: false
    }
  );
  theMap.addLayers([ctryLayer, beLayer]);

  //-- Map display panel
  var mapPanel = new GeoExt.MapPanel({
    map: theMap,
    extent: ctryBbox,
    region: 'center',
    margins: '5 5 5 0'
  });

  //-- Layer switcher
  var treePanel = new Ext.tree.TreePanel({
    title: 'Switcher',
    region: 'west',
    margins: '5 0 5 5',
    cmargins: '5 5 5 5',
    width: 175,
    minSize: 100,
    maxSize: 200,
    split: true,
    collapsible: true,
    bodyStyle: 'padding:5px',
    rootVisible: false,
    root: new Ext.tree.AsyncTreeNode({
      expanded: true,
      children: [
        new GeoExt.tree.BaseLayerContainer({
          text: 'Base Layers',
          expanded: true
        }),
        new GeoExt.tree.OverlayLayerContainer({
          expanded: true
        })
      ]
    })
  });

  //-- Panel container
  new Ext.Panel({
    renderTo: "viewer-panel",
    height: 500,
    width: 760,
    layout: 'border',
    items: [mapPanel, treePanel]
  });

});
