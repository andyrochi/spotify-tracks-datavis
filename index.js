const {
    select,
    csv
} = d3;
import { radarPlot } from './radarPlot.js';

let data = {};
let chosenAttribute = 'acousticness';
let radarData = {};
let allData = {};

const attributes = [
    'acousticness'
    , 'danceability'
    , 'energy'
    , 'instrumentalness'
    , 'liveness'
    , 'speechiness'
    , 'valence'
    , 'loudness'
    , 'duration_ms'
    , 'popularity'
    , 'tempo'];

const xMax = {
    'acousticness': 1,
    'danceability': 1,
    'energy': 1,
    'instrumentalness': 1,
    'liveness': 1,
    'speechiness': 1, 
    'valence': 1,
    'loudness': 5.0,
    'duration_ms': 5000000,
    'popularity': 100,
    'tempo': 260
};

const key_signature_map = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"];
const mode_map = ["minor", "major"];

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 50},
width = 460 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;
let nBin = 10;

const svg = select('svg#plot')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      `translate(${margin.left},${margin.top})`);

const xAxis = svg.append("g");
const yAxis = svg.append("g");

const selectAttribute = document.getElementById("selectAttribute");

// construct select menu
for(let i = 0; i < attributes.length; i++) {
    const opt = attributes[i];
    const el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    selectAttribute.appendChild(el);
}

// create a tooltip
const TooltipHistogram = d3.select(".svg-container")
.append("div")
.append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("color", "white")
    .style("border-radius", "5px")
    .style("padding", "10px")
.style("position", "absolute");

const mouseoverHistogram = function(d) {
    TooltipHistogram
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
const mousemoveHistogram = function(event, d) {
    TooltipHistogram
        .html("Count of songs<br>within this range: " + d.length)
        .style("left", (event.clientX+50) + "px")
        .style("top", (event.clientY) + "px");
}
const mouseleaveHistogram = function(d) {
TooltipHistogram
    .style("opacity", 0)
d3.select(this)
    .style("stroke", "none")
    .style("opacity", 0.8)
}

// set the dimensions and margins of the graph
const marginBar = {top: 20, right: 30, bottom: 40, left: 90},
    widthBar = 460 - marginBar.left - marginBar.right,
    heightBar = 400 - marginBar.top - marginBar.bottom;

const svgBar = d3
                .select("#bar-chart");
svgBar.append("g");

const render = () => {
    // X axis: scale and draw:
    console.log('render');
    const x = d3.scaleLinear()
        .domain([0, xMax[chosenAttribute]])
        .range([0, width]);
    
    xAxis
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Y axis: initialization
    const y = d3.scaleLinear()
        .range([height, 0]);
    
    const thresholds = x.ticks(nBin);
    thresholds.pop();

    // console.log('hack:', thresholds);
    // dynamic rendering
    // set the parameters for the histogram
    const histogram = d3.histogram()
        .value(function(d) { return d[chosenAttribute]; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(thresholds); // then the numbers of bins -> remove last threshold
    
    
    // And apply this function to data to get the bins
    const bins = histogram(data);

    // console.log('bins:', bins);

    // Y axis: update now that we know the domain
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    yAxis
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y));
    
    // Join the rect with the bins data
    const u = svg.selectAll("rect")
        .data(bins);

    // Manage the existing bars and eventually the new ones:
    const uJoin = u
        .join("rect");
    uJoin // Add a new rect for each new elements
        .transition() // and apply changes to all of them
        .duration(1000)
            .attr("x", 1)
            .attr("transform", function(d) { return `translate(${x(d.x0)}, ${y(d.length)})`})
            .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#69b3a2");
    uJoin
        .on("mouseover", mouseoverHistogram)
        .on("mousemove", mousemoveHistogram)
        .on("mouseleave", mouseleaveHistogram);
    
    // radial chart
    const ticks = [0.2, 0.4, 0.6, 0.8];
    const radarMaxTick = ticks[ticks.length - 1];
    const svgRadarDim = 600;
    const svgRadar = select(".radar-container #radar-chart")
    .attr("width", svgRadarDim)
    .attr("height", svgRadarDim);
    const radarDim = svgRadarDim / 2;
    const radarLabels = [
        'acousticness',
        'danceability',
        'energy',
        'instrumentalness',
        'liveness',
        'speechiness',
        'valence'
    ];

    radarPlot(svgRadar, ticks, svgRadarDim, radarLabels, radarData);
    
    const computePitchCount = (data) => {
        // bar chart data
        const dataBar = new Array(key_signature_map.length * mode_map.length).fill().map(() => ({value: 0, pitch: ""}));;
        for (let i = 0; i < key_signature_map.length; i++) {
            for (let j = 0; j < mode_map.length; j++) {
                dataBar[i * mode_map.length + j]['pitch'] = `${key_signature_map[i]} ${mode_map[j]}`;
            }
        }
        data.forEach((d,i) => {
            const mode = d['mode'];
            const key = d['key'];
            dataBar[key * mode_map.length + mode]['value'] += 1;
        })
        return dataBar;
    }
    
    const dataBar = computePitchCount(data);

    // sort ascend
    dataBar.sort((a, b) => {
        return b['value'] - a['value'];
    })
    // // bar chart
    svgBar
        .attr("width", widthBar + marginBar.left + marginBar.right)
        .attr("height", heightBar + marginBar.top + marginBar.bottom);
    const svgBarG = svgBar.select("g")
        .attr("transform", `translate(${marginBar.left}, ${marginBar.top})`);
    
        // Add X axis
    const xBar = d3.scaleLinear()
        .domain([0, d3.max(dataBar, (d) => d.value)])
        .range([ 0, widthBar]);
    const xBarAxis = svgBarG.selectAll("g.x-bar-axis").data([null]);
    const xBarEnter = xBarAxis
        .enter()
        .append("g")
            .attr("class", "x-bar-axis");
        
        xBarEnter.merge(xBarAxis)
            .attr("transform", `translate(0, ${heightBar})`)
            .call(d3.axisBottom(xBar))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
    
    // Y axis
    const yBar = d3.scaleBand()
    .range([ 0, heightBar ])
    .domain(dataBar.map(d => d.pitch))
    .padding(.1);

    const yBarAxis = svgBarG
        .selectAll("g.y-bar-axis").data([null]);
    
    const yBarAxisEnter = yBarAxis
        .enter()
            .append("g")
            .attr("class", "y-bar-axis");
    
    yBarAxisEnter.merge(yBarAxis)
        .call(d3.axisLeft(yBar));

    //Bars
    svgBarG.selectAll("myRect")
    .data(dataBar)
    .join("rect")
        .attr("class", "myRect")
        .attr("x", xBar(0) )
        .attr("y", d => yBar(d.pitch))
        .attr("width", d => xBar(d.value))
        .attr("height", yBar.bandwidth())
        .attr("fill", "#69b3a2");
    
};

function debounce(func, timeout = 30) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

d3.select("#selectAttribute").on("input", function() {
    chosenAttribute = this.value;
    render();
})

const debouncedResize = debounce(() => render());

const resize = addEventListener('resize', debouncedResize);

const getRadarObject = (dataList) => {
    return {
        acousticness: d3.mean(dataList, d => d['acousticness']),
        danceability: d3.mean(dataList, d => d['danceability']),
        energy: d3.mean(dataList, d => d['energy']),
        instrumentalness: d3.mean(dataList, d => d['instrumentalness']),
        liveness: d3.mean(dataList, d => d['liveness']),
        speechiness: d3.mean(dataList, d => d['speechiness']),
        valence: d3.mean(dataList, d => d['valence'])
    }
}

csv('http://vis.lab.djosix.com:2020/data/spotify_tracks.csv')
    .then(loadedData => {
        loadedData.forEach(d => {
        // fields
        d['acousticness'] = +d['acousticness'];
        d['danceability'] = +d['danceability'];
        d['duration_ms'] = +d['duration_ms'];
        d['energy'] = +d['energy'];
        d['instrumentalness'] = +d['instrumentalness'];
        d['liveness'] = +d['liveness'];
        d['loudness'] = +d['loudness'];
        d['mode'] = +d['mode'];
        d['popularity'] = +d['popularity'];
        d['speechiness'] = +d['speechiness'];
        d['tempo'] = +d['tempo'];
        d['time_signature'] = +d['time_signature'];
        d['valence'] = +d['valence'];
        d['key'] = +d['key'];
        });

        data = loadedData;
        allData = data;

        radarData = [];
        radarData.push(getRadarObject(data));

        render();
    });