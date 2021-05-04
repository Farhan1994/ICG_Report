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
 * CHART TREEMAP
 */
function chart_treemap() {
	var config = _chart_treemap();

	thisChart = function(containerID) {
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
 * internal - for rendering chart
 */
function _chart_treemap() {
	var config = {
		chartType : 'treemap',
		data 	: [],
		keys 	: null,
		chartStyle  : [],
		colors 	: d3.scale.category20(),
		tooltip		: [],
		responsiveWidth : 0,
		clickAction : null
	};


	config.drawChart = function(chartContainerID) {
		config.uniqueid = chartContainerID.substring(1);
		config.xkey = config.keys[0];
		config.ykey = config.keys[1];
		config.width = parseInt(config.chartStyle['width']);
		config.height = parseInt(config.chartStyle['height']);
		if (config.tooltip != null) {
			config.customTooltip = UTILS.customTooltip(config.uniqueid+"_tooltip",  config.tooltip['width'], config.tooltip['height']);
		}
		
		var responsiveWidth = parseInt(config.responsiveWidth);
		if (responsiveWidth > 0 && responsiveWidth < config.width) {
			config.width = responsiveWidth;
		}

		var treemap = d3.layout.treemap()
			.size([config.width, config.height])
			.value(function(d) {
				return d[config.ykey]; });

		var div = d3.select(chartContainerID).append("div")
			.style("position", "relative")
			.style("width", config.width + "px")
			.style("height", config.height + "px");
		
		if(config.clickAction != null) {
			div.style("cursor","pointer");
		}

		var json = { 'name':'treemap', 'children':config.data };

		var cells = div.data([json]).selectAll("div")
					.data(treemap.nodes)
					.enter().append("div")
						.attr("class", "cell")
						.style("background", function(d,i) {
							return d.children ? null:config.colors(d[config.xkey])})
						.style("display","block")
						.call(cell)
						.text(function(d) { return d.children ? null : d[config.xkey]; }
					);
		
		if(config.tooltip != null) {
			cells.on("mouseover",function(d,i) {
				content = d[config.xkey]+"<br/><b>"+d[config.ykey]+"</b>";
				config.customTooltip.showTooltip(content, (d3.event || window.event));
			})
			.on("mouseout",function(d,i) {
				config.customTooltip.hideTooltip();
			});
		}
		
		if(config.clickAction != null) {
			cells.on("click",function(d,i) {
				var actionType = config.clickAction['actionType'];
				var actionTarget = config.clickAction['actionTarget'];
				var actionUrl = config.clickAction['actionUrl'];
			
				var actionUrlParams = 'data='+d[config.xkey]+','+d[config.ykey]+'&keys='+config.xkey+','+config.ykey;
				if (actionType == 'callback') {
					eval( actionTarget+"(d[config.xkey],d[config.ykey])" );
			    } else {
			    	UTILS.executeClickAction(actionType, actionTarget, actionUrl, actionUrlParams);
			    }
				return;
		    });
		}

		function cell() {
			this
			.style("left", function(d) { return d.x + "px"; })
			.style("top", function(d) { return d.y + "px"; })
			.style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
			.style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
		}

		return config;
	}

	return config;
}