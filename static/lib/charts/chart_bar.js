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
function chart_bar() {
	var config = _bar_chart_config();

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
 * internal _bar_chart_config()
 */
function _bar_chart_config() {
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

		config.x = config.data.map(function(d) {
			return d[config.xkey];
		});
		config.y = config.data.map(function(d) {
			return config.ykeys.map(function(k) {
				return d[k];
			});
		});
		config.legends = config.ykeys;

		var max=0;
		for (var i=0;i<config.y.length;i++) {
			var d3max = d3.max(config.y[i], function(d) {
								return +d;} );
			if(d3max > max)
				max=d3max;
		}		
		
		var xAxisBottomPadding = 0;
		if (config.hAxis !== null) {
			if (config.hAxis['position'] == 'out')
				xAxisBottomPadding += 30;
			else if (config.hAxis['position'] == 'in')
				xAxisBottomPadding += 10;
			if(config.hAxis['label'] !== '')
				xAxisBottomPadding += 20;
		}
		var yAxisLeftPadding = 0;
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
		}
		var legendWidth = 0;
		var legendHeight = 0;
		if (config.legendStyle !== null) {
			legendWidth = parseInt(config.legendStyle['width']);
			legendHeight = parseInt(config.legendStyle['height']);
		}

		var actualChartWidth = config.width - yAxisLeftPadding;
		var actualChartHeight = config.height - xAxisBottomPadding;

		config.xScale = d3.scale.ordinal()
				.domain(config.x)
				.rangeRoundBands([0, actualChartWidth],0.1);
		config.yScale = d3.scale.linear()
				.domain([0, max])
				.range([actualChartHeight,0]);
		config.hScale = d3.scale.linear()
				.domain([0, max])
				.range([0,actualChartHeight]);
		config.m = config.y[0].length;

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
			.attr("transform","translate("+ yAxisLeftPadding + "," + panelOffsetY + ")" );

		var spanel = panel.selectAll("g")
			.data(config.y)
			.enter().append("g")
			.attr("class","category")
			.attr("transform", function(d,i) {
					return "translate(" + config.xScale(config.x[i]) + ",0)"; })
			.each(function(d,i) {
					var category = d3.select(this);
					config._drawBar(d,i,category);} );	

		if(config.clickAction != null) {
			spanel.style("cursor","pointer");
		}
		
		if (config.hAxis != null) {
			config.hAxis['labelOffset'] = xAxisBottomPadding-15
			var xAxis = UTILS.chart_x_axis()
				.attr("scale",config.xScale)
				.attr("axisStyle",config.hAxis)
				.attr("chartWidth",actualChartWidth)
				.attr("chartHeight",actualChartHeight);
			xAxis(panel);
		}
		
		if (config.vAxis != null) {
			config.vAxis['labelOffset'] = yAxisLeftPadding-15;
			if(config.vAxis['ticks']=='default') {
				config.vAxis['ticks'] = ((actualChartHeight / 100) * 3)
			}
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
					.attr("actualNames",config.x)
					.attr("colors",config.colors)
					.attr("width",legendWidth)
					.attr("height",legendHeight)
					.attr("dotType","circle");
			if (config.legendStyle['position'] == 'right') {
				chart_legends
					.attr("x",(actualChartWidth + yAxisLeftPadding + 15))
					.attr("y",10);
			}
			else {
				chart_legends
					.attr("x",(5 + yAxisLeftPadding))
					.attr("y",(actualChartHeight + xAxisBottomPadding + 25));
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
					return config.yScale(d); })
			.attr("x", function(d,i) {
					return i* config.xScale.rangeBand()/config.m;})
			.attr("width", function(d) {
					return config.xScale.rangeBand()/config.m})
			.attr("height", function(d) {
					return config.hScale(d);})
			.style("fill",function(d,i) {
				if(config.barStyle == UTILS.CONSTANTS.GROUPED_BARS) {
					return config.colors(i);
				}
				else {
					return config.hasNamedColors ? 
						config.colors(config.x[q]):config.colors(q);
				} })
			// .attr("title",function(d,i){
			//		return '('+config.x[q]+' ,'+config.legends[i]  + '='  + d+')'})
			// .append("svg:title").text(function(d,i) { return d; });
		
		if(config.tooltip != null) {
			bar.on("mouseover",function(d,i) {
				content = config.x[q] + '<br/>' + config.legends[i]  + ' = <b>' + d + '</b>';
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
			
				var actionUrlParams = 'data='+config.x[q]+','+ d +'&keys='+config.xkey+','+config.legends[i];
				if (actionType == 'callback') {	
					eval( actionTarget+"(config.x[q],d)" );
			    } else {
			    	UTILS.executeClickAction(actionType, actionTarget, actionUrl, actionUrlParams);
			    }
				return;
		    });
		}
	}

	return config;
}