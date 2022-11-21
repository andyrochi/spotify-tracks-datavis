export const violinPlot = (selection, props) => {
    const {
        margin,
        width,
        height,
        yMax, //map
        yAxis,
        selectedGenre,
        xAxis,
        chosenAttribute,
        data
    } = props;

    selection
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    const svg = selection.select("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
    
    // Build and Show the Y scale
    const y = d3.scaleLinear()
        .domain([0, yMax[chosenAttribute]])
        .range([height, 0]);
    
    yAxis
        .call( d3.axisLeft(y) );
    
    // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
    const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(selectedGenre)
    .padding(0.1);

    xAxis
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Features of the histogram
    const histogram = d3.histogram()
        .domain(y.domain())
        .thresholds(y.ticks(20))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
        .value(d => d[chosenAttribute]);

    // And apply this function to data to get the bins
    let bins = selectedGenre.map(selected_genre => histogram(data.filter((d) => selected_genre === 'all-genres' ? true : d['track_genre'] === selected_genre)));
    const binMax = bins.map((bin) => (d3.max(bin, (d) => d.length)));
    const maxNum = Math.max(...binMax);
    
    const xNum = 
        d3.scaleLinear()
        .range([0, x.bandwidth()])
        .domain([-maxNum,maxNum]);

    const vioPlotsG = svg
        .selectAll("g.myViolin")
        .data(bins);
    const vioPlotsGEnter = vioPlotsG
        .enter()        // So now we are working group per group
            .append("g")
            .attr("class", "myViolin")
        .merge(vioPlotsG)
        .attr("transform", (d, i) => { return `translate(${x(selectedGenre[i])}, 0)`})
        .each(function(d, i) {
            const cur = d3.select(this);
            const path = cur.selectAll("path")
                .data([d]);
            path
                .join("path")
            
                .style("stroke", "#69b3a2")
                .style("fill","#69b3a2")
                .style("fill-opacity", 0.3)
                .attr("d", d3.area()
                    .x0(function(d){ return(xNum(-d.length)) } )
                    .x1(function(d){ return(xNum(d.length)) } )
                    .y(function(d){ return(y(d.x0)) } )
                .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            );
        });
    
    vioPlotsG.exit().remove();
}