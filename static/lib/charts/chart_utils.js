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
 * UTILS
 */
var UTILS = UTILS || (function(){

/**
 * Handle Window Resize/OrientationChange event for charts
 */
var re_render_charts_handler = function(evt) {
	var list;
	if(document.getElementsByClassName) {
		list = document.getElementsByClassName("chart-responsive");
	}
	else {
		// filter all chart div's 
		var list1 = document.getElementsByTagName("div");
		list=[]
		for (var i = list1.length-1;i>-1;i--) {
			var el = list1[i];
			if(/chart-responsive/i.test(el.className)) { 
				list.push(el);
			}
		}
	}
	for (var i = list.length-1;i>-1;i--) {
		var el = list[i];
		var divWidth = el.clientWidth;
		if(divWidth==null) { return; }
		el.innerHTML = "";
		var renderFuncName = "render_"+el.id;
		eval( renderFuncName+"("+divWidth+")" );
	}
}
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
	window.addEventListener("orientationchange", re_render_charts_handler, false);
} else {
	window.addEventListener("resize", re_render_charts_handler, false);
}

	
	
var UTILS = {};

UTILS.CONSTANTS = {};
// Bar types used in chart_bar(&horizontal); 
UTILS.CONSTANTS.SIMPLE_BARS=0;
UTILS.CONSTANTS.GROUPED_BARS=1;

UTILS.customTooltip = function(tooltipId, width, height) {
	var tooltipId = tooltipId;
	var ttDiv = d3.select("body")
		.append("div")
		.attr("class", "chart-tooltip")
		.attr("id", tooltipId)
		.style("opacity", 1);
	// if(width) {	ttDiv.style("width", width); }
	// if(height) { ttDiv.style("height", height); }

	hideTooltip();

	function showTooltip(content, event) {
		ttDiv.html(content);
		ttDiv.style("display", "");
		updatePosition(event);
	}

	function hideTooltip() {
		ttDiv.style("display", "none");
	}

	function updatePosition(event) {
		var tdiv = document.getElementById(tooltipId);
		var xOffset = 20;
		var yOffset = 10;
	
		var ttw = tdiv.clientWidth;
		var tth = tdiv.clientHeight;
		var wscrY = window.scrollY || window.pageYOffset;
		var wscrX = window.scrollX || window.pageXOffset; 
		var curX = tdiv ? event.clientX + wscrX : event.pageX;
		var curY = tdiv ? event.clientY + wscrY : event.pageY;
		var ttleft = ((curX - wscrX + xOffset*2 + ttw) > window.outerWidth) ? curX - ttw - xOffset*2 : curX + xOffset;
		if (ttleft < wscrX + xOffset) {
			ttleft = wscrX + xOffset;
		}
		var tttop = ((curY - wscrY + yOffset*2 + tth) > window.outerHeight) ? curY - tth - yOffset*2 : curY + yOffset;
		if (tttop < wscrY + yOffset) {
			tttop = curY + yOffset;
		}
		ttDiv.style('top', tttop + 'px').style('left', ttleft + 'px');
	}

	return {
		showTooltip: showTooltip,
		hideTooltip: hideTooltip,
		updatePosition: updatePosition
	}
}

UTILS.second = 1000;
UTILS.minute = 60 * UTILS.second;
UTILS.hour = 60 * UTILS.minute;
UTILS.day = 24 * UTILS.hour;
UTILS.week = 7 * UTILS.day;
UTILS.month = 30 * UTILS.day;
UTILS.month31 = 31* UTILS.day;
UTILS.year = 365 * UTILS.day;

UTILS.randomInt = function(start,end) {
	if (!start){start=1;}
	if (!end){end=1000;}
	return Math.round((Math.random() * (end-start))+start);
}

UTILS.executeClickAction = function(actionType, actionTarget, actionUrl, actionUrlParams, chartDivID) {
	
	var actionUrlWithParams = "";
	idx = actionUrl.indexOf("?");
    if (idx == -1) {
    	actionUrlWithParams = actionUrl+'?'+actionUrlParams;
    } else {
    	actionUrlWithParams = actionUrl+'&'+actionUrlParams;
    }
	
    if (actionType == 'newPopup') {
    	if (typeof jQuery == 'undefined') {  
    		window.showModalDialog(actionUrlWithParams, "", "dialogWidth:300px; dialogHeight:200px; edge:sunken; center:yes; status:no; resizable:no; help:no");
    	} else {
    		if (typeof $().modal == 'function') {
    			// show a modal dialog only when bootstrap and jquery is loaded
    			UTILS.showPopupWindow(chartDivID, actionTarget, actionUrlWithParams);
    		} else {
    			window.showModalDialog(actionUrlWithParams, "", "dialogWidth:300px; dialogHeight:200px; edge:sunken; center:yes; status:no; resizable:no; help:no");
    		}
    	}
    }
	if (actionType == 'newWindow') {
		window.open(actionUrlWithParams, '_blank', 'menubar, toolbar, location, directories, status, scrollbars, resizable, dependent, width=640, height=480, left=0, top=0', 'false')
        window.focus();
    }
	if (actionType == 'divTarget') {
		UTILS.getUrlContent(actionTarget, actionUrlWithParams);
    }
	if (actionType == 'iframeTarget') {
		var iframe = document.getElementById(actionTarget);
        iframe.src = actionUrlWithParams;
    }
	return;
}

UTILS.getUrlContent = function(divID, url) {
	var xmlhttp;
    if(window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else {  // code for IE6, IE5
      xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.onreadystatechange=function() {
       if (xmlhttp.readyState==4 && xmlhttp.status==200) {
	       //execute script
	       div =  document.getElementById(divID);
	       div.innerHTML = xmlhttp.responseText;
	  
	       var x = div.getElementsByTagName("script");
	       for(var i=0;i<x.length;i++) { eval(x[i].text); }
       }
    }
    xmlhttp.open("GET",url,true); 
    xmlhttp.send();
}

UTILS.showPopupWindow = function(chartDivID, targetID, urlWithParams) {
	var popupID = chartDivID+"_popup";
	$("#"+popupID).modal({
		backdrop: false
	});
	UTILS.getUrlContent(popupID+"_content", urlWithParams);
}

UTILS.removeDuplicatesInList = function(list) {
	var tmplist = [];
	list.forEach(function(d) {
		if(tmplist.indexOf(d)==-1) {
			tmplist.push(d);
		}
	});
	return tmplist;
}

/**
 * CHART LEGENDS
 * 
 * @attr data
 * @attr colors
 * @attr layoutStyle
 * @attr x
 * @attr y
 * @attr width
 * @attr height
 * @attr dotSize
 * @attr dotType
 * @attr fontStyle
 * @attr padding
 * @attr chartWidthOffset
 * @attr chartHeightOffset
 *  
 */
UTILS.chart_legends = function() {
	var config = {
		"data" : [],
		"actualNames" : null,
		"colors" : d3.scale.category20(),
		"x" : 0,
		"y" : 0,
		"width" : 100,
		"height" : 100,
		"fontStyle" : "10px Verdana",
		"dotSize" : 5,
		"dotType" : "circle",  /* circle,square */
		"padding" : 10,
		"chartWidthOffset" : 8,
		"chartHeightOffset" : 8,
		"layoutStyle" : "left2right@width", /* left2right@width,left2righ@height,top2bottom@height,top2bottom@width */
	};
	var config_keys = Object.keys(config)
	
	var thisPane = function(parentPanel) {
		var mainPanel = (parentPanel instanceof String) 
			? d3.select(parentPanel)
			: parentPanel;
		_drawLegends(mainPanel);
	}
	thisPane.attr = function(name,value) {
		switch (arguments.length) {
		case 0:
			return null;
		case 1:
			return config[name];
		default:
			if(config_keys.indexOf(name)==-1) { console.log("[UTILS.chart_legends]","WARNING","Invalid attribute :",name); }
			config[name]=UTILS.defaultValue(value, config[name]);
			break;
		}
		return thisPane;
	}	
	thisPane.getLegends = function() {
		return config.legends;
	}

	// render legends
	_drawLegends = function(mainpanel) {
		var legendpanel = mainpanel.append("g")
			.attr("class","legendpanel");

		var entry = legendpanel.selectAll("g")
			.data(config.data)
			.enter()
			.append("g")
			.attr("class",function(d,i) {
				// add common class 'legend', 
				// and add custom class eg 'entry0', useful for selecting individual entry
				return "legend entry"+i });

		config.legends = entry;

		config.hasNamedColors = UTILS.isOrdinalScaleWithNames(config.colors);
		if(config.hasNamedColors && config.actualNames==null) {
			config.actualNames = config.data;
		}

		var legendDotRadius = config.dotSize;
		var chartWidthOffset = config.chartWidthOffset;
		var chartHeightOffset = config.chartHeightOffset;
		var startAtX = config.x;
		var startAtY = config.y;
		var colPadding = config.padding;
		var rowPadding = config.padding;

		var calc = {};
		calc.getLegendWidth = function(noOfChars) {
			return (noOfChars*chartWidthOffset)+(legendDotRadius*2)+colPadding;
		}

		var legendMax=d3.max(config.data.map(function(d,i){ return d.length }));
		var maxColWith = calc.getLegendWidth(legendMax);
		var maxRowHeight = chartHeightOffset+rowPadding;
		// console.log("maxColWith="+maxColWith,"maxRowHeight="+maxRowHeight)
		
		var len = config.data.length;
		if(config.layoutStyle.indexOf("@width")!=-1)  {
			// width-based - no of columns will be calculated based on width supplied
			calc.noOfCols = Math.floor(config.width / maxColWith);
			if(calc.noOfCols<=0) { calc.noOfCols=1 }

			calc.noOfRows = Math.ceil(len/calc.noOfCols);
			// console.log("WIDTH-BASED")
		}
		else { // "@height"
			// height-based - no of columns will be calculated based on height supplied
			calc.noOfRows = Math.floor(config.height / (maxRowHeight));
			if(calc.noOfRows<1) { calc.noOfRows=1 }

			calc.noOfCols = Math.ceil(len/calc.noOfRows);
			// console.log("HEIGHT-BASED")
		}

		if(config.layoutStyle.indexOf("left2right")!=-1) {
			// left-to-right
			calc.getColNo = function(i) { return Math.floor(i%calc.noOfCols); }
			calc.getRowNo = function(i) { return Math.floor(i/calc.noOfCols); }
			// console.log("left-to-right")
		}
		else {
			// top-to-bottom
			calc.getColNo = function(i) { return Math.floor(i/calc.noOfRows); }
			calc.getRowNo = function(i) { return Math.floor(i%calc.noOfRows); }
			// console.log("top-to-bottom")
		}
		
		// calculate max-string-length for each column
		var listPerColWidth = []
		config.data.forEach(function(d,i){
			var colNo = calc.getColNo(i);
			var dlen = d.length
			if(listPerColWidth[colNo]==undefined || listPerColWidth[colNo]<dlen) {
				listPerColWidth[colNo] = dlen;
			}
		});
		
		// Column X-postion, based on pervious column
		var colPositions=[];
		for(var i=0;i<calc.noOfCols;i++) {
			var x;
			if(i==0) {
				x = startAtX;
			}
			else {
				var w0 = listPerColWidth[i-1];  // get max-width of pervious column
				var x0 = colPositions[i-1];    // get x-position of pervious column
				x = x0 + calc.getLegendWidth(w0);
			}
			colPositions[i] = x;
		}
		var xcall = function(d,i) {
			var colNo = calc.getColNo(i);
			var x = colPositions[colNo];
			return x;
		}
		var ycall = function(d,i) {
			var rowNo = calc.getRowNo(i);
			return  startAtY + (rowNo * maxRowHeight);
		}

		// text
		entry.append("text")
			.attr("x", function(d,i) { 
					return xcall(d,i) + legendDotRadius*2; } )
			.attr("y", ycall)
			.attr("dy", ".35em")
			.attr("text-anchor", "start")
			.text(function(d, i) { 
					return d })
			.style('font',config.fontStyle);
		// dot
		if(config.dotType=='square') {
			var dot = entry.append("rect")
			.attr("x", function(d,i) { 
				return xcall(d,i) - legendDotRadius; } )
			.attr("y", function(d,i) { 
				return ycall(d,i) - legendDotRadius; } )
			.attr("width", legendDotRadius*2)
			.attr("height",legendDotRadius*2)
			.attr("fill", function(d, i) {
				return (config.hasNamedColors) ?
				 		config.colors(config.actualNames[i]) : config.colors(i) });
		}
		else {
			entry.append("circle")
				.attr("cx", xcall)
				.attr("cy", ycall)
				.attr("r",legendDotRadius)
				.attr("fill", function(d, i) {
					// console.log("circle fill d=",d,i,config.hasNamedColors,(config.hasNamedColors)?config.actualNames[i]:"N/A",(config.hasNamedColors) ? config.colors(config.actualNames[i]) : config.colors(i))					
					return (config.hasNamedColors) ?
							config.colors(config.actualNames[i]) : config.colors(i)  });
		}
	}

	return thisPane;
};

UTILS.parseBool = function(value, defaultValue) {
	if(value != null) {
		if(typeof value === "string")  {
			return (['true','on','yes','y','t'].indexOf(value.toLowerCase()) != -1);
		}
		else {
			return (value) ? true : false 
		}
	}
	else {
		return (arguments.length>1 && (defaultValue)) ? true : false;
	}
}

UTILS.parseInt = function(text, defaultValue) {
	if(text == null || text=='' || text=='default') {
		return (arguments.length>1) ? defaultValue : 0;
	}
	else {
		var num = parseInt(text);
		return isNaN(num) ? (arguments.length>1) ? defaultValue : 0 : num;
	}
}

UTILS.defaultValue = function(value, defaultValue) {
	if(value==null || value=='' || value=='default') {
		return (arguments.length>1) ? defaultValue : '';
	}
	else {
		return value;
	}
}

UTILS.getUniqueid = function() {
	return "id_" 
		+ (new String(Math.random())).replace(".","_") 
		+ "_" + (new Date()).getTime();
}

/**
 * 
 */
UTILS.isOrdinalScaleWithNames = function(scale) {
	var domain = scale.domain();
	return (domain.length > 0 && (typeof domain[0] === "string"));
}

/**
 * Chart Axis
 * 
 * @param type
 * @attr axisStyle - hAxis/vAxis
 * @attr scale  
 * @attr x
 * @attr y
 * @attr chartWidth
 * @attr chartHeight
 * @attr labelOffset
 * @atrr labelFontStyle
 */
UTILS._chart_axis = function(type) {
	var attrs = {'type':type, 'ticks':5, 'x':null, 'y':null, 'scale':null, 'chartWidth':0, 'chartHeight':0, 'axisStyle':{}, 'labelOffset':50, 'labelFontStyle':'10px Verdana'};
	var attrs_keys = Object.keys(attrs);

	var thisAxis = function(parentPanel) {
		var mainPanel = (parentPanel instanceof String) 
			? d3.select(parentPanel)
			: parentPanel;
		_renderAxis(mainPanel);
	}
	thisAxis.attr = function(name,value) {
		switch (arguments.length) {
		case 0:
			return null;
		case 1:
			return attrs[name];
		default:
			if(attrs_keys.indexOf(name)==-1) { console.log("[UTILS.chart-"+type+"]","WARNING","Invalid attribute :",name); }
			attrs[name]=UTILS.defaultValue(value, attrs[name]);
			break;
		};
		return thisAxis;
	}
	thisAxis.getAxis = function() {
		return thisAxis.axis;
	}
	
	var _renderAxis = function(mainpanel) {
		// SETUP
		var config = {};
		var label = attrs.axisStyle['label'];
		config.tickDisplayAngle = UTILS.parseInt(attrs.axisStyle['tickDisplayAngle'], null);
		config.ticks = UTILS.parseInt(attrs.axisStyle['ticks'], null);
		var tformat = attrs.axisStyle['tickformat'];
		if( typeof tformat == "function" || tformat.indexOf("d3") >= 0 ) {
			config.tickFormat = eval(tformat);
		}
		else if(tformat!=null && tformat!=='default' && tformat!=='') {
			config.tickFormat = d3.format(tformat);
		}		
		config.labelFontStyle = UTILS.defaultValue(attrs.axisStyle['labelFontStyle'],attrs.labelFontStyle);
		config.labelOffset = UTILS.defaultValue(attrs.axisStyle['labelOffset'],attrs.labelOffset);

		config.d3axis_x = (attrs.x == null) ? 0 : attrs.x; 
		config.d3axis_y = (attrs.y == null) ? 0 : attrs.y;
		
		config.hasGridLines = UTILS.parseBool(attrs.axisStyle['hasGridLines'],false);
		
		switch (type) {
		case 'y-axis':
			config.className = "y";
			// 'in'=='right' /  'out=='left"
			config.axisPosition = (attrs.axisStyle['position'] == 'in') ? "right" : "left";
			if (label!= null && label !== '') {
				config.label_x = -(attrs.chartHeight/2);
				config.label_y = -config.labelOffset;
				config.label_transform = "rotate(-90)";
			}
			config.addGridNewLine = function(d,i) {
				var g = d3.select(this);
				var line = g.append("line")
				line.attr("x2",0)
					.attr("y2",0)
					.attr("x1",attrs.chartWidth);
			};
			break;
		case 'x-axis-horizontal':
			config.className = "x";
			// 'out'=='top' /  'in=='bottom"
			config.axisPosition = (attrs.axisStyle['position'] == 'in') ? "bottom" : "top";
			if (label!= null && label !== '') {
				config.label_x = attrs.chartWidth / 2;
				config.label_y = -config.labelOffset;
				config.label_transform = "";
			}
			config.addGridNewLine = function(d,i) {
				var g = d3.select(this);
				var line = g.append("line")
				line.attr("y2",0)
					.attr("x2",0)
					.attr("y1",attrs.chartHeight);
			} 
			break;
		case 'x-axis':
		default:
			config.className = "x";
			// 'in'=='top' /  'out=='bottom"
			config.axisPosition = (attrs.axisStyle['position'] == 'in') ? "top" : "bottom";
			config.d3axis_y = (attrs.y == null) ? attrs.chartHeight : attrs.y;
			if (label!= null && label !== '') {
				config.label_x = attrs.chartWidth / 2;
				config.label_y = attrs.chartHeight + config.labelOffset;
				config.label_transform = "";
			}
			config.addGridNewLine = function(d,i) {
				var g = d3.select(this);
				var line = g.append("line")
				line.attr("y2",0)
					.attr("x2",0)
					.attr("y1",-attrs.chartHeight);
			} 
			break;
		}

		// D3 AXIS
		var d3Axis = d3.svg.axis()
			.scale(attrs.scale)
			.orient(config.axisPosition);
		if(config.ticks!=null) { d3Axis.ticks(config.ticks) }
		if(config.tickFormat!=null) { d3Axis.tickFormat(config.tickFormat) }
		thisAxis.axis = d3Axis;

		// ADD AXIS TO SVG
		var axisSvg = mainpanel.append("g")
			.attr("class",config.className+" axis")
			.attr("transform", "translate("+ config.d3axis_x + ","+ config.d3axis_y + ")")
			.call(d3Axis);
		if(config.tickDisplayAngle!=null) {
			axisSvg.selectAll('text').attr('transform', 'rotate('+ config.tickDisplayAngle  + ')');
		}
		if(config.hasGridLines) {
			axisSvg.selectAll('.tick.major').each(config.addGridNewLine);
		}
		
		// ADD AXIS LABEL - specify an label to better describe what the axis represents
		if (label!= null && label !== '') {
			mainpanel.append('g')
				.attr("class",config.className+" label")
				.append('text')
				.attr('transform', config.label_transform)
				.attr("text-anchor","middle")
				.attr('x', config.label_x)
				.attr('y', config.label_y)
				.text(label)
				.style('font', config.labelFontStyle);
		}
	}
	
	return function() { return thisAxis; }
};

UTILS.chart_x_axis = UTILS._chart_axis("x-axis");
UTILS.chart_x_axis_horizontal = UTILS._chart_axis("x-axis-horizontal");
UTILS.chart_y_axis = UTILS._chart_axis("y-axis");

UTILS.appendErrMsg = function(containerID,err) {
	var errMsg = err&&err.message?err.message:err;
	var errStack = escape(err.stack?err.stack:'');
	var _div = d3.select(containerID);
	_div.html(_div.html() + "<br/><div><img src='/iwap/css/images/warning_sign.png' width='15px' height='15px' alt='"+errStack+"' onclick='alert(unescape(this.alt));' /><span class='errmsg'>Error: "+errMsg+"</span></div>")
};

return UTILS;

})(window);


