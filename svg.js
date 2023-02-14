(function () {

    const ns = 'http://www.w3.org/2000/svg';
    const attributesCamelCaseToDashRegex = /[A-Z]/g;

    window.SvgChart = function (parent, config) {

        // Initialize variables
        this.parent = parent;
        this.config = config;
        this._data = null;
        this.unselectedSeries = {};
        this.selectedColumnIndex = null;
        this.xAxisLineGroupElement = null; // g element
        this.serieLineGroupElement = null; // g element
        this.xAxisGridColumnsSelectableGroupElement = null; // g element
        this.xAxisLabelsGroupElement = null;

        const parentRect = parent.getBoundingClientRect();

        this.width = parentRect.width;
        this.height = parentRect.height;
        this.chartWidth = this.width - this.config.padding.left - this.config.padding.right - (this.config.xAxisGridPadding * 2);
        this.chartHeight = this.height - this.config.padding.top - this.config.padding.bottom - (this.config.yAxisGridPadding * 2);

        // Add SVG element to parent
        this.svg = el('svg', {
            width: this.width,
            height: this.height
        })
        this.parent.appendChild(this.svg);

        this.valueHeight = this.chartHeight / this.config.maxValue;

        this.onXAxisLabelGroupClickScoped = scopedFunction(this, this.onXAxisLabelGroupClick);
        this.onSerieGroupClickScoped = scopedFunction(this, this.onSerieGroupClick);

    };

    window.SvgChart.prototype.init = function () {

        var me = this;

        var gYAxis = el('g');
        var currentYAxisValue = this.config.minValue;
        while (currentYAxisValue <= this.config.maxValue) {
            var y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (currentYAxisValue * this.valueHeight);
            if (this.config.yAxisGrid) {
                gYAxis.appendChild(el('line', {
                    x1: this.config.padding.left,
                    y1: y,
                    x2: this.config.padding.left + this.chartWidth + (this.config.xAxisGridPadding * 2),
                    y2: y,
                    stroke: '#C0C0C0',
                    strokeWidth: 1,
                    strokeDasharray: this.config.xAxisGridDash || ''
                }));
            }
            if (this.config.yAxisLabels) {
                gYAxis.appendChild(el('text', {
                    x: this.config.padding.left - 10,
                    y: y,
                    textAnchor: 'end',
                    dominantBaseline: 'middle'
                }, document.createTextNode(currentYAxisValue)));
            }
            currentYAxisValue += this.config.yAxisStep;
        }
        this.svg.appendChild(gYAxis);

        if (this.config.title) {
            this.svg.appendChild(el('text', {
                x: this.width / 2,
                y: 20,
                textAnchor: 'middle',
                dominantBaseline: 'hanging',
                className: 'text-title'
            }, document.createTextNode(this.config.title)));
        }

        if (this.config.xAxisTitle) {
            this.svg.appendChild(el('text', {
                x: this.width - this.config.padding.right - this.config.xAxisGridPadding,
                y: this.height - 20,
                textAnchor: 'end',
                dominantBaseline: 'auto',
                className: 'text-title'
            }, document.createTextNode(this.config.xAxisTitle)));
        }

        if (this.config.yAxisTitle) {
            var yAxisTitleG = el('g');
            yAxisTitleG.setAttribute('transform', 'translate(20, ' + (this.config.padding.top + this.config.yAxisGridPadding) + ')');
            var yAxisTitleEl = el('text', {
                textAnchor: 'end',
                dominantBaseline: 'hanging',
                className: 'text-title'
            }, document.createTextNode(this.config.yAxisTitle));
            yAxisTitleEl.setAttribute('transform', 'rotate(-90)');
            yAxisTitleG.appendChild(yAxisTitleEl);
            this.svg.appendChild(yAxisTitleG);
        }

        if (this.config.legend) {
            var gLegend = el('g');
            if (this.config.legendSelect) {
                gLegend.addEventListener('click', function (e) {
                    e.preventDefault();
                    var g = parent(e.target, 'g');
                    if (g && g.dataset.serie) {
                        if (me.unselectedSeries[g.dataset.serie]) {
                            g.classList.remove('unselected');
                            me.serieLineGroupElement.appendChild(me.unselectedSeries[g.dataset.serie]);
                            delete me.unselectedSeries[g.dataset.serie];
                        } else {
                            g.classList.add('unselected');
                            me.unselectedSeries[g.dataset.serie] = me.serieLineGroupElement.querySelector('g[data-serie="' + g.dataset.serie + '"]');
                            me.serieLineGroupElement.removeChild(me.unselectedSeries[g.dataset.serie]);
                        }
                    }
                });
            }
            this.config.series.forEach(function (serie, serieIndex) {
                var gSerie = el('g', {
                    dataSerie: serie.id
                });
                gSerie.appendChild(el('rect', {
                    x: this.config.padding.left + this.chartWidth + (this.config.xAxisGridPadding * 2) + 20,
                    y: this.config.padding.top + this.config.yAxisGridPadding + (serieIndex * 20),
                    width: 10,
                    height: 10,
                    fill: serie.color
                }));
                gSerie.appendChild(el('text', {
                    x: this.config.padding.left + this.chartWidth + (this.config.xAxisGridPadding * 2) + 40,
                    y: this.config.padding.top + this.config.yAxisGridPadding + (serieIndex * 20) + 5,
                    textAnchor: 'start',
                    dominantBaseline: 'middle'
                }, document.createTextNode(serie.title)));
                gLegend.appendChild(gSerie);
            }, this);
            this.svg.appendChild(gLegend);
        }

    };

    window.SvgChart.prototype.onSerieGroupClick = function(e) {
        var circle = e.target;
        var g = parent(circle, 'g');
        var serie = g.dataset.serie;
        console.log(circle.dataset.value + ' for ' + serie);
    };

    window.SvgChart.prototype.onXAxisLabelGroupClick = function (e) {
        var textNodes = this.xAxisLabelsGroupElement.querySelectorAll('text.x-axis-grid-columns-selectable-label');
        var rects = this.xAxisGridColumnsSelectableGroupElement.querySelectorAll('rect.x-axis-grid-columns-selectable');
        for (var i = 0; i < textNodes.length; i++) {
            if (textNodes[i] === e.target) {
                this.selectedColumnIndex = i;
                textNodes[i].classList.add('selected');
                rects[i].classList.add('selected');
            } else {
                textNodes[i].classList.remove('selected');
                rects[i].classList.remove('selected');
            }
        }
    };

    window.SvgChart.prototype.data = function (data = null) {

        if (data !== null) {
            this._data = data;
        }

        if (this.xAxisLineGroupElement && this.xAxisLineGroupElement.parentNode) {
            this.xAxisLineGroupElement.parentNode.removeChild(this.xAxisLineGroupElement);
            this.xAxisLineGroupElement = null;
        }
        if (this.serieLineGroupElement && this.serieLineGroupElement.parentNode) {
            this.serieLineGroupElement.removeEventListener('click', this.onSerieGroupClickScoped);
            this.serieLineGroupElement.parentNode.removeChild(this.serieLineGroupElement);
            this.serieLineGroupElement = null;
        }
        if (this.xAxisGridColumnsSelectableGroupElement && this.xAxisGridColumnsSelectableGroupElement.parentNode) {
            this.xAxisGridColumnsSelectableGroupElement.parentNode.removeChild(this.xAxisGridColumnsSelectableGroupElement);
            this.xAxisGridColumnsSelectableGroupElement = null;
        }
        if (this.xAxisLabelsGroupElement && this.xAxisLabelsGroupElement.parentNode) {
            this.xAxisLabelsGroupElement.removeEventListener('click', this.onXAxisLabelGroupClickScoped);
            this.xAxisLabelsGroupElement.parentNode.removeChild(this.xAxisLabelsGroupElement);
            this.xAxisLabelsGroupElement = null;
        }

        const columnWidth = this.config.xAxisGridColumns
            ? (this.chartWidth / (this._data.xAxis.columns.length))
            : (this.chartWidth / (this._data.xAxis.columns.length - 1));

        // Draw xAxis lines
        this.xAxisLineGroupElement = el('g');
        this.xAxisLabelsGroupElement = el('g');
        this.xAxisLabelsGroupElement.addEventListener('click', this.onXAxisLabelGroupClickScoped);
        this.xAxisGridColumnsSelectableGroupElement = el('g');
        this._data.xAxis.columns.forEach(function (colValue, colIndex) {
            if (this.config.xAxisGrid) {
                const x = this.config.padding.left + this.config.xAxisGridPadding + (colIndex * columnWidth);
                this.xAxisLineGroupElement.appendChild(el('line', {
                    x1: x,
                    y1: this.config.padding.top,
                    x2: x,
                    y2: this.chartHeight + this.config.padding.top + (this.config.yAxisGridPadding * 2),
                    stroke: '#C0C0C0',
                    strokeWidth: 1,
                    strokeDasharray: this.config.yAxisGridDash || ''
                }));
                if (this.config.xAxisGridColumnsSelectable) {
                    this.xAxisGridColumnsSelectableGroupElement.appendChild(el('rect', {
                        x: x,
                        y: this.config.padding.top + this.config.yAxisGridPadding,
                        width: columnWidth,
                        height: this.chartHeight,
                        fill: 'red',
                        strokeWidth: 1,
                        className: 'x-axis-grid-columns-selectable'
                    }));
                }
            }
            if (this.config.xAxisLabels) {
                this.xAxisLabelsGroupElement.appendChild(el('text', {
                    x: this.config.padding.left + this.config.xAxisGridPadding + (colIndex * columnWidth) + (this.config.xAxisGridColumns ? (columnWidth / 2) : 0),
                    y: this.chartHeight + this.config.padding.top + (this.config.yAxisGridPadding * 2) + 10,
                    textAnchor: 'middle',
                    dominantBaseline: 'hanging',
                    className: this.config.xAxisGridColumnsSelectable ? 'x-axis-grid-columns-selectable-label' : ''
                }, document.createTextNode(colValue)));
            }
        }, this);
        if (this.config.xAxisGrid && this.config.xAxisGridColumns) {
            this.xAxisLineGroupElement.appendChild(el('line', {
                x1: this.config.padding.left + this.config.xAxisGridPadding + (this._data.xAxis.columns.length * columnWidth),
                y1: this.config.padding.top,
                x2: this.config.padding.left + this.config.xAxisGridPadding + (this._data.xAxis.columns.length * columnWidth),
                y2: this.chartHeight + this.config.padding.top + (this.config.yAxisGridPadding * 2),
                stroke: '#C0C0C0',
                strokeWidth: 1,
                strokeDasharray: this.config.yAxisGridDash || ''
            }));
        }
        this.svg.appendChild(this.xAxisLineGroupElement);
        this.svg.appendChild(this.xAxisGridColumnsSelectableGroupElement);
        this.svg.appendChild(this.xAxisLabelsGroupElement);

        // Draw serie lines
        this.serieLineGroupElement = el('g');
        this.serieLineGroupElement.addEventListener('click', this.onSerieGroupClickScoped);
        this.config.series.forEach(function (serie, serieIndex) {
            if (this.unselectedSeries[serie.id]) {
                return;
            }
            var serieGroup = el('g', {
                dataSerie: serie.id
            });
            var path = [];
            var points = [];
            var previousValue = null;
            this._data.series[serie.id].forEach(function (value, valueIndex) {
                var x = this.config.padding.left + this.config.xAxisGridPadding + (valueIndex * columnWidth) + (this.config.xAxisGridColumns ? (columnWidth / 2) : 0);
                var y = this.config.padding.top + this.config.yAxisGridPadding + this.chartHeight - (value * this.valueHeight);
                if (valueIndex === 0 || (!this.config.connectNullValues && (value === null || previousValue === null))) {
                    path.push(`M ${x} ${y}`);
                } else {
                    if (value !== null) {
                        path.push(`L ${x} ${y}`);
                    }
                }
                if (value !== null && this.config.points) {
                    points.push({ x: x, y: y, value: value });
                }
                previousValue = value;
            }, this);
            serieGroup.appendChild(el('path', {
                d: path.join(' '),
                fill: 'none',
                stroke: serie.color,
                strokeWidth: this.config.lineWidth
            }));
            points.forEach(function (point) {
                serieGroup.appendChild(el('circle', {
                    cx: point.x,
                    cy: point.y,
                    r: this.config.pointRadius,
                    zIndex: 1,
                    fill: serie.color,
                    stroke: serie.color,
                    dataValue: point.value
                }));
            }, this);
            this.serieLineGroupElement.appendChild(serieGroup);
        }, this);
        this.svg.appendChild(this.serieLineGroupElement);
    };

    function scopedFunction(me, func) {
        return (function (arg) {
            func.call(me, arg);
        });
    }

    function parent(currentElement, parentName) {
        var el = currentElement;
        while (el && el.nodeName.toLowerCase() !== parentName.toLowerCase()) {
            el = el.parentNode;
        }
        return el;
    }

    function el(name, attributes = {}, child = null) {
        var el = document.createElementNS(ns, name);
        Object.keys(attributes).forEach(function (key) {
            switch (key) {
                case 'className':
                    if (attributes[key]) {
                        el.classList.add(...attributes[key].split(' '));
                    }
                    break;
                default:
                    el.setAttribute(key.replaceAll(attributesCamelCaseToDashRegex, "-$&").toLowerCase(), attributes[key]);
                    break;
            }
        });
        if (child) {
            el.appendChild(child);
        }
        return el;
    }

}());