import { polarToCartesian } from "../utils.js";
import { Controller } from "./controller.js";
import { draw as drawPieOrDonut } from "../donut_or_pie_utils.js";

/**
 * Class for displaying pie and donut charts.
 * @extends Controller
 */
class PieController extends Controller {

    /**
     * Draws chart.
     * @param {HTMLElement} currentSerieGroupElement Current serie group element.
     */
    draw(currentSerieGroupElement) {
        drawPieOrDonut(this.svgChart, currentSerieGroupElement, function(centerX, centerY, radius, startAngle, endAngle) {
            return describeArcPie(centerX, centerY, radius, startAngle, endAngle);
        });
    }
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

export { PieController }; 