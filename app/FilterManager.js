define([
  "esri/layers/FeatureLayer",
  "esri/rest/support/Query",
  "esri/core/promiseUtils"
], function (FeatureLayer, Query, promiseUtils) {
  function FilterManager(app) {
    this.app = app;
    // Initialize filters
    this.setupEventListeners();
    this.populateStreetDatalist();
    this.initializeYearFilter();
  }

  FilterManager.prototype.setupEventListeners = function () {
    var self = this;

    // Street Filter Input Event
    document.getElementById("streetFilter").addEventListener("input", function () {
      self.app.uiManager.validateStreetInput();
      self.updateYearFilterOptions();
      self.applyFilters();
    });

    // Data Type Filter Change Event
    document.getElementById("dataTypeFilter").addEventListener("change", function () {
      self.updateYearFilterOptions();
      self.applyFilters();
    });

    // Year Filter Change Event
    document.getElementById("yearFilter").addEventListener("change", function () {
      self.applyFilters();
    });

    // Period Filter Change Event
    document.getElementById("periodFilter").addEventListener("change", function () {
      self.applyFilters();
    });
  };

  FilterManager.prototype.populateStreetDatalist = function () {
    var self = this;
    const streetSet = new Set();
    const streetList = [];

    // Iterate through each layer to extract street names
    this.app.mapManager.map.layers.forEach(function (layer) {
      if (layer instanceof FeatureLayer) {
        // Query distinct Major_Street and Minor_Street values
        const query = layer.createQuery();
        query.where = "1=1";
        query.outFields = ["Major_Street", "Minor_Street"];
        query.returnDistinctValues = true;
        query.returnGeometry = false;

        layer.queryFeatures(query)
          .then(function (result) {
            result.features.forEach(function (feature) {
              const majorStreet = feature.attributes.Major_Street;
              const minorStreet = feature.attributes.Minor_Street;

              // Process Major_Street
              if (majorStreet && majorStreet.trim() !== "") {
                const normalizedMajor = self.normalizeStreetName(majorStreet);
                if (!streetSet.has(normalizedMajor)) {
                  streetSet.add(normalizedMajor);
                  streetList.push(majorStreet.trim());
                }
              }

              // Process Minor_Street
              if (minorStreet && minorStreet.trim() !== "") {
                const normalizedMinor = self.normalizeStreetName(minorStreet);
                if (!streetSet.has(normalizedMinor)) {
                  streetSet.add(normalizedMinor);
                  streetList.push(minorStreet.trim());
                }
              }
            });

            // After collecting all unique street names, populate the datalist
            const datalist = document.getElementById("streetNames");
            datalist.innerHTML = ""; // Clear existing options
            streetList.sort(); // Sort alphabetically
            streetList.forEach(function (street) {
              const option = document.createElement("option");
              option.value = street;
              datalist.appendChild(option);
            });
          })
          .catch(function (error) {
            console.error("Error fetching street names from layer:", layer.title, error);
          });
      }
    });
  };

  FilterManager.prototype.initializeYearFilter = function () {
    var self = this;
    const yearFilter = document.getElementById("yearFilter");
    yearFilter.innerHTML = ""; // Clear existing options

    const allOption = document.createElement("option");
    allOption.value = "All";
    allOption.text = "All";
    yearFilter.appendChild(allOption);

    const uniqueYears = new Set();

    // Query each layer to collect all unique years without applying filters
    const yearPromises = this.app.mapManager.map.layers.map(function (layer) {
      if (layer instanceof FeatureLayer) {
        const query = layer.createQuery();
        query.where = "1=1"; // No filter initially
        query.outFields = ["Year"];
        query.returnDistinctValues = true;

        return layer.queryFeatures(query).then(function (result) {
          result.features.forEach(function (feature) {
            const year = feature.attributes["Year"];
            if (year) uniqueYears.add(year);
          });
        }).catch(function (error) {
          console.error("Error querying layer for unique years:", error);
        });
      }
    });

    // Populate the year filter dropdown with all unique years
    Promise.all(yearPromises).then(function () {
      Array.from(uniqueYears).sort().forEach(function (year) {
        const option = document.createElement("option");
        option.value = year;
        option.text = year;
        yearFilter.appendChild(option);
      });
    });
  };

  FilterManager.prototype.updateYearFilterOptions = function () {
    var self = this;
    const selectedYears = new Set();
    const yearFilter = document.getElementById("yearFilter");
    const previousSelections = Array.from(yearFilter.selectedOptions).map(option => option.value);

    yearFilter.innerHTML = ""; // Clear existing options

    const allOption = document.createElement("option");
    allOption.value = "All";
    allOption.text = "All";
    yearFilter.appendChild(allOption);

    // Build where clause from current active filters (street and data type)
    const dataType = document.getElementById("dataTypeFilter").value;
    const street = document.getElementById("streetFilter").value.trim();
    const whereClause = [];

    if (dataType !== "All") {
      whereClause.push("Data_Type = '" + dataType + "'");
    }
    if (street && street !== "All") {
      whereClause.push("(Major_Street LIKE '%" + street + "%' OR Minor_Street LIKE '%" + street + "%')");
    }
    const filterExpression = whereClause.length > 0 ? whereClause.join(" AND ") : "1=1";

    // Query each layer to collect unique years based on current filter expression
    const yearPromises = this.app.mapManager.map.layers.map(function (layer) {
      if (layer instanceof FeatureLayer) {
        const query = layer.createQuery();
        query.where = filterExpression;
        query.outFields = ["Year"];
        query.returnDistinctValues = true;

        return layer.queryFeatures(query).then(function (result) {
          result.features.forEach(function (feature) {
            const year = feature.attributes["Year"];
            if (year) selectedYears.add(year);
          });
        }).catch(function (error) {
          console.error("Error querying layer for unique years:", error);
        });
      }
    });

    // Populate year filter based on filter-specific unique years
    Promise.all(yearPromises).then(function () {
      Array.from(selectedYears).sort().forEach(function (year) {
        const option = document.createElement("option");
        option.value = year;
        option.text = year;
        yearFilter.appendChild(option);
      });

      // Restore previous selections if they are still valid
      Array.from(yearFilter.options).forEach(function (option) {
        if (previousSelections.includes(option.value)) {
          option.selected = true;
        }
      });
    });
  };

  FilterManager.prototype.applyFilters = function () {
    var self = this;
    // For each layer, build and apply definitionExpression
    this.app.mapManager.map.layers.forEach(function (layer) {
      if (layer instanceof FeatureLayer) {
        const whereClause = self.buildWhereClause(layer);
        const definitionExpression = whereClause.length > 0 ? whereClause.join(" AND ") : "1=1";
        console.log(`Applying filters to layer '${layer.title}' with definitionExpression: ${definitionExpression}`);
        layer.definitionExpression = definitionExpression;
      }
    });

    // Re-query selected locations with updated filters
    var filteredFeatures = [];

    this.app.mapManager.selectedLocations.forEach(function (layer) {
      if (!(layer instanceof FeatureLayer)) return; // Skip non-feature layers

      self.queryFeatures(layer).then(function (features) {
        filteredFeatures = filteredFeatures.concat(features);

        if (filteredFeatures.length === 0) {
          self.app.mapManager.selectedLocations = [];
          self.app.uiManager.displayAttributes([]); // Clear the attribute display if no matches
          self.app.mapManager.view.graphics.removeAll(); // Remove any highlighted graphics
        } else {
          self.app.uiManager.displayAttributes(filteredFeatures);
          self.app.mapManager.highlightFeatures(filteredFeatures);
        }
      }).catch(function (error) {
        console.error("Query failed: ", error);
      });
    });
  };

  FilterManager.prototype.buildWhereClause = function (layer) {
    const whereClause = [];
    const dataType = document.getElementById("dataTypeFilter").value;
    const years = this.getSelectedYears();
    const period = document.getElementById("periodFilter").value;
    const street = document.getElementById("streetFilter").value.trim();

    let hasAllRequiredFields = true;

    // Check for Data_Type field
    if (dataType !== "All") {
      const dataTypeField = layer.fields.find(f => f.name === "Data_Type");
      if (dataTypeField) {
        whereClause.push("Data_Type = '" + dataType + "'");
      } else {
        hasAllRequiredFields = false;
      }
    }

    // Check for Year field
    if (years.length > 0 && !years.includes("All")) {
      const yearField = layer.fields.find(f => f.name === "Year");
      if (yearField) {
        let yearValuesExpression = "";
        if (yearField.type === "small-integer" || yearField.type === "integer") {
          // Year is numeric, do not use quotes
          yearValuesExpression = "Year IN (" + years.join(",") + ")";
        } else {
          // Year is string, wrap values in single quotes
          yearValuesExpression = "Year IN (" + years.map(year => `'${year}'`).join(",") + ")";
        }
        whereClause.push(yearValuesExpression);
      } else {
        hasAllRequiredFields = false;
      }
    }

    // Check for Period field
    if (period !== "All") {
      const periodField = layer.fields.find(f => f.name === "Period");
      if (periodField) {
        whereClause.push("Period = '" + period + "'");
      } else {
        hasAllRequiredFields = false;
      }
    }

    // Check for Major_Street and Minor_Street fields
    if (street && street !== "All") {
      const majorStreetField = layer.fields.find(f => f.name === "Major_Street");
      const minorStreetField = layer.fields.find(f => f.name === "Minor_Street");
      if (majorStreetField || minorStreetField) {
        const streetConditions = [];
        if (majorStreetField) {
          streetConditions.push("Major_Street LIKE '%" + street + "%'");
        }
        if (minorStreetField) {
          streetConditions.push("Minor_Street LIKE '%" + street + "%'");
        }
        // Add parentheses around street conditions
        whereClause.push("(" + streetConditions.join(" OR ") + ")");
      } else {
        hasAllRequiredFields = false;
      }
    }

    if (!hasAllRequiredFields) {
      // Exclude this layer if it doesn't have required fields
      console.warn(`Excluding layer '${layer.title}' due to missing required fields.`);
      return ['1=0'];
    }

    return whereClause;
  };

  FilterManager.prototype.getSelectedYears = function () {
    const yearFilter = document.getElementById("yearFilter");
    const selectedYears = Array.from(yearFilter.selectedOptions).map(option => option.value);
    return selectedYears.includes("All") ? ["All"] : selectedYears;
  };

  FilterManager.prototype.queryFeatures = function (layer) {
    var self = this;
    var query = new Query();
    var whereClause = this.buildWhereClause(layer);

    query.where = whereClause.length > 0 ? whereClause.join(" AND ") : "1=1";
    query.outFields = ["*"];
    query.returnGeometry = true;

    return layer.queryFeatures(query).then(function (result) {
      return result.features;
    });
  };

  // Helper function to normalize street names
  FilterManager.prototype.normalizeStreetName = function (street) {
    return street.trim().toLowerCase()
      .replace(/\./g, "")
      .replace(/\bstreet\b/g, "st")
      .replace(/\bavenue\b/g, "ave")
      .replace(/\broad\b/g, "rd")
      .replace(/\bdrive\b/g, "dr")
      .replace(/\bsuite\b/g, "ste");
  };

  return FilterManager;
});
