export const colorLegend = (selection, props) => {
    const {
      colorScale,
      circleRadius,
      spacing,
      textOffset,
      selectedGenreList
    } = props;
    
    const legendG = 
        selection.selectAll('g.container')
            .data([null]);

    const legendGEnter = legendG
        .enter()
          .append('g')
          .attr('class', 'container');
    
    const translatedLegend = legendGEnter.merge(legendG)
        .attr('transform',
            `translate(${40},${30})`);

    const groups = translatedLegend.selectAll('g')
      .data(selectedGenreList);
    
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
        .attr('fill', (d, i) => {
          // if(classData[d].filtered) return 'lightgrey'
          return colorScale(i);
        })
        .style('cursor', 'pointer');
  
    groupsEnter.append('text')
      .merge(groups.select('text'))
        .text(d => d)
        .attr('dy', '0.32em')
        .attr('x', textOffset)
        .attr('class', d => `text-${d}`)
        .style('cursor', 'pointer');
}