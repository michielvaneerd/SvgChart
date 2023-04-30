import { SvgChart } from "./svg.js";
import { el, prefixed, directionForEach } from "./utils.js";

class AxisController {

    #onXAxisLabelGroupClickScoped = null;
    #onXAxisLabelGroupKeypressScoped = null;

    /**
     * 
     * @param {SvgChart} svgChart SvgChart instance.
     */
    constructor(svgChart) {
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
                    this.#addXAxisLine(currentXAxisGroupElement, x);
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
                    transform: `translate(${this.config.padding.left + this.config.xAxisGridPadding + (colIndex * columnWidth) + (this.config.xAxisGridColumns ? (columnWidth / 2) : 0)} ${this.svgChart.chartHeight + this.config.padding.top + (this.config.yAxisGridPadding * 2) + (this.config.xAxisLabelTop || 10)})`
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
                    transform: this.config.xAxisLabelRotation ? `rotate(${this.config.xAxisLabelRotation})` : ''
                }, document.createTextNode(colValue)));
                currentXAxisLabelsGroupElement.appendChild(xlg);
            }
        });
        if (this.config.xAxisGrid && this.config.xAxisGridColumns) {
            this.#addXAxisLine(currentXAxisGroupElement, this.config.padding.left + this.config.xAxisGridPadding + (this.svgChart.data.xAxis.columns.length * columnWidth));
        }
        this.svgChart.xAxisGroupElement.appendChild(currentXAxisGroupElement);
        this.config.xAxisGridColumnsSelectable && this.svgChart.xAxisGridColumnsSelectableGroupElement.appendChild(currentXAxisGridColumnsSelectableGroupElement);
        this.svgChart.xAxisLabelsGroupElement.appendChild(currentXAxisLabelsGroupElement);
    }

    #addXAxisLine(parent, x) {
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
    }

    addXAxisTitle() {
        var x = this.svgChart.isLTR ? (this.svgChart.width - this.config.padding.right - this.config.xAxisGridPadding) : (this.config.padding.left);
        this.svgChart.svg.appendChild(el('text', {
            direction: this.config.dir,
            x: x,
            y: this.svgChart.height - (this.config.xAxisTitleBottom != null ? this.config.xAxisTitleBottom : this.config.paddingNormal),
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
        // By default: x is 20 pixels from start border
        var x = 0;
        if (this.svgChart.isLTR) {
            x = this.config.yAxisTitleStart ? this.config.yAxisTitleStart : this.config.paddingNormal;
        } else {
            x = this.config.yAxisTitleStart ? (this.svgChart.width - this.config.yAxisTitleStart) : (this.svgChart.width - this.config.paddingNormal);
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
            if (!this.#onXAxisLabelGroupClickScoped) {
                this.#onXAxisLabelGroupClickScoped = this.#onXAxisLabelGroupClick.bind(this);
                this.#onXAxisLabelGroupKeypressScoped = this.#onXAxisLabelGroupKeypress.bind(this);
            }
            this.svgChart.addEventListener(this.svgChart.xAxisLabelsGroupElement, 'click', this.#onXAxisLabelGroupClickScoped, false);
            this.svgChart.addEventListener(this.svgChart.xAxisLabelsGroupElement, 'keypress', this.#onXAxisLabelGroupKeypressScoped, false);
            // Group element that wraps the rects that indicates a selected column for line and bar charts.
            this.svgChart.xAxisGridColumnsSelectableGroupElement = this.svgChart.svg.appendChild(el('g', {
                className: prefixed('x-axis-columns-selectable-group')
            }));
        }
        this.svgChart.svg.appendChild(this.svgChart.xAxisLabelsGroupElement);
    }

    /**
     * When a label on the x axis receives a click when focussed.
     * @param {Event} e Event object.
     */
    #onXAxisLabelGroupClick(e) {
        this.#onXAxisLabelGroupSelect(e.target);
    }

    /**
     * Display the selected column indicator and fires the onXAxisLabelGroupSelect callback (if defined).
     * @param {HTMLElement} label Node (x axis label) that is selected.
     */
    #onXAxisLabelGroupSelect(label) {
        var textNodes = this.svgChart.xAxisLabelsGroupElement.querySelectorAll('text.' + prefixed('x-axis-grid-column-selectable-label'));
        var rects = this.svgChart.xAxisGridColumnsSelectableGroupElement.querySelectorAll('rect.' + prefixed('x-axis-grid-column-selectable'));
        for (var i = 0; i < textNodes.length; i++) {
            if (textNodes[i] === label) {
                this.svgChart.lineAndBarSelectedColumnIndex = i;
                textNodes[i].classList.add(prefixed('selected'));
                textNodes[i].setAttribute('font-weight', 'bold');
                rects[i].classList.add(prefixed('selected'));
                rects[i].setAttribute('fill-opacity', 0.2);
                if (this.config.onXAxisLabelGroupSelect) {
                    this.config.onXAxisLabelGroupSelect(this.svgChart, this.svgChart.lineAndBarSelectedColumnIndex);
                }
            } else {
                textNodes[i].classList.remove(prefixed('selected'));
                rects[i].classList.remove(prefixed('selected'));
                rects[i].setAttribute('fill-opacity', 0);
                textNodes[i].setAttribute('font-weight', 'normal');
            }
        }
    }

    #onXAxisLabelGroupKeypress(e) {
        if (e.keyCode === 13) {
            this.#onXAxisLabelGroupSelect(e.target);
        }
    }

}

export { AxisController };