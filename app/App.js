define([
    "app/MapManager",
    "app/FilterManager",
    "app/UIManager",
    "app/ReportGenerator",
    "app/Utility"
  ], function (MapManager, FilterManager, UIManager, ReportGenerator, Utility) {
    function App() {
      this.mapManager = null;
      this.filterManager = null;
      this.uiManager = null;
      this.reportGenerator = null;
      this.utility = Utility;
      this.init();
    }
  
    App.prototype.init = function () {
      var self = this;
      // Initialize components
      this.filterManager = new FilterManager(this);
      this.uiManager = new UIManager(this);
      this.mapManager = new MapManager(this);
      this.reportGenerator = new ReportGenerator(this);
    };
  
    return App;
  });
  