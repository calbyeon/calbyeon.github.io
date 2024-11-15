define([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/Graphic",
  "esri/geometry/Extent",
  "esri/rest/support/Query",
  "esri/core/watchUtils",
  "Utility" // Assuming you have a Utility module
], function (Map, MapView, FeatureLayer, Graphic, Extent, Query, watchUtils, Utility) {
  function MapManager(app) {
    this.app = app;
    this.map = null;
    this.view = null;
    this.selectedLocations = [];
    this.initMap();
  }

  MapManager.prototype.initMap = function () {
    var self = this;
    this.map = new Map({
      basemap: "streets-navigation-vector",
    });

    this.view = new MapView({
      container: "viewDiv",
      map: this.map,
      center: [-122.063686, 37.901657],
      zoom: 13,
    });

    var baseUrl =
      "https://services2.arcgis.com/AhHMUmDoudKVXiUl/arcgis/rest/services/Traffic_Analysis_PEAK_WFL1/FeatureServer";
    var layerIds = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
      41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
      60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
      79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97,
      98, 99, 100, 101,
    ];

    layerIds.forEach(function (id) {
      var layer = new FeatureLayer({
        url: `${baseUrl}/${id}`,
        outFields: ["*"],
      });
      self.map.add(layer);
    });

    // Map click event
    this.view.on("click", function (event) {
      self.view.hitTest(event).then(function (response) {
        var layerResult = response.results.filter(function (result) {
          return (
            result.graphic &&
            result.graphic.layer &&
            result.graphic.layer.type === "feature"
          );
        })[0];

        if (layerResult) {
          self.toggleLocationSelection(layerResult.graphic.layer);
        } else {
          // No features clicked; clear selections
          self.selectedLocations = [];
          self.view.graphics.removeAll();
          self.app.uiManager.displayAttributes([]);
          self.updateLocationSelectionUI();
        }
      });
    });

    // Map load event
    this.view.when(function () {
      console.log("Map loaded successfully. Click on a point to begin.");
      self.app.filterManager.populateStreetDatalist();
      self.app.filterManager.initializeYearFilter();
    });
  };

  MapManager.prototype.toggleLocationSelection = function (layer) {
    const index = this.selectedLocations.findIndex((l) => l.id === layer.id);
    if (index > -1) {
      this.selectedLocations.splice(index, 1);
    } else {
      this.selectedLocations.push(layer);
    }
    this.updateLocationSelectionUI();
    this.querySelectedLocations();
  };

  MapManager.prototype.updateLocationSelectionUI = function () {
    console.log("Selected locations:", this.selectedLocations.length);
    // Update UI elements if necessary, e.g., updating a counter or list
  };

  MapManager.prototype.querySelectedLocations = function () {
    var self = this;
    var promises = this.selectedLocations.map(function (layer) {
      return self.app.filterManager.queryFeatures(layer);
    });

    Promise.all(promises)
      .then(function (results) {
        var allFeatures = results.flat();
        self.app.uiManager.displayAttributes(allFeatures);
        self.highlightFeatures(allFeatures);
      })
      .catch(function (error) {
        console.error("Error querying selected locations:", error);
      });
  };

  MapManager.prototype.highlightFeatures = function (features) {
    var self = this;
    this.view.graphics.removeAll();
    features.forEach(function (feature) {
      var graphic = new Graphic({
        geometry: feature.geometry,
        symbol: {
          type: "simple-marker",
          style: "circle",
          color: [255, 255, 0, 0.8],
          size: "12px",
          outline: {
            color: [255, 255, 0, 0.8],
            width: "2px",
          },
        },
      });
      self.view.graphics.add(graphic);
    });
  };

  return MapManager;
});
