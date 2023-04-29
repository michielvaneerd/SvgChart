import { el, prefixed } from "./utils.js";

function drawStart(svgChart, axisController, currentSerieGroupElement) {
    if (svgChart.xAxisGroupElement.firstChild) {
        svgChart.xAxisGroupElement.removeChild(svgChart.xAxisGroupElement.firstChild);
    }

    if (svgChart.config.xAxisGridColumnsSelectable) {
        if (svgChart.xAxisGridColumnsSelectableGroupElement.firstChild) {
            svgChart.xAxisGridColumnsSelectableGroupElement.firstChild.remove();
        }
    }

    if (svgChart.xAxisLabelsGroupElement.firstChild) {
        svgChart.xAxisLabelsGroupElement.removeChild(svgChart.xAxisLabelsGroupElement.firstChild);
    }

    // Note that for bar charts to display correctly, this.config.xAxisGridColumns MUST be true!
    const columnWidth = svgChart.config.xAxisGridColumns
        ? (svgChart.chartWidth / (svgChart.data.xAxis.columns.length))
        : (svgChart.chartWidth / (svgChart.data.xAxis.columns.length - 1));
    
    svgChart.columnWidth = columnWidth;
    
    axisController.addXAxisLabels(columnWidth);
}

function configBefore(svgChart, axisController) {

    svgChart.lineAndBarSelectedColumnIndex = null;
    svgChart.lineAndBarValueHeight = svgChart.chartHeight / svgChart.config.maxValue;
    svgChart.barCountPerColumn = svgChart.config.barStacked ? 1 : 0;

    if (svgChart.config.yAxis) {
        axisController.addYAxisGrid();
    }

    if (svgChart.config.xAxisTitle) {
        axisController.addXAxisTitle();
    }

    if (svgChart.config.yAxisTitle) {
        axisController.addYAxisTitle();
    }

    if (svgChart.config.xAxisLabels) {
        axisController.addXAxisLabelsGroup();
    }

    svgChart.xAxisGroupElement = svgChart.svg.appendChild(el('g', {
        className: prefixed('x-axis-group')
    }));
}

export { drawStart, configBefore };