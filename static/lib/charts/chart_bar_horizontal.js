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
 * The Bar Chart Builder
 */
function chart_bar_horizontal() {
	var config = _bar_horizontal_chart_config();

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
 * internal _bar_horizontal_chart_config()
 */
function _bar_horizontal_chart_config() {
	var config = {
		chartType : "bar",
		barStyle : UTILS.CONSTANTS.GROUPED_BARS,
		data 	: [],
		keys 	: null,
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
			config.customTooltip = UTILS.customTooltip(config.uniqueid+"_tooltip",  config.tooltip['width'], config.tooltip['height'])
		}
		
		var responsiveWidth = parseInt(config.responsiveWidth);
		if (responsiveWidth > 0 && responsiveWidth < config.width) {
			config.width = responsiveWidth;
		}
		
		config.hasNamedColors = UTILS.isOrdinalScaleWithNames(config.colors);		

		if(config.ykeys.length==1) {
			// pie chart like data, so different bar colors  
			config.barStyle = UTILS.CONSTANTS.SIMPLE_BARS;
		}
		else {
			config.barStyle = UTILS.CONSTANTS.GROUPED_BARS;
		}

		config.y = config.data.map(function(d) {
			return d[config.xkey];
		});
		config.x = config.data.map(function(d) {
			return config.ykeys.map(function(k) {
				return d[k];
			});
		});
		config.legends = config.ykeys;

		var max=0;
		for (var i=0;i<config.y.length;i++) {
			var d3max = d3.max(config.x[i], function(d) {
								return +d;} );
			if(d3max > max)
				max=d3max;
		}		
		
		var xAxisTopPadding = 0;
		var xAxisBottomPadding = 25;
		if (config.hAxis !== null) {
			if (config.hAxis['position'] == 'out')
				xAxisTopPadding = xAxisTopPadding + 30;
			else if (config.hAxis['position'] == 'in')
				xAxisTopPadding += 10;
			if(config.hAxis['label'] !== '')
				xAxisTopPadding = xAxisTopPadding + 20;
		}
		var yAxisLeftPadding = 0;
		var yAxisRightPadding = 25;
		var panelOffsetY = 0;
		if (config.vAxis !== null) {
			if (xAxisBottomPadding < 15) xAxisBottomPadding = 15;
			panelOffsetY = 10;
			if (config.vAxis['position'] == 'out')
				yAxisLeftPadding += 40;
			else if (config.vAxis['position'] == 'in')
				yAxisLeftPadding += 5;
			if(config.vAxis['label'] !== '')
				yAxisLeftPadding += 20;
			if (config.legends!=null && config.legends['position']=='right') 
				yAxisRightPadding += 10;
		}
		var legendWidth = 0;
		var legendHeight = 0;
		if (config.legendStyle !== null) {
			legendWidth = parseInt(config.legendStyle['width']);
			legendHeight = parseInt(config.legendStyle['height']);
		}

		var actualChartWidth = config.width - (yAxisLeftPadding + yAxisRightPadding);
		var actualChartHeight = config.height - (xAxisBottomPadding + xAxisTopPadding);

		config.xScale = d3.scale.linear()
				.domain([0, max])
				.range([0, actualChartWidth]);
		config.yScale = d3.scale.ordinal()
				.domain(config.y)
				.rangeRoundBands([0, actualChartHeight],0.1);
		config.hScale = d3.scale.linear()
				.domain([0, max])
				.range([0,actualChartWidth]);
		config.m = config.x[0].length;

		var container = d3.select(chartContainerID);
		
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

		var mainpanel = container
			.append("svg")
			.attr("width", totalWidth)
			.attr("height", totalHeight)
			.attr("class", "barchart");

		var panel = mainpanel.append("g")
			.attr("transform","translate("+ yAxisLeftPadding + "," + (panelOffsetY+xAxisTopPadding) + ")" );

		var spanel = panel.selectAll("g")
			.data(config.x)
			.enter().append("g")
			.attr("class","category")
			.attr("transform", function(d,i) {
					return "translate(0,"+ config.yScale(config.y[i]) + ")"; })
			.each(function(d,i) {
					var category = d3.select(this);
					config._drawBar(d,i,category);} );	

		if(config.clickAction != null) {
			spanel.style("cursor","pointer");
		}
		
		if (config.hAxis != null) {
			config.hAxis['labelOffset'] = xAxisTopPadding-15
			if(config.hAxis['ticks']=='default') {
				config.hAxis['ticks'] = ((actualChartWidth / 100) * 3)
			}
			var xAxis = UTILS.chart_x_axis_horizontal()
				.attr("scale",config.xScale)
				.attr("axisStyle",config.hAxis)
				.attr("chartWidth",actualChartWidth)
				.attr("chartHeight",actualChartHeight);
			xAxis(panel);
		}
		
		if (config.vAxis != null) {
			config.vAxis['labelOffset'] = yAxisLeftPadding-15;
			var yAxis = UTILS.chart_y_axis()
				.attr("scale",config.yScale)
				.attr("axisStyle",config.vAxis)
				.attr("chartWidth",actualChartWidth)
				.attr("chartHeight",actualChartHeight);
			yAxis(panel);
		}

		if(config.legendStyle != null) {
			var llegends;
			if(config.barStyle == UTILS.CONSTANTS.GROUPED_BARS) {
				llegends = config.legends;
			}
			else {
				llegends = config.data.map(function(d) {
					return d[config.xkey] + " ("+ (+d[config.ykeys[0]]) + ")";
				});
			}
			
			var chart_legends = UTILS.chart_legends()
					.attr("data",llegends)
					.attr("actualNames",config.y)
					.attr("colors",config.colors)
					.attr("width",legendWidth)
					.attr("height",legendHeight)
					.attr("dotType","circle");
			if (config.legendStyle['position'] == 'right') {
				chart_legends
					.attr("x",(actualChartWidth + yAxisLeftPadding + yAxisRightPadding))
					.attr("y",(xAxisTopPadding + 15));
			}
			else {
				chart_legends
					.attr("x",(5 + yAxisLeftPadding))
					.attr("y",(actualChartHeight + xAxisTopPadding + xAxisBottomPadding));
			}
			chart_legends(mainpanel);
		}
	};

	config._drawBar = function(p,q,parent)  {
		var bar = parent.selectAll(".chart")
			.data(p)
			.enter()
			.append("rect")
			.attr("class","bar")
			.attr("y", function(d, i) {
					return (i*config.yScale.rangeBand()/config.m); })
			.attr("x", function(d,i) {
				return 0;})
			.attr("width", function(d) {
				return config.xScale(d);})
			.attr("height", function(d) {
				return config.yScale.rangeBand()/config.m})
			.style("fill",function(d,i) {
				if(config.barStyle == UTILS.CONSTANTS.GROUPED_BARS) {
					return config.colors(i);
				}
				else {
					return config.hasNamedColors ? 
						config.colors(config.y[q]):config.colors(q);
				} })
		
		if(config.tooltip != null) {
			bar.on("mouseover",function(d,i) {
				content = config.y[q] + '<br/>' + config.legends[i]  + ' = <b>' + d + '</b>';
				config.customTooltip.showTooltip(content, (d3.event || window.event));
			})
			.on("mouseout",function(d,i) {
				config.customTooltip.hideTooltip();
			});
		}

		if(config.clickAction != null) {
			bar.on("click",function(d,i) {
				var actionType = config.clickAction['actionType'];
				var actionTarget = config.clickAction['actionTarget'];
				var actionUrl = config.clickAction['actionUrl'];
			
				var actionUrlParams = 'data='+config.y[q]+','+ d +'&keys='+config.xkey+','+config.legends[i];
				if (actionType == 'callback') {	
					eval( actionTarget+"(config.y[q],d)" );
			    } else {
			    	UTILS.executeClickAction(actionType, actionTarget, actionUrl, actionUrlParams);
			    }
				return;
		    });
		}
	}

	return config;
}