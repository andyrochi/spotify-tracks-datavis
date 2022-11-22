export const dropdownMenu = (selection, props) => {
    const {
        options,
        onOptionClicked,
        selectedOption,
        dropdownClass
    } = props;
    
    let select = selection.selectAll('select').data([null]);
    select = select.enter().append('select')
        .merge(select)
            .attr("class", () => {
                if (dropdownClass)
                    return dropdownClass;
                return "";
            })
            .on('change', function() {
                onOptionClicked(this.value);
            });

    const option = select.selectAll('option').data(options);
    option.enter().append('option')
        .merge(option)
            .attr('value', d => d)
            .property('selected', d => d === selectedOption)
            .text(d => d);
    option.exit().remove();
}