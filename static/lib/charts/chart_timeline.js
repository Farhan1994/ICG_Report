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
function chart_timeline() {
	var config = _chart_timeline_config();

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
 * internal _chart_timeline_config()
 */
function _chart_timeline_config() {
	var config = {
		chartType : "timeline",
		data 	: [],
		keys 	: null,
		legendStyle : {},
		chartStyle  : {},
		colors 	: d3.scale.category20(),
		hAxis 	: null,
		vAxis 	: null,
		tooltip	: {},
		tooltip_showAllLegends : false,
		dataInterval : null,
		barWidth : 10,
		barWidthMin : 1,
		barWidthMax : 10,
		responsiveWidth : 0,
		clickAction : null,
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
		config.dataInterval = config.chartStyle['dataInterval'];
			
		var responsiveWidth = parseInt(config.responsiveWidth);
		if (responsiveWidth > 0 && responsiveWidth < config.width) {
			config.width = responsiveWidth;
		}

		config.hasNamedColors = UTILS.isOrdinalScaleWithNames(config.colors);

		// ---------------------------------
		var allDates=[], ymax=0, ymin=0, minTimeDiff=UTILS.year;
		config.dataLayers = config.ykeys.map(function(){return [];});
		config.data.forEach(function(d,i) {
			// Note: the time value should always be either long or long-string value
			//       '+' will convert long-string to numeric value, 
			//       but if the time value is date-string - it will create unintended problem. 
			var time = new Date(+d[config.xkey]);
			allDates[i] = time;
			if(i>0) {
				var diff = allDates[i].getTime()-allDates[i-1].getTime();
				if(diff < 0) { diff *= -1; }
				if(diff > 0 && diff < minTimeDiff) { minTimeDiff = diff; }
			}
			var ytotal = 0;
			config.ykeys.forEach(function(k,ki){
				var yvalue = +d[k];
				ytotal += yvalue;
				config.dataLayers[ki][i] = {
					 "x" : time,
					 "y" : yvalue,
					 "i" : ki 
				}
			});
			if(ytotal < ymin) { ymin = ytotal; }
			if(ytotal > ymax) { ymax = ytotal; }
		});
		var startTime = d3.min( allDates );
		var endTime = d3.max( allDates );

		config.stackedData = d3.layout.stack()(config.dataLayers);
		// ----------------------------------
		config.legends = config.ykeys;

		var xAxisOffset = 7;
		var xAxisBottomPadding = 0;
		if (config.hAxis !== null) {
			if (config.hAxis['position'] == 'out')
				xAxisBottomPadding += 30;
			else if (config.hAxis['position'] == 'in')
				xAxisBottomPadding += 10;
			if(config.hAxis['label'] !== '')
				xAxisBottomPadding += 20;
			
			// user supplied start time
			if(config.hAxis['startValue']!=null) {
				var val = +config.hAxis['startValue']
				if(val > 0 && val < startTime.getTime()) {
					startTime = new Date(val);
				}
			}
			
			// user supplied end time
			if(config.hAxis['endValue']!=null) {
				var val = +config.hAxis['endValue'];
				if(val > 0 && val > endTime.getTime()) {
					endTime = new Date(val);
				}
			}
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

		var actualChartWidth = config.width - yAxisLeftPadding - xAxisOffset - 5;
		var actualChartHeight = config.height - xAxisBottomPadding;		
		
		// startValue should atleast as big as interval
		var interval = null,minTime = UTILS.hour;
		if(config.dataInterval != null) {
			interval = eval("UTILS."+config.dataInterval);
			var diff = endTime.getTime()-startTime.getTime();
			if(diff<interval) {
				startTime = new Date(endTime.getTime()-interval);
			}
		}
		else {
			// if only one datapoint, then x-axis time-range is atleast a hour,
			if(endTime.getTime()==startTime.getTime()) {
				startTime = new Date(startTime.getTime()-UTILS.minute);
			}
		}

		config.xScale = d3.time.scale.utc()
			.domain([startTime, endTime])
			.rangeRound([0, actualChartWidth]);

		config.barWidth = config.normalizedBarWidth(startTime,minTimeDiff,config.xScale,interval);

		// for space at the start of xAxis
		var xBarOffset = config.barWidth * 20/100;
		// console.log("barWidth="+config.barWidth,"xBarOffset="+xBarOffset);
		if(xBarOffset < 3) { xBarOffset = 3; }
		if(xBarOffset > 10) { xBarOffset = 10; }
		var newStartTime = config.xScale.invert(-xBarOffset);
		// for space at the end of xAxis
		var newEndTime = config.xScale.invert(actualChartWidth+config.barWidth+xBarOffset);
		config.xScale.domain([newStartTime, newEndTime]);

		config.yScale = d3.scale.linear()
				.domain([ymin, ymax])
				.range([actualChartHeight,0]);

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
		//console.log("totalWidth=",totalWidth,"totalHeight=",totalHeight)

		var mainpanel = container
			.append("svg")
			.attr("width", totalWidth)
			.attr("height", totalHeight)
			.attr("class", "barchart");

		var panel = mainpanel.append("g")
			.attr("transform","translate("+ yAxisLeftPadding + "," + panelOffsetY + ")" );

		if (config.hAxis != null) {
			config.hAxis['labelOffset'] = xAxisBottomPadding-15
			if(config.hAxis['ticks']=='default') {
				config.hAxis['ticks'] = ((actualChartWidth / 100) * 1)
			}
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
				config.vAxis['ticks'] = ((actualChartHeight / 100) * 3) + 1
			}
			var yAxis = UTILS.chart_y_axis()
				.attr("scale",config.yScale)
				.attr("axisStyle",config.vAxis)
				.attr("chartWidth",actualChartWidth)
				.attr("chartHeight",actualChartHeight);
			yAxis(panel);
		}		

		// stacked bars group
		var spanel = panel.selectAll('g.category')
			.data(config.stackedData)
			.enter()
			.append("g")
			.attr("class", "category")
			.style("fill", function(d, i) { 
				return config.hasNamedColors ? 
						config.colors(config.ykeys[i]) : config.colors(i); });
		
		spanel.each(function(d,i) {
					var category = d3.select(this);
					config._drawBar(d,i,category);
		});
		// stacked bars group

		if(config.clickAction != null) {
			spanel.style("cursor","pointer");
		}

		if(config.legendStyle != null) {
			var chart_legends = UTILS.chart_legends()
					.attr("data",config.legends)
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


	config._drawBar = function(p,q,parent) {
		// each rect bar in the stacked bar group
		var bar = parent.selectAll("rect")
			.data(p)
			.enter().append('rect')
			.attr("class","bar")
			.attr('x', function(d) {
					return config.xScale(d.x); })
			.attr('y', function(d) {
					return config.yScale(d.y0 + d.y); })
			// .attr('width', config.xScale.rangeBand())
			.attr('width', config.barWidth)
			.attr('height', function(d) {
					return (config.yScale(d.y0) - config.yScale(d.y0 + d.y)) });
		
		if(config.tooltip != null) {
			config.tooltip_showAllLegends = UTILS.parseBool(config.tooltip['showAllLegends'], config.tooltip_showAllLegends);

			bar.on("mouseover",function(d,i) {
				var date = d.x;
				var displayDate = date.toUTCString();
				var content = displayDate;
				if(config.tooltip_showAllLegends) {
					var d = config.data[i];
					for (var i = config.ykeys.length; i > -1; i--) {
						var k = config.ykeys[i];
						if(+d[k]>0) {
							var color = config.colors( config.hasNamedColors ? k : i );
							content += "<br/><span style='color:"+color+";'>" + k + " : <b>" + d[k] + "</b></span>" ;
						}
					}
				}
				else {
					content += "<br/>" + config.ykeys[d.i] + " : <b>" + d.y  + "</b>" ;
				}
				config.customTooltip.showTooltip(content, (d3.event || window.event));
			})
			.on("mouseout",function(d,i) {
				config.customTooltip.hideTooltip();
			});
		}

		if(config.clickAction != null) {
			bar.on("click",function(d,i) {
				config.customTooltip.hideTooltip();
				var actionType = config.clickAction['actionType'];
				var actionTarget = config.clickAction['actionTarget'];
				var actionUrl = config.clickAction['actionUrl'];
				var actionUrlParams = 'data='+d.x+','+ d.y +'&keys='+config.xkey+','+config.legends[q];
				if (actionType == 'callback') {
					eval( actionTarget+"(d.x,d.y,config.legends[q],i)" );
				} else {
					UTILS.executeClickAction(actionType, actionTarget, actionUrl, actionUrlParams);
				}
				if(config.tooltip != null) {
					config.customTooltip.hideTooltip();
				}
				return;
			});
		}
	}

	config.normalizedBarWidth = function(startTime,minTimeDiff,xScale,interval) {
		var timeDiff = (interval!=null && minTimeDiff > interval) ? interval : minTimeDiff;
		var dt1 = new Date(startTime.getTime()+timeDiff);
		var barWidth = (xScale(dt1)-xScale(startTime))*65/100;
		return (barWidth < config.barWidthMin) ? config.barWidthMin : (barWidth > config.barWidthMax) ? config.barWidthMax : barWidth;  
	}
	
	return config;
}