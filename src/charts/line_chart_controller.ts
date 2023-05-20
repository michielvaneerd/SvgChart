import { prefixed, directionForEach, el } from "../utils";
import { Controller } from "./controller";
import { ChartPoint, SvgChart } from "../svg";
import { AxisController } from "../axis";
import { configBefore as barAndLineConfigBefore, drawStart as barAndLineDrawStart } from "../bar_and_line_utils";
import { ChartConfigSerie } from "../config";

/**
 * Controller class for bar and line charts.
 * @extends Controller
 */
class LineController extends Controller {

    #axisController = null;

    /**
     * @param {SvgChart} svgChart SvgChart instance.
     */
    constructor(svgChart: SvgChart) {
        super(svgChart);
        this.#axisController = new AxisController(svgChart);
    }

    /**
     * Draws chart element for this serie and attached it to the serieGroup. Overrides base class method.
     * @param {ChartConfigSerie} serie Serie object.
     * @param {number} serieIndex Serie index.
     * @param {SVGElement} serieGroup DOM group element for this serie.
     */
    drawSerie(serie: ChartConfigSerie, serieIndex: number, serieGroup: SVGElement) {
        var nonNullPoints = [[]]; // Array of arrays, each array consists only of NON NULL points, used for smoot lines when not connecting NULL values and for filled lines charts when not connecting null points
        var flatNonNullPoints = [];

        directionForEach(this, this.svgChart.data.series[serie.id], this.svgChart.isLTR, function (value: number, valueIndex: number, values: Array<number>) {
            var x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * this.svgChart.columnWidth) + (this.config.xAxisGridColumns ? (this.svgChart.columnWidth / 2) : 0);
            var y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.svgChart.lineAndBarValueHeight);

            if (value === null) {
                if (nonNullPoints[nonNullPoints.length - 1].length > 0 && valueIndex + 1 < values.length) {
                    nonNullPoints.push([]);
                }
            } else {
                nonNullPoints[nonNullPoints.length - 1].push({ x: x, y: y, value: value });
                flatNonNullPoints.push({ x: x, y: y, value: value });
            }
        });

        var paths = [];

        if (this.config.connectNullValues) {

            // Loop through flatNonNullPoints

            let path = this.config.lineCurved ? this.#getCurvedPathFromPoints(flatNonNullPoints) : this.#getStraightPathFromPoints(flatNonNullPoints);
            if (path.length > 0) {
                paths.push(path);
            }

        } else {

            // Loop through nonNullPoints

            nonNullPoints.forEach((currentNonNullPoints) => {
                if (currentNonNullPoints.length > 0) {
                    let path = this.config.lineCurved ? this.#getCurvedPathFromPoints(currentNonNullPoints) : this.#getStraightPathFromPoints(currentNonNullPoints);
                    if (path.length > 0) {
                        paths.push(path);
                    }
                }
            });

        }

        paths.forEach((path) => {
            serieGroup.appendChild(el('path', {
                d: path.join(' '),
                fill: this.config.lineChartFilled ? this.svgChart.getSerieFill(serie, serieIndex) : 'none',
                fillOpacity: 0.4,
                stroke: this.svgChart.getSerieStrokeColor(serie, serieIndex),
                strokeWidth: this.config.lineWidth || '',
                className: prefixed('line')
            }));
        });

        if (this.config.points) {
            flatNonNullPoints.forEach((point) => {
                serieGroup.appendChild(el('circle', {
                    cx: point.x,
                    cy: point.y,
                    r: this.config.pointRadius,
                    zIndex: 1,
                    fill: this.svgChart.getSeriePointColor(serie, serieIndex),
                    stroke: this.svgChart.getSeriePointColor(serie, serieIndex),
                    dataValue: point.value,
                    className: prefixed('line-point'),
                    tabindex: this.config.focusedValueShow ? 0 : null
                }));
            });
        }
    }

    /**
     * Do things at the start of the draw for this chart.
     * @param {SVGElement} currentSerieGroupElement DOM group element.
     */
    drawStart(currentSerieGroupElement: SVGElement) {
        barAndLineDrawStart(this.svgChart, this.#axisController, currentSerieGroupElement);
    }

    /**
     * Helper function to get a curved path from an array of points.
     * @param {Array<ChartPoint>} points Array of points.
     * @returns Array of curved path coordinates.
     */
    #getCurvedPathFromPoints(points: Array<ChartPoint>): Array<any> {
        let path = ['M ' + points[0].x + ' ' + points[0].y];
        for (var i = 0; i < points.length - 1; i++) {
            var x_mid = (points[i].x + points[i + 1].x) / 2;
            var y_mid = (points[i].y + points[i + 1].y) / 2;
            var cp_x1 = (x_mid + points[i].x) / 2;
            var cp_x2 = (x_mid + points[i + 1].x) / 2;
            path.push(`Q ${cp_x1} ${points[i].y}, ${x_mid} ${y_mid}`);
            path.push(`Q ${cp_x2} ${points[i + 1].y} ${points[i + 1].x} ${points[i + 1].y}`);
        }
        this.#closePath(path, points);
        return path;
    }

    /**
     * Closes path for filled line charts.
     * @param {Array} path Array of path coordinates
     * @param {Array} points Array of points
     */
    #closePath(path: Array<any>, points: Array<ChartPoint>) {
        if (this.config.lineChartFilled && points.length > 1) {
            path.push(`L ${points[points.length - 1].x} ${this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight}`);
            path.push(`L ${points[0].x} ${this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight}`);
            path.push(`L ${points[0].x} ${points[0].y}`);
            path.push('Z');
        }


    }

    /**
     * Helper function to get a straight path for line charts.
     * @param {Array} points Array of points.
     * @returns Array of path coordinates.
     */
    #getStraightPathFromPoints(points: Array<ChartPoint>): Array<any> {
        let path = [];
        points.forEach(function (point, pointIndex) {
            if (pointIndex === 0) {
                path.push(`M ${point.x} ${point.y}`);
            } else {
                path.push(`L ${point.x} ${point.y}`);
            }
        });
        this.#closePath(path, points);
        return path;
    }

    /**
     * Execute config things before global config things are done.
     */
    configBefore() {
        super.configBefore();
        barAndLineConfigBefore(this.svgChart, this.#axisController);
    }

}

export { LineController };






