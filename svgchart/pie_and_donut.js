import { prefixed, el } from "./utils.js";
import { Controller } from "./controller.js";

/**
 * Class for displaying pie and donut charts.
 * @extends Controller
 */
class PieAndDonutController extends Controller {

    /**
     * 
     * @param {HTMLElement} currentSerieGroupElement Current serie group element.
     */
    draw(currentSerieGroupElement) {

        var radius = this.svgChart.chartHeight / 2;
        var centerX = this.svgChart.width / 2;
        var centerY = this.svgChart.chartHeight / 2 + this.config.padding.top;

        var total = 0;
        for (let key in this.svgChart.data.series) {
            total += this.svgChart.data.series[key];
        }

        var totalToDegree = 360 / total;
        var currentTotal = 0;

        this.config.series.forEach(function (serie, serieIndex) {
            var serieGroup = el('g', {
                dataSerie: serie.id,
                className: this.svgChart.unselectedSeries[serie.id] ? prefixed('unselected') : ''
            });

            const value = this.svgChart.data.series[serie.id];

            var startAngle = currentTotal * totalToDegree;
            currentTotal += value;
            var endAngle = currentTotal * totalToDegree;
            var path = this.config.chartType === 'pie' ? describeArcPie(centerX, centerY, radius, startAngle, endAngle) : describeArcDonut(centerX, centerY, radius - 40, 40, startAngle, endAngle);
            serieGroup.appendChild(el('path', {
                d: path.join(' '),
                fill: this.svgChart.getSerieFill(serie, serieIndex),
                fillOpacity: this.config.pieFillOpacity || 1,
                className: prefixed('pie-piece'),
                tabindex: 0,
                dataValue: value
            }));

            currentSerieGroupElement.appendChild(serieGroup);

        }, this);

    }
}



/**
 * Convert polar to cartesian point.
 * @param {Number} centerX Center x.
 * @param {Number} centerY Center y.
 * @param {Number} radius Radius of arc.
 * @param {Number} angleInDegrees Angle in degrees.
 * @returns {Object} Point.
 */
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

/**
 * Get path for pie.
 * @param {Number} x X point.
 * @param {Number} y Y point.
 * @param {Number} radius Radius of arc.
 * @param {Number} startAngle Start angle.
 * @param {Number} endAngle End angle.
 * @returns {Array} Array of path coordinates.
 */
function describeArcPie(x, y, radius, startAngle, endAngle) {
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
        "L", x, y,
        "L", start.x, start.y
    ];

    return d;
}

/**
 * Get path for donut.
 * @param {Number} x X point.
 * @param {Number} y Y point.
 * @param {Number} radius Radius of arc.
 * @param {Number} spread Spread of the donut.
 * @param {Number} startAngle Start angle.
 * @param {Number} endAngle End angle.
 * @returns {Array} Array of path coordinates.
 */
function describeArcDonut(x, y, radius, spread, startAngle, endAngle) {
    var innerStart = polarToCartesian(x, y, radius, endAngle);
    var innerEnd = polarToCartesian(x, y, radius, startAngle);
    var outerStart = polarToCartesian(x, y, radius + spread, endAngle);
    var outerEnd = polarToCartesian(x, y, radius + spread, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", outerStart.x, outerStart.y,
        "A", radius + spread, radius + spread, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
        "L", innerEnd.x, innerEnd.y,
        "A", radius, radius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        "L", outerStart.x, outerStart.y, "Z"
    ];

    return d;
}

export { PieAndDonutController }; 