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
 * Chart Multiarea Builder.
 */
function chart_multiarea() {
	var config = _chart_multiarea_config();

	var thisChart = function(containerID) {
		try {
			config.drawChart(containerID);
		} catch(e) {
			UTILS.appendErrMsg(containerID,e);
			throw e;
		}
	};

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
	thisChart.vAxis = function(value) {
		if (!arguments.length) return config.vAxis;
		config.vAxis = value;
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
	thisChart.responsiveWidth = function(value) {
		if (!arguments.length) return config.responsiveWidth;
		config.responsiveWidth = value;
		return thisChart;
	};

	return thisChart;
};

/**
 * internal : render chart multi area
 */
function _chart_multiarea_config() {
	var config = {
		chartType : "multiarea",
		data 	: [],
		keys 	: null,
		legendStyle : [],
		chartStyle  : [],
		colors 	: d3.scale.category20(),
		hAxis 	: null,
		vAxis 	: null,
		margin : { top: 10, right: 30, bottom: 30, left: 50  },
		tooltip		: [],
		responsiveWidth : 0,
		clickAction : null
	};

	config.drawChart = function(chartContainerID) {
		config.uniqueid = chartContainerID.substring(1);
		config.xkey = config.keys[0];
		config.ykeys = (typeof config.keys[1] === "string") ? [config.keys[1]] : config.keys[1];
		config.width = parseInt(config.chartStyle['width']);
		config.height = parseInt(config.chartStyle['height']);	
				
		var responsiveWidth = parseInt(config.responsiveWidth);
		if (responsiveWidth > 0 && responsiveWidth < config.width) {
			config.width = responsiveWidth;
		}

		var width = config.width - config.margin.left - config.margin.right;
		var height = config.height - config.margin.top - config.margin.bottom;
		var colors = config.colors;

		var svg = d3.select(chartContainerID).append("svg")
			.attr("width", width + config.margin.left + config.margin.right)
			.attr("height", height + config.margin.top + config.margin.bottom);

		var parameters = [];
		var charts = [];
		var maxDataPoint = 0;

		/* Loop through first row and get each key and push it into an array to use later */
		for (var prop in config.data[0]) {
			if (prop != config.xkey) {
				parameters.push(prop);
			}
		};

		var parametersCount = parameters.length;
		var startTime = config.data[0][config.xkey];
		var endTime = config.data[config.data.length - 1][config.xkey];
		var chartHeight = height * (1 / parametersCount);
		
		/*
		 * Let's make sure these are all numbers,  we don't want javaScript thinking it's text,
		 * Let's also figure out the maximum data point, We'll use this later to set the Y-Axis scale
		 */
		config.data.forEach(function(d) {
			for (var prop in d) {
				if (d.hasOwnProperty(prop) && prop != config.xkey) {
					d[prop] = parseInt(d[prop]);
					if (d[prop] > maxDataPoint) {
						maxDataPoint = d[prop];
					}
				}
			}
		});

		for(var i = 0; i < parametersCount; i++) {
			charts.push(new config._multiarea({
				data   : config.data.slice(),
				id     : i,
				name   : parameters[i],
				width  : width,
				height : height * (1 / parametersCount),
				maxDataPoint : maxDataPoint,
				svg    : svg,
				margin : config.margin,
				showBottomAxis : (i == parameters.length - 1),
				showSingleArea: (parameters.length == 1),
				fillColor : colors(parameters[i]),
				uniqueid : config.uniqueid,
				xkey	: config.xkey
			}));
		}
	};

	config._multiarea = function(options) {
		this.chartData = options.data;
		this.width = options.width;
		this.height = options.height;
		this.maxDataPoint = options.maxDataPoint;
		this.svg = options.svg;
		this.id = options.id;
		this.name = options.name;
		this.margin = options.margin;
		this.showBottomAxis = options.showBottomAxis;
		this.fillColor = options.fillColor;
		this.uniqueid = options.uniqueid;
		this.xkey	= options.xkey;
		this.showSingleArea = options.showSingleArea;
		
		var localName = this.name;
		var xkey = this.xkey;
		
		/* XScale is time based */
		this.xScale = d3.time.scale.utc()
			.range([0, this.width])
			.domain(d3.extent(this.chartData.map(
					function(d) { 
						return d[xkey];
					}
				)
			));

		/* YScale is linear based on the maxData Point we found earlier */
		this.yScale = d3.scale.linear()
			.range([this.height,0])
			.domain([0,this.maxDataPoint]);

		var xS = this.xScale;
		var yS = this.yScale;

		/*
			This is what creates the chart.
			There are a number of interpolation options.
			'basis' smooths it the most, however, when working with a lot of data, this will slow it down
		*/
		this.area = d3.svg.area()
			.interpolate("basis")
			.x(function(d) {
				return xS(d[xkey]);
			})
			.y0(this.height)
			.y1(function(d) { 
				return yS(d[localName]);
			});
		/*
			This isn't required - it simply creates a mask. If this wasn't here,
			when we zoom/panned, we'd see the chart go off to the left under the y-axis
		*/
		this.svg.append("defs")
			.append("clipPath")
			.attr("id", "clip-" + this.uniqueid + "-" + this.id)
			.append("rect")
			.attr("width", this.width)
			.attr("height", this.height);
		
		/*
			Assign it a class so we can assign a fill color			
			And position it on the page
		*/
		this.chartContainer = this.svg.append("g")
			.attr('class', this.name.toLowerCase())
			.attr("transform", "translate(" + config.margin.left + "," + (config.margin.top + (this.height * this.id) + (10 * this.id)) + ")");

		/* We've created everything, let's actually add it to the page 
		- Using this.fillColor to fill the color
		*/
		this.chartContainer.append("path")
			.data([this.chartData])
			.attr("class", "chart")
			.style('fill', this.fillColor)
			.attr("clip-path", "url(#clip-" + this.uniqueid + "-" + this.id + ")")
			.attr("d", this.area);

		
		if (config.hAxis != null) {
			var tickformat = config.hAxis['tickformat'];	

			if(! this.showSingleArea) {
				this.xAxisTop = d3.svg.axis()
					.scale(this.xScale)
					.orient("bottom")
					.ticks(config.hAxis['ticks']);
				
				if(tickformat!='default' && tickformat!='') {
					this.xAxisTop.tickFormat(d3.format(tickformat));
				}

				/* We only want a top axis if it's the first area chart */
				if(this.id == 0) {
					var xSvg = this.chartContainer.append("g")
						.attr("class", "x axis top")
						.attr("transform", "translate(0,0)")
						.call(this.xAxisTop);
					xSvg.selectAll('text').attr('transform', 'rotate('+ config.hAxis['tickDisplayAngle'] + ')');
				}
			}
			
			xAxisPosition = "top";
			if(this.showSingleArea) {
				if (config.hAxis['position'] == 'out') 
					xAxisPosition = "bottom";
				if (config.hAxis['position'] == 'in') 
					xAxisPosition = "top";
			}
			
			this.xAxisBottom = d3.svg.axis()
				.scale(this.xScale)
				.orient(xAxisPosition)
				.ticks(config.hAxis['ticks']);
			
			if(tickformat!='default' && tickformat!='') {
				this.xAxisBottom.tickFormat(d3.format(tickformat));
			}

			/* Only want a bottom axis on the last area chart */
			if(this.showBottomAxis) {
				var xSvg = this.chartContainer.append("g")
					.attr("class", "x axis bottom")
					.attr("transform", "translate(0," + this.height + ")")
					.call(this.xAxisBottom);
				xSvg.selectAll('text').attr('transform', 'rotate('+ config.hAxis['tickDisplayAngle'] + ')');
			}
		}

		if (config.vAxis != null) {
			this.yAxis = d3.svg.axis()
				.scale(this.yScale)
				.orient("left")
				.ticks(config.vAxis['ticks'])
				.tickFormat(d3.format(config.vAxis['tickformat']));

			var ySvg = this.chartContainer.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(-15,0)")
				.call(this.yAxis);
			ySvg.selectAll('text').attr('transform', 'rotate('+ config.vAxis['tickDisplayAngle'] + ')');
		}

		this.chartContainer.append("text")
			.attr("class","country-title")
			.attr("transform", "translate(15,40)")
			.attr("style","font-size: 14px; font-weight: bold;")
			.text(this.name);
	};

	return config;
};