import { el, prefixed } from "../utils";
import { SvgChart } from "../svg";
import { DonutController } from "./donut_chart_controller";
import { PieController } from "./pie_chart_controller";
import { ChartType } from "../types";

/**
 * Function that is called from within the {@link drawPieOrDonut} function.
 */
type ArcCallback = (
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number
) => Array<string | number>;

/**
 * Shared functions that draws a pie or donut chart. Called from {@link DonutController} and {@link PieController}.
 * 
 * @param svgChart - SvgChart instance.
 * @param currentSerieGroupElement - Group node.
 * @param describeArcCallback - Callback for gettting the path of the pie or donut.
 */
function drawPieOrDonut(svgChart: SvgChart, currentSerieGroupElement: SVGElement, describeArcCallback: ArcCallback) {

    var radius = svgChart.chartHeight / 2;
    var centerX = svgChart.width / 2;
    var centerY = svgChart.chartHeight / 2 + svgChart.config.padding.top;

    var total = 0;
    for (let key in svgChart.data.series) {
        total += svgChart.data.series[key];
    }

    var totalToDegree = 360 / total;
    var currentTotal = 0;

    svgChart.config.series.forEach((serie, serieIndex) => {
        var serieGroup = el('g', {
            dataSerie: serie.id,
            className: svgChart.unselectedSeries[serie.id] ? prefixed('unselected') : ''
        });

        const value = svgChart.data.series[serie.id];

        var startAngle = currentTotal * totalToDegree;
        currentTotal += value;
        var endAngle = currentTotal * totalToDegree;
        var path = describeArcCallback(centerX, centerY, radius, startAngle, endAngle);
        serieGroup.appendChild(el('path', {
            d: path.join(' '),
            fill: svgChart.getSerieFill(serie, serieIndex),
            fillOpacity: svgChart.config.pieFillOpacity || 1,
            className: prefixed('pie-piece'),
            tabindex: 0,
            stroke: svgChart.config[ChartType[svgChart.config.chartType].toLowerCase() + 'Stroke'],
            strokeWidth: svgChart.config[ChartType[svgChart.config.chartType].toLowerCase() + 'StrokeWidth'],
            dataValue: value
        }));

        currentSerieGroupElement.appendChild(serieGroup);

    });

}

export { drawPieOrDonut, ArcCallback };