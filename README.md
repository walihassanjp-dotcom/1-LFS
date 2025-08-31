// ===============================
// Jam Chakro VIIRS Time-Series Extraction (2014-2025)
// Dataset: NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG
// ===============================
// This script extracts the monthly average radiance for a specific point
// and exports the data as a CSV file to your Google Drive.

// 1) CONFIGURATION
var pt = ee.Geometry.Point([67.030662, 25.028991]); // Jam Chakro coordinates
var startDate = '2014-01-01';
var endDate = '2025-12-31';

// 2) LOAD AND FILTER VIIRS DATA
// We use the stray-light corrected monthly composite.
var viirs = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG')
  .filterDate(startDate, endDate)
  .select(['avg_rad']); // We only need the average radiance band

// 3) EXTRACT TIME-SERIES DATA
// This function is applied to every image in the collection.
var extractTimeSeries = function(image) {
  // Use reduceRegion to get the pixel value at the point of interest.
  // Using .first() is efficient for single-point extraction.
  var stats = image.reduceRegion({
    reducer: ee.Reducer.first(),
    geometry: pt,
    scale: 463.83, // Native resolution of the data product
    tileScale: 16
  });

  // Extract the radiance value. The result is a dictionary.
  var radiance = stats.get('avg_rad');

  // Create a new feature for each image with its date and radiance value.
  // This will become a row in our final CSV.
  return ee.Feature(null, {
    // Format the date for readability.
    'date_time': image.date().format('YYYY-MM-dd'),
    // The radiance value in nanoWatts/cm^2/sr
    'radiance': radiance,
    // For a single point, "Sum of Lights" (SOL) is the same as the radiance value.
    'SOL': radiance,
    // Include the raw timestamp for potential sorting later.
    'system:time_start': image.get('system:time_start')
  });
};

// Map the function over the image collection to create a feature collection.
var timeSeriesFC = ee.ImageCollection(viirs.map(extractTimeSeries));

// Filter out any results that might be null (e.g., if there was no data for that month).
var timeSeriesFiltered = timeSeriesFC.filter(ee.Filter.notNull(['radiance']));

// 4) DISPLAY AND EXPORT
// (Optional) Print the first 5 results to the console to verify the data.
print('First 5 results from the time-series:', timeSeriesFiltered.limit(5));

// Export the FeatureCollection to a CSV file in your Google Drive.
Export.table.toDrive({
  collection: timeSeriesFiltered,
  description: 'JamChakro_VIIRS_TimeSeries_2014-2025',
  folder: 'GEE_Exports', // A folder named 'GEE_Exports' will be created if it doesn't exist
  fileNamePrefix: 'JamChakro_VIIRS_TimeSeries_2014-2025',
  fileFormat: 'CSV',
  // Specify which properties to include in the CSV columns.
  selectors: ['date_time', 'radiance', 'SOL']
});

// 5) MAP VISUALIZATION (Optional)
// Add the point to the map for context.
Map.centerObject(pt, 12);
Map.addLayer(pt, {color: 'red'}, 'Jam Chakro Point');

