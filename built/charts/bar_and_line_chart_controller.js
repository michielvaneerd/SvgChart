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
var _BarAndLineController_lineChartController, _BarAndLineController_barChartController;
import { Controller } from "./controller.js";
import { LineController } from "./line_chart_controller.js";
import { BarController } from "./bar_chart_controller.js";
import { SvgChart } from "../svg.js";
/**
 * Controller class for bar and line charts.
 * @extends Controller
 */
class BarAndLineController extends Controller {
    /**
     * @param {SvgChart} svgChart SvgChart instance.
     */
    constructor(svgChart) {
        super(svgChart);
        _BarAndLineController_lineChartController.set(this, null);
        _BarAndLineController_barChartController.set(this, null);
        __classPrivateFieldSet(this, _BarAndLineController_barChartController, new BarController(svgChart), "f");
        __classPrivateFieldSet(this, _BarAndLineController_lineChartController, new LineController(svgChart), "f");
    }
    drawSerie(serie, serieIndex, serieGroup) {
        const serieType = serie.type || (this.config.chartType === SvgChart.chartTypes.lineAndBar ? SvgChart.chartTypes.line : this.config.chartType);
        switch (serieType) {
            case SvgChart.chartTypes.line:
                __classPrivateFieldGet(this, _BarAndLineController_lineChartController, "f").drawSerie(serie, serieIndex, serieGroup);
                break;
            case SvgChart.chartTypes.bar:
                __classPrivateFieldGet(this, _BarAndLineController_barChartController, "f").drawSerie(serie, serieIndex, serieGroup);
                break;
        }
    }
    drawStart(currentSerieGroupElement) {
        __classPrivateFieldGet(this, _BarAndLineController_barChartController, "f").drawStart(currentSerieGroupElement);
    }
    configBefore() {
        __classPrivateFieldGet(this, _BarAndLineController_barChartController, "f").configBefore();
    }
    configSerieBefore(serie) {
        __classPrivateFieldGet(this, _BarAndLineController_barChartController, "f").configSerieBefore(serie);
    }
}
_BarAndLineController_lineChartController = new WeakMap(), _BarAndLineController_barChartController = new WeakMap();
BarAndLineController.requiredConfigWithValue = {
    xAxisGridColumns: true
};
export { BarAndLineController };
