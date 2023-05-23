import { polarToCartesian } from "../utils";
import { Controller } from "./controller";
import { drawPieOrDonut } from "./donut_or_pie_utils";

/**
 * Class for displaying pie and donut charts.
 * @extends Controller
 */
class PieController extends Controller {

    /**
     * Draws pie chart.
     * 
     * @override
     * 
     * @param currentSerieGroupElement - Current serie group element.
     */
    onDraw(currentSerieGroupElement: SVGElement) {
        drawPieOrDonut(this.svgChart, currentSerieGroupElement, (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
            return describeArcPie(centerX, centerY, radius, startAngle, endAngle);
        });
    }

}

/**
 * Get path for pie.
 * 
 * @param x - X point.
 * @param y - Y point.
 * @param radius - Radius of arc.
 * @param startAngle - Start angle.
 * @param endAngle - End angle.
 * @returns Array of path coordinates.
 */
function describeArcPie(x: number, y: number, radius: number, startAngle: number, endAngle: number): Array<string | number> {
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