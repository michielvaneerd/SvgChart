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
var _BarController_axisController;
import { prefixed, directionForEach, el } from "../utils.js";
import { Controller } from "./controller.js";
import { SvgChart } from "../svg.js";
import { AxisController } from "../axis.js";
import { configBefore as barAndLineConfigBefore, drawStart as barAndLineDrawStart } from "../bar_and_line_utils.js";
/**
 * Controller class for bar and line charts.
 * @extends Controller
 */
class BarController extends Controller {
    /**
     * @param {SvgChart} svgChart SvgChart instance.
     */
    constructor(svgChart) {
        super(svgChart);
        _BarController_axisController.set(this, null);
        __classPrivateFieldSet(this, _BarController_axisController, new AxisController(svgChart), "f");
    }
    /**
     * Draws chart element for this serie and attached it to the serieGroup.
     * @param {Object} serie Serie object.
     * @param {Number} serieIndex Serie index.
     * @param {HTMLElement} serieGroup DOM group element for this serie.
     */
    drawSerie(serie, serieIndex, serieGroup) {
        directionForEach(this, this.svgChart.data.series[serie.id], this.svgChart.isLTR, function (value, valueIndex) {
            var x = null;
            var y = null;
            var height = null;
            if (this.config.barStacked) {
                if (!this.stackedBarValues[valueIndex]) {
                    this.stackedBarValues[valueIndex] = this.config.minValue;
                }
                ;
                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * this.svgChart.columnWidth) + this.config.barSpacing;
                y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.svgChart.lineAndBarValueHeight) - (this.stackedBarValues[valueIndex] * this.svgChart.lineAndBarValueHeight);
                height = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.svgChart.lineAndBarValueHeight);
                this.stackedBarValues[valueIndex] = this.stackedBarValues[valueIndex] += value;
            }
            else {
                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * this.svgChart.columnWidth) + (this.svgChart.barWidth * this.currentBarIndex) + (this.config.barSpacing * (this.currentBarIndex + 1));
                if (isNaN(x)) {
                    console.log(this.currentBarIndex);
                }
                height = y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.svgChart.lineAndBarValueHeight);
            }
            serieGroup.appendChild(el('rect', {
                x: x,
                y: y,
                width: this.svgChart.barWidth,
                height: this.svgChart.chartHeight + this.config.padding.top + this.config.yAxisGridPadding - height,
                fill: this.svgChart.getSerieFill(serie, serieIndex),
                className: prefixed('bar'),
                fillOpacity: this.config.barFillOpacity || '',
                strokeWidth: this.config.barStrokeWidth || 0,
                stroke: this.svgChart.getSerieStrokeColor(serie, serieIndex),
                dataValue: value,
                tabindex: this.config.focusedValueShow ? 0 : null
            }));
        });
        this.currentBarIndex += 1;
    }
    /**
     * Do things at the start of the draw for this chart.
     * @param {HTMLElement} currentSerieGroupElement DOM group element.
     */
    drawStart(currentSerieGroupElement) {
        barAndLineDrawStart(this.svgChart, __classPrivateFieldGet(this, _BarController_axisController, "f"), currentSerieGroupElement);
        const barWidth = (this.svgChart.columnWidth - (this.config.barSpacing * (this.svgChart.barCountPerColumn + 1))) / (this.svgChart.barCountPerColumn || 1);
        this.svgChart.barWidth = barWidth;
        this.currentBarIndex = 0;
        this.stackedBarValues = []; // value index => current value (steeds optellen)
    }
    /**
     * Execute config things before global config things are done.
     */
    configBefore() {
        super.configBefore();
        barAndLineConfigBefore(this.svgChart, __classPrivateFieldGet(this, _BarController_axisController, "f"));
    }
    /**
     * Execute serie config things before global config serie things are done.
     * @param {Object} serie - Serie object
     */
    configSerieBefore(serie) {
        super.configSerieBefore(serie);
        if (!this.config.barStacked && (serie.type === SvgChart.chartTypes.bar || this.config.chartType === SvgChart.chartTypes.bar)) {
            this.svgChart.barCountPerColumn += 1;
        }
    }
}
_BarController_axisController = new WeakMap();
/**
 * Required config property values for this type of chart.
 */
BarController.requiredConfigWithValue = {
    xAxisGridColumns: true
};
export { BarController };
