export const colorLegend = (selection, props) => {
    const {
      colorScale,
      circleRadius,
      spacing,
      textOffset,
      highlight,
      unhighlight,
      filterData,
      classData
    } = props;
  
    const groups = selection.selectAll('g')
      .data(colorScale.domain());
    const groupsEnter = groups
      .enter().append('g')
        .attr('class', 'tick');
    groupsEnter
      .merge(groups)
        .attr('transform', (d, i) =>
          `translate(0, ${i * spacing})`
        );
    groups.exit().remove();
  
    groupsEnter.append('circle')
      .merge(groups.select('circle'))
        .attr('r', circleRadius)
        .attr('fill', (d) => {
          if(classData[d].filtered) return 'lightgrey'
          else return colorScale(d)
        })
        .style('cursor', 'pointer')
        .on("mouseover", (event, d) => {highlight(event, {class: d})})
        .on("mouseleave", (event, d) => {unhighlight(event, {class: d})})
        .on("click", filterData);
  
    groupsEnter.append('text')
      .merge(groups.select('text'))
        .text(d => d)
        .attr('dy', '0.32em')
        .attr('x', textOffset)
        .attr('class', d => `text-${d}`)
        .style('cursor', 'pointer')
        .on("mouseover", (event, d) => {highlight(event, {class: d})})
        .on("mouseleave", (event, d) => {unhighlight(event, {class: d})})
        .on("click", filterData);
  }