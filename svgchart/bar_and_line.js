import { prefixed, directionForEach, el } from "./utils.js";
import { Controller } from "./controller.js";

/**
 * Controller class for bar and line charts.
 */
class BarAndLineController extends Controller {

    static requiredConfigWithValue = {
        xAxisGridColumns: true
    };

    #onXAxisLabelGroupClickScoped = null;
    #onXAxisLabelGroupKeypressScoped = null;

    /**
     * Write the data.
     * @param {HTMLElement} currentSerieGroupElement Current serie groep element. Elementes are attached directory to this node.
     */
    draw(currentSerieGroupElement) {
        if (this.svgChart.xAxisGroupElement.firstChild) {
            this.svgChart.xAxisGroupElement.removeChild(this.svgChart.xAxisGroupElement.firstChild);
        }

        if (this.config.xAxisGridColumnsSelectable) {
            if (this.svgChart.xAxisGridColumnsSelectableGroupElement.firstChild) {
                this.svgChart.xAxisGridColumnsSelectableGroupElement.firstChild.remove();
            }
        }

        if (this.svgChart.xAxisLabelsGroupElement.firstChild) {
            this.svgChart.xAxisLabelsGroupElement.removeChild(this.svgChart.xAxisLabelsGroupElement.firstChild);
        }

        // Note that for bar charts to display correctly, this.config.xAxisGridColumns MUST be true!
        const columnWidth = this.config.xAxisGridColumns
            ? (this.svgChart.chartWidth / (this.svgChart.data.xAxis.columns.length))
            : (this.svgChart.chartWidth / (this.svgChart.data.xAxis.columns.length - 1));
        const barWidth = (columnWidth - (this.config.barSpacing * (this.svgChart.barCountPerColumn + 1))) / (this.svgChart.barCountPerColumn || 1);

        // Make this available on the instance.
        this.svgChart.columnWidth = columnWidth;
        this.svgChart.barWidth = barWidth;

        this.#addXAxisLabels(columnWidth);

        var currentBarIndex = 0;
        var stackedBarValues = []; // value index => current value (steeds optellen)

        this.config.series.forEach(function (serie, serieIndex) {

            var serieGroup = el('g', {
                dataSerie: serie.id,
                className: this.svgChart.unselectedSeries[serie.id] ? prefixed('unselected') : ''
            });

            var serieType = serie.type || (this.config.chartType === 'lineAndBar' ? 'line' : this.config.chartType);

            switch (serieType) {
                case 'line':
                    {
                        var nonNullPoints = [[]]; // Array of arrays, each array consists only of NON NULL points, used for smoot lines when not connecting NULL values and for filled lines charts when not connecting null points
                        var flatNonNullPoints = [];

                        directionForEach(this, this.svgChart.data.series[serie.id], this.svgChart.isLTR, function (value, valueIndex, values) {
                            var x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + (this.config.xAxisGridColumns ? (columnWidth / 2) : 0);
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

                            nonNullPoints.forEach(function (currentNonNullPoints) {
                                if (currentNonNullPoints.length > 0) {
                                    let path = this.config.lineCurved ? this.#getCurvedPathFromPoints(currentNonNullPoints) : this.#getStraightPathFromPoints(currentNonNullPoints);
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
                                    tabindex: this.config.showValueOnFocus ? 0 : null
                                }));
                            }, this);
                        }
                    }
                    break;
                case 'bar':
                    {
                        directionForEach(this, this.svgChart.data.series[serie.id], this.svgChart.isLTR, function (value, valueIndex) {

                            var x = null;
                            var y = null;
                            var height = null;
                            if (this.config.barStacked) {
                                if (!stackedBarValues[valueIndex]) stackedBarValues[valueIndex] = this.config.minValue;
                                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + this.config.barSpacing;
                                y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.svgChart.lineAndBarValueHeight) - (stackedBarValues[valueIndex] * this.svgChart.lineAndBarValueHeight);
                                height = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.svgChart.lineAndBarValueHeight);
                                stackedBarValues[valueIndex] = stackedBarValues[valueIndex] += value;
                            } else {
                                x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + (barWidth * currentBarIndex) + (this.config.barSpacing * (currentBarIndex + 1));
                                height = y = this.config.padding.top + this.config.yAxisGridPadding + this.svgChart.chartHeight - (value * this.svgChart.lineAndBarValueHeight);
                            }

                            serieGroup.appendChild(el('rect', {
                                x: x,
                                y: y,
                                width: barWidth,
                                height: this.svgChart.chartHeight + this.config.padding.top + this.config.yAxisGridPadding - height,
                                fill: this.svgChart.getSerieFill(serie, serieIndex),
                                className: prefixed('bar'),
                                fillOpacity: this.config.barFillOpacity || '',
                                strokeWidth: this.config.barStrokeWidth || 0,
                                stroke: this.svgChart.getSerieStrokeColor(serie, serieIndex),
                                dataValue: value,
                                tabindex: this.config.showValueOnFocus ? 0 : null
                            }));

                        });

                        currentBarIndex += 1;

                    }
                    break;
            }

            currentSerieGroupElement.appendChild(serieGroup);
        }, this);
    }

    #addYAxisGrid() {
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

    /**
     * Helper function to get a curved path from an array of points.
     * @param {Array} points Array of points.
     * @returns Array of curved path coordinates.
     */
    #getCurvedPathFromPoints(points) {
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
    #closePath(path, points) {
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
    #getStraightPathFromPoints(points) {
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


    #addXAxisLabels(columnWidth) {
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

    #addXAxisTitle() {
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

    #addYAxisTitle() {
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
    #addXAxisLabelsGroup() {
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

    configBefore() {

        super.configBefore();

        this.svgChart.lineAndBarSelectedColumnIndex = null;
        this.svgChart.lineAndBarValueHeight = this.svgChart.chartHeight / this.config.maxValue;
        this.svgChart.barCountPerColumn = this.config.barStacked ? 1 : 0;

        if (this.config.yAxis) {
            this.#addYAxisGrid();
        }

        if (this.config.xAxisTitle) {
            this.#addXAxisTitle();
        }

        if (this.config.yAxisTitle) {
            this.#addYAxisTitle();
        }

        if (this.config.xAxisLabels) {
            this.#addXAxisLabelsGroup();
        }

        this.svgChart.xAxisGroupElement = this.svgChart.svg.appendChild(el('g', {
            className: prefixed('x-axis-group')
        }));
    }

    configSerieBefore(serie) {

        super.configSerieBefore(serie);

        if (!this.config.barStacked && (serie.type === 'bar' || this.config.chartType === 'bar')) {
            this.svgChart.barCountPerColumn += 1;
        }

    }

}

export { BarAndLineController };






