const {
    select,
    csv,
    scaleOrdinal,
    schemeAccent
} = d3;
import { colorLegend } from "./colorLegend.js";

const svg = select('svg#plot');
const svgLegend = select('svg#legend');
let data = {};
const margin = {
    top: 30,
    right: 70, 
    bottom: 10,
    left: 70
};
let dynamicRange = false;
let width, height, innerWidth, innerHeight;
let y = {};
let dragging = {};
let dimensions;
let colorScale;
let classData = {};

let highlighted = false;

// Rescale Axis
const rescaleAxis = function(event, d){
    if (dynamicRange)
        d3.select('#rescale-btn')
            .text('Scale axis to min-max value')
    else
        d3.select('#rescale-btn')
            .text('Align axes scale')
    dynamicRange = !dynamicRange
    const axisName = d
    y[axisName] = d3.scaleLinear()
            .domain( dynamicRange ? d3.extent(data, d => d[axisName]) : [0,8])
            .range([innerHeight+margin.bottom, margin.top]);
    
    render()
}
// Highlight the class that is hovered
const highlight = function(event, d){
    const selected_class = d.class
    highlighted = true;
    // first every group turns grey
    d3.selectAll(".line")
    .transition().duration(200)
    .style("stroke", "lightgrey")
    .style("opacity", "0.2")
    // Second the hovered specie takes its color
    d3.selectAll("." + selected_class)
    .transition().duration(200)
    .style("stroke", colorScale(selected_class))
    .style("opacity", "1")
}

const debouncedUnhighlight = debounce((event, d) => {
    if (highlighted) return;
    d3.selectAll(".line")
        .transition().duration(200)
        .style("stroke", function(d){ return( colorScale(d.class))} )
        .style("opacity", "0.8");
}, 1000);
// Unhighlight
const unhighlight = function(event, d){
    highlighted = false;
    debouncedUnhighlight(event, d);
}

const rescaleBtn = d3.select("#rescale-btn")
    .on("click", rescaleAxis);

const filterData = function(event, className) {
    console.log('called', classData[className].filtered)
    if (classData[className].filtered) {
        data = data.concat(classData[className].content);
        svgLegend.select(`.text-${className}`)
            .style('text-decoration', 'none');
    }
    else {
        data = data.filter((d) => d.class !== className);
        svgLegend.select(`.text-${className}`)
            .style('text-decoration', 'line-through');
    }
    classData[className].filtered = !classData[className].filtered;
    render();
}

const render = () => {
    const svgElement = document.getElementById("plot");
    const viewPortWidth = document.documentElement.clientWidth;
    // For each dimension, I build a linear scale. I store all in a y object
    if (viewPortWidth > 1280) {
        svgElement.setAttribute("width", 1024);
    }
    else {
        svgElement.setAttribute("width", "80%");
    }
    
    let bb = svgElement.getBoundingClientRect();
    width = +bb.width;
    height = width*3/5;
    innerWidth = width - margin.left - margin.right;
    innerHeight = height - margin.top - margin.bottom;
    svgElement.setAttribute("height", `${height}`);
    if (colorScale === undefined)
        colorScale = scaleOrdinal(schemeAccent);

    for (let i in dimensions) { 
        const dimName = dimensions[i];
        y[dimName] = d3.scaleLinear()
            .domain( dynamicRange ? d3.extent(data, d => d[dimName]) : [0,8])
            .range([innerHeight, margin.top]);
    }

    // Build the X scale -> it find the best position for each Y axis
    const x = d3.scalePoint()
        .range([margin.left, innerWidth+margin.left])
        // .padding(1)
        .domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    const path = (d) =>
        d3.line()(dimensions.map((p) => { return [x(p), y[p](d[p])]; }));

    function position(d) {
        const v = dragging[d];
        return v === undefined ? x(d) : v;
    }

    // Draw the lines
    svg
        .selectAll(".myPath")
        .data(data)
        .join("path")
            .attr("class", function (d) { return "myPath line " + d.class } ) // 2 class for each line: 'line' and the group name
            .attr("d",  path)
            .style("fill", "none")
            .style("stroke", d => colorScale(d.class))
            .style("opacity", 0.8)
            .on("mouseover", highlight)
            .on("mouseleave", unhighlight);

    // Draw the axis:

    const g = svg.selectAll(".myAxis").data(dimensions);
    const gEnter =  g
        .enter()
        .append("g")
        .attr("class", "myAxis");

    const axesG = gEnter.merge(g)
        // translate this element to its right position on the x axis
        .attr("transform", (d) => `translate(${x(d)})`);
    
    axesG
        .call(d3.drag()
        .on("start", function(d) {
            dragging[d.subject] = this.__origin__ = x(d.subject);
            this.__dragged__ = false;
        })
        .on("drag", function(d) {
            dragging[d.subject] = Math.min(width, Math.max(0, this.__origin__ += d.dx));
            dimensions.sort((a, b) => position(a) - position(b));
            x.domain(dimensions);
            axesG.attr("transform", (d) => `translate(${position(d)})`);
            this.__dragged__ = true;
        })
        .on("end", function(d) {
            // reorder axes
            d3.select(this).attr("transform", `translate(${x(d.subject)})`);
            render();
            delete this.__dragged__;
            delete this.__origin__;
            delete dragging[d.subject];
        }))

    const eachAxes = axesG
        .each(function(d) { 
            d3.select(this)
                 // build the axis with the call function
                .transition().duration(300)
                .call(
                    d3
                    .axisLeft()
                    .scale(y[d])
                )
                .attr("class", (d) => { return `myAxis ${d.split(' ').join('_')}` });       
        }); 

    const axesLabelText = gEnter
        // Add axis title
        .append("text")
            .attr('class', 'axis-label')
            .style("text-anchor", "middle")
            .attr("y", +20)
            .style("fill", "black")
        .merge(g.select('.axis-label'))
            .text(function(d) { return d; });

    const legendG = svgLegend.selectAll('.legend').data([null]);
    const legendGEnter = legendG
        .enter()
        .append('g')
            .attr('class', 'legend');

    const translatedLegend = legendGEnter.merge(legendG)
        .attr('transform', 
            `translate(${40},${30})`
        );
    translatedLegend
        .call(colorLegend, {
            colorScale,
            circleRadius: 10,
            spacing: 40,
            textOffset: 20,
            highlight,
            unhighlight,
            filterData,
            classData
            });
        ;
};

function debounce(func, timeout = 30) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const debouncedResize = debounce(() => render());

const resize = addEventListener('resize', debouncedResize);

csv('http://vis.lab.djosix.com:2020/data/iris.csv')
    .then(loadedData => {
        loadedData.forEach(d => {
        d['sepal length'] = +d['sepal length'];
        d['sepal width'] = +d['sepal width'];
        d['petal length'] = +d['petal length'];
        d['petal width'] = +d['petal width']; 
        });
        loadedData.pop();
        data = loadedData;
        dimensions = data.columns.filter((d) => d !== 'class');
        loadedData.forEach(d => {
            if (classData[d.class] === undefined) {
                classData[d.class] = {}
                classData[d.class].content = [];
                classData[d.class].filtered = false;
            }
            classData[d.class].content.push(d);
        })
        render();
    });