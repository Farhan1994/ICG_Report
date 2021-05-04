/* begin_generated_IBM_copyright_prolog */
/*
* Licensed Materials - Property of IBM
*
* IBM WebSphere Analytics Platform
*
* Copyright IBM Corp. 2013
*
* US Government Users Restricted Rights - Use, duplication
* or disclosure restricted by GSA ADP Schedule Contract
* with IBM Corp.
*/
/* end_generated_IBM_copyright_prolog */

/**
 * The Brush Area Chart Builder
 */
function chart_brusharea() {
	var config = _chart_brusharea();

	var thisChart = function(containerID) {
		try {
			config.drawChart(containerID);
		} catch(e) {
			UTILS.appendErrMsg(containerID,e);
			throw e;
		}
	}
	thisChart.data = function(value) {
		if (!arguments.length) return config.data;
		config.data = value;
		return thisChart;
	};
	thisChart.keys = function(value) {
		if (!arguments.length) return config.keys;
		config.keys = value;
		return thisChart;
	};
	thisChart.chartStyle = function(value) {
		if (!arguments.length) return config.chartStyle;
		config.chartStyle = value;
		return thisChart;
	};
	thisChart.hAxis = function(value) {
		if (!arguments.length) return config.hAxis;
		config.hAxis = value;
		return thisChart;
	};
	thisChart.colors = function(value) {
		if (!arguments.length) return config.colors;
		config.colors = value;
		return thisChart;
	};
	thisChart.clickAction = function(value) {
		if (!arguments.length) return config.clickAction;
		config.clickAction = value;
		return thisChart;
	};
	thisChart.brushAction = function(value) {
		if (!arguments.length) return config.brushAction;
		config.brushAction = value;
		return thisChart;
	};	
	thisChart.brushendAction = function(value) {
		if (!arguments.length) return config.brushendAction;
		config.brushendAction = value;
		return thisChart;
	};	
	thisChart.responsiveWidth = function(value) {
		if (!arguments.length) return config.responsiveWidth;
		config.responsiveWidth = value;
		return thisChart;
	};

	return thisChart;
}

var doNothingAction = function() {}

/**
 * internal _chart_brusharea()
 */
function _chart_brusharea() {
	var config = {
		chartType : "brusharea",
		data 	: [],
		keys 	: null,
		chartStyle  : {},
		width : 800,
		height: 50,
		colors 	: d3.scale.category20(),
		hAxis 	: null,
		dataInterval : 'day',
		responsiveWidth : 0,
		clickAction : doNothingAction,
		brushAction : doNothingAction,
		brushendAction : doNothingAction,
	};

	config.drawChart = function(chartContainerID) {
		config.uniqueid = chartContainerID.substring(1);
		config.xkey = config.keys[0];
		config.ykey = config.keys[1];
		config.width = UTILS.parseInt(config.chartStyle['width'], config.width);
		config.height = UTILS.parseInt(config.chartStyle['height'], config.height);
		config.dataInterval = UTILS.defaultValue(config.chartStyle['dataInterval'], config.dataInterval);
			
		var responsiveWidth = parseInt(config.responsiveWidth);
		if (responsiveWidth > 0  && responsiveWidth < config.width) {
			config.width = responsiveWidth;
		}
		
		var margin = { top: 8, right: 25, bottom: 20, left: 15  };
		var actualChartWidth = config.width - margin.left - margin.right;
		var actualChartHeight = config.height - margin.top - margin.bottom;
		var colors = config.colors;
		
		var allDates=[],data2=[],
			min=0,max=0,
			len=config.data.length;
		for(var i=0;i<len;i++) {
			var d=config.data[i];
			var time = new Date(d[config.xkey]);
			var val = parseInt(d[config.ykey]);
			if(val<min) { min = val;}
			if(val>max) { max = val;}
			allDates[i] = time;
			data2[i] = { 'time':time, 'count':val };
		};
		
		var startTime = d3.min(allDates);
		var endTime = d3.max(allDates)
		
		var xScale = d3.time.scale.utc()
			.domain([startTime, endTime])
			// .nice(d3.time.month)
			.range([0, actualChartWidth]);
		var yScale = d3.scale.linear()
			.domain([min,max])
			.range([actualChartHeight,0])
		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom");

		// var newEndTime = xScale.invert(actualChartWidth+5);
		// xScale.domain([startTime, newEndTime]);
		
		var svg = d3.select(chartContainerID)
			.append("svg")
			.attr("width", config.width)
			.attr("height", config.height);
		var mainpanel = svg.append("g")
			.attr("transform","translate("+margin.left+","+margin.top+")" );
		
		var area = d3.svg.area()
			// .interpolate("monotone")
			// .interpolate("basis")
			.interpolate("bundle")
			.x(function(d) { return xScale(d.time); })
			.y0(actualChartHeight)
			.y1(function(d) { return yScale(d.count); })

			
		var brush = d3.svg.brush()
			.x(xScale)
			.on("brush", function() { 
				config.brushAction(brush.extent()) 
			})
			.on("brushend", function() { 
				config.brushendAction(brush.extent()) 
			})
			
		mainpanel.append("path")
			.datum(data2)
			.style('fill', config.colors(0))
			.attr("d", area);

		mainpanel.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + actualChartHeight + ")")
			.call(xAxis);

		mainpanel.append("g")
			.attr("class", "x brush")
			// .style('fill', config.colors(1))
			.call(brush)
				.selectAll("rect")
					.attr("y", 0)
					.attr("height", actualChartHeight + 0);
		return config;
	}
	
	return config;
}
