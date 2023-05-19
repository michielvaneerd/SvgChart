var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LineController_instances, _LineController_axisController, _LineController_getCurvedPathFromPoints, _LineController_closePath, _LineController_getStraightPathFromPoints;
import { prefixed, directionForEach, el } from "../utils.js";
import { Controller } from "./controller.js";
import { SvgChart } from "../svg.js";
import { AxisController } from "../axis.js";
import { configBefore as barAndLineConfigBefore, drawStart as barAndLineDrawStart } from "../bar_and_line_utils.js";
/**
 * Controller class for bar and line charts.
 * @extends Controller
 */
class LineController extends Controller {
    /**
     * @param {SvgChart} svgChart SvgChart instance.
     */
    constructor(svgChart) {
        super(svgChart);
        _LineController_instances.add(this);
        _LineController_axisController.set(this, null);
        __classPrivateFieldSet(this, _LineController_axisController, new AxisController(svgChart), "f");
    }
    /**
     * Draws chart element for this serie and attached it to the serieGroup. Overrides base class method.
     * @param {Object} serie Serie object.
     * @param {Number} serieIndex Serie index.
     * @param {HTMLElement} serieGroup DOM group element for this serie.
     */
    drawSerie(serie, serieIndex, serieGroup) {
        var nonNullPoints = [[]]; // Array of arrays, each array consists only of NON NULL points, used for smoot lines when not connecting NULL values and for filled lines charts when not connecting null points
        var flatNonNullPoints = [];
        directionForEach(this, this.svgChart.data.series[serie.id], this.svgChart.isLTR, function (value, valueIndex, values) {
            var x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * this.svgChart.columnWidth) + (this.config.xAxisGridColumns ? (this.svgChart.columnWidth / 2) : 0);
            var y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.svgChart.lineAndBarValueHeight);
            if (value === null) {
                if (nonNullPoints[nonNullPoints.length - 1].length > 0 && valueIndex + 1 < values.length) {
                    nonNullPoints.push([]);
                }
            }
            else {
                nonNullPoints[nonNullPoints.length - 1].push({ x: x, y: y, value: value });
                flatNonNullPoints.push({ x: x, y: y, value: value });
            }
        });
        var paths = [];
        if (this.config.connectNullValues) {
            // Loop through flatNonNullPoints
            let path = this.config.lineCurved ? __classPrivateFieldGet(this, _LineController_instances, "m", _LineController_getCurvedPathFromPoints).call(this, flatNonNullPoints) : __classPrivateFieldGet(this, _LineController_instances, "m", _LineController_getStraightPathFromPoints).call(this, flatNonNullPoints);
            if (path.length > 0) {
                paths.push(path);
            }
        }
        else {
            // Loop through nonNullPoints
            nonNullPoints.forEach(function (currentNonNullPoints) {
                if (currentNonNullPoints.length > 0) {
                    let path = this.config.lineCurved ? __classPrivateFieldGet(this, _LineController_instances, "m", _LineController_getCurvedPathFromPoints).call(this, currentNonNullPoints) : __classPrivateFieldGet(this, _LineController_instances, "m", _LineController_getStraightPathFromPoints).call(this, currentNonNullPoints);
                    if (path.length > 0) {
                        paths.push(path);
                    }
                }
            }, this);
        }
        paths.forEach(function (path) {
            serieGroup.appendChild(el('path', {
                d: path.join(' '),
                fill: this.config.lineChartFilled ? this.svgChart.getSerieFill(serie, serieIndex) : 'none',
                fillOpacity: 0.4,
                stroke: this.svgChart.getSerieStrokeColor(serie, serieIndex),
                strokeWidth: this.config.lineWidth || '',
                className: prefixed('line')
            }));
        }, this);
        if (this.config.points) {
            flatNonNullPoints.forEach(function (point) {
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
            }, this);
        }
    }
    /**
     * Do things at the start of the draw for this chart.
     * @param {HTMLElement} currentSerieGroupElement DOM group element.
     */
    drawStart(currentSerieGroupElement) {
        barAndLineDrawStart(this.svgChart, __classPrivateFieldGet(this, _LineController_axisController, "f"), currentSerieGroupElement);
    }
    /**
     * Execute config things before global config things are done.
     */
    configBefore() {
        super.configBefore();
        barAndLineConfigBefore(this.svgChart, __classPrivateFieldGet(this, _LineController_axisController, "f"));
    }
}
_LineController_axisController = new WeakMap(), _LineController_instances = new WeakSet(), _LineController_getCurvedPathFromPoints = function _LineController_getCurvedPathFromPoints(points) {
    let path = ['M ' + points[0].x + ' ' + points[0].y];
    for (var i = 0; i < points.length - 1; i++) {
        var x_mid = (points[i].x + points[i + 1].x) / 2;
        var y_mid = (points[i].y + points[i + 1].y) / 2;
        var cp_x1 = (x_mid + points[i].x) / 2;
        var cp_x2 = (x_mid + points[i + 1].x) / 2;
        path.push(`Q ${cp_x1} ${points[i].y}, ${x_mid} ${y_mid}`);
        path.push(`Q ${cp_x2} ${points[i + 1].y} ${points[i + 1].x} ${points[i + 1].y}`);
    }
    __classPrivateFieldGet(this, _LineController_instances, "m", _LineController_closePath).call(this, path, points);
    return path;
}, _LineController_closePath = function _LineController_closePath(path, points) {
    if (this.config.lineChartFilled && points.length > 1) {
        path.push(`L ${points[points.length - 1].x} ${this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight}`);
        path.push(`L ${points[0].x} ${this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight}`);
        path.push(`L ${points[0].x} ${points[0].y}`);
        path.push('Z');
    }
}, _LineController_getStraightPathFromPoints = function _LineController_getStraightPathFromPoints(points) {
    let path = [];
    points.forEach(function (point, pointIndex) {
        if (pointIndex === 0) {
            path.push(`M ${point.x} ${point.y}`);
        }
        else {
            path.push(`L ${point.x} ${point.y}`);
        }
    });
    __classPrivateFieldGet(this, _LineController_instances, "m", _LineController_closePath).call(this, path, points);
    return path;
};
export { LineController };
