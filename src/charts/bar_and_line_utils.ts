import { AxisController } from "../axis";
import { SvgChart } from "../svg";
import { ChartType } from "../types";
import { el, prefixed } from "../utils";
import { BarAndLineController } from "./bar_and_line_chart_controller";
import { BarController } from "./bar_chart_controller";
import { LineController } from "./line_chart_controller";

/**
     * Do things at the start of the draw for this chart.
     * @param {SvgChart} svgChart SvgChart instance.
     * @param {AxisController} axisController AxisController instance.
     * @param {SVGElement} currentSerieGroupElement DOM group element.
     */
function onDrawStartBarAndLine(svgChart: SvgChart, axisController: AxisController, currentSerieGroupElement: SVGElement) {

    const controller = getController(svgChart);

    if (controller.xAxisGroupElement.firstChild) {
        controller.xAxisGroupElement.removeChild(controller.xAxisGroupElement.firstChild);
    }

    if (controller.xAxisLabelsGroupElement.firstChild) {
        controller.xAxisLabelsGroupElement.removeChild(controller.xAxisLabelsGroupElement.firstChild);
    }

    // Note that for bar charts to display correctly, this.config.xAxisGridColumns MUST be true!
    const columnWidth = svgChart.config.xAxisGridColumns
        ? (svgChart.chartWidth / (svgChart.data.xAxis.columns.length))
        : (svgChart.chartWidth / (svgChart.data.xAxis.columns.length - 1));

    controller.columnWidth = columnWidth;

    axisController.addXAxisGridAndLabels(columnWidth);
}

function getController(svgChart: SvgChart): LineController | BarController | BarAndLineController {
    return svgChart.config.chartType === ChartType.Line ? svgChart.controller as LineController : (svgChart.config.chartType === ChartType.Bar ? svgChart.controller as BarController : svgChart.controller as BarAndLineController);
}

/**
 * Execute config things before global config things are done, like adding the axis lines and labels.
 * @param {SvgChart} svgChart SvgChart instance.
 * @param {AxisController} axisController AxisController instance.
 */
function onConfigBeforeBarAndLine(svgChart: SvgChart, axisController: AxisController) {

    const controller = getController(svgChart);

    controller.selectedColumnIndex = null;
    controller.valueHeight = svgChart.chartHeight / (Math.abs(svgChart.config.minValue) + svgChart.config.maxValue);
    if (controller instanceof BarController || controller instanceof BarAndLineController) {
        controller.barCountPerColumn = svgChart.config.barStacked ? 1 : 0;
    }

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

    controller.xAxisGroupElement = svgChart.svg.appendChild(el('g', {
        className: prefixed('x-axis-group')
    }));
}

export { onDrawStartBarAndLine, onConfigBeforeBarAndLine };