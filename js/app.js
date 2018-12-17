// one global for persistent app variables
      var app = {};
      require([
        "esri/map",
        "esri/layers/ArcGISTiledMapServiceLayer", "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/request", "esri/config",
        "esri/tasks/ClassBreaksDefinition", "esri/tasks/AlgorithmicColorRamp",
        "esri/tasks/GenerateRendererParameters", "esri/tasks/GenerateRendererTask",
        "esri/layers/LayerDrawingOptions",
        "esri/symbols/SimpleFillSymbol", "esri/dijit/Legend",
        "dojo/parser", "dojo/_base/array", "esri/Color", "dojo/dom-style",
        "dojo/json", "dojo/dom",
        "dojo/data/ItemFileReadStore",
        "dijit/registry",

        "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dijit/form/FilteringSelect",
        "dojo/domReady!"
      ], function(
        Map,
        ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer,
        esriRequest, esriConfig,
        ClassBreaksDefinition, AlgorithmicColorRamp,
        GenerateRendererParameters, GenerateRendererTask,
        LayerDrawingOptions,
        SimpleFillSymbol, Legend,
        parser, arrayUtils, Color, domStyle,
        JSON, dom,
        ItemFileReadStore,
        registry
      ) {
        parser.parse();

     esriConfig.defaults.io.proxyUrl = "/proxy/";

        app.dataUrl = "https://tiles.arcgis.com/tiles/YnOQrIGdN9JGtBh4/arcgis/rest/services/CMA_Service/MapServer/0";
        app.defaultFrom = "#ffffcc";
        app.defaultTo = "#006837";

        app.map = new Map("map", {
          center: [-85.787, 39.782],
          zoom: 6,
          slider: false
        });

        // add US Counties as a dynamic map service layer
        var urlDyn = "https://tiles.arcgis.com/tiles/YnOQrIGdN9JGtBh4/arcgis/rest/services/CMA_Service/MapServer";
        var usaLayer = new ArcGISDynamicMapServiceLayer(urlDyn, {
          id: "us_counties",
          opacity: 0.7,
          visible: false
        });
        usaLayer.setVisibleLayers([0]);
        app.map.addLayer(usaLayer);

        // get field info
        var countyFields = esriRequest({
          url: app.dataUrl,
          content: {
            f: "json"
          },
          callbackParamName: "callback"
        });
        countyFields.then(function(resp) {
          var fieldNames, fieldStore;

          fieldNames = { identifier: "value", label: "name", items: [] };
          arrayUtils.forEach(resp.fields.slice(10, 14), function(f) { // add some field names to the FS
            fieldNames.items.push({ "name": f.name, "value": f.name });
          });
          fieldStore = new ItemFileReadStore({ data: fieldNames });
          registry.byId("fieldNames").set("store", fieldStore);
          registry.byId("fieldNames").set("value", "market_pop"); // set a value
        }, function(err) {
          console.log("failed to get field names: ", err);
        });

        // update renderer when field name changes
        registry.byId("fieldNames").on("change", getData);
        registry.byId("fieldNames").set("value", "market_pop"); // triggers getData()

        function getData() {
          classBreaks(app.defaultFrom, app.defaultTo);
        }

        function classBreaks(c1, c2) {
          var classDef = new ClassBreaksDefinition();
          classDef.classificationField = registry.byId("fieldNames").get("value") || "totalmktsu";
          classDef.classificationMethod = "equal-interval"; // always natural breaks
          

          var colorRamp = new AlgorithmicColorRamp();
          colorRamp.fromColor = new Color.fromHex(c1);
          colorRamp.toColor = new Color.fromHex(c2);
          colorRamp.algorithm = "hsv"; // options are:  "cie-lab", "hsv", "lab-lch"

          classDef.baseSymbol = new SimpleFillSymbol("solid", null, null);
          classDef.colorRamp = colorRamp;

          var params = new GenerateRendererParameters();
          params.classificationDefinition = classDef;
          var generateRenderer = new GenerateRendererTask(app.dataUrl);
          generateRenderer.execute(params, applyRenderer, errorHandler);
        }

        function applyRenderer(renderer) {
          // dynamic layer stuff
          var optionsArray = [];
          var drawingOptions = new LayerDrawingOptions();
          drawingOptions.renderer = renderer;
          // set the drawing options for the relevant layer
          // optionsArray index corresponds to layer index in the map service
          optionsArray[0] = drawingOptions;
          app.map.getLayer("us_counties").setLayerDrawingOptions(optionsArray);
          app.map.getLayer("us_counties").show();
          // create the legend if it doesn't exist
          if ( ! app.hasOwnProperty("legend") ) {
            createLegend();
          }
        }

        function createLegend() {
          app.legend = new Legend({
            map : app.map,
            layerInfos : [ {
              layer : app.map.getLayer("us_counties"),
              title : "US Counties"
            } ]
          }, dom.byId("legendDiv"));
          app.legend.startup();
        }

        function errorHandler(err) {
          // console.log("Something broke, error: ", err);
          console.log("error: ", JSON.stringify(err));
        }
      });
