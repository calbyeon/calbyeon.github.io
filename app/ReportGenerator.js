define([
  'https://js.arcgis.com/4.28/', // Ensure ArcGIS API is loaded
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.21/jspdf.plugin.autotable.min.js',
  'esri/geometry/Extent',
  'esri/geometry/geometryEngine',
  'esri/core/watchUtils',
], function (ArcGIS, jsPDFLib, jsPDFPlugin, Extent, geometryEngine, watchUtils) {
  function ReportGenerator(app) {
    this.app = app;
  }

  ReportGenerator.prototype.generateReport = function () {
    var selectedLocations = this.app.mapManager.selectedLocations;
    var app = this.app;
    if (selectedLocations.length === 0) {
      alert("No locations selected. Please select locations for the report.");
      return;
    }

    var promises = selectedLocations.map(function (layer) {
      return app.filterManager.queryFeatures(layer);
    });

    Promise.all(promises).then(function (results) {
      var allFeatures = results.flat();
      // Generate PDF using jsPDF
      generatePDF(allFeatures);
    });
  };

  ReportGenerator.prototype.printMap = function () {
    var selectedLocations = this.app.mapManager.selectedLocations;
    var app = this.app;
    if (selectedLocations.length === 0) {
      alert("No locations selected. Please select locations first.");
      return;
    }

    var promises = selectedLocations.map(function (layer) {
      return app.filterManager.queryFeatures(layer);
    });

    Promise.all(promises).then(function (results) {
      var allFeatures = results.flat();
      // Implement the printMap function
      printMap(allFeatures, app);
    });
  };

  // Helper function to generate PDF using jsPDF
  function generatePDF(features) {
    if (features.length === 0) {
      alert("No data available to generate report.");
      return;
    }

    // Access jsPDF from the global namespace
    var { jsPDF } = window.jspdf;

    var doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    doc.text("Traffic Analytics Report", 105, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 25);

    // Fields to potentially include
    var potentialFields = [
      // Existing fields
      "Data_Type",
      "Year",
      "Period",
      "Major_Street",
      "Minor_Street",
      // Additional fields
      "EBL",
      "EBT",
      "EBR",
      "WBL",
      "WBT",
      "WBR",
      "NBL",
      "NBT",
      "NBR",
      "SBL",
      "SBT",
      "EB",
      "WB",
      "NB",
      "SB",
    ];

    // Determine which fields have at least one non-"N/A" value
    var includedFields = potentialFields.filter(function (field) {
      return features.some(function (feature) {
        var value = feature.attributes[field];
        return value !== null && value !== undefined && value !== "N/A" && value !== "";
      });
    });

    if (includedFields.length === 0) {
      alert("No valid data available to generate report with the specified fields.");
      return;
    }

    // Prepare the table data
    var tableData = features.map(function (feature) {
      var rowData = {};
      includedFields.forEach(function (field) {
        var value = feature.attributes[field];
        rowData[field] = value !== null && value !== undefined && value !== "" ? value : "N/A";
      });
      return rowData;
    });

    // Add the table to the PDF
    doc.autoTable({
      head: [includedFields],
      body: tableData.map((row) => includedFields.map((field) => row[field])),
      startY: 35,
      theme: "striped",
      styles: { fontSize: 10 },
    });

    // Save the PDF
    doc.save("traffic_analytics_report.pdf");
  }

  // Helper function to print the map
  function printMap(features, app) {
    // Assuming we have access to the map view
    var view = app.mapManager.view;

    if (features.length === 0) {
      alert("No features selected. Please select features first.");
      return;
    }

    var extent = null;
    var validFeatures = features.filter(function (feature) {
      return feature.geometry;
    });

    if (validFeatures.length === 0) {
      alert("No valid geometries found in the selected features. Unable to print map.");
      return;
    }

    // Calculate combined extent of all features
    validFeatures.forEach(function (feature) {
      if (extent) {
        extent = extent.union(feature.geometry.extent || feature.geometry);
      } else {
        extent = feature.geometry.extent ? feature.geometry.extent.clone() : feature.geometry.clone();
      }
    });

    if (!extent) {
      alert("Unable to determine map extent. Please try again.");
      return;
    }

    // Adjust the extent to include a buffer around the features
    var bufferedExtent = geometryEngine.buffer(extent, 500, "meters").extent;

    // Zoom to the buffered extent
    view.goTo(bufferedExtent.expand(1.2)).then(function () {
      // Wait until the view is stationary
      watchUtils.whenTrueOnce(view, "stationary", function () {
        view
          .takeScreenshot({
            format: "jpg",
            width: 900,
            height: 1200,
          })
          .then(function (screenshot) {
            var image = new Image();
            image.src = screenshot.dataUrl;

            image.onload = function () {
              var { jsPDF } = window.jspdf;
              var doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
              });

              doc.setFontSize(18);
              doc.text("Traffic Analytics Map", 105, 15, { align: "center" });

              var pageWidth = doc.internal.pageSize.getWidth();
              var pageHeight = doc.internal.pageSize.getHeight();
              var margin = 10;
              var bottomY = pageHeight - 20; // Start 20mm from bottom
              var maxWidth = pageWidth - 2 * margin;
              var maxHeight = pageHeight - 50;

              var imgRatio = image.height / image.width;
              var pageRatio = maxHeight / maxWidth;

              var imgWidth, imgHeight;

              if (imgRatio > pageRatio) {
                imgHeight = maxHeight;
                imgWidth = imgHeight / imgRatio;
              } else {
                imgWidth = maxWidth;
                imgHeight = imgWidth * imgRatio;
              }

              var xOffset = (pageWidth - imgWidth) / 2;

              doc.addImage(image, "JPEG", xOffset, 25, imgWidth, imgHeight);

              // Add additional elements like scalebar, legend, date, filters, etc.
              doc.setFontSize(10);
              doc.text("Generated on: " + new Date().toLocaleDateString(), margin, pageHeight - 10);

              // Save the PDF
              doc.save("traffic_analytics_map.pdf");
            };
          });
      });
    }).catch(function (error) {
      console.error("Error while zooming to extent:", error);
      alert("An error occurred while preparing the map for print. Please try again.");
    });
  }

  return ReportGenerator;
});
