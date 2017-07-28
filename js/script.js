var commData, commGeo, map;
var gauge = gaugeChart()
  .width(300)
  .height(200)
  .colorOptions(["#1a9641", "#efef5d", "#d7191c"])
  .innerRadius(50)
  .outerRadius(80).margin({top: 0,left: 0,right: 0,bottom: 0});
var donut = donutChart();
var bars = barChart();

function resize() {
  if (d3.select("#gauge svg").empty()) {
    return;
  }
  var gWidth = Math.min(d3.select("#gauge").node().offsetWidth, 260);
  gauge.width(gWidth).innerRadius(gWidth / 4).outerRadius((gWidth / 4) + 40);
  d3.select("#gauge").call(gauge);

  donut.width(+d3.select("#donut").style("width").replace(/(px)/g, ""))
    .height(+d3.select("#donut").style("height").replace(/(px)/g, ""));
  d3.select("#donut").call(donut);

  bars.width(+d3.select("#bars").style("width").replace(/(px)/g, ""))
    .height(+d3.select("#bars").style("height").replace(/(px)/g, ""));
  d3.select("#bars").call(bars);
}

function loadCharts() {
  map = L.map("map-container", {dragging: !L.Browser.mobile});
  var osm = new L.TileLayer(
    "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
    { minZoom: 10, maxZoom: 18 }
  );

  map.addLayer(osm);
  map.setView([41.907477, -87.685913], 10);
  commGeo = L.geoJson().addTo(map);

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", function() {
    var commAreas = JSON.parse(this.responseText);
    commGeo = L.geoJson(commAreas, {
      color: "#4dd0e1",
      weight: 1,
      opacity: 0.6
    }).addTo(map);
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
      layer.setStyle({fillColor: "#ff0000"});
      map.fitBounds(layer.getBounds());
    }
    else {
      layer.setStyle({fillColor: "#4dd0e1"});
    }
  });

  d3.select("#donut").datum(donutVals(commItem)).call(donut);
  d3.select("#bars").datum(barVals(commItem)).call(bars);
  resize();
}

(function() {
  loadCharts();
  d3.csv(baseUrl + "/data/community_area_data.csv", function(data) {
    commData = data;
    window.addEventListener("hashchange", function() {
      var commArea = decodeURIComponent(location.hash.substr(1));
      if (commArea === "") {
        $("h3.commLabel").text("Select a community area to view dashboard.");
        $("span.commLabel").text("Community Areas");
        $("#viz").hide();
      }
      else {
        $("#viz").show();
        $(".commLabel").text(commArea);
        updateData(commArea);
      }
    });
  });
  d3.select(window).on('resize', resize);
})()
