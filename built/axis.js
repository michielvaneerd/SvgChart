/**
 * @module
 * @ignore
 */
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _AxisController_instances, _AxisController_onXAxisLabelGroupClickScoped, _AxisController_onXAxisLabelGroupKeypressScoped, _AxisController_addXAxisLine, _AxisController_onXAxisLabelGroupClick, _AxisController_onXAxisLabelGroupSelect, _AxisController_onXAxisLabelGroupKeypress;
import { el, prefixed, directionForEach } from "./utils";
/**
 * @class
 * @ignore
 */
class AxisController {
    /**
     *
     * @param {SvgChart} svgChart SvgChart instance.
     */
    constructor(svgChart) {
        _AxisController_instances.add(this);
        _AxisController_onXAxisLabelGroupClickScoped.set(this, null);
        _AxisController_onXAxisLabelGroupKeypressScoped.set(this, null);
        this.svgChart = svgChart;
        this.config = svgChart.config;
    }
    addYAxisGrid() {
        var gYAxis = el('g', {
            className: prefixed('y-axis-group')
        });
        var currentYAxisValue = this.config.minValue;
        var currentYAxisLabelValue = this.config.minValue;
        while (currentYAxisValue <= this.config.maxValue || currentYAxisLabelValue <= this.config.maxValue) {
            if (this.config.yAxisGrid && currentYAxisValue <= this.config.maxValue) {
                let y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (currentYAxisValue * this.svgChart.lineAndBarValueHeight);
                gYAxis.appendChild(el('line', {
                    x1: this.config.padding.left,
                    y1: y,
                    x2: this.config.padding.left + this.svgChart.chartWidth + (this.config.xAxisGridPadding * 2),
                    y2: y,
                    className: prefixed('y-axis-grid-line'),
                    stroke: this.config.yAxisGridLineColor || '',
                    strokeWidth: this.config.yAxisGridLineWidth || '',
                    strokeDasharray: this.config.yAxisGridLineDashArray || '',
                }));
            }
            currentYAxisValue += this.config.yAxisStep;
            if (this.config.yAxisLabels && currentYAxisLabelValue <= this.config.maxValue) {
                let y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (currentYAxisLabelValue * this.svgChart.lineAndBarValueHeight);
                gYAxis.appendChild(el('text', {
                    direction: this.config.dir,
                    x: this.svgChart.isLTR ? (this.config.padding.left - 10) : (this.config.padding.left + this.svgChart.chartWidth + 10),
                    y: y,
                    textAnchor: 'end',
                    dominantBaseline: 'middle',
                    fontFamily: this.config.fontFamily || '',
                    fontSize: this.config.axisLabelFontSize || '',
                    className: prefixed('y-axis-label'),
                    fill: this.config.yAxisLabelColor || ''
                }, document.createTextNode(currentYAxisLabelValue)));
            }
            currentYAxisLabelValue += this.config.yAxisLabelStep;
        }
        this.svgChart.svg.appendChild(gYAxis);
    }
    addXAxisLabels(columnWidth) {
        // Draw xAxis lines
        var currentXAxisGroupElement = el('g');
        var currentXAxisLabelsGroupElement = el('g', {
            className: prefixed('x-axis-label-group-current')
        });
        var currentXAxisGridColumnsSelectableGroupElement = (this.config.xAxisGridColumnsSelectable) ? el('g') : null;
        directionForEach(this, this.svgChart.data.xAxis.columns, this.svgChart.isLTR, function (colValue, colIndex) {
            if (this.config.xAxisGrid) {
                const x = this.config.padding.left + this.config.xAxisGridPadding + (colIndex * columnWidth);
                if (colIndex === 0 || ((colIndex + 0) % this.config.xAxisStep === 0)) {
                    __classPrivateFieldGet(this, _AxisController_instances, "m", _AxisController_addXAxisLine).call(this, currentXAxisGroupElement, x);
                }
                if (this.config.xAxisGridColumnsSelectable) {
                    currentXAxisGridColumnsSelectableGroupElement.appendChild(el('rect', {
                        x: x,
                        y: this.config.padding.top + this.config.yAxisGridPadding,
                        width: columnWidth,
                        height: this.svgChart.chartHeight,
                        className: prefixed('x-axis-grid-column-selectable'),
                        fillOpacity: 0,
                        fill: this.config.xAxisGridColumnsSelectableColor
                    }));
                }
            }
            if (this.config.xAxisLabels && ((colIndex + 0) % this.config.xAxisLabelStep === 0)) {
                var xlg = el('g', {
                    transform: `translate(${this.config.padding.left + this.config.xAxisGridPadding + (colIndex * columnWidth) + (this.config.xAxisGridColumns ? (columnWidth / 2) : 0)} ${this.svgChart.chartHeight + this.config.padding.top + (this.config.yAxisGridPadding * 2) + this.config.xAxisLabelTop})`
                });
                xlg.appendChild(el('text', {
                    direction: this.config.dir,
                    textAnchor: this.config.textAnchorXAxisLabels || 'middle',
                    dominantBaseline: 'hanging',
                    fontFamily: this.config.fontFamily || '',
                    fontSize: this.config.axisLabelFontSize || '',
                    fontWeight: 'normal',
                    fill: this.config.xAxisLabelColor || '',
                    tabindex: this.config.xAxisGridColumnsSelectable ? 0 : null,
                    className: prefixed('x-axis-label') + ' ' + (this.config.xAxisGridColumnsSelectable ? prefixed('x-axis-grid-column-selectable-label') : ''),
                    transform: `rotate(${this.config.xAxisLabelRotation})`
                }, document.createTextNode(colValue.toString())));
                currentXAxisLabelsGroupElement.appendChild(xlg);
            }
        });
        if (this.config.xAxisGrid && this.config.xAxisGridColumns) {
            __classPrivateFieldGet(this, _AxisController_instances, "m", _AxisController_addXAxisLine).call(this, currentXAxisGroupElement, this.config.padding.left + this.config.xAxisGridPadding + (this.svgChart.data.xAxis.columns.length * columnWidth));
        }
        this.svgChart.xAxisGroupElement.appendChild(currentXAxisGroupElement);
        this.config.xAxisGridColumnsSelectable && this.svgChart.xAxisGridColumnsSelectableGroupElement.appendChild(currentXAxisGridColumnsSelectableGroupElement);
        this.svgChart.xAxisLabelsGroupElement.appendChild(currentXAxisLabelsGroupElement);
    }
    addXAxisTitle() {
        var x = this.svgChart.isLTR ? (this.svgChart.width - this.config.padding.right - this.config.xAxisGridPadding) : (this.config.padding.left);
        this.svgChart.svg.appendChild(el('text', {
            direction: this.config.dir,
            x: x,
            y: this.svgChart.height - (this.config.xAxisTitleBottom !== null ? this.config.xAxisTitleBottom : this.config.paddingDefault),
            textAnchor: 'end',
            dominantBaseline: 'auto',
            fontFamily: this.config.fontFamily || '',
            fontSize: this.config.axisTitleFontSize || '',
            fill: this.config.xAxisTitleColor || '',
            className: prefixed('text-x-axis-title')
        }, document.createTextNode(this.config.xAxisTitle)));
    }
    addYAxisTitle() {
        var yAxisTitleG = el('g');
        var x = 0;
        if (this.svgChart.isLTR) {
            x = this.config.yAxisTitleStart ? this.config.yAxisTitleStart : this.config.paddingDefault;
        }
        else {
            x = this.config.yAxisTitleStart ? (this.svgChart.width - this.config.yAxisTitleStart) : (this.svgChart.width - this.config.paddingDefault);
        }
        yAxisTitleG.setAttribute('transform', 'translate(' + x + ', ' + (this.config.padding.top + this.config.yAxisGridPadding) + ')');
        var yAxisTitleEl = el('text', {
            direction: this.config.dir,
            textAnchor: 'end',
            dominantBaseline: 'hanging',
            fontFamily: this.config.fontFamily || '',
            fontSize: this.config.axisTitleFontSize || '',
            fill: this.config.yAxisTitleColor || '',
            className: prefixed('text-y-axis-title')
        }, document.createTextNode(this.config.yAxisTitle));
        yAxisTitleEl.setAttribute('transform', this.svgChart.isLTR ? 'rotate(-90)' : 'rotate(90)');
        yAxisTitleG.appendChild(yAxisTitleEl);
        this.svgChart.svg.appendChild(yAxisTitleG);
    }
    /**
     * Adds group for x axis labels.
     */
    addXAxisLabelsGroup() {
        this.svgChart.xAxisLabelsGroupElement = el('g', {
            className: prefixed('x-axis-label-group')
        });
        if (this.config.xAxisGridColumnsSelectable) {
            if (!__classPrivateFieldGet(this, _AxisController_onXAxisLabelGroupClickScoped, "f")) {
                __classPrivateFieldSet(this, _AxisController_onXAxisLabelGroupClickScoped, __classPrivateFieldGet(this, _AxisController_instances, "m", _AxisController_onXAxisLabelGroupClick).bind(this), "f");
                __classPrivateFieldSet(this, _AxisController_onXAxisLabelGroupKeypressScoped, __classPrivateFieldGet(this, _AxisController_instances, "m", _AxisController_onXAxisLabelGroupKeypress).bind(this), "f");
            }
            this.svgChart.addEventListener(this.svgChart.xAxisLabelsGroupElement, 'click', __classPrivateFieldGet(this, _AxisController_onXAxisLabelGroupClickScoped, "f"), false);
            this.svgChart.addEventListener(this.svgChart.xAxisLabelsGroupElement, 'keydown', __classPrivateFieldGet(this, _AxisController_onXAxisLabelGroupKeypressScoped, "f"), false);
            // Group element that wraps the rects that indicates a selected column for line and bar charts.
            this.svgChart.xAxisGridColumnsSelectableGroupElement = this.svgChart.svg.appendChild(el('g', {
                className: prefixed('x-axis-columns-selectable-group')
            }));
        }
        this.svgChart.svg.appendChild(this.svgChart.xAxisLabelsGroupElement);
    }
}
_AxisController_onXAxisLabelGroupClickScoped = new WeakMap(), _AxisController_onXAxisLabelGroupKeypressScoped = new WeakMap(), _AxisController_instances = new WeakSet(), _AxisController_addXAxisLine = function _AxisController_addXAxisLine(parent, x) {
    parent.appendChild(el('line', {
        x1: x,
        y1: this.config.padding.top,
        x2: x,
        y2: this.svgChart.chartHeight + this.config.padding.top + (this.config.yAxisGridPadding * 2),
        className: prefixed('x-axis-grid-line'),
        stroke: this.config.xAxisGridLineColor || '',
        strokeWidth: this.config.xAxisGridLineWidth || '',
        strokeDasharray: this.config.xAxisGridLineDashArray || '',
    }));
}, _AxisController_onXAxisLabelGroupClick = function _AxisController_onXAxisLabelGroupClick(e) {
    __classPrivateFieldGet(this, _AxisController_instances, "m", _AxisController_onXAxisLabelGroupSelect).call(this, e.target);
}, _AxisController_onXAxisLabelGroupSelect = function _AxisController_onXAxisLabelGroupSelect(label) {
    var textNodes = this.svgChart.xAxisLabelsGroupElement.querySelectorAll('text.' + prefixed('x-axis-grid-column-selectable-label'));
    var rects = this.svgChart.xAxisGridColumnsSelectableGroupElement.querySelectorAll('rect.' + prefixed('x-axis-grid-column-selectable'));
    for (var i = 0; i < textNodes.length; i++) {
        if (textNodes[i] === label) {
            this.svgChart.lineAndBarSelectedColumnIndex = i;
            textNodes[i].classList.add(prefixed('selected'));
            textNodes[i].setAttribute('font-weight', 'bold');
            rects[i].classList.add(prefixed('selected'));
            rects[i].setAttribute('fill-opacity', this.svgChart.config.xAxisGridSelectedColumnOpacity.toString());
            if (this.config.onXAxisLabelGroupSelect) {
                this.config.onXAxisLabelGroupSelect(this.svgChart, this.svgChart.lineAndBarSelectedColumnIndex);
            }
        }
        else {
            textNodes[i].classList.remove(prefixed('selected'));
            rects[i].classList.remove(prefixed('selected'));
            rects[i].setAttribute('fill-opacity', '0');
            textNodes[i].setAttribute('font-weight', 'normal');
        }
    }
}, _AxisController_onXAxisLabelGroupKeypress = function _AxisController_onXAxisLabelGroupKeypress(e) {
    if (e.key === 'Enter') {
        __classPrivateFieldGet(this, _AxisController_instances, "m", _AxisController_onXAxisLabelGroupSelect).call(this, e.target);
    }
};
export { AxisController };
