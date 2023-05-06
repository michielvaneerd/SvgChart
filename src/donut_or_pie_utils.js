/**
 * @module
 * @ignore
 */

import { el, prefixed } from "./utils.js";
import { SvgChart } from "./svg.js";

/**
 * 
 * @param {SvgChart} svgChart SvgChart instance.
 * @param {HTMLElement} currentSerieGroupElement Group node.
 * @param {Function} describeArcCallback Callback for gettting the path of the pie or donut.
 */
function draw(svgChart, currentSerieGroupElement, describeArcCallback) {

    var radius = svgChart.chartHeight / 2;
    var centerX = svgChart.width / 2;
    var centerY = svgChart.chartHeight / 2 + svgChart.config.padding.top;

    var total = 0;
    for (let key in svgChart.data.series) {
        total += svgChart.data.series[key];
    }

    var totalToDegree = 360 / total;
    var currentTotal = 0;

    svgChart.config.series.forEach(function (serie, serieIndex) {
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
            stroke: svgChart.config[svgChart.config.chartType + 'Stroke'],
            strokeWidth: svgChart.config[svgChart.config.chartType + 'StrokeWidth'],
            dataValue: value
        }));

        currentSerieGroupElement.appendChild(serieGroup);

    });

}

export { draw };