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
 * Chart Usage Multi Gauge builder.
 */
var chart_multigauge = function () {
	var config = _chart_multigauge();

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
var _chart_multigauge = function() {
	var config = {
		data : [],
		keys : null,
		width : 800,
		height : 800,
		outerRadius:60,
		innerRadius:35,
		padding : 20,
		// colors : d3.scale.category20(),
		colors : d3.scale.ordinal().range(['orange']) ,
		chartStyle : {},
		legendStyle : null,
		numFormat: d3.format(".2s"),
		titleKey : 'title',
		subtitleKey : 'subtitle',
		// unusedColor: 'lightgray',
		unusedColor: '#eeeeee',
	};

	/**
	 * render chart
	 */
	config.drawChart = function(chartContainerID) {
		config.uniqueid = chartContainerID.substring(1);
		config.usedKey = config.keys[0];
		config.totalKey = config.keys[1];
		if(config.keys.length>2) {
			config.titleKey = config.keys[2];
		}
		if(config.keys.length>3) {
			config.subtitleKey = config.keys[3];
		}
		config.width = UTILS.parseInt(config.chartStyle['width']);
		config.height = UTILS.parseInt(config.chartStyle['height']);
		if(config.height == 0) {
			config.height = config.width;
		}
		
		config.padding = UTILS.parseInt(config.chartStyle['padding'], config.padding);
		config.outerRadius = UTILS.parseInt(config.chartStyle['outerRadius'], config.outerRadius);
		config.innerRadius = UTILS.parseInt(config.chartStyle['innerRadius'], config.innerRadius);
		if (config.tooltip != null) {
			config.customTooltip = UTILS.customTooltip(config.uniqueid+"_tooltip",  config.tooltip['width'], config.tooltip['height'])
		}
		
		// -------------------------

		var responsiveWidth = parseInt(config.responsiveWidth);
		if (responsiveWidth > 0 && responsiveWidth < config.width) {
			var innerRadiusPercent = (config.innerRadius / config.width) * 100;
			var outerRadiusPercent = (config.outerRadius / config.width) * 100;
			config.innerRadius = (responsiveWidth * innerRadiusPercent) / 100;
			config.outerRadius = (responsiveWidth * outerRadiusPercent) / 100;
			
			config.width = responsiveWidth;
		}
		

		var legendWidth=0,legendHeight=0;
		if(config.legendStyle!=null) {
			var titles = config.legendStyle['titles']
			var subtitles = config.legendStyle['subtitles']
			// config.titleWidth = parseInt(config.legendStyle['width']);
			
			if(titles!=null) {
				if(typeof titles === "string") {
					if(titles != "") {
						// each element in the titles list is same
						for(var i=0;i<config.data.length;i++) {
							config.data[i][config.titleKey]=titles;
						}
					}
				}
				else {
					// it is a list of titles
					var len = (titles.length<config.data.length)?titles.length:config.data.length;
					for(var i=0;i<len;i++) {
						if(titles[i]!="") {
							config.data[i][config.titleKey]=titles[i];
						}
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
		}
		var isSubtitleAvailable = (config.subtitleKey in config.data[0]);
		// console.log("config.data[0]="+JSON.stringify(config.data[0]))
		// -------------------------
		


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

		var container = d3.select(chartContainerID);
		
		var mainpanel = container
			.append("svg")
			.attr("width", totalWidth)
			.attr("height", totalHeight)
			.attr("class", "multipie");

		var totalLabel = config.totalKey;
		var usedLabel = config.usedKey;
		
		var x=config.padding, y=config.padding, 
			pies=[], xEnd = null, yEnd = null;
		var y2 = ((config.outerRadius*2) + (config.padding*2));  // height of single pie
		var x2 = ((config.outerRadius*2) + config.padding);  // width of single pie
		var y2Footer2 = (isSubtitleAvailable ? 15 : 0);  // height of footer2 
		for(var i=0;i<config.data.length;i++) {
			var d2 = config.data[i];
			
			var total = d2[config.totalKey];
			var used = d2[config.usedKey];
			var unused = total - used;
			var percent = (Math.round(used/total * 100*100)/100)
			var title = (d2[config.titleKey]==null)?"":d2[config.titleKey];
			var subtitle = (d2[config.subtitleKey]==null)?"":d2[config.subtitleKey];
			
			var values=[ used,  unused];
			// var values=[ unused,  used];
						
			var pie = chart_usage_pie()
				.data(values)
				.dataidx(i)
				.colors(d3.scale.ordinal().range([config.colors(title), config.unusedColor]))
				.outerRadius(config.outerRadius)
				.innerRadius(config.innerRadius)
				.displayPercent(false)
				.x(x)
				.y(y)
				// .headerText(title)
				.centerText(percent+"%")
				// .centerText2(config.numFormat(used) + "/" +config.numFormat(total))
				// .footerText(totalLabel+":"+total+"/"+usedLabel+":"+used+" "+subtitle);
				.footerText(title)
				// .unitLabels([totalLabel+':'+total, usedLabel+':'+used]);
			if(isSubtitleAvailable) {
				// pie.footerText2(config.numFormat(used) + "/" +config.numFormat(total)+" "+subtitle)
				pie.footerText2(subtitle)
			}
			pie(mainpanel);
			
			pies[i] = pie
			var arcs = pie.getArcs();
					
			if (config.tooltip != null) {
				arcs.on("mouseover",function(d,i) {
					var path = d3.select(this);
					var idx = path.attr("dataidx");
					var pie = pies[idx];

					var d2 = config.data[idx];
					var total = d2[config.totalKey];
					var used = d2[config.usedKey];
					var percent = pie.getPercentages()[0] + "%";
					var title = (d2[config.titleKey]==null)?"":d2[config.titleKey];
					
					var content = title+"<br/>"+totalLabel+':'+total + '<br/> <b> '+usedLabel+':'+used + '('+percent+')</b>';
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
					
					var d2 = config.data[idx];
					var total = d2[config.totalKey];
					var used = d2[config.usedKey];
					var title = (d2[config.titleKey]==null)?"":d2[config.titleKey];
					
					var actionUrlParams = 'data='+total+','+used+','+escape(title)+'&keys='+config.keys[0]+','+config.keys[1];
					if (actionType == 'callback') {
						eval( actionTarget+"(total,used,title)" );
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
				y += y2 + y2Footer2
				yEnd = y;
			}
			else {
				x += x2;
			}
		} // end of for loop for multipe-pie 
		
		if(xEnd == null) {
			xEnd = x + x2;
		}
		if(yEnd == null) {
			yEnd = y2;
		}
		
	}
	
	return config;
}