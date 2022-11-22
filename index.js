const {
    select,
    csv
} = d3;
import { radarPlot } from './radarPlot.js';
import { barChart } from './barChart.js';
import { colorLegend } from './colorLegend.js';
import { MultiSelectDropdown } from './multiselect.js';
import { dropdownMenu } from './dropdownMenu.js';
import { violinPlot } from './violinPlot.js';
import { histogram } from './histogram.js';

let data = {};
let chosenAttribute = 'acousticness';
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
let selectedGenre = ['j-pop', 'mandopop', 'j-idol'];
const queryDomSelectedGenres = () => {
    const genreSearch = document.querySelector('select[multiple]#genre-search');
    const selectedOptions = Array.from(genreSearch.selectedOptions);
    const selected = selectedOptions.map((option) => option.value);
    selectedGenre = selected;
    if (!selectedGenre.find(element => element === barChartGenreSelected))
        barChartGenreSelected = selectedGenre[0];
}

let barChartGenreSelected = "all-genres";

const onBarChartGenreClicked = (genre) => {
    barChartGenreSelected = genre;
    render();
}

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 50},
width = 360 - margin.left - margin.right,
height = 300 - margin.top - margin.bottom;
let nBin = 10;

const defaultOpacity = 0.5;

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
    .style("opacity", defaultOpacity)
}

const svgBar = d3
                .select("#bar-chart");
svgBar.append("g");

const accent = d3.scaleOrdinal(d3.schemeAccent);

// Violin Plot Stuff

const marginViolin = {top: 10, right: 30, bottom: 30, left: 55},
    widthViolin = 600 - marginViolin.left - marginViolin.right,
    heightViolin = 400 - marginViolin.top - marginViolin.bottom;

let chosenViolinAttribute = 'acousticness';

d3.select("#selectViolinAttribute").on("input", function() {
    chosenViolinAttribute = this.value;
    render();
})

const selectViolinAttribute = document.getElementById("selectViolinAttribute");

// construct select menu
for(let i = 0; i < attributes.length; i++) {
    const opt = attributes[i];
    const el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    selectViolinAttribute.appendChild(el);
}

const svgViolin = d3
                .select("#violin-plot");
svgViolin.append("g");
const yAxisViolin = svgViolin
    .select("g")
    .append("g");

const xAxisViolin = svgViolin
    .select("g")
    .append("g");

// Violin Plot stuff done.

// Pie chart
// set the dimensions and margins of the graph
const widthPie = 450,
    heightPie = 450,
    marginPie = 100;

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(widthPie, heightPie) / 2 - marginPie;

// append the svg object to the div called 'my_dataviz'
const svgPie = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", widthPie)
    .attr("height", heightPie)
  .append("g")
    .attr("transform", `translate(${widthPie/2}, ${heightPie/2})`);

const render = () => {
    // X axis: scale and draw:
    console.log('render');

    queryDomSelectedGenres();

    
    histogram(svg, {
        width,
        height,
        xAxis,
        xMax,
        yAxis,
        nBin,
        selectedGenre,
        chosenAttribute,
        defaultOpacity,
        mouseoverHistogram,
        mousemoveHistogram,
        mouseleaveHistogram,
        accent,
        data,
        showGenre: barChartGenreSelected,
    });
    // const allRects = svg.selectAll("rect");
    // TODO: find a way to deal with this
    // allRects.sort((a, b) =>  b.length - a.length );
    
    // radial chart
    const ticks = [0.2, 0.4, 0.6, 0.8];
    const radarMaxTick = ticks[ticks.length - 1];
    const svgRadarDim = 400;
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

    radarPlot(svgRadar, ticks, svgRadarDim, radarLabels, data, selectedGenre, accent);
    
    // construct barChart select
    select('#single-genre-analysis-select')
        .call(dropdownMenu, {
            options: selectedGenre,
            onOptionClicked: onBarChartGenreClicked,
            selectedOption: barChartGenreSelected
        });

    // set the dimensions and margins of the graph
    const marginBar = {top: 20, right: 30, bottom: 40, left: 90},
        widthBarSvg = 360,
        heightBarSvg = 300;
    const filteredBarData = data.filter((d) => {
        return barChartGenreSelected === 'all-genres'
            ? true
            : d['track_genre'] === barChartGenreSelected
    });
    
    // render barchart
    barChart(svgBar, {
        margin: marginBar, // marginBar,
        height: heightBarSvg, 
        width: widthBarSvg,
        key_signature_map,
        mode_map,
        data: filteredBarData,
        color: accent(selectedGenre.indexOf(barChartGenreSelected))
    });
    
    violinPlot(svgViolin, {
        margin: marginViolin,
        width: widthViolin,
        height: heightViolin,
        yMax: xMax,
        yAxis: yAxisViolin,
        selectedGenre,
        xAxis: xAxisViolin,
        chosenAttribute: chosenViolinAttribute,
        data,
        colorScheme: accent
    });

    const legendSvg = d3
        .select('svg#legend')
            .attr("height", Math.max(150, 50 * selectedGenre.length))
            .attr("width", 200);
    
        console.log(50 * selectedGenre.length);

    colorLegend(legendSvg, {
        colorScale: accent,
        circleRadius: 1.0,
        circleRadius: 10,
        spacing: 40,
        textOffset: 20,
        selectedGenreList: selectedGenre
    });

    // set the color scale
    const color = d3.scaleOrdinal()
        .domain(["explicit", "normal"])
        .range(["#e15759", "#59a14f"]);

    const count_explicit = (dList, genre) => {
        const filtered = dList.filter((d) => genre === 'all-genres'
            ? true
            : d['track_genre'] === genre);
        const exCount = filtered.filter( d => d['explicit'] === true).length;
        const nonExCount = filtered.filter( d => d['explicit'] === false).length;
        console.log(exCount, nonExCount);
        return {
            explicit: exCount,
            'normal': nonExCount
        };
    }

    const pieData = count_explicit(data, barChartGenreSelected);
    // const fil
    // pie
    console.log(pieData);
     // Compute the position of each group on the pie:
    const pie = d3.pie()
        .value(function(d) {return d[1]; })
        .sort(function(a, b) { return d3.ascending(a.key, b.key);} ); // This make sure that group order remains the same in the pie chart
    const data_ready = pie(Object.entries(pieData));

    // The arc generator
    const arc = d3.arc()
    .innerRadius(radius * 0.5)         // This is the size of the donut hole
    .outerRadius(radius * 0.8);

    // Another arc that won't be drawn. Just for labels positioning
    const outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

    // map to data
    const u = svgPie.selectAll("path")
        .data(data_ready);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    u
        .join('path')
        .transition()
        .duration(1000)
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        )
        .attr('fill', function(d){ return(color(d.data[0])) })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.5);
    
        // Add the polylines between chart and labels:
    const polyLine =
            svgPie
            .selectAll('.polylines')
            .data(data_ready);
    
    // draw polyline
    polyLine
        .join('polyline')
            .transition()
            .duration(1000)
            .attr("class", "polylines")
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', function(d) {
            const posA = arc.centroid(d) // line insertion in the slice
            const posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
            const posC = outerArc.centroid(d); // Label position = almost the same as posB
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            return [posA, posB, posC]
            });
    
    const pieLabel = 
        // Add the polylines between chart and labels:
            svgPie
            .selectAll('.labels')
            .data(data_ready);
    
    pieLabel
        .join('text')
            .text(d => { console.log(d.data); return `${d.data[0]}:${d.data[1]}`})
            .attr("class", "labels")
            .attr('transform', function(d) {
                const pos = outerArc.centroid(d);
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                return `translate(${pos})`;
            })
            .style('text-anchor', function(d) {
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            });


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

const genreSet = new Set();

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
            d['explicit'] = d['explicit'] === 'True' ? true : false;

            genreSet.add(d['track_genre']);
        });

        data = loadedData;
        allData = data;

        const genreList = Array.from(genreSet);
        genreList.unshift("all-genres");
        const genreSearch = d3.select("#genre-search");

        genreList.forEach((genre) => {
        genreSearch
            .selectAll("option")
            .data(genreList)
            .enter()
            .append("option")
            .text((d) => d)
            .attr("value", (d) => d);
        })

        MultiSelectDropdown({
            render
        });

        // TODO: fix double render bug
        // render();
    });