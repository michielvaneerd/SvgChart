(function () {

    const ns = 'http://www.w3.org/2000/svg';
    const attributesCamelCaseToDashRegex = /[A-Z]/g;

    window.SvgChart = function (parent, config) {

        // Initialize variables
        this.parent = parent;
        this.config = config;
        this.data = null;
        this.selectedSeries = {};
        this.xAxisLineGroupElement = null; // g element
        this.serieLineGroupElement = null; // g element

        const parentRect = parent.getBoundingClientRect();

        this.width = parentRect.width;
        this.height = parentRect.height;
        this.chartWidth = this.width - this.config.padding.left - this.config.padding.right;
        this.chartHeight = this.height - this.config.padding.top - this.config.padding.bottom;

        // Add SVG element to parent
        this.svg = el('svg', {
            width: this.width,
            height: this.height
        })
        this.parent.appendChild(this.svg);

        this.valueHeight = this.chartHeight / this.config.maxValue;

        this.config.series.forEach(function (serie, serieIndex) {
            this.selectedSeries[serie.id] = true;
        }, this);

    };

    window.SvgChart.prototype.drawConfig = function () {

        var me = this;

        var gYAxis = el('g');
        var currentYAxisValue = this.config.minValue;
        while (currentYAxisValue <= this.config.maxValue) {
            var y = this.config.padding.top + this.chartHeight - (currentYAxisValue * this.valueHeight);
            if (this.config.yAxisGrid) {
                gYAxis.appendChild(el('line', {
                    x1: this.config.padding.left,
                    y1: y,
                    x2: this.config.padding.left + this.chartWidth,
                    y2: y,
                    stroke: '#C0C0C0',
                    strokeWidth: 1
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

        if (this.config.legend) {
            var gLegend = el('g');
            if (this.config.legendSelect) {
                gLegend.addEventListener('click', function (e) {
                    var g = parent(e.target, 'g');
                    if (g && g.dataset.serie) {
                        me.selectedSeries[g.dataset.serie] = !me.selectedSeries[g.dataset.serie];
                        if (me.selectedSeries[g.dataset.serie]) {
                            g.classList.remove('unselected');
                        } else {
                            g.classList.add('unselected');
                        }
                        me.drawData();
                    }
                });
            }
            this.config.series.forEach(function (serie, serieIndex) {
                var gSerie = el('g', {
                    dataSerie: serie.id
                });
                gSerie.appendChild(el('rect', {
                    x: this.config.padding.left + this.chartWidth + 10,
                    y: this.config.padding.top + (serieIndex * 20),
                    width: 10,
                    height: 10,
                    fill: serie.color
                }));
                gSerie.appendChild(el('text', {
                    x: this.config.padding.left + this.chartWidth + 30,
                    y: this.config.padding.top + (serieIndex * 20) + 5,
                    textAnchor: 'start',
                    dominantBaseline: 'middle'
                }, document.createTextNode(serie.title)));
                gLegend.appendChild(gSerie);
            }, this);
            this.svg.appendChild(gLegend);
        }

    };

    window.SvgChart.prototype.drawData = function (data = null) {

        // var me = this;

        if (data !== null) {
            this.data = data;
        }

        if (this.xAxisLineGroupElement && this.xAxisLineGroupElement.parentNode) {
            this.xAxisLineGroupElement.parentNode.removeChild(this.xAxisLineGroupElement);
            this.xAxisLineGroupElement = null;
        }
        if (this.serieLineGroupElement && this.serieLineGroupElement.parentNode) {
            this.serieLineGroupElement.parentNode.removeChild(this.serieLineGroupElement);
            this.serieLineGroupElement = null;
        }

        const columnWidth = this.chartWidth / (this.data.xAxis.columns.length - 1);

        // Draw xAxis lines
        this.xAxisLineGroupElement = el('g');
        this.data.xAxis.columns.forEach(function (colValue, colIndex) {
            if (this.config.xAxisGrid) {
                this.xAxisLineGroupElement.appendChild(el('line', {
                    x1: this.config.padding.left + (colIndex * columnWidth),
                    y1: this.config.padding.top,
                    x2: this.config.padding.left + (colIndex * columnWidth),
                    y2: this.chartHeight + this.config.padding.top,
                    stroke: '#C0C0C0',
                    strokeWidth: 1
                }));
            }
            if (this.config.xAxisLabels) {
                this.xAxisLineGroupElement.appendChild(el('text', {
                    x: this.config.padding.left + (colIndex * columnWidth),
                    y: this.chartHeight + this.config.padding.top + 10,
                    textAnchor: 'middle',
                    dominantBaseline: 'hanging'
                }, document.createTextNode(colValue)));
            }
        }, this);
        this.svg.appendChild(this.xAxisLineGroupElement);

        // Draw serie lines
        this.serieLineGroupElement = el('g');
        this.config.series.forEach(function (serie, serieIndex) {
            if (!this.selectedSeries[serie.id]) {
                return;
            }
            var path = [];
            this.data.series[serie.id].forEach(function (value, valueIndex) {
                var x = this.config.padding.left + (valueIndex * columnWidth);
                var y = this.config.padding.top + this.chartHeight - (value * this.valueHeight);
                if (valueIndex === 0) {
                    path.push(`M ${x} ${y}`);
                } else {
                    path.push(`L ${x} ${y}`);
                }
            }, this);
            this.serieLineGroupElement.appendChild(el('path', {
                d: path.join(' '),
                fill: 'none',
                stroke: serie.color,
                strokeWidth: 2
            }));
        }, this);
        this.svg.appendChild(this.serieLineGroupElement);



    };

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
            el.setAttribute(key.replaceAll(attributesCamelCaseToDashRegex, "-$&").toLowerCase(), attributes[key]);
        });
        if (child) {
            el.appendChild(child);
        }
        return el;
    }

}());