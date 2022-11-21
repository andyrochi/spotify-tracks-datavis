export const histogram = (selection, props) => {
    const {
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
        data
    } = props;

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

    // dynamic rendering
    // set the parameters for the histogram
    const histogram = d3.histogram()
        .value(function(d) { return d[chosenAttribute]; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(thresholds); // then the numbers of bins -> remove last threshold


    // And apply this function to data to get the bins
    let bins = selectedGenre.map(selected_genre => histogram(data.filter((d) => selected_genre === 'all-genres' ? true : d['track_genre'] === selected_genre)));

    const binMax = bins.map((bin) => (d3.max(bin, (d) => d.length)));

    // Y axis: update now that we know the domain, remember to desconstruct
    y.domain([0, Math.max(...binMax)]);   // d3.hist has to be called before the Y axis obviously
    yAxis
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y));

    function addRectangles(bin, i, node) {
        const cssSelector = 'rect';
        const svg2 = d3.select(this);
        const u = svg2.selectAll(cssSelector)
            .data(bin);

        // Manage the existing bars and eventually the new ones:
        const uJoin = u
            .join("rect");

        uJoin // Add a new rect for each new elements
            // .attr("class", `rect-${i}`)
            .transition() // and apply changes to all of them
            .duration(1000)
                .attr("x", 1)
                .attr("class", function(d, j) { return `rect-bin-${j}`} )
                .attr("transform", function(d) { return `translate(${x(d.x0)}, ${y(d.length)})`})
                .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
                .attr("height", function(d) { return height - y(d.length); })
                .attr("opacity", defaultOpacity)
                .style("fill", () => {return accent(i)});
        uJoin
            .on("mouseover", mouseoverHistogram)
            .on("mousemove", mousemoveHistogram)
            .on("mouseleave", mouseleaveHistogram);

    };

    // use groups to manage enter and exit
    const rectGs = selection.selectAll("g.rect-g")
        .data(bins);

    const rectGsEnter = rectGs
        .enter()
            .append("g")
            .attr("class", "rect-g")
        .merge(rectGs)
        .each(addRectangles);
    rectGs.exit().remove();
}