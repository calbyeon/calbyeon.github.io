define([], function () {
  function UIManager(app) {
    this.app = app;
    this.currentSort = { index: -1, asc: true };
    this.setupEventListeners();
  }

  UIManager.prototype.setupEventListeners = function () {
    var self = this;

    // Generate Report Button
    document.getElementById("generateReportBtn").addEventListener("click", function () {
      self.app.reportGenerator.generateReport();
    });

    // Print Map Button
    document.getElementById("printMapBtn").addEventListener("click", function () {
      self.app.reportGenerator.printMap();
    });

    // Street Filter Input Validation
    var streetFilter = document.getElementById("streetFilter");
    streetFilter.addEventListener("input", function () {
      self.validateStreetInput();
      self.app.filterManager.updateYearFilterOptions();
      self.app.filterManager.applyFilters();
    });
    streetFilter.addEventListener("change", function () {
      self.validateStreetInput();
    });
    streetFilter.addEventListener("keydown", function (event) {
      self.handleEnterKey(event);
    });

    // Other UI event listeners can be added here
  };

  UIManager.prototype.displayAttributes = function (features) {
    var featuresContentDiv = document.getElementById("featuresContentDiv");
    featuresContentDiv.innerHTML = ""; // Clear previous content

    if (features.length === 0) {
      featuresContentDiv.innerHTML = "No features found in this layer.";
      return;
    }

    var table = document.createElement("table");
    table.className = "attribute-table";

    // Determine which columns have non-null values and are not excluded
    var columnsWithValues = {};
    var excludedFields = [
      "PopupInfo", "ObjectID", "PEAK_ID", "Latitude", "Longitude",
      "Intersection_ID", "Intersection_Type", "Leg_Type", "Traffic_DataCollection_Date",
      "City", "State", "Intersection_Value", "E", "N", "S", "W"
    ];
    features.forEach(function (feature) {
      for (var attr in feature.attributes) {
        if (
          feature.attributes.hasOwnProperty(attr) &&
          feature.attributes[attr] !== null &&
          !excludedFields.includes(attr)
        ) {
          columnsWithValues[attr] = true;
        }
      }
    });

    // Create header row
    var headerRow = table.createTHead().insertRow();
    var headers = [];
    for (var attr in features[0].attributes) {
      if (
        features[0].attributes.hasOwnProperty(attr) &&
        columnsWithValues[attr] &&
        !excludedFields.includes(attr)
      ) {
        headers.push(attr);
        var headerCell = document.createElement("th");
        headerCell.innerHTML = attr + ' <span class="sort-indicator">⇅</span>';

        // Use closure to capture the current value of attr
        (function (attrCopy) {
          headerCell.addEventListener("click", function () {
            var columnIndex = headers.indexOf(attrCopy);
            self.sortTable(table, columnIndex, headerCell);
          });
        })(attr);

        headerRow.appendChild(headerCell);
      }
    }

    // Create tbody
    var tbody = table.createTBody();
    features.forEach(function (feature) {
      var dataRow = tbody.insertRow();
      headers.forEach(function (attr) {
        var dataCell = dataRow.insertCell();
        dataCell.innerHTML =
          feature.attributes[attr] !== null ? feature.attributes[attr] : "N/A";
      });
    });

    featuresContentDiv.appendChild(table); // Append the table to the content div
  };

  UIManager.prototype.sortTable = function (table, columnIndex, headerCell) {
    if (columnIndex === -1) {
      console.error("Invalid column index:", columnIndex);
      return;
    }

    var tbody = table.tBodies[0];
    var rows = Array.from(tbody.rows);

    if (this.currentSort.index === columnIndex) {
      this.currentSort.asc = !this.currentSort.asc;
    } else {
      this.currentSort.index = columnIndex;
      this.currentSort.asc = true;
    }

    var asc = this.currentSort.asc;

    rows.sort(function (a, b) {
      var aCell = a.cells[columnIndex];
      var bCell = b.cells[columnIndex];

      // Safety check
      if (!aCell || !bCell) {
        console.warn("One of the cells is undefined:", aCell, bCell);
        return 0;
      }

      var aText = aCell.textContent.trim();
      var bText = bCell.textContent.trim();

      // Attempt to parse as numbers
      var aNum = parseFloat(aText.replace(/[^0-9.-]+/g, ""));
      var bNum = parseFloat(bText.replace(/[^0-9.-]+/g, ""));

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return asc ? aNum - bNum : bNum - aNum;
      } else {
        return asc ? aText.localeCompare(bText) : bText.localeCompare(aText);
      }
    });

    // Remove existing rows
    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }

    // Re-add sorted rows
    rows.forEach(function (row) {
      tbody.appendChild(row);
    });

    // Update sort indicators
    this.updateSortIndicators(table, columnIndex, asc);
  };

  UIManager.prototype.updateSortIndicators = function (table, sortedColumn, asc) {
    var headers = table.tHead.rows[0].cells;
    for (var i = 0; i < headers.length; i++) {
      var indicator = headers[i].querySelector(".sort-indicator");
      if (i === sortedColumn) {
        indicator.textContent = asc ? "↑" : "↓";
      } else {
        indicator.textContent = "⇅";
      }
    }
  };

  UIManager.prototype.validateStreetInput = function () {
    var streetInput = document.getElementById("streetFilter");
    var datalist = document.getElementById("streetNames");
    var options = datalist.options;
    var enteredValue = streetInput.value.trim().toLowerCase();
    var isValid = false;

    for (var i = 0; i < options.length; i++) {
      if (this.normalizeStreetName(options[i].value) === this.normalizeStreetName(enteredValue)) {
        isValid = true;
        break;
      }
    }

    var streetError = document.getElementById("streetError");

    if (isValid || enteredValue === "") {
      streetInput.style.borderColor = "green";
      streetError.style.display = "none";
      streetInput.setCustomValidity("");
    } else {
      streetInput.style.borderColor = "red";
      streetError.style.display = "block";
      streetInput.setCustomValidity("Please select a valid street from the suggestions.");
    }
  };

  UIManager.prototype.handleEnterKey = function (event) {
    if (event.key === "Enter") {
      var streetInput = event.target;
      var datalist = document.getElementById("streetNames");
      var options = Array.from(datalist.options).map(function (option) {
        return UIManager.prototype.normalizeStreetName(option.value);
      });
      var enteredValue = this.normalizeStreetName(streetInput.value);

      // Check if entered value matches any option
      if (!options.includes(enteredValue) && options.length > 0) {
        // Prevent form submission if inside a form
        event.preventDefault();

        // Set the input value to the first suggestion
        streetInput.value = datalist.options[0].value;
        this.validateStreetInput(); // Update validation visuals
      }
    }
  };

  UIManager.prototype.normalizeStreetName = function (street) {
    return street
      .trim()
      .toLowerCase()
      .replace(/\./g, "")
      .replace(/\bstreet\b/g, "st")
      .replace(/\bavenue\b/g, "ave")
      .replace(/\broad\b/g, "rd")
      .replace(/\bdrive\b/g, "dr")
      .replace(/\bsuite\b/g, "ste");
  };

  // Other UI-related methods can be added here
  UIManager.prototype.highlightFeatures = function (features) {
    var view = this.app.mapManager.view;
    view.graphics.removeAll();
    features.forEach(function (feature) {
      var graphic = new this.app.Graphic({
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
      view.graphics.add(graphic);
    }, this);
  };

  return UIManager;
});
