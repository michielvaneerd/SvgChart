(function (window) {

    var scale = window.devicePixelRatio;

    // ************************************************************************
    // Helper functions
    // ************************************************************************
    function getLineX(valueIndex, lineConfig, config) {
        return (valueIndex * lineConfig.columnWidth) + (lineConfig.columnWidth / 2) + config.padding.start;
    }

    function getY(value, chartHeight, lineOrBarConfig, config) {
        return chartHeight - ((value || 0) * lineOrBarConfig.oneSeriesValueHeight) + config.padding.top;
    }

    function getBarXStart(valueIndex, barConfig, config) {
        return (valueIndex * barConfig.columnWidth) + (barConfig.spaceBetweenBars / 2) + config.padding.start;
    }

    function gradient(a, b) {
        return (b.y - a.y) / (b.x - a.x);
    }

    // https://stackoverflow.com/a/28056903
    function hexToRGB(hex, alpha) {
        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);
    
        if (alpha) {
            return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        } else {
            return "rgb(" + r + ", " + g + ", " + b + ")";
        }
    }

    var rgbaReg = /^rgba/;
    var hexReg = /^#/;

    function colorIsRgba(color) {
        return rgbaReg.test(color);
    }

    function colorIsHex(color) {
        return hexReg.test(color);
    }

    function updateRgbAlpha(rgba, newAlpha) {
        return rgba.replace(/,([^,]+)\)$/, function(match, p1) { return ',' + newAlpha + ')'; });
    }



    // ************************************************************************
    // Constructor
    // ************************************************************************
    window.Chart = function (parent, config, data) {

        this.config = this._getConfig(config);

        var parentRect = parent.getBoundingClientRect();
        var parentWidth = parentRect.width;
        var parentHeight = parentRect.height;

        var canvas = document.createElement('canvas');
        canvas.style.width = parentWidth + 'px';
        canvas.style.height = parentHeight + 'px';
        canvas.width = parentWidth * scale;
        canvas.height = parentHeight * scale;
        parent.appendChild(canvas);

        if (this.config.backgroundColor) {
            canvas.style.backgroundColor = this.config.backgroundColor;
        }

        var context = canvas.getContext('2d');
        context.scale(scale, scale);

        // Get highest series value if not given;
        // Update color to rgba if given in hex.
        var maxSeriesValue = config.maxSeriesValue;
        var minSeriesValue = config.minSeriesValue || 0;
        if (typeof maxSeriesValue === 'undefined') {
            maxSeriesValue = 0;
            data.series.forEach(function (serie) {
                if (serie.color && colorIsHex(serie.color)) {
                    serie.color = hexToRGB(serie.color, 1);
                }
                var max = serie.values.reduce(function (a, b) {
                    return Math.max(a, b);
                }, 0);
                if (max > maxSeriesValue) {
                    maxSeriesValue = max;
                }
            });
        }

        // Set general props we need in multiple methods
        this.data = data;
        this.maxSeriesValue = maxSeriesValue;
        this.minSeriesValue = minSeriesValue;
        this.context = context;
        this.chartHeight = parentHeight - this.config.padding.top - this.config.padding.bottom;
        this.chartWidth = parentWidth - this.config.padding.start - this.config.padding.end;
        this.parentWidth = parentWidth;

        data.series.forEach(function (serie, serieIndex) {
            switch (serie.type) {
                case 'line':
                    var lineConfig = this._getLineConfig(this.config.line, serie.config);
                    if (this.config.writeXAxisLabels && serieIndex === 0) {
                        this._drawXAxisLabels(lineConfig);
                        this._drawYAxisLabels(lineConfig);
                    }
                    this._drawLineChart(serie, lineConfig);
                    // this._line(serie, Object.assign(config.line, {
                    //     smoothCurves: true
                    // }));
                    break;
                case 'bar':
                    var barConfig = this._getBarConfig(this.config.bar, serie.config);
                    console.log(barConfig);
                    if (this.config.writeXAxisLabels && serieIndex === 0) {
                        this._drawXAxisLabels(barConfig);
                        this._drawYAxisLabels(barConfig);
                    }
                    this._drawBarChart(serie, barConfig);
                    break;
            }
        }, this);

        if (this.config.legend) {
            this._drawLegend();
        }

    };





    // ************************************************************************
    // Private chart draw methods
    // ************************************************************************
    window.Chart.prototype._drawBarChart = function (serie, barConfig) {
        //barConfig = Object.assign(this._getBarConfig(barConfig), serie.config || {});
        this.context.save();
        this.context.fillStyle = serie.color;
        serie.values.forEach(function (value, valueIndex, values) {
            var x = getBarXStart(valueIndex, barConfig, this.config);
            var y = value * barConfig.oneSeriesValueHeight;
            console.log('Bar: ' + this.data.xAxis.columns[valueIndex] + ' = ' + value);
            this.context.fillRect(x, this.chartHeight - y + this.config.padding.top, barConfig.barWidth, y);
        }, this);
        this.context.restore();
        return barConfig;
    };

    // https://stackoverflow.com/a/39559854
    window.Chart.prototype._drawLineChart = function (serie, lineConfig) {
        //lineConfig = Object.assign(this._getLineConfig(lineConfig), serie.config || {});
        this.context.save();
        this.context.lineJoin = 'round';
        this.context.lineCap = 'round';
        this.context.lineWidth = lineConfig.lineWidth;
        // if (lineConfig.smoothCurves) {
        //     this.context.globalAlpha = 0.4;
        // }
        // If f = 0, this will be a straight line
        var f = 0.3;
        //var t = 0.6;
        var t = 0.6;
        this.context.beginPath();
        this.context.strokeStyle = serie.color;
        var valueLastIndex = serie.values.length - 1;
        var m = 0;
        var dx1 = 0;
        var dy1 = 0;
        var dx2 = 0;
        var dy2 = 0;
        var preP = null;
        var points = [];
        serie.values.forEach(function (value, valueIndex, values) {

            var x = getLineX(valueIndex, lineConfig, this.config);
            //var y = this.chartHeight - ((value || 0) * lineConfig.oneSeriesValueHeight) + this.config.padding.top;
            var y = getY(value, this.chartHeight, lineConfig, this.config);

            var point = { x: x, y: y, value: value };

            if (!lineConfig.connectNullValues && value === null) {
                points.push(point);
                // TODO: Fill area?
                preP = null;
                return;
            }

            console.log('Line: ' + this.data.xAxis.columns[valueIndex] + ' = ' + value);
            if (valueIndex === 0 || preP === null) {
                this.context.moveTo(x, y);
                preP = { x: x, y: y };
            } else {
                var curP = { x: x, y: y };
                if (lineConfig.smoothCurves) {
                    if (valueIndex < valueLastIndex) {
                        var nexP = { x: getLineX(valueIndex + 1, lineConfig, this.config), y: values[valueIndex + 1] * lineConfig.oneSeriesValueHeight };
                        m = gradient(preP, nexP);
                        dx2 = (nexP.x - curP.x) * -f;
                        dy2 = dx2 * m * t;
                    } else {
                        dx2 = 0;
                        dy2 = 0;
                    }
                    this.context.bezierCurveTo(preP.x - dx1, preP.y - dy1, curP.x + dx2, curP.y + dy2, curP.x, curP.y);
                    point.bezier = {
                        cp1x: preP.x - dx1,
                        cp1y: preP.y - dy1,
                        cp2x: curP.x + dx2,
                        cp2y: curP.y + dy2,
                        x: curP.x,
                        y: curP.y
                    };
                    dx1 = dx2;
                    dy1 = dy2;
                } else {
                    this.context.lineTo(x, y);
                }
                preP = curP;
            }

            points.push(point);

        }, this);
        this.context.stroke();
        //this.context.fillStyle = 'rgba(255, 255, 130, 200)';
        //this.context.fill();

        if (lineConfig.points) {
            this.context.beginPath();
            this.context.fillStyle = serie.color;
            points.forEach(function (point) {
                if (point.value === null) {
                    return;
                }
                this.context.moveTo(point.x, point.y);
                this.context.arc(point.x, point.y, lineConfig.pointWidth || (lineConfig.lineWidth * 2), 0, Math.PI * 2);
            }, this);
            this.context.fill();
        }

        if (lineConfig.fillArea) {
            //this.context.fillStyle = serie.color;
            //this.context.fillStyle = 'rgba(245, 40, 145, 0.4)';
            this.context.fillStyle = updateRgbAlpha(serie.color, 0.2);
            points.forEach(function (point, index) {

                if (index + 1 < points.length) {

                    if (!lineConfig.connectNullValues && (point.value === null || points[index + 1].value === null)) {
                        return;
                    }

                    var nextPoint = points[index + 1];

                    console.log('Area voor ' + index + ' en value ' + point.value + ' en x = ' + point.x);
                    this.context.beginPath();
                    this.context.moveTo(point.x, getY(0, this.chartHeight, lineConfig, this.config));

                    this.context.lineTo(point.x, point.y);

                    if (lineConfig.smoothCurves) {
                        this.context.bezierCurveTo(nextPoint.bezier.cp1x, nextPoint.bezier.cp1y, nextPoint.bezier.cp2x, nextPoint.bezier.cp2y, nextPoint.bezier.x, nextPoint.bezier.y);
                    } else {
                        this.context.lineTo(nextPoint.x, nextPoint.y);
                    }
                    this.context.lineTo(nextPoint.x, getY(0, this.chartHeight, lineConfig, this.config));
                    this.context.fill();
                }
            }, this);
            //this.context.fill();
        }

        this.context.restore();
        return lineConfig;
    };


    // TODO: placement, for now end top
    window.Chart.prototype._drawLegend = function () {
        this.context.save();
        this.context.textAlign = 'start';
        this.context.textBaseline = 'top';
        var maxTextWidth = 0;
        var textHeight = 20;
        this.data.series.forEach(function (serie) {
            var width = this.context.measureText(serie.title).width;
            if (width > maxTextWidth) {
                maxTextWidth = width;
            }
        }, this);
        var x = this.parentWidth - maxTextWidth - 10;
        this.data.series.forEach(function (serie, index) {
            var y = this.config.padding.top + (index * textHeight);
            this.context.fillStyle = serie.color;
            this.context.fillRect(x - 20, y, 10, 10);
            this.context.fillStyle = 'black';
            this.context.fillText(serie.title, x, y);
        }, this);
        this.context.restore();
    };


    // ************************************************************************
    // Draw axis labels
    // ************************************************************************
    window.Chart.prototype._drawXAxisLabels = function (lineOrBarConfig) {
        this.context.save();
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.strokeStyle = 'rgba(175, 177, 194, 0.54)';
        this.context.lineWidth = 1;
        this.context.setLineDash([2, 2]);
        this.context.beginPath();
        for (var index = 0; index < this.data.xAxis.columns.length; index += this.config.xAxisStep) {
            var x = getLineX(index, lineOrBarConfig, this.config);
            this.context.fillText(this.data.xAxis.columns[index], x, this.chartHeight + this.config.padding.top + (this.config.padding.bottom / 2));
            var lineX = Math.round(x) + 0.5;
            this.context.moveTo(lineX, this.chartHeight + this.config.padding.top);
            this.context.lineTo(lineX, this.config.padding.top);
        }
        // this.data.xAxis.columns.forEach(function(value, index) {
        //     var x = getLineX(index, lineOrBarConfig, this.config);
        //     this.context.fillText(value, x, this.chartHeight + this.config.padding.top + (this.config.padding.bottom / 2));
        //     var lineX = Math.round(x) + 0.5;
        //     this.context.moveTo(lineX, this.chartHeight + this.config.padding.top);
        //     this.context.lineTo(lineX, this.config.padding.top);
        // }, this);
        this.context.stroke();
        this.context.restore();
    };

    window.Chart.prototype._drawYAxisLabels = function (lineOrBarConfig) {
        this.context.save();
        this.context.textAlign = 'end';
        this.context.textBaseline = 'middle';
        this.context.strokeStyle = 'rgba(175, 177, 194, 0.54)';
        this.context.lineWidth = 1;
        this.context.setLineDash([2, 2]);
        var curValue = this.minSeriesValue;
        this.context.beginPath();
        while (curValue <= this.maxSeriesValue) {
            var y = this.chartHeight - (curValue * lineOrBarConfig.oneSeriesValueHeight) + this.config.padding.top;
            this.context.fillText(curValue, this.config.padding.start / 2, y);
            // Write line?
            // Make sure y.5 if we have line width of 1!
            // see: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors#a_linewidth_example
            var lineY = Math.round(y) + 0.5;
            this.context.moveTo(this.config.padding.start, lineY);
            this.context.lineTo(this.chartWidth + this.config.padding.start, lineY);
            curValue += this.config.yAxisStep;
        }
        this.context.stroke();
        this.context.restore();
    };





    // ************************************************************************
    // Private config methods
    // ************************************************************************
    window.Chart.prototype._getConfig = function (config) {
        if (!config) config = {};
        return Object.assign({
            padding: {
                start: 10,
                end: 10,
                top: 10,
                bottom: 10
            },
            writeXAxisLabels: true,
            yAxisStep: 1,
            yAxisGrid: true,
            xAxisGrid: false,
            xAxisStep: 1,
            legend: false,
        }, config);
    };

    window.Chart.prototype._getBarConfig = function (barConfig, serieConfig) {
        if (!barConfig) barConfig = {};
        if (!serieConfig) serieConfig = {};

        var spaceBetweenBars = ('spaceBetweenBars' in serieConfig)
            ? serieConfig.spaceBetweenBars
            :
            (('spaceBetweenBars' in barConfig)
                ? barConfig.spaceBetweenBars
                : this.chartWidth / this.data.xAxis.columns.length / 2);
        var columnWidth = this.chartWidth / this.data.xAxis.columns.length;
        return Object.assign({
            oneSeriesValueHeight: this.chartHeight / (this.maxSeriesValue - this.minSeriesValue),
            columnWidth: columnWidth,
            barWidth: columnWidth - spaceBetweenBars,
            spaceBetweenBars: spaceBetweenBars
        }, barConfig, serieConfig);
    };

    window.Chart.prototype._getLineConfig = function (lineConfig, serieConfig) {
        if (!lineConfig) lineConfig = {};
        if (!serieConfig) serieConfig = {};
        var columnWidth = this.chartWidth / this.data.xAxis.columns.length;
        return Object.assign({
            smoothCurves: false,
            oneSeriesValueHeight: this.chartHeight / (this.maxSeriesValue - this.minSeriesValue),
            columnWidth: columnWidth,
            lineWidth: 1,
            points: false,
            connectNullValues: false,
            pointWidth: null,
            fillArea: false
        }, lineConfig, serieConfig);
    };

}(this));