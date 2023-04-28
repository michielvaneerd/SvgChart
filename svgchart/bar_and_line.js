/**
 * Main function to visualise data for line or bar chart types.
 * @param {HTMLElement} currentSerieGroupElement The current serie group element
 */
export function dataLineAndBar(currentSerieGroupElement) {

    if (this.xAxisGroupElement.firstChild) {
        this.xAxisGroupElement.removeChild(this.xAxisGroupElement.firstChild);
    }

    if (this.config.xAxisGridColumnsSelectable) {
        if (this.xAxisGridColumnsSelectableGroupElement.firstChild) {
            this.xAxisGridColumnsSelectableGroupElement.firstChild.remove();
        }
    }

    if (this.xAxisLabelsGroupElement.firstChild) {
        this.xAxisLabelsGroupElement.removeChild(this.xAxisLabelsGroupElement.firstChild);
    }

    // Note that for bar charts to display correctly, this.config.xAxisGridColumns MUST be true!
    const columnWidth = this.config.xAxisGridColumns
        ? (this.chartWidth / (this.data.xAxis.columns.length))
        : (this.chartWidth / (this.data.xAxis.columns.length - 1));
    const barWidth = (columnWidth - (this.config.barSpacing * (this.barCountPerColumn + 1))) / (this.barCountPerColumn || 1);

    // Make this available on the instance.
    this.columnWidth = columnWidth;
    this.barWidth = barWidth;

    this.#addXAxisLabels(columnWidth);

    var currentBarIndex = 0;
    var stackedBarValues = []; // value index => current value (steeds optellen)

    this.config.series.forEach(function (serie, serieIndex) {

        var serieGroup = el('g', {
            dataSerie: serie.id,
            className: this.unselectedSeries[serie.id] ? prefixed('unselected') : ''
        });

        var serieType = serie.type || (this.config.chartType === 'lineAndBar' ? 'line' : this.config.chartType);

        switch (serieType) {
            case 'line':
                {
                    var nonNullPoints = [[]]; // Array of arrays, each array consists only of NON NULL points, used for smoot lines when not connecting NULL values and for filled lines charts when not connecting null points
                    var flatNonNullPoints = [];

                    directionForEach(this, this.data.series[serie.id], this.isLTR, function (value, valueIndex, values) {
                        var x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + (this.config.xAxisGridColumns ? (columnWidth / 2) : 0);
                        var y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.lineAndBarValueHeight);

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
                            fill: this.config.lineChartFilled ? this.#getSerieFill(serie, serieIndex) : 'none',
                            fillOpacity: 0.4,
                            stroke: this.#getSerieStrokeColor(serie, serieIndex),
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
                                fill: this.#getSeriePointColor(serie, serieIndex),
                                stroke: this.#getSeriePointColor(serie, serieIndex),
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
                    directionForEach(this, this.data.series[serie.id], this.isLTR, function (value, valueIndex) {

                        var x = null;
                        var y = null;
                        var height = null;
                        if (this.config.barStacked) {
                            if (!stackedBarValues[valueIndex]) stackedBarValues[valueIndex] = this.config.minValue;
                            x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + this.config.barSpacing;
                            y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.lineAndBarValueHeight) - (stackedBarValues[valueIndex] * this.lineAndBarValueHeight);
                            height = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.lineAndBarValueHeight);
                            stackedBarValues[valueIndex] = stackedBarValues[valueIndex] += value;
                        } else {
                            x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + (barWidth * currentBarIndex) + (this.config.barSpacing * (currentBarIndex + 1));
                            height = y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.lineAndBarValueHeight);
                        }

                        serieGroup.appendChild(el('rect', {
                            x: x,
                            y: y,
                            width: barWidth,
                            height: this.chartHeight + this.config.padding.top + this.config.yAxisGridPadding - height,
                            fill: this.#getSerieFill(serie, serieIndex),
                            className: prefixed('bar'),
                            fillOpacity: this.config.barFillOpacity || '',
                            strokeWidth: this.config.barStrokeWidth || 0,
                            stroke: this.#getSerieStrokeColor(serie, serieIndex),
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