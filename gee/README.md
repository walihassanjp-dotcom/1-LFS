Google Earth Engine: Landfill sites in Karachi, Hyderabad, and Sukkur

How to use

1. Open the Earth Engine Code Editor at https://code.earthengine.google.com/.
2. Create a new script and paste the contents of `gee/landfills_sindh.js` into the editor.
3. Click Run. The map will zoom to the three cities in Sindh and display:
   - OSM features tagged as landfills (polygons and points)
   - District boundaries for Karachi, Hyderabad, and Sukkur

Notes

- The script uses GAUL Level 2 for district boundaries and an OpenStreetMap mirror hosted under `projects/sat-io` in Earth Engine. If you see an asset access error, replace those sources with your own assets.
- You can export the merged landfill features to Google Drive by uncommenting the export block at the bottom of the script.
