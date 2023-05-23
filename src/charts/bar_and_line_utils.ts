import { AxisController } from "../axis";
import { SvgChart } from "../svg";
import { el, prefixed } from "../utils";

/**
     * Do things at the start of the draw for this chart.
     * @param {SvgChart} svgChart SvgChart instance.
     * @param {AxisController} axisController AxisController instance.
     * @param {SVGElement} currentSerieGroupElement DOM group element.
     */
function onDrawStartBarAndLine(svgChart: SvgChart, axisController: AxisController, currentSerieGroupElement: SVGElement) {
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
    
    axisController.addXAxisGridAndLabels(columnWidth);
}

/**
 * Execute config things before global config things are done, like adding the axis lines and labels.
 * @param {SvgChart} svgChart SvgChart instance.
 * @param {AxisController} axisController AxisController instance.
 */
function onConfigBeforeBarAndLine(svgChart: SvgChart, axisController: AxisController) {

    svgChart.lineAndBarSelectedColumnIndex = null;
    svgChart.lineAndBarValueHeight = svgChart.chartHeight / svgChart.config.maxValue;
    svgChart.barCountPerColumn = svgChart.config.barStacked ? 1 : 0;

    if (svgChart.config.yAxisGrid) {
        axisController.addYAxisGridAndLabels();
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

export { onDrawStartBarAndLine, onConfigBeforeBarAndLine };