# Traffic Analytics Map – One Pager

## Purpose
Interactive web map for Walnut Creek traffic analytics. Provides filtering, selection-driven summaries, and export options (CSV, PDF, map snapshot) so staff can review traffic counts, movements, and related studies quickly.

## Key Features
- **ArcGIS WebMap integration** – pulls live data from portal item `e22b69d781254a3bbbf5d2310ba75315`.
- **Dynamic filtering** – data type, year (multi-select), period, and street search with autocomplete.
- **Selection awareness** – filters pivot automatically to the highlighted features when the user clicks on the map.
- **Attribute table** – sticky headers, client-side sorting, directional columns grouped in logical order.
- **Exports** – table to CSV/PDF via jsPDF + AutoTable; map export produces labeled letter-size PDF screenshot.

## Architecture
- Pure front-end app served as static files.
- Dependencies loaded from CDN: ArcGIS JS API 4.30, jQuery 3.6, jQuery UI 1.13, jsPDF 2.5, AutoTable 3.5.
- Custom logic lives in `index.html` (inline script) with helper modules available under `/app` for advanced extensions.
- Styling handled in-page; table and toolbar CSS tailored for sticky headers and responsive layout.

## How It Works
1. `dojoConfig` registers the local `app` package.
2. `init()` loads the WebMap, waits for layer views, clones UI templates, and populates filter lists (including relationship-driven years).
3. Filters are applied client-side by querying visible features, trimming via related records, and updating both map and table.
4. Selection + filter state summarized in the toolbar and filter panel.

## Hosting & Deployment
- Static assets: `index.html`, `/app/`, `/styles/`, `spinner.gif`.
- Works on any static host (ArcGIS Experience site, S3 + CloudFront, nginx, etc.).
- For quick local testing: `http-server -p 8080` (see `README-self-hosting.md` for step-by-step instructions).

## Operational Notes
- Portal item ownership: confirm the WebMap remains shared to the target audience; app only reads.
- If filters stop showing expected data, check that related tables retain the `Year` field and relationships are still configured.
- The ArcGIS API warning about `sizeInfo` originates from the saved renderer; harmless unless symbology refresh is needed.
- To adjust data filters (new periods, new fields), update constants near the top of the inline script.

## Handoff Checklist
- [ ] Confirm portal item access for replacement owner.
- [ ] Copy repo + `README-self-hosting.md` into team SharePoint/Git.
- [ ] Review export buttons after any library upgrades.
- [ ] Schedule periodic QA (quarterly) to ensure map/table alignment after data refreshes.

## Contacts & Resources
- **GIS Lead:** _<name / email>_
- **Traffic Engineering:** _<name / email>_
- ArcGIS API docs: https://developers.arcgis.com/javascript/latest/
- jsPDF docs: https://artskydj.github.io/jsPDF/docs/jsPDF.html

