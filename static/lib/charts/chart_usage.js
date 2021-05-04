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
 * Chart Usage Builder.
 */
var chart_usage = function () {
	var config = _chart_usage();

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
var _chart_usage = function() {
	var config = {
		data : [],
		keys : null,
		width : 800,
		barHeight : 25,
		padding : 20,
		colors : d3.scale.category20(),
		chartStyle : {},
		legendStyle : null,
		percentRoundDecimals: 2,
		barTextFont: '9px Verdana',
		barTextFontOnHover: 'bold 12px Verdana',
		/* *********
		 * if xAxisPercentageBased==true, the chart will be percentage based, bars will of constant width, x-axis will be 0% to 100%      
		 * if xAxisPercentageBased==false, the chart will be value based, bars will be of variable width, x-axis will be 0 to max-total value.) 
		 ******* */
		xAxisPercentageBased: true,  // if false for value based
		isValuesTicksDisplayed: false,     // true, displays values with tick marks
		isXAxisDisplayed: false,   // if false, xAxis will not be display
		y: 5,
		titleHeight: 15,
		xAxisHeight: 50,
		totalKey: 'Total',
		unusedKey: 'Unused',
		titleKey : 'Title',
		subtitleKey : 'Subtitle',
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
		config.barHeight = UTILS.parseInt(config.chartStyle['barHeight']);
		config.padding = UTILS.parseInt(config.chartStyle['padding'], config.padding);
		config.percentRoundDecimals = UTILS.parseInt(config.chartStyle['percentRoundDecimals'], config.percentRoundDecimals);
		if (config.tooltip != null) {
			config.customTooltip = UTILS.customTooltip(config.uniqueid+"_tooltip",  config.tooltip['width'], config.tooltip['height'])
		}

		var responsiveWidth = parseInt(config.responsiveWidth);
		if (responsiveWidth > 0 && responsiveWidth < config.width) {
			config.width = responsiveWidth;
		}
		
		var isLegendsDisplayed = (config.usedKeys.length>1);

		var legendWidth = 0;
		var legendHeight = 0;
		if (config.legendStyle !== null) {
			if(isLegendsDisplayed) {  
				legendWidth = parseInt(config.legendStyle['width']);
				legendHeight = parseInt(config.legendStyle['height']);
			}

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
		// console.log("legendWidth="+legendWidth,"legendHeight="+legendHeight);

		//config.isValuesTicksDisplayed = (config.subtitleKey in config.data[0]);

		config.barRowHeight = (config.barHeight+config.padding+config.titleHeight);
		config.barRowHeight +=  config.isValuesTicksDisplayed ? 10 : 0;
		config.allBarsHeight = (config.barRowHeight * config.data.length);
		config.height = config.allBarsHeight + config.padding;
		config.height += (config.isXAxisDisplayed==true) ? config.xAxisHeight : 0
		
		var actualChartWidth = config.width -20 -config.padding;
		if(config.xAxisPercentageBased == false) {
			actualChartWidth -= 15
		}
		
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
		// console.log("totalWidth="+totalWidth,"totalHeight="+totalHeight);
		
		var dataLayerKeys = config.usedKeys.concat([config.unusedKey]); //add unused key value to dataLayer
		// var dataLayerKeys = config.usedKeys;
		var dcolors = config.usedKeys.map(function(d,i){return config.colors(d)});
		dcolors.push(config.unusedColor); //add color unused bar
		var dataLayerColors = d3.scale.ordinal().range(dcolors);
		// console.log("dataLayerKeys",dataLayerKeys);

		var kLen = config.usedKeys.length;
		var hasTotalValue = (config.keys.length > 1);
		var percentages = [];
		var maxTotal = 0;
		// percentages & total
		config.data.forEach(function(d, i) {
			var total=0,actualTotal=0;
			for(var k=0;k<kLen;k++) {
				total += d[config.usedKeys[k]]; 
			}
			if(hasTotalValue) {
				actualTotal = d[config.totalKey];
				d[config.unusedKey] = actualTotal-total;
			}
			else {
				actualTotal = total;
				d[config.totalKey]=total;
				d[config.unusedKey]=0;
			}
			if(maxTotal < actualTotal) {
				maxTotal = actualTotal;
			}

			var result = {"x": d[config.titleKey], "x2":d[config.subtitleKey]};
			// used value percentages
			for(var k=0;k<kLen;k++) {
				var v1 = d[config.usedKeys[k]];
				var percent = (v1/actualTotal * 100)
				var name = config.usedKeys[k];
				
				if(config.xAxisPercentageBased) {
					result[name] = percent;
				}
				else {
					result[name] = v1;
				}
			}
			// unused value percentage
			var v1 = d[config.unusedKey];
			result[config.unusedKey]=(config.xAxisPercentageBased) ? (v1/actualTotal * 100) : v1;
			result[config.totalKey]=actualTotal;
			// add to array
			percentages[i]=result;
		});
		config.dataPercentages = percentages;
		// console.log("dataPercentages=",JSON.stringify(config.dataPercentages));
		// ---------------------------------
		config.dataLayers = dataLayerKeys.map(function(k, ki) {
			return config.dataPercentages.map(function(d, i) {
				return { "x" : d.x,
						 "x2": d.x2,
						 "y" : d[k],
						 "k" : k,
						 "ki": ki,
						 "i" : i}
			});
		});
		// console.log("dataLayers=",JSON.stringify(config.dataLayers));
		// ---------------------------------
		config.stackedData = d3.layout.stack()(config.dataLayers);
		// console.log("stackedData=",JSON.stringify(config.stackedData));
		// ---------------------------------
		// config.max = d3.max(config.stackedData, function(data) { 
		//  					return d3.max(data, function(d) { return d.y0 + d.y; }); });
		config.max = (config.xAxisPercentageBased) ? 100 : maxTotal;
		// console.log("config.max=",config.max);
		// ----------------------------------

		var xScale = d3.scale.linear()
			.domain([0, config.max])
			.range([0, actualChartWidth]);
		config.xScale = xScale;

		var container = d3.select(chartContainerID);

		var mainpanel = container
			.append("svg")
			.attr("width", totalWidth)
			.attr("height", totalHeight)
			.attr("class", "usage2");

		var panel = mainpanel.append("g")
			.attr("transform","translate(0," + config.padding + ")" );	
		// .attr("transform","translate("+ yAxisLeftPadding + "," + panelOffsetY + ")" );

		// stacked bars group
		var spanel = panel.selectAll('g')
			.data(config.stackedData)
			.enter()
			.append("g")
			.attr("class", "category");
		spanel.each(function(d,i) {
					var category = d3.select(this);
					config._drawBar(d,i,category,dataLayerColors);} );

		var yEnd = config.allBarsHeight + config.padding;

		if(config.isXAxisDisplayed == true) {
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				.tickFormat(function(d,i) {
					return config.xAxisPercentageBased ? (d+"%") : config.valueFormat(d);
				})
				// .tickSubdivide(5)
				.ticks(10)
			var xSvg = panel
				.append("g")
				.attr("class","x axis")
				.attr("transform", "translate("+config.padding+","+ yEnd  + ")")
				.call(xAxis);
		}
		
		if(isLegendsDisplayed && config.legendStyle != null) {
			var chart_legends = UTILS.chart_legends()
					.attr("data",config.usedKeys)
					.attr("colors",dataLayerColors)
					.attr("width",legendWidth)
					.attr("height",legendHeight)
					.attr("dotType",UTILS.defaultValue(config.legendStyle['dotType'], 'circle'))
					.attr("dotSize",config.legendStyle['dotSize'])
					.attr("fontStyle",config.legendStyle['fontStyle'])
					.attr("padding",config.legendStyle['padding'])
			if (config.legendStyle['position'] == 'right') {
				chart_legends
					.attr("x",(config.width+config.padding))
					.attr("y",(config.padding+10));
			}
			else {
				var y = yEnd + ((config.isXAxisDisplayed==true) ? config.xAxisHeight : 0)  + config.padding
				chart_legends
					.attr("x",(config.padding+10))
					.attr("y",y);
			}
			chart_legends(mainpanel);
			

			var legends = chart_legends.getLegends();
			legends.on("mouseover",function(d,i) {
				var bars = mainpanel.selectAll("rect.bar"+i);
				bars.style("opacity","0.7")

				var texts = mainpanel.selectAll("text.bar"+i);
				texts
					.style('font',config.barTextFontOnHover)
					.style('display',"")
			})
			.on("mouseout",function(d,i) {
				var bars = mainpanel.selectAll("rect.bar"+i);
				bars.style("opacity","")

				var texts = mainpanel.selectAll("text.bar"+i);
				texts.style('font',config.barTextFont)
				
				var textSmall = mainpanel.selectAll("text.barSmall"+i);
				textSmall.style('display',"none")
			})

		}

	}

	config._drawBar = function(p,q,parent,colors)  {
		// each rect bar in the stacked bar group
		var gRow = parent.selectAll("g.row")
			.data(p)
			.enter().append("g")
			.attr("class","row")
			.attr("_dataidx",function(d,i){return i;})

		var yCall = function(d,i) {
				return (d.i * config.barRowHeight) + config.titleHeight; };

		// print title/subtitle/total only once 
		if(q==0) {
			// title
			gRow.append('text')
				.attr("class","title")
				.attr('y', function(d,i) {
					return yCall(d,i)-5; })
				.attr('x', config.padding+2)
				// .style('fill','gray')
				.style("font","13px Verdana")
				.text(function(d,i) {return d.x})

			// subtitle
			gRow.append('text')
				.attr("class","subtitle")
				.attr('y', function(d,i) {
					return yCall(d,i)-6; })
				.attr('x', function(d,i) { 
					return (config.padding+2 + config.padding + (d.x.length*9))  })
				// .style('fill','gray')
				.style("font"," 10px Verdana")
				.text(function(d,i) { 
					if(d.x2 !=null && d.x2!="") { 
						return "( " + d.x2 + " )"; 
					}
					else {
						return "";
					} })

			// total
			if(config.isValuesTicksDisplayed) {
				if(config.xAxisPercentageBased) {
					// total tick mark, above the bar
					gRow.append("rect")
						.attr("class","stroke")
						.attr("y", function(d,i){
							return  yCall(d,i)-(config.barHeight/2) })
						.attr("x", function(d){
							return config.xScale(config.max)+config.padding-1;})
						.attr("width","0.5")
						.attr("height", config.barHeight/2)
						// .style("fill","black");	
					// total value, above the bar
					gRow.append("text")
						.attr("y", function(d,i){
							return  yCall(d,i)-1;})
						.attr("x", function(d){
							return config.xScale(config.max)+config.padding-2;})
						.attr("text-anchor","end")
						.text(function(d) { 
							if(d.k==config.unusedKey) { 
								return "";
							}
							return config.valueFormat(config.data[d.i][config.totalKey]); })
						.style("font","10px Verdana")
						// .style("fill","gray");
				}
				else {
					// total value, at end of the bar
					gRow.append("text")
						.attr("y", function(d,i){
							return  yCall(d,i)+config.padding;})
						.attr("x", function(d){
							return config.xScale(config.data[d.i][config.totalKey])+config.padding;})
						.attr("text-anchor","start")
						.text(function(d) { 
							if(d.k==config.unusedKey) { 
								return "";
							}
							return config.valueFormat(config.data[d.i][config.totalKey]); })
						.style("font","10px Verdana")
						// .style("fill","gray");
				} 
			}
		} // title/subtitle/total only once //
		
		var bar = gRow.append("g")
			.attr("class","bar");
		
		// bar
		bar.append('rect')
			.attr("class",function(d,i){return "bar"+d.ki})
			.style("fill", function(d, i) {
				return colors(d.ki); })
			// .style('stroke',function(d,i) { 
			//	return d3.rgb(colors(d.ki)).darker(); })
			.attr('y', yCall)
			.attr('x', function(d) {
				return config.padding + config.xScale(d.y0); })
			.attr('height', config.barHeight)
			.attr('width', function(d) {
				return config.xScale(d.y) })
				
		var minWidth = 38;

		// used percentage/value on the bar
		bar.append('text')
			.attr("class",function(d,i){
				var barSelectClass = "bar"+d.ki;  // for select
				var barSmallClass = (config.xScale(d.y)>minWidth) ? "" : "barSmall"+d.ki;
				return "bar " + barSmallClass + " " + barSelectClass})
			.attr('y', function(d,i) {
				return yCall(d,i) + (config.barHeight/1.5); })
			.attr('x', function(d) {
				return config.padding + config.xScale(d.y0) + (config.xScale(d.y)/2); })
			.style('font',config.barTextFont)
			.attr("text-anchor", "middle")
			.text(function(d) { 
				if(d.k==config.unusedKey) { 
					return "";
				}
				var text = config.xAxisPercentageBased 
							? (Math.round(d.y * 100)/100 + '%')
							: config.valueFormat(d.y);
				return text; })
			.style("display", function(d,i) {
				return (config.xScale(d.y)>minWidth) ? "" : "none";	})

		// value tick
		if(config.isValuesTicksDisplayed) {
			if(config.xAxisPercentageBased) {
				// used value tick mark below the bar
				bar.append("rect")
					.attr("class","stroke")
					.attr("y", function(d,i){
						return  yCall(d,i)+config.barHeight; })
					.attr("x", function(d){
						return config.xScale(d.y + d.y0) + config.padding - 1;})
					.attr("width","0.5")
					.attr("height", config.barHeight/2)
					// .style("fill","black")
					.style("display",function(d,i) {
						return (d.k==config.unusedKey) ? "none" : "";})
				// used value below the bar
				bar.append("text")
				.attr("y", function(d,i){
					return  yCall(d,i) + config.barHeight + 10;})
				.attr("x", function(d){
					return config.xScale(d.y + d.y0) + config.padding - 2;})
				.attr("text-anchor","end")
					.text(function(d) { 
						if(d.k==config.unusedKey) { 
							return "";
						}
						return config.valueFormat(config.data[d.i][d.k]); })
				.style("font","12px Verdana")
				// .style("fill","gray");
			}
		}
		
		if(config.tooltip != null) {
			bar.on("mouseover",function(d,i) {
				var title = d.x;
				var yLabel = d.k;
				var yValue = config.data[d.i][d.k];
				var total = config.data[d.i][config.totalKey];

				var content = title+'  <font size="-2">(Total:'+total+')</font><br\><b>'+ yLabel + ": " + yValue;
				if(config.xAxisPercentageBased) { 
					var percent = Math.round(d.y * 100)/100
					content += '('+percent+'%)';
				}

				config.customTooltip.showTooltip(content, (d3.event || window.event));
			})
			.on("mouseout",function(d,i) {
				config.customTooltip.hideTooltip();
			});
		}

		if(config.clickAction != null) {
			bar.on("click",function(d,i) {
				var title = d.x;
				var yLabel = d.k;
				var yValue = config.data[d.i][d.k];
				var total = config.data[d.i][config.totalKey];
				
				var actionType = config.clickAction['actionType'];
				var actionTarget = config.clickAction['actionTarget'];
				var actionUrl = config.clickAction['actionUrl'];
				var actionUrlParams = 'data='+yLabel+','+yValue+','+title+'&keys='+config.titleKey+','+config.usedKeys;
				if (actionType == 'callback') {
					eval( actionTarget+"(yLabel,yValue,title)" );
			    } else {
			    	UTILS.executeClickAction(actionType, actionTarget, actionUrl, actionUrlParams);
			    }
				return;
		    });
		}
	}	
	
	return config;
}