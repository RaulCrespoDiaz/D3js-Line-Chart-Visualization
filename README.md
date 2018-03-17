# Visualization Advanced Exercise
## The target of this script is to Create a Line chart add dots and interaction (whenever you click on the dots display information).
### I have introduced several improvements as
### * Refresh the chart on any change in the load file
### * In the load file you can introduce some charts (not only one)

#### Final result

![Final chart](./pictures/Exercise2_final_result.png "Final result")

The chart shows the sales of several products in our company

---

#### Usage

> Open _index.html_ on your favorite web browser.
> You could need to open a lite-server
> The load file has to be a csv file with this format:
> * date: date with format DD-MM-YY
> * sales: integer with amount of sales of this date
> * chart: the id chart
> * product: string with the namber of the product

---

#### Implementation overview

The following sample data will be used as input for the line chart:

```javascript
var totalSales = [
    { month: new Date(2016,10, 01), sales: 6500 },
    { month: new Date(2016,11, 01), sales: 5400 },
    { month: new Date(2016,12, 01), sales: 3500 },
    { month: new Date(2017,1, 01), sales: 9000 },
    { month: new Date(2017,2, 01), sales: 8500 },
    ];
```

**1. SVG area**

The following code sets canvas size and margins used to plot SVG area:

```javascript
function setupCanvasSize() {
  margin = {top: 20, left: 80, bottom: 20, right: 30};
  width = 900 - margin.left - margin.right;
  height = 320 - margin.top - margin.bottom;
}

function appendSvg(domElement) {
  svg = d3.select(domElement).append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform",`translate(${margin.left}, ${margin.top})`);
}
```

**2. Tooltip area**

A new _\<div>_ is created to contain tooltip information. Initial _opacity_ is set to 0 as the tooltip should not be visible until a dot in the line chart is clicked:

```javascript
function appendTooltip(domElement){
  tooltip=d3.select(domElement)
    .append('div')	
    .attr('class', 'tooltip')				
    .style('opacity', 0);
}
```

A specific CSS style has been created for the tooltip in order to show a nice semi-transparent box containing the value when a dot in the line chart is clicked:

```javascript
.tooltip {
  position: absolute;           
  text-align: center;
  color: white;
  width: 50px;                  
  height: 30px;                 
  padding: 8px;             
  font: 13px sans-serif;        
  background: lightsteelblue;   
  border: 0px;      
  border-radius: 8px;           
  pointer-events: none;         
  font-weight: bold;
}
```

**3. X/Y axis**

Axis scales are defined based on input data (_totalSales_ defined in step 1 above). X axis data is composed of a time scale from date values, while Y axis data is composed of a liner range between 0 and _maxSales_:

```javascript
function setupXScale()
{
  x = d3.scaleTime()
      .range([0, width])
      .domain(d3.extent(totalSales, function(d) { return d.month}));
}

function setupYScale()
{
  var maxSales = d3.max(totalSales, function(d, i) {
    return d.sales;
  });
  y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, maxSales]);
}
```

Once scales are defined, both X and Y axis are configured in D3 to be shown on the bottom and left, respectively:

```javascript
function appendXAxis() {
  // Add the X Axis
  svg.append("g")
    .attr("transform",`translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .attr("class", "axis");
}  

function appendYAxis() {
  // Add the Y Axis
  svg.append("g")
  .call(d3.axisLeft(y))
  .attr("class", "axis");
}
```

Axis values are rendered using a custom CSS style:

```javascript
.axis {
  fill: none;
  stroke: blue;
  stroke-width: 0.5px;
}
```

**4. Line chart**

The following code defines the line using sample data from step 1 above, and then represents it as a SVG path:

```javascript
function appendLineCharts()
{
  // define the line
  var valueline = d3.line()
                    .x(function(d) { return x(d.month); })
                    .y(function(d) { return y(d.sales); });
  // Add the value path
  svg.append("path")
      .data([totalSales])
      .attr("class", "line")
      .attr("d", valueline);
}
```

Line is painted in red according to its own CSS style:

```javascript
.line {
  fill: none;
  stroke: red;
  stroke-width: 1.5px;
}
```

**5. Interactive dots**

As a last step in this exercise, data points are shown on top of the line chart as interactive dots along the SVG path:

```javascript
function appendPointCharts(){
  svg.selectAll('dot')
    .data(totalSales)
    .enter().append('circle')
    .attr("class", "dot")
    .attr('r', 4.5)
    .attr('cx', d => x(d.month))
    .attr('cy', d => y(d.sales))
    .on('mouseout',d=>{
      //Hide the tooltip
      tooltip.transition()		
        .duration(800)
        .style('opacity', 0);
    })
    .on('mousedown',d=>{
      //Show the tooltip when a point in the chart is clicked
      tooltip.transition()		
            .duration(10)		
            .style('opacity', .9);
      // Add tooltip content
      tooltip.html(`<span>Sales: ${d.sales}</span>`)
            .style("left", (d3.event.pageX) + "px")     
            .style("top", (d3.event.pageY - 28) + "px");  
    });
}
```

Dots are shown in red according to a specific CSS style:

```javascript
.dot {
  fill: red;
}
```