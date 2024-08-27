# Traffic Analytics Application

## Overview
This web application provides an interactive map interface for analyzing traffic data in the City of Walnut Creek. It allows users to visualize, filter, and generate reports based on various traffic-related metrics.

## Features
- Interactive map display using ArcGIS API for JavaScript
- Data filtering by type, year, period, and street
- Attribute table display for selected features
- Report generation in PDF format
- Map printing functionality

## Prerequisites
- Web browser with JavaScript enabled
- Internet connection to access ArcGIS online services

## Setup
1. Clone this repository or download the HTML file.
2. Ensure you have the necessary permissions to access the ArcGIS Feature Layers used in the application.
3. Host the HTML file on a web server or open it locally in a web browser.

## Usage
1. Open the application in a web browser.
2. Use the map to navigate to desired locations.
3. Click on map features to select locations for analysis.
4. Use the filter options on the right side to refine the data display:
   - Data Type: Select the type of traffic data to display
   - Year: Choose one or multiple years for data filtering
   - Period: Filter by time of day (AM, MID, PM)
   - Street: Enter a street name to filter locations
5. The attribute table at the bottom will update based on your selections and filters.
6. Use the "Generate Report" button to create a PDF report of the selected data.
7. Use the "Print Map" button to generate a PDF of the current map view.

## Customization
- To modify the ArcGIS layers used, update the `baseUrl` and `layerIds` variables in the JavaScript code.
- Adjust the styling by modifying the CSS in the `<style>` section of the HTML file.

## Troubleshooting
- If the map doesn't load, check your internet connection and ensure you have the necessary permissions to access the ArcGIS services.
- For performance issues, try reducing the number of selected features or narrowing your filter criteria.

