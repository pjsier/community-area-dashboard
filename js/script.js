var commData, commGeo, map;
var gauge = gaugeChart()
  .width(250)
  .height(150)
  .colorOptions(["#1a9641", "#efef5d", "#d7191c"])
  .innerRadius(80)
  .outerRadius(120).margin({top: 0,left: 0,right: 0,bottom: 0});
var donut = donutChart();
var bars = barChart();

function loadCharts() {
  d3.select("#gauge").datum([0]).call(gauge);

  map = L.map("map-container", {dragging: !L.Browser.mobile});
  var osm = new L.TileLayer(
    "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
    { minZoom: 10, maxZoom: 18 }
  );

  map.addLayer(osm);
  map.setView([41.907477, -87.685913], 10);
  neighborhoodLayer = L.geoJson().addTo(map);

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", function() {
    var commAreas = JSON.parse(this.responseText);
    commGeo = L.geoJson(commAreas).addTo(map);
  });
  xhr.open("GET", baseUrl + "/data/chi_comm_areas.geojson");
  xhr.send();
}

function donutVals(commItem) {
  var raceVals = ["white","black","native_american","asian","other","hispanic","multiracial"];
  return raceVals.map(function(v) {
    return {label: v, value: commItem[v] };
  });
}

function barVals(commItem) {
  var ageVals = [
    "age_lt_5",
    "age_5_9",
    "age_10_14",
    "age_15_17",
    "age_18_19",
    "age_20_24",
    "age_25_29",
    "age_30_34",
    "age_35_39",
    "age_40_44",
    "age_45_49",
    "age_50_54",
    "age_55_59",
    "age_60_64",
    "age_65_69",
    "age_70_74",
    "age_75_79",
    "age_80_84",
    "age_gte_85"
  ];
  return ageVals.map(function(v) {
    return {label: v, value: commItem[v] };
  });
}

function updateData(commArea) {
  var commItem = commData.filter(function(d) { return d.comm_area === commArea; })[0];
  d3.select("#gauge").datum([commItem.hardship_index]).call(gauge);
  map.invalidateSize();
  commGeo.eachLayer(function(layer) {
    if (layer.feature.properties.community == commArea.toUpperCase()) {
      map.fitBounds(layer.getBounds());
      return;
    }
  });

  d3.select("#donut").datum(donutVals(commItem)).call(donut);
  d3.select("#bars").datum(barVals(commItem)).call(bars);
}

(function() {
  loadCharts();
  d3.csv(baseUrl + "/data/community_area_data.csv", function(data) {
    commData = data;
    window.addEventListener("hashchange", function() {
      $("#viz").show();
      var commArea = location.hash.substr(1);
      $(".commLabel").text(commArea);
      updateData(location.hash.substr(1));
    });
  });
})()
