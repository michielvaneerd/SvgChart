import { polarToCartesian } from "../utils.js";
import { Controller } from "./controller.js";
import { draw as drawPieOrDonut } from "../donut_or_pie_utils.js";

/**
 * Class for displaying pie and donut charts.
 * @extends Controller
 */
class DonutController extends Controller {

    /**
     * 
     * @param {HTMLElement} currentSerieGroupElement Current serie group element.
     */
    draw(currentSerieGroupElement) {
        const donutWidth = this.config.donutWidth;
        drawPieOrDonut(this.svgChart, currentSerieGroupElement, function(centerX, centerY, radius, startAngle, endAngle) {
            return describeArcDonut(centerX, centerY, radius - donutWidth, donutWidth, startAngle, endAngle);
        });
    }
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

export { DonutController }; 