require([
  'esri/Map',
  'esri/views/MapView',
  'esri/Basemap',
  'esri/layers/VectorTileLayer',
  'esri/layers/FeatureLayer',
  'esri/layers/WebTileLayer',
  'esri/layers/TileLayer',
  'esri/widgets/Search',
  'esri/widgets/Home',
  'esri/widgets/Locate'
],
    function (Map, MapView, Basemap, VectorTileLayer, FeatureLayer, WebTileLayer, TileLayer, Search, Home, Locate) {
      var map, view, searchWidget, homeBtn, locateBtn
      var layers = window.layers
      var featLayers = []

        // Create base layer from Mapbox street layer
      var mapBaseLayer = new WebTileLayer({
        urlTemplate: 'https://{subDomain}.tiles.mapbox.com/v4/fcc.map-toolde8w/{level}/{col}/{row}.png?access_token=pk.eyJ1IjoiZmNjIiwiYSI6InBiaGMyLU0ifQ.LOmVYpUCFv2yWpbvxDdQNg',
        subDomains: ['a', 'b', 'c', 'd'],
        copyright: '\u00A9 OpenStreetMap contributors Design \u00A9 Mapbox'
      })

        // Create base map from Mapbox layer
      var mapBox = new Basemap({
        baseLayers: [mapBaseLayer],
        title: 'Street'
      })

        // Create map
      map = new Map({
        basemap: mapBox
      })

        // Make map view and bind it to the map
      view = new MapView({
        container: 'map',
        map: map,
        center: [-98, 38.48],
        zoom: 4,
        constraints: {
          minZoom: 4,
          maxZoom: 9,
          rotationEnabled: false
        }
      })

        // Add search widget
      searchWidget = new Search({
        view: view
      })

        // Position search widget
      view.ui.add(searchWidget, {
        position: 'top-right',
        index: 2
      })

        // Add Home widget
      homeBtn = new Home({
        view: view
      })

        // Position Home widget
      view.ui.add(homeBtn, 'top-left')

        // Add locate widget
      locateBtn = new Locate({
        view: view
      })

        // Position locate widget
      view.ui.add(locateBtn, {
        position: 'top-left'
      })

      var template = {
        title: 'caf2_auction_cam_auction_cbg_geom',
        content: '<ul style="margin-top: 0"><li>cbg_id = {cbg_id}</li><li>stateabbr = {stateabbr}</li><li>bidder = {bidder}</li><li>tier = {tier}</li><li>latency = {latency}</li><li>locations = {locations}</li><ul>'
      }

      // Create feature layers
      var fOneOrMore = new TileLayer({
        url: 'https://tiles.arcgis.com/tiles/YnOQrIGdN9JGtBh4/arcgis/rest/services/F477_LTE_By_Block_OneOrMore_Providers_Dec2017/VectorTileServer?token=dls8NktxFcfUUiCiaid15zO_T-_iz491gkT5f_9v-_21sCJFaPx0GVdYTR_aP73qoR9xgy7LMCo3_zn9PyhZxyFGDiildbNDR_DbaRxQbbsUQki2IguWTiWcr-UyiSz-QRs5kGzUmMCHHgl0W40oUtxUlrOuOWBwK5In2n7mDAtGKIPPOomdPUcMeQXVKejNy_7399Ey_gircnXT14Cq_plw0maUy8Px08msKBj1VWk.',
        outFields: ['*']
      })

     var fTwoOrMore = new TileLayer({
        url: 'https://tiles.arcgis.com/tiles/YnOQrIGdN9JGtBh4/arcgis/rest/services/F477_LTE_By_Block_TwoOrMore_Providers_Dec2017/VectorTileServer?token=dls8NktxFcfUUiCiaid15zO_T-_iz491gkT5f_9v-_21sCJFaPx0GVdYTR_aP73qoR9xgy7LMCo3_zn9PyhZxyFGDiildbNDR_DbaRxQbbsUQki2IguWTiWcr-UyiSz-QRs5kGzUmMCHHgl0W40oUtxUlrOuOWBwK5In2n7mDAtGKIPPOomdPUcMeQXVKejNy_7399Ey_gircnXT14Cq_plw0maUy8Px08msKBj1VWk.',
        outFields: ['*']
      })

     var fThreeOrMore = new TileLayer({
        url: 'https://tiles.arcgis.com/tiles/YnOQrIGdN9JGtBh4/arcgis/rest/services/F477_LTE_By_Block_ThreeOrMore_Providers_Dec2017/VectorTileServer?token=dls8NktxFcfUUiCiaid15zO_T-_iz491gkT5f_9v-_21sCJFaPx0GVdYTR_aP73qoR9xgy7LMCo3_zn9PyhZxyFGDiildbNDR_DbaRxQbbsUQki2IguWTiWcr-UyiSz-QRs5kGzUmMCHHgl0W40oUtxUlrOuOWBwK5In2n7mDAtGKIPPOomdPUcMeQXVKejNy_7399Ey_gircnXT14Cq_plw0maUy8Px08msKBj1VWk.',
        outFields: ['*']
      })


    var fFourOrMore = new TileLayer({
        url: 'https://tiles.arcgis.com/tiles/YnOQrIGdN9JGtBh4/arcgis/rest/services/F477_LTE_By_Block_FourOrMore_Providers_Dec2017/VectorTileServer?token=dls8NktxFcfUUiCiaid15zO_T-_iz491gkT5f_9v-_21sCJFaPx0GVdYTR_aP73qoR9xgy7LMCo3_zn9PyhZxyFGDiildbNDR_DbaRxQbbsUQki2IguWTiWcr-UyiSz-QRs5kGzUmMCHHgl0W40oUtxUlrOuOWBwK5In2n7mDAtGKIPPOomdPUcMeQXVKejNy_7399Ey_gircnXT14Cq_plw0maUy8Px08msKBj1VWk.',
        outFields: ['*']
      })


      fLayer.popupTemplate = template

        // Add tile layers to map
      map.addMany([fOneOrMore,fTwoOrMore,fThreeOrMore,fFourOrMore])
      

        // bind radio button event
        // var radios = document.layerControl.layerOpts;
        // for (var i = 0, radiosLen = radios.length; i < radiosLen; i++) {
        //     radios[i].onchange = function() {
        //         updateLayerVisibility(this.value);
        //     };
        // }

        // toggle layer visibility
        // function updateLayerVisibility(indx) {

        //     for (var i = 0; i < featLayers.length; i++) {
        //         featLayers[i].visible = false;
        //     }

        //     featLayers[indx].visible = true;

        // }

        // set default layer to visible
        // updateLayerVisibility(0);

        // toggle legend display
      $('#btn-closeLegend').on('click', function (e) {
        e.preventDefault()
        $('.map-legend').hide('fast')
      })

      $('#btn-openLegend').on('click', function (e) {
        e.preventDefault()
        $('.map-legend').show('fast')
      })

        // toggle layer control display
      $('#btn-closeLayerCtrl').on('click', function (e) {
        e.preventDefault()
        $('.layer-control').hide('fast')
      })

      $('#btn-openLayerCtrl').on('click', function (e) {
        e.preventDefault()
        $('.layer-control').show('fast')
      })
    })
