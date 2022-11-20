const {
    scaleLinear,
    line,
} = d3;

export const radarPlot = (
    svgRadar,
    ticks,
    svgRadarDim,
    radarLabels,
    radarData
) => {
    const radarMaxTick = ticks[ticks.length - 1];
    const radarDim = svgRadarDim / 2;
    const circleSize = radarDim * 0.7;

    let radialScale = scaleLinear() // d3.
        .domain([0,0.8])
        .range([0, circleSize]);

    function angleToCoordinate(angle, value){
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return {"x": radarDim + x, "y": radarDim - y};
    }
    function angleToCoordinateLabel(angle, value, string) {
        let shift = false;
        let shiftValue = svgRadarDim / 12;

        if (angle <= Math.PI + Math.PI/2) {
            shift = true;
        }

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

    function getRadarAxisLabel(d, i) {
        let angle = (Math.PI / 2) + (2 * Math.PI * i / radarLabels.length);
        let label_offset = 0.14 * d.length / 20.0; // offset determined by stringlength
        let label_coordinate = angleToCoordinateLabel(angle, radarMaxTick + label_offset, d);
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
        .attr("x", (d, i) => getRadarAxisLabel(d, i).x)
        .attr("y", (d, i) => getRadarAxisLabel(d, i).y)
        .text((d) => (d));

    // helper functions
    let lineDraw = line() // d3.
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

    let colors = ["#69b3a2", "darkorange", "gray", "navy"];
    
    radarPaths.join("path")
        .datum((d) => getPathCoordinates(d))
        .attr("class", "plots")
        .attr("d", d => lineDraw(d))
        .attr("stroke", (d,i) => colors[i])
        .attr("fill", (d, i) => colors[i])
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5);

};