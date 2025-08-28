// Google Earth Engine script: Plot OSM landfill sites in Karachi, Hyderabad, and Sukkur (Sindh, Pakistan)
// Usage: Copy this script into https://code.earthengine.google.com and run

// Load GAUL level 2 boundaries and filter to Sindh
var gaulL2 = ee.FeatureCollection('FAO/GAUL/2015/level2');
var sindhL2 = gaulL2.filter(ee.Filter.eq('ADM1_NAME', 'Sindh'));

// Helper to grab district(s) by partial name match (case sensitive)
function districtsLike(name) {
  return sindhL2.filter(ee.Filter.stringContains('ADM2_NAME', name));
}

var karachi = districtsLike('Karachi');
var hyderabad = districtsLike('Hyderabad');
var sukkur = districtsLike('Sukkur');

// Combined area of interest
var aoi = karachi.geometry()
  .union(hyderabad.geometry())
  .union(sukkur.geometry());

// Load OpenStreetMap polygons and points (public mirror on Earth Engine)
// If you get an asset access error, you can replace these with your own OSM imports
var osmPolys = ee.FeatureCollection('projects/sat-io/open-datasets/OSM/planet_osm_polygon');
var osmPoints = ee.FeatureCollection('projects/sat-io/open-datasets/OSM/planet_osm_point');

// Define a filter for landfill-related tags
var landfillFilter = ee.Filter.or(
  ee.Filter.eq('landuse', 'landfill'),
  ee.Filter.eq('waste', 'landfill'),
  ee.Filter.eq('landfill', 'yes'),
  ee.Filter.and(
    ee.Filter.eq('amenity', 'waste_disposal'),
    ee.Filter.eq('waste', 'landfill')
  )
);

// Apply filters within AOI
var landfillPolys = osmPolys.filter(landfillFilter).filterBounds(aoi);
var landfillPoints = osmPoints.filter(landfillFilter).filterBounds(aoi);

// Map display
Map.setOptions('HYBRID');
Map.centerObject(aoi, 8);

Map.addLayer(karachi.style({color: '00AEEF', width: 2}), {}, 'Karachi boundary');
Map.addLayer(hyderabad.style({color: '00AEEF', width: 2}), {}, 'Hyderabad boundary');
Map.addLayer(sukkur.style({color: '00AEEF', width: 2}), {}, 'Sukkur boundary');

Map.addLayer(
  landfillPolys.style({color: 'FF5500', fillColor: 'FF550033', width: 1}),
  {},
  'Landfills (polygons)'
);
Map.addLayer(
  landfillPoints.style({color: 'FF0000', pointSize: 5}),
  {},
  'Landfills (points)'
);

// Console stats
print('Landfill polygons (count):', landfillPolys.size());
print('Landfill points (count):', landfillPoints.size());

// Optional: export the combined features as a table to Drive (uncomment to use)
// var allLandfills = landfillPolys.merge(landfillPoints);
// Export.table.toDrive({
//   collection: allLandfills,
//   description: 'sindh_landfills_osm',
//   fileFormat: 'GeoJSON'
// });

