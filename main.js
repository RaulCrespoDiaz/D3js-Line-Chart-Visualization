
// Let's start using ES6
// And let's organize the code following clean code concepts
// Later one we will complete a version using imports + webpack

// Isolated data array to a different file

let margin = null,
  width = null,
  height = null;

let svg = null;
let x, y = null; // scales

var barColor = d3.scaleOrdinal(d3.schemeCategory10);

var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

setupCanvasSize();
appendSvg("body");
refreshChart();
autoRefreshChart(500000);

function autoRefreshChart(miliSeconds) {
  setInterval(function () {
    refreshChart();
  }, miliSeconds);
}


function refreshChart() {
  d3.csv("data.csv", function (error, data) {
    if (error) throw error;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");
    
    data.forEach(function (d,i) {
      d.date = parseTime(d.date);
      d.sales = +d.sales;
      d.chart = +d.chart;
      d.product=d.product;
    });


    clearCanvas();
    drawChart(data)


  });
}


function drawChart(totalSales) {
  setupXScale(totalSales);
  setupYScale(totalSales);
  appendXAxis(totalSales);
  appendYAxis(totalSales);

  //Calculate the number of charts
  var numcharts = d3.max(totalSales, function (d, i) {
    return d.chart;
  });
  var data_for_legend=[];
  var i;
  
  //iterate on every chart to draw them on the canvas
  for (i = 1; i < numcharts + 1; i++)
  { 
    chart=totalSales.filter(totalSales => totalSales.chart === i);

    var newchart=[];
    
    newchart=totalSales.filter(totalSales => totalSales.chart === i);
    appendLineCharts(newchart);
    appendDot(newchart,i);
    data_for_legend.push({"product":newchart[0].product})
  }
  
  appendLegend(data_for_legend)  
  
}

function clearCanvas() {
  d3.selectAll("svg > g > *").remove();
}

// 1. let's start by selecting the SVG Node
function setupCanvasSize() {
  margin = { top: 75, left: 80, bottom: 80, right: 30 };
  width = 960 - margin.left - margin.right;
  height = 520 - margin.top - margin.bottom;
}

function appendSvg(domElement) {
  svg = d3.select(domElement).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

}

// Now on the X axis we want to map totalSales values to
// pixels
// in this case we map the canvas range 0..350, to 0...maxSales
// domain == data (data from 0 to maxSales) boundaries
function setupXScale(totalSales) {

  x = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(totalSales, function (d) { return d.date }));
}

// Now we don't have a linear range of values, we have a discrete
// range of values (one per product)
// Here we are generating an array of product names
function setupYScale(totalSales) {
  var maxSales = d3.max(totalSales, function (d, i) { return d.sales; });

  y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, maxSales]);

}

function appendXAxis(totalSales) {
  // Add the X Axis
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    svg.append("text")             
    //.attr("transform",
    //      "translate(" + (width/2) + " ," + 
    //                     (height + margin.top + 20) + ")")
    .attr("y", height+ margin.top -25)
    .attr("x",(width / 2))
    .style("text-anchor", "middle")
    .text("Time");
}

function appendYAxis(totalSales) {
  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y))
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Sales");
}

function appendLineCharts(totalSales) {

  // define the line
  var valueline = d3.line()
    .x(function (d) {
      //console.log('linea:', x(d.date));
      return x(d.date);
    }) 
    .y(function (d) { return y(d.sales); });

  // Add the valueline path.
  svg.append("path")
    .data([totalSales])
    //.attr("class", "line")
    .attr("d", valueline)
    .style("fill", "none")
    .style('stroke', function(d) {console.log("product line:",d[0].product);
                                  console.log("color line:",barColor(d[0].product));
                                  return barColor(d[0].product);})
    //.style("stroke", totalSales[0])
    .style("stroke-width", "2px");
}

function appendDot(totalSales,i) {

  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Product:</strong> <span style='color:yellow'>" + d.product + "</span>" + "</br>"+ "</br>"
          + "<strong>Sales:</strong> <span style='color:yellow'>" + d.sales +"$"+ "</span>" 
    ;});

  svg.call(tip);

  svg.selectAll("circle"+i)
    .data(totalSales)
    .enter().append("circle")
    .attr("class", "circle")
    .attr('fill', function(d) {
      console.log("color dot:",barColor(d.product));
      return barColor(d.product);
      
      })
    //.style("fill", totalSales[0])
    .attr("r", 5)
    .attr("cx", function(d) { return x(d.date); })
    .attr("cy", function(d) { return y(d.sales); })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
    
}

 //  Now let's add a Legend
 function appendLegend(totalSales){

  legend = svg.append('g')
	  .attr('class', 'legend')
	  .attr('height', 100)
    .attr('width', 100)
  
  legend.selectAll('rect')
    .data(totalSales)
    .enter()
    .append('rect')
	  .attr('x', width-85)
    .attr('y', -10)
    .attr('width', 90)
	  .attr('height', (function(d, i){ return 20+(i *  20)}))  
  
  legend.selectAll('circle')
    .data(totalSales)
    .enter()
    .append('circle')
	  .attr('cx', width - 70)
    .attr('cy', (d, i)=> i *  20)
	  .attr('r', 5)
    .attr('fill', function(d) {
            return barColor(d.product);      
      })
    .attr('class', 'circle');
    
  legend.selectAll('text')
    .data(totalSales)
    .enter()
    .append('text')
	  .attr('x', width - 60)
    .attr('y',function(d, i) { return i *  20+5;
      console.log('valor: ',d);})
	  .text(function(d){ return d.product});
}







