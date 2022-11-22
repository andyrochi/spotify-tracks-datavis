export const pieChart = (selection, props) => {
    const {
        data,
        selectedGenre,
        radius,
        sliceThreshold
    } = props;
    // all pie
    // set the color scale
    const color = d3.scaleOrdinal()
        .domain(["explicit", "normal"])
        .range(["#e15759", "#59a14f"]);
    
    const count_explicit = (dList, genre) => {
        let filtered = dList.filter((d) => genre === 'all-genres'
            ? true
            : d['track_genre'] === genre);
        const slicePoint = Math.round(filtered.length * sliceThreshold / 100);
        filtered = filtered.slice(0, slicePoint);

        const exCount = filtered.filter( d => d['explicit'] === true).length;
        const nonExCount = filtered.filter( d => d['explicit'] === false).length;
        console.log(exCount, nonExCount);
        return {
            explicit: exCount,
            'normal': nonExCount
        };
    }

    const pieData = count_explicit(data, selectedGenre);
    // const fil
    // pie
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
    const u = selection.selectAll("path")
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
            selection
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
            selection
            .selectAll('.labels')
            .data(data_ready);
    
    pieLabel
        .join('text')
            .text(d => { console.log(d.data); return `${d.data[0]}:${d.data[1]}`})
            .attr("class", "labels")
            .attr("font-size", "12px")
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
}