export const barChartTop20 = (selection, props) => {
    const {
        margin, // marginBar,
        height, 
        width,
        dataCnt,
        color
    } = props;


    const widthBar = width - margin.left - margin.right;
    const heightBar = height - margin.top - margin.bottom;
    
    // sort ascend
    let dataBar = dataCnt;
    
    // console.log(dataBar);
    dataBar.sort((a, b) => {
        return b['value'] - a['value'];
    });
    dataBar = dataBar.slice(0, 20);
    // console.log(dataBar);
    // // bar chart
    selection
        .attr("width", widthBar + margin.left + margin.right)
        .attr("height", heightBar + margin.top + margin.bottom);
    const svgBarG = selection.select("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
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
            .transition()
            .duration(1000)
            .attr("transform", `translate(0, ${heightBar})`)
            .call(d3.axisBottom(xBar))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
    
    // Y axis
    const yBar = d3.scaleBand()
    .range([ 0, heightBar ])
    .domain(dataBar.map(d => d.genre))
    .padding(.1);

    // console.log('domain', yBar.domain());
    // console.log(yBar.range());

    const yBarAxis = svgBarG
        .selectAll("g.y-bar-axis").data([null]);
    
    const yBarAxisEnter = yBarAxis
        .enter()
            .append("g")
            .attr("class", "y-bar-axis");
    
    yBarAxisEnter.merge(yBarAxis)
        .transition().duration(1000)
        .call(d3.axisLeft(yBar));

    //Bars
    const u = svgBarG.selectAll(".myRect")
        .data(dataBar);

    u
        .enter()
            .append("rect")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("class", "myRect")
        .attr("x", xBar(0) )
        .attr("y", d => yBar(d.genre))
        .attr("width", d => xBar(d.value))
        .attr("height", yBar.bandwidth())
        .attr("fill", d => color(d.genre))
        .attr("fill-opacity", 0.7);
    
    u
        .exit()
        .remove();

}