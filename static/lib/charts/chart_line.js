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
 * The Line Chart Builder
 */
function chart_line() {
	var config = _line_chart_config();

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
	thisChart.legendStyle = function(value) {
		if (!arguments.length) return config.legendStyle;
		config.legendStyle = value;
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
	thisChart.tooltip = function(value) {
		if (!arguments.length) return config.tooltip;
		config.tooltip = value;
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
}


/**
 * internal _line_chart_config()
 */
function _line_chart_config() {
	var config = {
		chartType : "line",
		data : [],
		keys : null,
		legendStyle : [],
		chartStyle  : [],
		colors 	: d3.scale.category20(),
		hAxis 	: null,
		vAxis 	: null,
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
		if (config.tooltip != null) {
			config.customTooltip = UTILS.customTooltip(config.uniqueid+"_tooltip", config.tooltip['width'], config.tooltip['height'])
		}
		config.isDate = UTILS.parseBool(config.chartStyle['isDate'])
		config.dataPoints = UTILS.parseBool(config.chartStyle['dataPoints'])
		config.lineWidth = UTILS.parseInt(config.chartStyle['lineWidth'])

		config.hasNamedColors = UTILS.isOrdinalScaleWithNames(config.colors);
		
		var responsiveWidth = parseInt(config.responsiveWidth);
		if (responsiveWidth > 0 && responsiveWidth < config.width) {
			config.width = responsiveWidth;
		}

		config.x = config.data.map(function(d) {
			return d[config.xkey];
		});
		config.y = config.data.map(function(d) {
			return config.ykeys.map(function(k) {
				return d[k];
			});
		});
		config.y1 = config.ykeys.map(function(k) {
			return config.data.map(function(d) {
				return d[k];
			});
		});
		config.legends = config.ykeys;
		
		var ymin=9999999;
		for(var i=0; i < config.y.length; i++) {
			var pvmin = d3.min(config.y[i]);
			if (pvmin < ymin) ymin=pvmin;
		}

		var ymax=-9999;
		for (var i=0; i < config.y.length; i++) {
			var pvmax = d3.max(config.y[i], function(d) {return +d;} );
			if (pvmax > ymax) ymax=pvmax;
		}
		
		var xAxisPadding = 0;
		if (config.hAxis !== null) {
			xAxisPadding = 30;
			if(config.hAxis['label'] !== '')
				xAxisPadding = xAxisPadding + 20;
		}
		var yAxisPadding = 0;
		var panelOffsetY = config.lineWidth;
		if (config.vAxis !== null) {
			if (xAxisPadding < 15) xAxisPadding = 15;
			panelOffsetY = 10;
			yAxisPadding = 40;
			if(config.vAxis['label'] !== '')
				yAxisPadding = yAxisPadding + 20;
		}

		var xAxisOffset = 0;
		if(!config.isDate && config.hAxis != null) {
			if(config.yAxis == null) {
				// add offset for beginning of x-axis, for the first tick label
				yAxisPadding += (config.x[0].length * 3);
			}
			// offset at endding of x-axis, for the last tick label
			xAxisOffset = (config.x[config.x.length-1].length * 2);
		}

		if(config.dataPoints) {
			yAxisPadding += (config.lineWidth) + 1
			panelOffsetY += (config.lineWidth) + 1
		}

		var legendWidth = 0;
		var legendHeight = 0;
		if (config.legendStyle !== null) {
			legendWidth = parseInt(config.legendStyle['width']);
			legendHeight = parseInt(config.legendStyle['height']);
		}

		
		var actualChartWidth = config.width - (yAxisPadding+12) - xAxisOffset;
		var actualChartHeight = config.height - xAxisPadding - (panelOffsetY + (config.lineWidth*2))

		/* The scale is a time scale if isDate == true else its an ordinal scale */
		if(!config.isDate) {
			//ordinal scale
			config.xScale = d3.scale.ordinal()
				.domain(config.x)
				.rangePoints([0, actualChartWidth]);
		}
		else {
			//timeScale - shows epoch time as meaningful values
			config.xScale = d3.time.scale.utc()
				.domain([d3.min(config.x),d3.max(config.x)])
				.range([0, actualChartWidth]);
		}
		config.yScale = d3.scale.linear()
			.domain([ymin, ymax])
			.range([actualChartHeight, 0]);

		var m = config.y[0].length;
		var totalWidth,totalHeight;
		if (config.legendStyle==null || config.legendStyle['position'] == 'right') {
			totalWidth = config.width + legendWidth;
			totalHeight = (config.height > legendHeight) 
						? config.height 
						: legendHeight;
		}
		else {
			totalWidth = (config.width > legendWidth)
						? config.width 
						: legendWidth;
			totalHeight = config.height + legendHeight;
		}
		// console.log("totalWidth=",totalWidth,"totalHeight=",totalHeight)
		
		var mainpanel = d3.select(chartContainerID)
			.append("svg")
			.attr("width", totalWidth )
			.attr("height", totalHeight)
			.attr("class", "linechart");

		var panel = mainpanel.append("g")
			.attr("transform","translate("+ yAxisPadding + "," + panelOffsetY + ")" );

		var spanel= panel.append("g")
			//.attr("transform", function(d,i) { return "translate(" + xScale(x[i]) + ",0)"; });
			.attr("transform", function(d,i) {
					return "translate(0,0)"; })
			.attr("class","chartdisplay");

		var line = d3.svg.line()
			.x(function(d,i) {
				return config.xScale(config.x[i]);})
			.y(function(d,i) {
				return config.yScale(d); })
			// .interpolate("cardinal-closed");
			.interpolate(config.chartStyle['interpolate']);

		var paths = spanel.selectAll("g.path")
			.data(config.y1)
			.enter()
			.append("g")
			.attr("class","path")
			.each(function(d,i) {
				var path = d3.select(this);
				config.dot(d,i,path);
			});

		paths.append("svg:path")
			.attr("d", function(d,i) {
					return line(d,i);})
			.attr("class","svgpath")
			.style("stroke-width", config.lineWidth)
			.style("stroke", function(d,i) {
					return (config.hasNamedColors) ? 
							config.colors(config.ykeys[i]) : config.colors(i)})
			.style("fill","none");


		if(config.clickAction != null) {
			mainpanel.style("cursor","pointer");
		}

		if (config.hAxis != null) {
			config.hAxis['labelOffset'] = xAxisPadding-15
			var xAxis = UTILS.chart_x_axis()
				.attr("scale",config.xScale)
				.attr("axisStyle",config.hAxis)
				.attr("chartWidth",actualChartWidth)
				.attr("chartHeight",actualChartHeight);
			xAxis(panel);
		}

		if (config.vAxis != null) {
			config.vAxis['labelOffset'] = xAxisPadding-15;
			var yAxis = UTILS.chart_y_axis()
				.attr("scale",config.yScale)
				.attr("axisStyle",config.vAxis)
				.attr("chartWidth",actualChartWidth)
				.attr("chartHeight",actualChartHeight);
			yAxis(panel);
		}

		if(config.legendStyle != null) {
			var chart_legends = UTILS.chart_legends()
					.attr("data",config.legends)
					.attr("colors",config.colors)
					.attr("width",legendWidth)
					.attr("height",legendHeight);
			if (config.legendStyle['position'] == 'right') {
				chart_legends
					.attr("x",(actualChartWidth + yAxisPadding + 25))
					.attr("y",panelOffsetY);
			}
			else {
				chart_legends
					.attr("x",(5 + yAxisPadding))
					.attr("y",(actualChartHeight + xAxisPadding + 20));
			}
			chart_legends(mainpanel);
		}
	};

	config.dot = function(p,q,path) {
		var point = path.selectAll("g.point")
			.data(function(d) {
					return d;})
			.enter().append("g").attr("class","point");
		
			point.append("svg:circle")
				.attr("cx",function(d,i) {
						return config.xScale(config.x[i]);})
				.attr("cy",function(d,i) {
						return config.yScale(d);})
				.attr("r", (config.lineWidth + 1))
				//.style("stroke-width","15")
				//.style("stroke","none")
				.attr("fill", function(d,i) {
						return (config.hasNamedColors) ? 
							config.colors(config.ykeys[q]) : config.colors(q); })
				.attr("fill-opacity",function(d,i) {
					if (config.dataPoints)
						return 1;
					else
						return 0;
			});
				
				
		if(config.tooltip != null) {
			point.on("mouseover",function(d,i) {
				content = config.x[i] + '<br/>' + config.legends[q]  + ' = <b>' + d + '</b>';
				config.customTooltip.showTooltip(content, (d3.event || window.event));
			})
			.on("mouseout",function(d,i) {
				config.customTooltip.hideTooltip();
			});
		}

		if(config.clickAction != null) {
			point.on("click",function(d,i) {
				var actionType = config.clickAction['actionType'];
				var actionTarget = config.clickAction['actionTarget'];
				var actionUrl = config.clickAction['actionUrl'];

				var actionUrlParams = 'data='+config.x[i]+','+config.legend[q]+','+d+'&keys='+config.keys.toString();
				if (actionType == 'callback') {
					eval( actionTarget+"(config.x[i], config.legend[q], d)" );
				} else {
					UTILS.executeClickAction(actionType, actionTarget, actionUrl, actionUrlParams);
				}
				return;
			});
		}
	}

	return config;
}