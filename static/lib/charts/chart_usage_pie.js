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
 * CHART PIE2
 * - used in chart_usage for pie & guage.
 */
var chart_usage_pie = function() {
	var config = {
		uniqueid : null,
		data: [],
		dataidx: -1,
		colors : d3.scale.category20(),
		x:0,
		y:0,
		colors:d3.scale.category20(),
		innerRadius:30,
		outerRadius:50,
		unitLabels:null,
		headerText:'',
		centerText:'',
		centerText2:'',
		footerText:'',
		footerText2:'',
		arcs : null,
		displayPercent:true,
		arcStartAngle: 1,
		percentRoundDecimals: 2,
	};
	
	var thisPie = function(parentPanel) {
		if(config.uniqueid==null) {
			config.uniqueid = UTILS.getUniqueid(); 
		}
		var mainPanel = (parentPanel instanceof String) 
					? d3.select(parentPanel)
					: parentPanel;
		var g = mainPanel.append("g")
			.attr("transform", "translate(" + (config.x + config.outerRadius) + "," + (config.y + config.outerRadius) + ")")
			.attr("id",config.uniqueid);
		config._drawPie(g);
	};
	thisPie.data = function(value) {
		if (!arguments.length) return config.data;
		config.data = value;
		return thisPie;
	};
	thisPie.dataidx = function(value) {
		if (!arguments.length) return config.dataidx;
		config.dataidx = value;
		return thisPie;
	};	
	thisPie.colors = function(value) {
		if (!arguments.length) return config.colors;
		config.colors = value;
		return thisPie;
	};
	thisPie.x = function(value) {
		if (!arguments.length) return config.x;
		config.x = value;
		return thisPie;
	};
	thisPie.y = function(value) {
		if (!arguments.length) return config.y;
		config.y = value;
		return thisPie;
	};
	thisPie.innerRadius = function(value) {
		if (!arguments.length) return config.innerRadius;
		config.innerRadius = value;
		return thisPie;
	};
	thisPie.outerRadius = function(value) {
		if (!arguments.length) return config.outerRadius;
		config.outerRadius = value;
		return thisPie;
	};
	thisPie.displayPercent = function(value) {
		if (!arguments.length) return config.displayPercent;
		config.displayPercent = value;
		return thisPie;
	};
	thisPie.headerText = function(value) {
		if (!arguments.length) return config.headerText;
		config.headerText = value;
		return thisPie;
	};
	thisPie.centerText = function(value) {
		if (!arguments.length) return config.centerText;
		config.centerText = value;
		return thisPie;
	};
	thisPie.centerText2 = function(value) {
		if (!arguments.length) return config.centerText2;
		config.centerText2 = value;
		return thisPie;
	};	
	thisPie.footerText = function(value) {
		if (!arguments.length) return config.footerText;
		config.footerText = value;
		return thisPie;
	};
	thisPie.footerText2 = function(value) {
		if (!arguments.length) return config.footerText2;
		config.footerText2 = value;
		return thisPie;
	};
	thisPie.arcLabels = function(value) {
		if (!arguments.length) return config.arcLabels;
		config.arcLabels = value;
		return thisPie;
	};	
	thisPie.unitLabels = function(value) {
		if (!arguments.length) return config.unitLabels;
		config.unitLabels = value;
		return thisPie;
	};	
	thisPie.uniqueid = function(value) {
		if (!arguments.length) return config.uniqueid;
		config.uniqueid = value;
		return thisPie;
	};
	thisPie.getArcs = function() {
		return config.arcs;
	};
	thisPie.getTotal = function() {
		return config.total;
	};
	thisPie.getPercentages = function() {
		return config.percentage;
	};
	thisPie.percentRoundDecimals = function(value) {
		if (!arguments.length) return config.percentRoundDecimals;
		config.percentRoundDecimals = value;
		return thisPie;
	};
	
	
	config._drawPie = function(vis) {
		var y2 = 0;
		if(config.headerText!='') {
			vis.append('g')
				.attr("class","label")
				.append('text')
				.attr("text-anchor","middle")
				.attr('x', 0)
				.attr('y', -(config.outerRadius-10))
				.text(config.headerText)
				.style('font','bold 10px Verdana');
			y2 += 20;
		}
		
		var values = config.data;;

		var pie = d3.layout.pie()
				.sort(null);
		var arc = d3.svg.arc()
			.innerRadius(config.innerRadius)
			.outerRadius(config.outerRadius);
		var piedata = pie(values);
		
		var arcs = vis.selectAll("g arc")
			.data(piedata)
			.enter()
			.append("g")
			.attr("class", "arc")
			.attr("transform", "translate(0," + y2 + ")")

		var wedge = arcs.append("path")
			.attr("stroke", "beige")
			.attr("stroke-width", 0.5)
			.attr("fill", function(d, i) {
				return config.colors(i); })
			.attr("id",function(d, i) {
				return config.uniqueid+"_"+i;
			})
			.attr("d", arc);

		// attach dataidx to the arc path
		arcs.attr("dataidx",config.dataidx);
		
		config.arcs = arcs;
		
		// Calculate the percentage of the pie portions
		var total = d3.sum(values);
		var percentage = [];
		for (var i=0;i< values.length;i++) {
			// percentage[i] = Math.round(values[i]/total * 100*100)/100;
			percentage[i] = d3.round((values[i]/total * 100), config.percentRoundDecimals);
		}
		config.total = total;
		config.percentage = percentage;		


		var textOffset = config.innerRadius!=0?1:1.5;
		var label = arcs.append("text")
			.attr("transform", function(d) {
				var c = arc.centroid(d);
				return "translate(" + c[0]*textOffset +"," + c[1]*textOffset + ")"; })
			.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.attr("display", function(d) {
				return d.value > .15 ? null : "none"; })
			.text(function(d, i) {
				var label = ""
				if(config.arcLabels!=null) {
					var alabel = config.arcLabels[i];
					label += (alabel!=null) ? alabel : ""; 
				}
				if(config.displayPercent) {
					var percent = (percentage[i]>7)
						? percentage[i] + "%"
						: '';
					label += percent;
				}
				return label; })
			//.attr("fill", function(d, i) {
					// return d3.rgb(d3.rgb(config.colors(i)).brighter()).brighter()  })
					// return d3.rgb(d3.rgb(config.colors(i)).darker()).darker()  })
					// return d3.rgb(config.colors(i)).darker()  })
					// return d3.rgb("white")  })
					// return d3.rgb("beige")  })
			.style('font','10px Verdana');
		
		if(config.centerText!='') {
			vis.append('g')
				.attr("class","label")
				.append('text')
				.attr("text-anchor","middle")
				.attr('x', 0)
				.attr('y', y2)
				.text(config.centerText)
				.style('font','bold 10px Verdana');
		}
		if(config.centerText2!='') {
			vis.append('g')
				.attr("class","label")
				.append('text')
				.attr("text-anchor","middle")
				.attr('x', 0)
				.attr('y', y2+15)
				.text(config.centerText2)
				.style('font','10px Verdana');
		}		
		
		if(config.footerText!='') {
			vis.append('g')
				.attr("class","label")
				.append('text')
				.attr("text-anchor","middle")
				.attr('x', 0)
				.attr('y', (y2+config.outerRadius+15))
				.text(config.footerText)
				.style('font','bold 10px Verdana');
		}
		if(config.footerText2!='') {
			vis.append('g')
				.attr("class","label")
				.append('text')
				.attr("text-anchor","middle")
				.attr('x', 0)
				.attr('y', (y2+config.outerRadius+30))
				.text(config.footerText2)
				.style('font','10px Verdana');
		}
		
		if(config.unitLabels != null) { 
			config._drawUnitLabels(vis,piedata); 
		}
	}
	
	config._drawUnitLabels = function(viz,piedata) {
		//draw labels with tick marks
		var unitLabels = viz.selectAll("text.unit")
			.data(piedata)
			// .text(function(d,i){return config.unitLabels[i];});
		 
		config.arcTextStartAngleOffset = -(Math.PI) -(Math.PI * -0.5);
		config.textOffset = 1;
		
		unitLabels.enter().append("svg:text")
			.attr("class", "unit")
			/* ****
				.append("textPath")
				.attr("xlink:href", function(d,i) {
					return "#"+config.uniqueid+"_"+i;
				})
				.attr("transform", function(d) {
				return "translate(0,0)";
			})				
			**** */
			.attr("transform", function(d) {
				return "translate(" + 
				 (Math.cos((d.startAngle-(Math.PI))-config.arcTextStartAngleOffset) * (config.outerRadius+config.textOffset)) 
				  + "," + 
				 (Math.sin((d.startAngle-(Math.PI))-config.arcTextStartAngleOffset) * (config.outerRadius+config.textOffset))
				 + ")";
			})
			.attr("text-anchor", function(d){
				var startAngle = d.startAngle;
				var arcSize = Math.PI;
				if (startAngle == arcSize) {
					return "middle";
				} else if (startAngle < arcSize) {
				  return "end";
				} else {
				  return "beginning";
				}
			})
			
			.text(function(d,i){return config.unitLabels[i];});
		unitLabels.exit().remove();
	}
	
	return thisPie;
}
