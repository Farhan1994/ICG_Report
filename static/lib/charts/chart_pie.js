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
 * Pie Chart Builder.
 */
function chart_pie() {
	
	var config = _chart_pie_config();
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
 * internal _chart_pie_config()
 */
function _chart_pie_config() {
	var config = {
		chartType	: "pie",
		data        : [],
		keys        : [],
		legendStyle : null,
		chartStyle  : [],
		colors		: d3.scale.category20(),
		tooltip		: null,
		clickAction : null,
		responsiveWidth : 0
	};

	/**
	 * Draw Chart
	 */
	config.drawChart = function(chartContainerID) {
		config.uniqueid = chartContainerID.substring(1);
		if (config.tooltip != null) {
			config.customTooltip = UTILS.customTooltip(config.uniqueid+"_tooltip", config.tooltip['width'], config.tooltip['height'])
		}
		
		config.innerRadius = parseInt(config.chartStyle['innerRadius']);
		config.outerRadius = parseInt(config.chartStyle['outerRadius']);

		config.width = config.outerRadius * 2;
		config.height = config.outerRadius * 2;
		
		if (config.legendStyle != null) {
			config.legendWidth = parseInt(config.legendStyle['width']);
			config.legendHeight = parseInt(config.legendStyle['height'])
			
			if(config.legendStyle['position'] == 'right') {
				config.width += config.legendWidth;
				if(config.height < config.legendHeight) {
					config.height = config.legendHeight;	
				}
			}
			else {
				// bottom
				if(config.width < config.legendWidth) {
					config.width = config.legendWidth;
				}
				config.height += config.legendHeight;	
			}
		}
		
		var responsiveWidth = parseInt(config.responsiveWidth);
		if (responsiveWidth > 0 && responsiveWidth < config.width) {
			var innerRadiusPercent = (config.innerRadius / config.width) * 100;
			var outerRadiusPercent = (config.outerRadius / config.width) * 100;
			config.innerRadius = (responsiveWidth * innerRadiusPercent) / 100;
			config.outerRadius = (responsiveWidth * outerRadiusPercent) / 100;
			if (config.outerRadius > (config.height /2)) { 
				config.outerRadius = config.height /2;
			}
			
			config.width = responsiveWidth;
		}
		
		config.hasNamedColors = UTILS.isOrdinalScaleWithNames(config.colors);		

		var labels=[], values=[], matchedColors=[];
		for (var i=0;i< config.data.length;i++) {
			var d = config.data[i];
			labels[i] = d[config.keys[0]];
			values[i] = d[config.keys[1]];
			matchedColors[i] = config.hasNamedColors ? 
					config.colors(labels[i]) : config.colors(i);
		}
		config.labels = labels;
		config.values = values;
		config.matchedColors = matchedColors;
		
		// Calculate the percentage of the pie portions
		config.sum = d3.sum(config.values);
		config.percentage = [];
		for (var i=0;i< config.values.length;i++) {
			config.percentage[i] = Math.round(config.values[i]/config.sum * 100*100)/100;
		}

		var vis = d3.select(chartContainerID)
			.append("svg")
			.attr("width", config.width)
			.attr("height", config.height)
			.attr("id",config.uniqueid+"_svg");

		var donut = d3.layout.pie();   // .sort(null)
		var arc = d3.svg.arc()
			.innerRadius(config.innerRadius)
			.outerRadius(config.outerRadius);

		// Filter for dropshadow when pie-chart is click-enabled
		/*var filter = vis.append("svg:defs")
			.append("svg:filter")
			.attr("id", config.uniqueid+"_DropShadow");

		filter.append("svg:feGaussianBlur")
			.attr("in","SourceAlpha")
			.attr("stdDeviation", 1)
			.attr("result","MyBlur");

		filter.append("svg:feOffset")
			.attr("in","MyBlur")
			.attr("dx","3")
			.attr("dy","3")
			.attr("result","FinalBlur");*/

		var arcs = vis.selectAll("g.arc")
			.data(donut(config.values))
			.enter()
			.append("g")
			.attr("class", function(d,i) { 
				// add common class 'arc
				// and add custom class eg. 'arc0' to select individual arc
				return "arc arc"+i; })
			.attr("transform", "translate(" + config.outerRadius + "," + config.outerRadius + ")");
			
		var wedge = arcs.append("path")
			.attr("fill", function(d, i) {
				return config.matchedColors[i]; /* config.colors(i); */ })
			.attr("d", arc);

		// a) If the innerRadius=0 and if (outerRadius - innerRadius <= 80), 
		//			then we will not show any % value in the chart. Can be available only as tooltip.
		// b) If the innerRadius>0 and if (outerRadius - innerRadius < 50), 
		//			then we will not show any % value in the chart, Can be available only as tooltip.		
		if((config.innerRadius==0 && (config.outerRadius - config.innerRadius) > 80) || 
		   (config.innerRadius>0 && (config.outerRadius - config.innerRadius) >= 50)) {

			var textOffset = config.innerRadius!=0?1:1.5;

			var label = arcs.append("text")
				// .attr("transform", function(d) { return "translate(" + (arc.centroid(d)) + ")"; })
				.attr("transform", function(d) {
					var c = arc.centroid(d);
					return "translate(" + c[0]*textOffset +"," + c[1]*textOffset + ")"; })
				.attr("dy", ".35em")
				.attr("text-anchor", "middle")
				.attr("display", function(d) {
					return d.value > .15 ? null : "none"; })
				.text(function(d, i) {
					var percent;
					if (parseInt(config.percentage[i])>+7){
						percent = config.percentage[i] + "%";
					} else {
						percent = '';
					}
					return percent; })
				.style('font','10px sans-serif');
			// append tooltip to label
			// config.appendTooltip(label);
		}

		if (config.legendStyle != null) {
			config.drawLegendList(vis,arcs);
			
			var legends = config.legends;
			
			legends.on("mouseover",function(d,i) {
				// show hover effect to arc(as earlier), when hovering over legend
				vis.select(".arc"+i).style("opacity","0.5")
				if (config.tooltip != null) {
					// show tooltip
					var content = config.getTooltipContent(i);
					config.customTooltip.showTooltip(content, (d3.event || window.event));
				}
			})
			.on("mouseout",function(d,i) {
				// disable hover effect to arc
				vis.select(".arc"+i).style("opacity","")
				if (config.tooltip != null) {
					// hide tooltip
					config.customTooltip.hideTooltip();
				}
			});
		}

		if (config.tooltip != null) {
			arcs.on("mouseover",function(d,i) {
				var content = config.getTooltipContent(i);
				config.customTooltip.showTooltip(content, (d3.event || window.event));
			})
			.on("mouseout",function(d,i) {
				config.customTooltip.hideTooltip();
			});
		}
		
		if(config.clickAction != null) {
			arcs.style("cursor","pointer");
			
			arcs.on("click",function(d,i) {
				config.doClickAction(i);
			});
			
			if(config.legends != null) {
				var legends = config.legends;
				
				legends.on("click",function(d,i) {
					config.doClickAction(i);
				});
			}
		}		
		
		return config;
	};
	
	config.getTooltipContent = function(i) {
		var percent = config.percentage[i] + "%";
		var content = config.labels[i] + '<br/> <b>' + config.values[i] + ' ('+ percent+')';
		return content;
	}	
	
	config.doClickAction = function(i) {
		var actionType = config.clickAction['actionType'];
		var actionTarget = config.clickAction['actionTarget'];
		var actionUrl = config.clickAction['actionUrl'];
		
		var label = config.labels[i];
		var value = config.values[i];
		
		var actionUrlParams = 'data='+label+','+value+'&keys='+config.keys[0] +','+config.keys[1];
		if (actionType == 'callback') {
			eval( actionTarget+"(label,value)" );
	    } else {
	    	UTILS.executeClickAction(actionType, actionTarget, actionUrl, actionUrlParams, config.uniqueid);
	    }
		return;
	}
	
	/**
	 * Draw LegendList
	 */
	config.drawLegendList = function(vis,arcs) {
		//The Legend
		var textOffset = 20;
		var dotOffset = textOffset - 10;
		if (config.legendStyle['position'] == 'right') {
			legendXPos = (config.outerRadius*2)+textOffset;
			yOffset = 10;
		}
		else if (config.legendStyle['position'] == 'bottom') {
			legendXPos = textOffset;
			yOffset = (config.outerRadius*2)+textOffset;
		}
		
		var legends = config.labels.map(function(d,i) {
			return d + " ("+ (+config.values[i]) + ")";
		})
		
		var chart_legends = UTILS.chart_legends()
			.attr("data",legends)
			.attr("colors",config.colors)
			.attr("width",config.legendWidth)
			.attr("height",config.legendHeight)
			.attr("x",legendXPos)
			.attr("y",yOffset);
		if(config.hasNamedColors) {
			chart_legends
			.attr("actualNames",config.labels);
		}
		chart_legends(vis);
		
		config.legends = chart_legends.getLegends();
	}

	return config;
} // End-of-chart_pie()