const {
    select,
    csv
} = d3;

let data = {};
let chosenAttribute = 'acousticness';
let radarData = {};

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

const svgRadar = select(".radar-container #radar-chart")
    .attr("width", 600)
    .attr("height", 600);

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
    u
        .join("rect") // Add a new rect for each new elements
        .transition() // and apply changes to all of them
        .duration(1000)
          .attr("x", 1)
          .attr("transform", function(d) { return `translate(${x(d.x0)}, ${y(d.length)})`})
          .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
          .attr("height", function(d) { return height - y(d.length); })
          .style("fill", "#69b3a2");
    
    // radial chart
    const ticks = [0.2, 0.4, 0.6, 0.8];
    const radarMaxTick = ticks[ticks.length - 1];
    const svgRadarDim = 600;
    const radarDim = svgRadarDim / 2;
    const circleSize = radarDim * 0.6;
    const radarLabels = [
        'acousticness',
        'danceability',
        'energy',
        'instrumentalness',
        'liveness',
        'speechiness',
        'valence'
    ];

    let radialScale = d3.scaleLinear()
        .domain([0,0.8])
        .range([0, 200]);

    function angleToCoordinate(angle, value){
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return {"x": radarDim + x, "y": radarDim - y};
    }
    function angleToCoordinateLabel(angle, value) {
        let shift = false;
        let shiftValue = 50;
        console.log("angle:", angle);
        if (angle <= Math.PI + Math.PI/2) {
            shift = true;
        }
        console.log("is true:", shift);
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        if(shift) x -= shiftValue;
        return {"x": radarDim + x, "y": radarDim - y};
    }

    const circles = svgRadar.selectAll("circle")
        .data(ticks);
    
    circles.join("circle")
        .attr("cx", radarDim)
        .attr("cy", radarDim)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("r", (d) => radialScale(d));
    
    const circleLabel = svgRadar.selectAll("text.circle-label")
        .data(ticks);
    
    circleLabel.join("text")
        .attr("class", "circle-label")
        .attr("x", radarDim + 5)
        .attr("y", (d) => radarDim - radialScale(d))
        .text((d) => d.toString());
    
    function getRadarAxis(i) {
        let angle = (Math.PI / 2) + (2 * Math.PI * i / radarLabels.length);
        let line_coordinate = angleToCoordinate(angle, radarMaxTick);
        return line_coordinate;
    }

    function getRadarAxisLabel(i) {
        let angle = (Math.PI / 2) + (2 * Math.PI * i / radarLabels.length);
        let label_offset = 0.1;
        let label_coordinate = angleToCoordinateLabel(angle, radarMaxTick + label_offset);
        console.log(radarLabels[i], label_coordinate);
        return label_coordinate;
    } 

    const radarAxis = svgRadar.selectAll("line.axis")
        .data(radarLabels);
    
    radarAxis.join("line")
        .attr("class", "axis")
        .attr("x1", radarDim)
        .attr("y1", radarDim)
        .attr("x2", (d, i) => getRadarAxis(i).x)
        .attr("y2", (d, i) => getRadarAxis(i).y)
        .attr("stroke","black");

    const radarAxisLabel = svgRadar.selectAll("text.axis-label")
    .data(radarLabels);
    
    radarAxisLabel.join("text")
        .attr("class", "axis-label")
        .attr("x", (d, i) => getRadarAxisLabel(i).x)
        .attr("y", (d, i) => getRadarAxisLabel(i).y)
        .text((d) => (d));

    // helper functions
    let line = d3.line()
    .x(d => d.x)
    .y(d => d.y);

    function getPathCoordinates(data_point){
        let coordinates = [];
        for (var i = 0; i < radarLabels.length; i++){
            let ft_name = radarLabels[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / radarLabels.length);
            coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
        }
        return coordinates;
    }

    const radarPaths = svgRadar.selectAll("path.plots")
        .data(radarData);

    let colors = ["darkorange", "gray", "navy"];
    
    radarPaths.join("path")
        .datum((d) => getPathCoordinates(d))
        .attr("class", "plots")
        .attr("d", d => line(d))
        .attr("stroke", (d,i) => colors[i])
        .attr("fill", (d, i) => colors[i])
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5);
    
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
        });

        data = loadedData;

        radarData = [{
            acousticness: d3.mean(data, d => d['acousticness']),
            danceability: d3.mean(data, d => d['danceability']),
            energy: d3.mean(data, d => d['energy']),
            instrumentalness: d3.mean(data, d => d['instrumentalness']),
            liveness: d3.mean(data, d => d['liveness']),
            speechiness: d3.mean(data, d => d['speechiness']),
            valence: d3.mean(data, d => d['valence'])
        }];

        render();
    });