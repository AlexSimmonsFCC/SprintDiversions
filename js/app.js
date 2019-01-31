var app = {};
require([
  "esri/map", "esri/tasks/query",
  "esri/layers/ArcGISTiledMapServiceLayer", "esri/layers/FeatureLayer",
  "esri/tasks/ClassBreaksDefinition", "esri/tasks/AlgorithmicColorRamp",
  "esri/tasks/GenerateRendererParameters", "esri/tasks/GenerateRendererTask",
  "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",
  "esri/dijit/PopupTemplate", "esri/dijit/Legend",
  "dojo/parser", "dojo/_base/array", "esri/Color",
  "dojo/dom", "dojo/dom-construct", "dojo/number",
  "dojo/data/ItemFileReadStore", "dijit/form/FilteringSelect",
  "dijit/layout/BorderContainer", "dijit/layout/ContentPane",
  "dojo/domReady!"

], function (
  Map, Query,
  ArcGISTiledMapServiceLayer, FeatureLayer,
  ClassBreaksDefinition, AlgorithmicColorRamp,
  GenerateRendererParameters, GenerateRendererTask,
  SimpleLineSymbol, SimpleFillSymbol,
  PopupTemplate, Legend,
  parser, arrayUtils, Color,
  dom, domConstruct, number,
  ItemFileReadStore, FilteringSelect
) {

  parser.parse();
  // the counties map service uses the actual field name as the field alias
  // set up an object to use as a lookup table to convert from terse field
  // names to more user friendly field names
  app.fields = {
    "market_pop": "Market Population",
    "swdiversio": "Verizon to Verizon"
  };



  app.map = new Map("map", {
    center: [-95.3, 38.397],
    zoom: 4,
    slider: false
  });
  var basemap = new ArcGISTiledMapServiceLayer("https://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer");
  app.map.addLayer(basemap);
  var ref = new ArcGISTiledMapServiceLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer");
  app.map.addLayer(ref);

  // various info for the feature layer
  app.countiesUrl = "https://services.arcgis.com/YnOQrIGdN9JGtBh4/arcgis/rest/services/CMA_Full/FeatureServer/0";
  app.outFields = ["swdiversio", "market_pop"];
  app.currentAttribute = "market_pop";
  app.popupTemplate = new PopupTemplate({
    title: "{MarketName} county",
    fieldInfos: [{
      "fieldName": app.currentAttribute,
      "label": app.fields[app.currentAttribute],
      "visible": true,
      "format": {
        places: 0,
        digitSeparator: true
      }
    }],
    showAttachments: true
  });

  // create a feature layer 
  // wait for map to load so the map's extent is available
  app.map.on("load", function () {
    app.wash = new FeatureLayer(app.countiesUrl, {
      "id": "Washington",
      "infoTemplate": app.popupTemplate,
      "outFields": app.outFields,
      "opacity": 0.8
    });

    // show selected attribute on click
    app.mapClick = app.wash.on("click", function (evt) {
      var name = evt.graphic.attributes.NAME + " County",
        ca = app.currentAttribute,
        content = app.fields[ca] + ": " + number.format(evt.graphic.attributes[ca]);
      app.map.infoWindow.setTitle(name);
      app.map.infoWindow.setContent(content);
      // show info window at correct location based on the event's properties
      (evt) ? app.map.infoWindow.show(evt.screenPoint, app.map.getInfoWindowAnchor(evt.screenPoint)): null;
    });

    app.map.addLayer(app.wash);



    // colors for the renderer
    app.defaultFrom = Color.fromHex("#ff0000");
    app.defaultTo = Color.fromHex("#660000");


    createRenderer("market_pop");


    var yearDp = document.getElementById("YR");
    var monthDp = document.getElementById("MNTH");
    var filterButton = document.getElementById('filterBtn');


    

    //Create a query for use in our code.
    var query = new Query();
    query.where = '1=1';
    query.outFields = ["YR"];
    query.returnGeometry = false;

    var arr1 = [];

    app.wash.queryFeatures(query).then(function (featureSet) {
      //Since the "year field is not distinct, we only add the year to the empty array if it is not in there already"
      featureSet.features.forEach(function (feature) {
        if (arr1.includes(feature.attributes.YR) === false) {
          arr1.push(feature.attributes.YR);
        }
      });

      // For each unique year, create an option and add it to the dropdown list.
      arr1.forEach(function (year) {
        var option = document.createElement("option");
        option.text = year;
        yearDp.add(option);
      });
      // setDefinitionExp(yearDp.value);
    });

    //Set the definition expression based on the value of the dropdown.
    function setDefinitionExp(yearValue, monthValue) {
      console.log(yearValue, monthValue);
      console.log("YR = " + yearValue + " AND " + "MNTH = " + monthValue);
      app.wash.setDefinitionExpression("YR = " + yearValue + " AND " + "MNTH = " + monthValue);
    }


    //Create a query for use in our code.
    var query2 = new Query();
    query2.where = '1=1';
    query2.outFields = ["MNTH"];
    query2.returnGeometry = false;

    var arr = [];

    app.wash.queryFeatures(query2).then(function (featureSet) {
      //Since the "year field is not distinct, we only add the year to the empty array if it is not in there already"
      featureSet.features.forEach(function (feature) {
        if (arr.includes(feature.attributes.MNTH) === false) {
          arr.push(feature.attributes.MNTH);
        }
      });

      // For each unique year, create an option and add it to the dropdown list.
      arr.forEach(function (month) {
        var option = document.createElement("option");
        option.text = month;
        monthDp.add(option);
      });
      // setDefinitionExp2(monthDp.value);
    });

    filterButton.addEventListener('click', function(){
      setDefinitionExp(yearDp.value, monthDp.value);
    });

  });




  // create a store and a filtering select for the county layer's fields
  var fieldNames, fieldStore, fieldSelect;
  fieldNames = {
    "identifier": "value",
    "label": "name",
    "items": []
  };
  arrayUtils.forEach(app.outFields, function (f) {
    if (arrayUtils.indexOf(f.split(" "), "cnamname") == -1) { // exclude attrs that contain "NAME"
      fieldNames.items.push({
        "name": app.fields[f],
        "value": f
      });
    }
  });

  fieldStore = new ItemFileReadStore({
    data: fieldNames
  });
  fieldSelect = new FilteringSelect({
    displayedValue: fieldNames.items[0].name,
    value: fieldNames.items[0].value,
    name: "fieldsFS",
    required: false,
    store: fieldStore,
    searchAttr: "name",
    style: {
      "width": "290px",
      "fontSize": "12pt",
      "color": "#444"
    }
  }, domConstruct.create("div", null, dom.byId("fieldWrapper")));
  fieldSelect.on("change", updateAttribute);

  function createRenderer(field) {
    app.sfs = new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_SOLID,
      new SimpleLineSymbol(
        SimpleLineSymbol.STYLE_SOLID,
        new Color([0, 0, 0]),
        0.5
      ),
      null
    );
    var classDef = new ClassBreaksDefinition();
    classDef.classificationField = app.currentAttribute;
    classDef.classificationMethod = "quantile";
    classDef.breakCount = 5;
    classDef.baseSymbol = app.sfs;

    var colorRamp = new AlgorithmicColorRamp();
    colorRamp.fromColor = app.defaultFrom;
    colorRamp.toColor = app.defaultTo;
    colorRamp.algorithm = "hsv"; // options are:  "cie-lab", "hsv", "lab-lch"
    classDef.colorRamp = colorRamp;

    var params = new GenerateRendererParameters();
    params.classificationDefinition = classDef;
    // limit the renderer to data being shown by the feature layer
    params.where = app.layerDef;
    var generateRenderer = new GenerateRendererTask(app.countiesUrl);
    generateRenderer.execute(params, applyRenderer, errorHandler);

  }

  function applyRenderer(renderer) {
    app.wash.setRenderer(renderer);
    app.wash.redraw();
    createLegend(app.map, app.wash);
  }

  function updateAttribute(ch) {
    app.map.infoWindow.hide();
    delete app.popupTemplate;
    app.popupTemplate = new PopupTemplate({
      title: "{cnamname} County",
      fieldInfos: [{
        "fieldName": ch,
        "label": app.fields[ch],
        "visible": true,
        "format": {
          places: 0,
          digitSeparator: true
        }
      }],
      showAttachments: false
    });
    app.wash.setInfoTemplate(app.popupTemplate);
    app.currentAttribute = ch;
    createRenderer(ch);
    createLegend(app.map, app.wash);
  }

  function createLegend(map, fl) {
    // destroy previous legend, if present
    if (app.hasOwnProperty("legend")) {
      app.legend.destroy();
      domConstruct.destroy(dojo.byId("legendDiv"));
    }
    // create a new div for the legend
    var legendDiv = domConstruct.create("div", {
      id: "legendDiv"
    }, dom.byId("legendWrapper"));

    app.legend = new Legend({
      map: map,
      layerInfos: [{
        layer: fl,
        title: "Census Attribute: " + app.fields[app.currentAttribute]
      }]
    }, legendDiv);
    app.legend.startup();
  }

  function errorHandler(err) {
    console.log('Oops, error: ', err);
  }
});
