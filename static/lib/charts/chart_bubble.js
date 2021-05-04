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
 * Bubble Chart Builder.
 */
function chart_bubble()  {
	var config = _bubble_chart_config();

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
 * internal _bubble_chart_config()
 */
function _bubble_chart_config() {
	var config = {
		chartType : "bubble",
		data 	: [],
		keys 	: [],
		chartStyle  : [],
		colors 	: d3.scale.category20(),
		tooltip : null,
		clickAction  : null
	};

	// drawChart()
	config.drawChart = function(chartContainerID) {
		config.uniqueid = chartContainerID.substring(1);
		if (config.tooltip != null) {
			config.customTooltip = UTILS.customTooltip(config.uniqueid+"_tooltip", config.tooltip['width'], config.tooltip['height'])
		}
		config.width = parseInt(config.chartStyle['width']);
		config.height = parseInt(config.chartStyle['height']);
		
		var responsiveWidth = parseInt(config.responsiveWidth);
		if (responsiveWidth > 0 && responsiveWidth < config.width) {
			config.width = responsiveWidth;
		}		

		var jsonData = { name : 'wordCloud', children : config.data };

		var format = d3.format(",g");
		var fill = config.colors;

		var bubble = d3.layout.pack()
			.sort(null)
			.size([config.width, config.height]);

		// get container to which chart to be added
		var container = d3.select(chartContainerID)

		// svg
		var vis = container
			.append("svg")
			.attr("width", config.chartStyle['width'])
			.attr("height", config.chartStyle['height'])
			.attr("class", "bubble");

		// Returns a flattened hierarchy containing all leaf nodes under the root.
		var toClasses = function(root,keyList) {
			var classes = [];
			function recurse(name, node) {
				if (node.children) {
					node.children.forEach(function(child) {
						recurse( node[keyList[0]], child);
					});
				}
				else {
					classes.push({
						packageName: node[keyList[0]],
						className: node[keyList[0]],
						value: node[keyList[1]]}
					);
				}
			}
			recurse(null, root);
			return {children: classes};
		}

		var classes = toClasses(jsonData, config.keys);

		var node = vis.selectAll(".node")
			.data(bubble.nodes(classes)
				.filter(function(d) { return !d.children;})
			)
			.enter()
			.append("g")
			.attr("class", "node")
			.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")"; });
		
		if (config.tooltip != null) {
			node.on("mouseover", function(d,i) {
				content = d.className + "<br/><b>" + format(+d.value) + "</b>";
			    config.customTooltip.showTooltip(content, (d3.event || window.event));
			})
			.on("mouseout", function(d,i) {
				config.customTooltip.hideTooltip();
			});
		}

		if(config.clickAction != null) {
			node.style("cursor","pointer");
			
			node.on("click",function(d,i) {
					var actionType = config.clickAction['actionType'];
					var actionTarget = config.clickAction['actionTarget'];
					var actionUrl = config.clickAction['actionUrl'];	
					
					var actionUrlParams = 'data='+d.className+','+d.value+'&keys='+config.keys[0] +','+config.keys[1];
					if (actionType == 'callback') {
						eval( actionTarget+"(d.className,d.value)" );
				    } else {
				    	UTILS.executeClickAction(actionType, actionTarget, actionUrl, actionUrlParams);
				    }
					return;
			 });
		}
		
		node.append("circle")
			.attr("r", function(d) { 
				return d.r; })
			.style("fill", function(d) { 
				return fill(d.className); });

		node.append("text")
			.attr("text-anchor", "middle")
			.attr("dy", ".3em")
			.text(function(d) { 
				return d.className.substring(0, d.r / 4); })
			.style('font','12px Verdana');

	};

	return config;
}