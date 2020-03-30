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

  countryLayer = new OpenLayers.Layer.WMS(
    'Nepal Boundary', 'https://srl.localmun.com/geoserver/sarawal/wms', {
      layers: 'sarawal:country',
      transparent: true,
      countryname: 'Nepal',
      version: '1.1.1'
    }, {
      isBaseLayer: false
    }
  );

  provinceLayer = new OpenLayers.Layer.WMS(
    'Province', 'https://srl.localmun.com/geoserver/sarawal/wms', {
      layers: 'sarawal:province',
      transparent: true,
      countryname: 'Sarawal',
      version: '1.1.1'
    }, {
      isBaseLayer: false
    }
  );

  var districtLayer = new OpenLayers.Layer.WMS(
    'District', 'https://srl.localmun.com/geoserver/sarawal/wms', {
      layers: 'sarawal:district',
      transparent: true,
      countryname: 'Sarawal',
      version: '1.1.1'
    }, {
      isBaseLayer: false
    }
  );

  var palikaLayer = new OpenLayers.Layer.WMS(
    'Rural/Urban Municipality', 'https://srl.localmun.com/geoserver/sarawal/wms', {
      layers: 'sarawal:gn',
      transparent: true,
      countryname: 'Sarawal',
      version: '1.1.1'
    }, {
      isBaseLayer: false
    }
  );

  var roadLayer = new OpenLayers.Layer.WMS(
    'Major Road Network', 'http://110.44.126.80:8888/geoserver/wwf/wms', {
      layers: 'wwf:Roads',
      transparent: true,
      countryname: 'Sarawal',
      version: '1.1.1'
    }, {
      visibility:false,
      isBaseLayer: false
    }
  );

  var riverLayer = new OpenLayers.Layer.WMS(
    'Water Body', 'http://110.44.126.80:8888/geoserver/wwf/wms', {
      layers: 'wwf:Water Body',
      transparent: true,
      countryname: 'Sarawal',
      version: '1.1.1'
    }, {
      visibility:false,
      isBaseLayer: false

    }
  );

  var hydroLayer = new OpenLayers.Layer.WMS(
    'Major Hydrapower', 'http://110.44.126.80:8888/geoserver/wwf/wms', {
      layers: 'wwf:Above100MW',
      transparent: true,
      countryname: 'Sarawal',
      version: '1.1.1'
    }, {
      visibility:false,
      isBaseLayer: false
    }
  );


  theMap.addLayers([countryLayer, provinceLayer, districtLayer, palikaLayer, riverLayer, roadLayer, hydroLayer]);


  info = new OpenLayers.Control.WMSGetFeatureInfo({
            url: 'http://110.44.126.80:8888/geoserver/wms',
            title: 'Identify features by clicking',
            queryVisible: true,
            eventListeners: {
                getfeatureinfo: function(event) {
                    map.addPopup(new OpenLayers.Popup.FramedCloud(
                        "chicken",
                        map.getLonLatFromPixel(event.xy),
                        null,
                        event.text,
                        null,
                        true
                    ));
                }
            }
        });
        theMap.addControl(info);
        info.activate();

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
