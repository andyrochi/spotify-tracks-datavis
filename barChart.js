export const barChart = (selection, props) => {
    const {
        margin, // marginBar,
        height, 
        width,
        key_signature_map,
        mode_map,
        data,
        color
    } = props;

    const widthBar = width - margin.left - margin.right;
    const heightBar = height - margin.top - margin.bottom;
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
    .domain(dataBar.map(d => d.pitch))
    .padding(.1);

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
        .attr("y", d => yBar(d.pitch))
        .attr("width", d => xBar(d.value))
        .attr("height", yBar.bandwidth())
        .attr("fill", color)
        .attr("fill-opacity", 0.7);
    
    u
        .exit()
        .remove();

}