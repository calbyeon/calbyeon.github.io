Traffic Analytics Map – Developer Notes
=======================================

Overview
--------
This repository contains a static ArcGIS JavaScript application that renders the Walnut Creek Traffic Analytics map. The main entry point is `index.html`, which embeds all JavaScript/CSS needed to drive the UI.

Project Structure
-----------------
- `index.html` – primary application file; contains layout, styling, and app logic.
- `app/` – custom AMD modules (if any) referenced via `dojoConfig`.
- `styles/` – additional CSS assets used by modules.
- `spinner.gif` – loading indicator displayed while queries run.
- `README-self-hosting.md` – step-by-step guide for serving the app yourself.
- `WIKI-ONE-PAGER.md` – high-level overview for internal knowledge transfer.

Key Dependencies
----------------
All dependencies are loaded from CDN:
- ArcGIS JavaScript API 4.30 (`https://js.arcgis.com/4.30/`)
- jQuery 3.6 / jQuery UI 1.13.2
- jsPDF 2.5.1 + AutoTable 3.5.21

Runtime Flow
------------
1. `dojoConfig` registers the `/app` folder so AMD modules can be referenced if needed.
2. `require([...], function(...) { ... })` loads ArcGIS modules and defines application logic.
3. `init()` builds the `MapView`, clones UI templates, populates filter lists (including relationship-driven years), and wires event listeners.
4. Filters are applied client-side: we query visible features, fetch related records, and update both map filters and the attribute table.
5. Export options (CSV/PDF and map snapshot) rely on jsPDF and the ArcGIS screenshot API.

Coding Notes
------------
- The app assumes ES2015+ features; ensure build/hosting environments support modern JS. A `jsconfig.json` sets `target: ES2022` for editor linting.
- Filtering logic lives in `applyFiltersAndDisplay()` and helpers like `clientSideFilterFeatures()` and `displayAttributes()`.
- The toolbar summary is updated in `updateFilterStatusSummary()`; modify this function to change messaging.
- For new filters, add constants near the top of the script and extend `createFilterElements()` / `applyFiltersAndDisplay()` accordingly.
- ArcGIS API warning about `sizeInfo` is benign; it originates from the saved WebMap renderer.

Development Tips
----------------
- Use `http-server` (see README-self-hosting.md) to test locally—the ArcGIS API blocks `file://` execution.
- Keep an eye on console warnings when the portal item changes (field removals, relationship edits).
- When modifying table layout or exports, update both the HTML template and jsPDF/CSV routines to keep parity.

Contacts / Resources
--------------------
- GIS Lead: <name / email>
- Traffic Engineering: <name / email>
- ArcGIS JS API docs: https://developers.arcgis.com/javascript/latest/
- jsPDF docs: https://artskydj.github.io/jsPDF/docs/

