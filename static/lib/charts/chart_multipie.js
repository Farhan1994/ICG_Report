/* begin_generated_IBM_copyright_prolog */
/*
* Licensed Materials - Property of IBM
*
* IBM WebSphere Analytics Platform
*
* Copyright IBM Corp. 2012,2013
*
* US Government Users Restricted Rights - Use, duplication
* or disclosure restricted by GSA ADP Schedule Contract
* with IBM Corp.
*/
/* end_generated_IBM_copyright_prolog */

/**
 * Chart Usage Multi Pie builder.
 */
var chart_multipie = function () {
	var config = _chart_multipie();

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
	thisChart.legendStyle = function(value) {
		if (!arguments.length) return config.legendStyle;
		config.legendStyle = value;
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
};


/**
 * internal - for rendering usage chart
 */
var _chart_multipie = function() {
	var config = {
		data : [],
		keys : null,
		width : 800,
		height : 800,
		outerRadius:60,
		innerRadius:20,
		padding : 20,
		colors : d3.scale.category20(),
		chartStyle : {},
		legendStyle : null,
		percentRoundDecimals: 2,
		totalKey: '_total',
		unusedKey: '_unused',
		titleKey : '_title',
		subtitleKey : '_subtitle',
		// unusedColor: 'lightgray',
		unusedColor: '#eeeeee',
		valueFormat: d3.format(".2s"),
	};

	/**
	 * render chart
	 */
	config.drawChart = function(chartContainerID) {
		config.uniqueid = chartContainerID.substring(1);
		if(typeof config.keys[0] === "string") {
			config.usedKeys = [config.keys[0]];
		}
		else {
			config.usedKeys = config.keys[0];
		}
		if(config.keys.length > 1) {
			config.totalKey = config.keys[1];
		}
		if(config.keys.length > 2) {
			config.titleKey = config.keys[2];
		}
		if(config.keys.length > 3) {
			config.subtitleKey = config.keys[3];
		}
		config.width = UTILS.parseInt(config.chartStyle['width']);
		config.height = UTILS.parseInt(config.chartStyle['height']);
		config.padding = UTILS.parseInt(config.chartStyle['padding'], config.padding);
		config.outerRadius = UTILS.parseInt(config.chartStyle['outerRadius'], config.outerRadius);
		config.innerRadius = UTILS.parseInt(config.chartStyle['innerRadius'], config.innerRadius);
		config.percentRoundDecimals = UTILS.parseInt(config.chartStyle['percentRoundDecimals'], config.percentRoundDecimals);
		if (config.tooltip != null) {
			config.customTooltip = UTILS.customTooltip(config.uniqueid+"_tooltip",  config.tooltip['width'], config.tooltip['height'])
		}

		var responsiveWidth = parseInt(config.responsiveWidth);
		if (responsiveWidth > 0 && responsiveWidth < config.width) {
			var innerRadiusPercent = (config.innerRadius / config.width) * 100;
			var outerRadiusPercent = (config.outerRadius / config.width) * 100;
			config.innerRadius = (responsiveWidth * innerRadiusPercent) / 100;
			config.outerRadius = (responsiveWidth * outerRadiusPercent) / 100;
			
			config.width = responsiveWidth;
		}
		
		var legendWidth = 0;
		var legendHeight = 0;
		if (config.legendStyle !== null) {
			legendWidth = parseInt(config.legendStyle['width']);
			legendHeight = parseInt(config.legendStyle['height']);

			var titles = config.legendStyle['titles']
			var subtitles = config.legendStyle['subtitles']
			// config.titleWidth = parseInt(config.legendStyle['width']);
			
			if(titles!=null) {
				if(typeof titles === "string") {
					// each element in the titles list is same
					for(var i=0;i<config.data.length;i++) {
						config.data[i][config.titleKey]=titles;
					}
				}
				else {
					// it is a list of titles
					var len = (titles.length<config.data.length)?titles.length:config.data.length;
					for(var i=0;i<len;i++) {
						config.data[i][config.titleKey]=titles[i];
					}
				}
			}

			if(subtitles!=null ) {
				if(typeof subtitles === "string") {
					if(subtitles != "") {
						// console.log("adding subtitles.1 subtitles="+JSON.stringify(subtitles));
						// each element in the subtitles list is same
						for(var i=0;i<config.data.length;i++) {
							config.data[i][config.subtitleKey]=subtitles;
						}
					}
				}
				else {
					// console.log("adding subtitles.2 subtitles="+JSON.stringify(subtitles));
					// #it is a list of titles
					var len = (subtitles.length<config.data.length)?subtitles.length:config.data.length;
					for(var i=0;i<len;i++) {
						if(subtitles[i]!="") {
							config.data[i][config.subtitleKey]=subtitles[i];
						}
					}
				}
			}
		} // end-if-(config.legendStyle !== null)
		config.isSubtitleAvailable = (config.subtitleKey in config.data[0]);
		// console.log("legendWidth="+legendWidth,"legendHeight="+legendHeight);
		
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

		var container = d3.select(chartContainerID);
		
		var mainpanel = container
			.append("svg")
			.attr("width", totalWidth)
			.attr("height", totalHeight)
			.attr("class", "multipie");

		// show unused value 'arc' as lightgray in pie, but do not show legends,
		var dataLayerKeys = config.usedKeys.concat(['Unused']); //add unused key value to dataLayer
		var dcolors = config.usedKeys.map(function(d,i){return config.colors(d)});
		dcolors.push(config.unusedColor); //add color unused 
		var dataLayerColors = d3.scale.ordinal().range(dcolors);
		
		var hasTotalValue = (config.keys.length > 1);
		var kLen = config.usedKeys.length;
		var x=config.padding, y=config.padding, 
			pies=[], xEnd = null, yEnd = null;
		var y2 = ((config.outerRadius*2) + (config.padding*2));
		var x2 = ((config.outerRadius*2) + config.padding);
		for(var i=0;i<config.data.length;i++) {
			yEnd = null;
			var d = config.data[i];
			var values=[], total = 0,actualTotal,arcLabels=[],displayPercent=true;
			for(var k=0;k<kLen;k++) {
				var v1 = d[config.usedKeys[k]];
				values[k] = v1
				total = total + v1; 
			}
			if(hasTotalValue) {
				actualTotal = d[config.totalKey];
				var unused = actualTotal-total;
				// if unused not zero, then add to values, but show without text 
				if(unused != 0) {
					var percentages = values.map(function(d,i) {
						return (d3.round((d/actualTotal * 100), config.percentRoundDecimals)) + "%";
					});
					d[config.unusedKey] = unused
					values[kLen] = unused;
					percentages[kLen] = "";
					// the 'unused' value arc will be shown without percentage 
					displayPercent = false;
					arcLabels = percentages;
				}
			}
			else {
				actualTotal = total;
				d[config.totalKey]=total;
				d[config.unusedKey]=0;
			}
			
			// add pie
			var pie = chart_usage_pie()
				.data(values)
				.dataidx(i)
				.colors(dataLayerColors)
				.outerRadius(config.outerRadius)
				.innerRadius(config.innerRadius)
				.x(x)
				.y(y)
				.displayPercent(displayPercent)
				.arcLabels(arcLabels)
				// .headerText(d[config.titleKey]")
				// .centerText(d[config.titleKey])
				.footerText(d[config.titleKey])
				.footerText2(d[config.subtitleKey])
				.percentRoundDecimals(config.percentRoundDecimals);
			pie(mainpanel);
			
			pies[i] = pie
			var arcs = pie.getArcs();
					
			if (config.tooltip != null) {
				arcs.on("mouseover",function(d,i) {
					var path = d3.select(this);
					var idx = path.attr("dataidx");
					var pie = pies[idx];

					var title = config.data[idx][config.titleKey];
					var yLabel = dataLayerKeys[i]; // config.usedKeys[i]
					var yValue = d.value.toFixed(0);
					var percent = pie.getPercentages()[i] + "%";
					var total = pie.getTotal();
					
					var content = title+'  <font size="-2">(Total:'+total+')</font><br\><b>'+ yLabel + ": " + yValue + '('+percent+')';
					config.customTooltip.showTooltip(content, (d3.event || window.event));
				})
				.on("mouseout",function(d,i) {
					config.customTooltip.hideTooltip();
				});
			}
			
			if(config.clickAction != null) {
				arcs.style("cursor","pointer");
				
				arcs.on("click",function(d,i) {
					var path = d3.select(this);
					var idx = path.attr("dataidx");
					var pie = pies[idx];

					var actionType = config.clickAction['actionType'];
					var actionTarget = config.clickAction['actionTarget'];
					var actionUrl = config.clickAction['actionUrl'];
					
					var title = config.data[idx][config.titleKey];
					var yLabel = config.usedKeys[i]
					var yValue = d.value;
					
					var actionUrlParams = 'data='+yLabel+','+yValue+','+title+'&keys='+config.titleKey+','+config.usedKeys;
					if (actionType == 'callback') {
						eval( actionTarget+"(yLabel,yValue,title)" );
					} else {
						UTILS.executeClickAction(actionType, actionTarget, actionUrl, actionUrlParams, config.uniqueid);
					}
					return;
				});
			}
			
			// console.log("x=",x,"x2=",x2,"x+x2=",(x + x2),"config.width=",config.width);
			if(config.width < x + x2*2) {
				xEnd = x + x2;
				x = config.padding;
				y += y2; 
				yEnd = y;
			}
			else {
				x += x2;
			}
			
		}
		
		if(xEnd == null) {
			xEnd = x + ((config.outerRadius*2) + config.padding);
		}
		if(yEnd == null) {
			yEnd = y + y2 + config.padding;
		}
		
		if(config.legendStyle != null) {
			var chart_legends = UTILS.chart_legends()
					.attr("data",config.usedKeys)
					.attr("colors",config.colors)
					.attr("width",legendWidth)
					.attr("height",legendHeight);
			if (config.legendStyle['position'] == 'right') {
				chart_legends
					// .attr("x",(config.width + (config.padding*2)))
					.attr("x",(xEnd + config.padding))
					.attr("y",(config.padding + 10));
			}
			else {
				chart_legends
					.attr("x",(config.padding*2))
					.attr("y",(yEnd + config.padding));
			}
			chart_legends(mainpanel);
		}

	}
	
	return config;
}


