// Based on reusable chart pattern from https://bost.ocks.org/mike/chart/

function gaugeChart() {
  var margin = {top: 20, right: 30, bottom: 10, left: 20},
      width = 250,
      height = 150,
      arcMin = -Math.PI/2,
      arcMax = Math.PI/2,
      innerRadius = 60,
      outerRadius = 80,
      dataDomain = [0, 50, 100],
      dataValue = function(d) { return +d; },
      colorScale = d3.scaleLinear(),
      arcScale = d3.scaleLinear(),
      colorOptions = ["#d7191c", "#efef5d", "#1a9641"];
      arc = d3.arc();

  // Arc tween example adapted from http://bl.ocks.org/mbostock/5100636
  function arcTween(scale, attr) {
    return function(d) {
      var interpolate = d3.interpolate(d.endAngle, scale(d[attr]));
      return function(t) {
        d.endAngle = interpolate(t);
        return arc(d);
      };
    };
  }

  function chart(selection) {
    selection.each(function(data) {
      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) { return dataValue(d); });
      arcScale = d3.scaleLinear().domain(dataDomain).range([arcMin, 0, arcMax]);
      colorScale = d3.scaleLinear().domain(dataDomain).range(colorOptions);
      arc = d3.arc().innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(arcMin);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      var arcGEnter = gEnter.append("g").attr("class", "arc");
      arcGEnter.append("path").attr("class", "bg-arc");
      arcGEnter.append("path").attr("class", "data-arc");
      arcGEnter.append("text").attr("class", "arc-label");

      // Update the outer dimensions.
      var svg = selection.select("svg");
      svg.attr("width", width).attr("height", height);
      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var arcG = svg.select("g.arc")
        .attr("transform", "translate(" +
          ((width - margin.left - margin.right) / 2) + "," +
          (((height - margin.top - margin.bottom) / 2) * 1.75) + ")");

      svg.select("g.arc .bg-arc")
        .datum({endAngle: arcMax})
        .style("fill", "#ddd")
        .attr("d", arc);

      var dataArc = svg.select("g.arc .data-arc")
        .datum({endAngle: arcMin, score: data[0]})
        .style("fill", function(d) { return colorScale(d.score); })
        .attr("d", arc);

      dataArc.transition()
        .duration(750)
        .attrTween("d", arcTween(arcScale, "score"));

      var arcBox = arcG.node().getBBox();
      svg.select("text.arc-label")
        .datum({score: data[0]})
        .attr("x", (arcBox.width/2)+arcBox.x)
        .attr("y", -15)
        .style("alignment-baseline", "central")
        .style("text-anchor", "middle")
        .style("font-size", "36px")
        .text(function(d) { return d.score; });
    });
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.innerRadius = function(_) {
    if (!arguments.length) return innerRadius;
    innerRadius = _;
    return chart;
  };

  chart.outerRadius = function(_) {
    if (!arguments.length) return outerRadius;
    outerRadius = _;
    return chart;
  };

  chart.dataDomain = function(_) {
    if (!arguments.length) return dataDomain;
    dataDomain = _;
    return chart;
  };

  chart.colorOptions = function(_) {
    if (!arguments.length) return colorOptions;
    colorOptions = _;
    return chart;
  };

  return chart;
}


function donutChart() {
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
      width = 350,
      height = 350,
      donutWidth = 60,
      labelValue = function(d) {
        return d.label.split("_").map(function(d) {
          return d[0].toUpperCase() + d.slice(1);
        }).join(" ");
      },
      dataValue = function(d) { return +d.value; },
      colorScale = d3.scaleOrdinal(),
      colorOptions = d3.schemeCategory20;

  function chart(selection) {
    selection.each(function(data) {
      data = data.map(function(d, i) {
        return { label: labelValue(d), value: dataValue(d) };
      });
      colorScale = d3.scaleOrdinal().domain(data.map(labelValue)).range(colorOptions);
      var pie = d3.pie()
        .value(dataValue)
        .sort(null);
      var legendRectSize = 18;
			var legendSpacing = 4;

      var radius = Math.min(width-margin.left-margin.right, height-margin.top-margin.bottom) / 2;
      var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

      // https://bl.ocks.org/mbostock/1346410
      function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
          return arc(i(t));
        };
      }

      var svg = d3.select(this).selectAll("svg").data([data]);
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.selectAll().data(pie).enter().append("path")
        .attr("d", arc)
        .each(function(d) { this._current = d; });
      var legendEnter = gEnter.selectAll(".legend").data(data)
        .enter().append("g").attr("class", "legend");
      legendEnter.append("rect");
      legendEnter.append("text");

      var svg = selection.select("svg");
      svg.attr('width', width).attr('height', height)
      var g = svg.select("g")
        .attr("transform", "translate(" +
          ((width - margin.left - margin.right) / 2) + "," +
          ((height - margin.top - margin.bottom) / 2) + ")");

      var donutPath = g.selectAll("path")
        .data(pie)
        .attr("fill", function(d) { return colorScale(labelValue(d.data)); })
        .transition()
          .duration(750)
          .attrTween("d", arcTween);

      var legend = g.selectAll(".legend")
        .data(data)
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
          var height = legendRectSize + legendSpacing;
          var offset =  height * data.length / 2;
          var horz = -3 * legendRectSize;
          var vert = i * height - offset;
          return 'translate(' + horz + ',' + vert + ')';
        });

      legend.select('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', function(d) { return colorScale(d.label); });

      var totalPop = d3.sum(data, function(d) { return d.value; });
      legend.select('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .attr("font-size", "12px")
        .text(function(d) {
          return labelValue(d) + " " + d3.format(".1%")(d.value/totalPop);
        });
      });
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.donutWidth = function(_) {
    if (!arguments.length) return donutWidth;
    donutWidth = _;
    return chart;
  };

  chart.labelValue = function(_) {
    if (!arguments.length) return labelValue;
    labelValue = _;
    return chart;
  };

  chart.dataValue = function(_) {
    if (!arguments.length) return dataValue;
    dataValue = _;
    return chart;
  };

  chart.colorOptions = function(_) {
    if (!arguments.length) return colorOptions;
    colorOptions = _;
    return chart;
  };

  return chart;
}


function barChart() {
  var margin = {top: 10, right: 10, bottom: 40, left: 40},
      width = 350,
      height = 350,
      labelValue = function(d) {
        return d.label.substr(4)
          .replace(/(lt_)/g, "<")
          .replace(/(gte_)/g, ">=")
          .replace(/_/g, "-");
      },
      dataValue = function(d) { return +d.value; },
      bandPadding = 0.1,
      color = "#b2ebf2";

  function chart(selection) {
    selection.each(function(data) {
      data = data.map(function(d, i) {
        return { label: labelValue(d), value: dataValue(d) };
      });
      var x = d3.scaleBand().rangeRound([0, width-margin.top-margin.bottom]).padding(bandPadding),
          y = d3.scaleLinear().rangeRound([0, height-margin.left-margin.right]);

      x.domain(data.map(function(d) { return d.label; }));
      y.domain([0, d3.max(data, dataValue)]);

      var svg = d3.select(this).selectAll("svg").data([data]);
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("g").attr("class", "axis x");
      gEnter.append("g").attr("class", "axis y").append("text");
      gEnter.selectAll(".bar").data(data).enter().append("rect").attr("class", "bar");

      var svg = selection.select("svg");
      svg.attr('width', width).attr('height', height);
      var g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      g.select("g.axis.x")
        .call(d3.axisLeft(x));

      g.select("g.axis.y")
        .attr("class", "axis y")
        .attr("transform", "translate(0," + (height - margin.bottom - margin.top) + ")")
        .call(d3.axisBottom(y).ticks(5));

      g.select("g.axis.y text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Population");

      g.selectAll("rect.bar")
        .data(data)
        .attr("x", "1")
        .attr("y", function(d) { return x(d.label); })
        .attr("fill", color)
        .attr("height", x.bandwidth())
        .transition()
          .duration(750)
          .attr("width", function(d) { return y(dataValue(d)); });
    });
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.donutWidth = function(_) {
    if (!arguments.length) return donutWidth;
    donutWidth = _;
    return chart;
  };

  chart.labelValue = function(_) {
    if (!arguments.length) return labelValue;
    labelValue = _;
    return chart;
  };

  chart.dataValue = function(_) {
    if (!arguments.length) return dataValue;
    dataValue = _;
    return chart;
  };

  chart.colorOptions = function(_) {
    if (!arguments.length) return colorOptions;
    colorOptions = _;
    return chart;
  };

  return chart;
}
