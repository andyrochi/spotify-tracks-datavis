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
import { pieChart } from './pieChart.js';
import { barChartTop20 } from './barChartTop20.js';

let data = {};
let chosenAttribute = 'acousticness';
let allData = {};

let sliceThreshold = 50;
let sortAscend = false;
let sortAttribute = 'popularity';

let showHiddenBarChartOption = true;
let genreListNoAll = [];

const dataIsGenre = (d) => {
    return barChartGenreSelected === 'all-genres'
        ? true
        : d['track_genre'] === barChartGenreSelected
}

const sortData = (data, field, ascend) => {
    const factor = ascend ? 1 : -1;
    data.sort((a, b) => factor * (a[field] - b[field]));
};

const legendAttributeSpan = document.querySelector("#legend-attribute");
const legendOrderSpan = document.querySelector("#legend-order");
const legendSliceSpan = document.querySelector("#legend-slice");

const pieChartDiv = document.querySelector(".pie-chart-container");
const barChartTop20Div = document.querySelector(".bar-chart-top-20-container");

const refreshDataAndRerender = () => {
    sortData(data, sortAttribute, sortAscend);
    render();
};

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

const someOtherColor = d3.scaleOrdinal(d3.schemeSet3);

const sortAttributeSelectElement = document.querySelector("#sort-attribute-select");

// construct select menu
for(let i = 0; i < attributes.length; i++) {
    const opt = attributes[i];
    const el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    if (opt === sortAttribute) el.selected = true;
    sortAttributeSelectElement.appendChild(el);
}

sortAttributeSelectElement.addEventListener('change', (event) => {
    const selectedValue = event.target.selectedOptions[0].value;
    sortAttribute = selectedValue;
    refreshDataAndRerender();
})

// ascend descend
const sortAscendRadioElements = document.querySelectorAll('input[name="ascradio"]');
for(const radioBtn of sortAscendRadioElements) {
    radioBtn.addEventListener('change', function(event) {
        if (this.checked) {
            const curValue = this.value;
            sortAscend = curValue === 'ascending' ? true : false;
        }
        refreshDataAndRerender();
    })
}

// construct input
const slicerElement = document.querySelector('input[type="range"]#slice-threshold-input');
// Initalize
slicerElement.value = sliceThreshold;
const showNumber = document.querySelector('#slice-threshold');
showNumber.innerText = sliceThreshold;

slicerElement.addEventListener('input', function(event) {
    showNumber.innerText = this.value;
})

slicerElement.addEventListener('change', function(event) {
    sliceThreshold = this.value;
    refreshDataAndRerender();
})

const key_signature_map = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"];
const mode_map = ["minor", "major"];
let selectedGenre = ['j-pop', 'mandopop', 'j-idol'];

const queryDomSelectedGenres = () => {
    const genreSearch = document.querySelector('select[multiple]#genre-search');
    const selectedOptions = Array.from(genreSearch.selectedOptions);
    const selected = selectedOptions.map((option) => option.value);
    selectedGenre = selected;
    if (!selectedGenre.find(element => element === barChartGenreSelected)) {
        barChartGenreSelected = selectedGenre[0];
    }
        
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

const svgBarTop20 = d3
                .select("#bar-chart-top-20");
                svgBarTop20.append("g");

const accent = d3.scaleOrdinal(d3.schemeAccent);

// Violin Plot Stuff

const marginViolin = {top: 10, right: 30, bottom: 30, left: 55},
    widthViolin = 500 - marginViolin.left - marginViolin.right,
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
const widthPie = 400,
    heightPie = 300,
    marginPie = 50;

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(widthPie, heightPie) / 2 - marginPie;

// append the svg object to the div called 'my_dataviz'
const svgPie = d3.select("svg#pie-chart")
    .attr("width", widthPie)
    .attr("height", heightPie)
  .append("g")
    .attr("transform", `translate(${widthPie/2}, ${heightPie/2})`);

const render = () => {
    // X axis: scale and draw:
    console.log('render');

    // check chosen option
    queryDomSelectedGenres();

    // decide hide or show genre count option
    showHiddenBarChartOption = (barChartGenreSelected === 'all-genres') ? true : false;
    if (showHiddenBarChartOption) {
        pieChartDiv.style.display = 'none';
        barChartTop20Div.style.display = 'flex';
    }
    else {
        pieChartDiv.style.display = 'flex';
        barChartTop20Div.style.display = 'none';
    }
    // console.log('showHiddenOption:', showHiddenBarChartOption);
    
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
        sliceThreshold
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

    radarPlot(svgRadar, ticks, svgRadarDim, radarLabels, data, selectedGenre, accent, sliceThreshold);
    
    // construct barChart select
    select('#single-genre-analysis-select')
        .call(dropdownMenu, {
            options: selectedGenre,
            onOptionClicked: onBarChartGenreClicked,
            selectedOption: barChartGenreSelected,
            dropdownClass: "form-select-lg"
        });

    // set the dimensions and margins of the graph
    const marginBar = {top: 20, right: 30, bottom: 40, left: 90},
        widthBarSvg = 360,
        heightBarSvg = 300;
    
    let filteredBarData = data.filter(dataIsGenre);
    
    const slicePoint = Math.round(filteredBarData.length * sliceThreshold / 100);
    filteredBarData = filteredBarData.slice(0, slicePoint);
    
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
        colorScheme: accent,
        sliceThreshold
    });

    const legendSvg = d3
        .select('svg#legend')
            .attr("height", Math.max(150, 50 * selectedGenre.length))
            .attr("width", 200);
    
        // console.log(50 * selectedGenre.length);

    colorLegend(legendSvg, {
        colorScale: accent,
        circleRadius: 1.0,
        circleRadius: 10,
        spacing: 40,
        textOffset: 20,
        selectedGenreList: selectedGenre
    });
    
    pieChart(svgPie, {
        data,
        selectedGenre: barChartGenreSelected,
        radius,
        sliceThreshold
    });

    legendAttributeSpan.innerText = sortAttribute;
    legendOrderSpan.innerText = sortAscend ? "ascending" : "descending";
    legendSliceSpan.innerText = sliceThreshold;

    const cntList = genreListNoAll.map((genre) => filteredBarData.filter((d) => {
        return genre === 'all-genres'
            ? true
            : d['track_genre'] === genre
    }).length);

    const genreCnt = [];
    for (let i = 0 ; i < genreListNoAll.length ; i++ ){
        const str = genreListNoAll[i];
        genreCnt.push({ genre: str, value:cntList[i]});
    }
    
    // render barchart
    barChartTop20(svgBarTop20, {
        margin: marginBar, // marginBar,
        height: heightBarSvg, 
        width: widthBarSvg,
        dataCnt: genreCnt,
        color: someOtherColor
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

csv('https://gist.githubusercontent.com/andyrochi/ade546bbf55b5ca24771a1e5e94609f3/raw/6d17bcd61513e94971f57db6e2bca7ea4b99b2ed/spotify_tracks_dataset.csv')
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
        
        sortData(data, sortAttribute, false);

        allData = data;

        const genreList = Array.from(genreSet);
        genreListNoAll = Array.from(genreSet);
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