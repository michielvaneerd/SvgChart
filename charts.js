(function (window) {

    var scale = window.devicePixelRatio;

    // ************************************************************************
    // Helper functions
    // ************************************************************************
    function getLineX(valueIndex, lineConfig, config) {
        return (valueIndex * lineConfig.columnWidth) + (lineConfig.columnWidth / 2) + config.padding.start;
    }

    function getBarXStart(valueIndex, barConfig, config) {
        return (valueIndex * barConfig.columnWidth) + (barConfig.spaceBetweenBars / 2) + config.padding.start;
    }

    function gradient(a, b) {
        return (b.y - a.y) / (b.x - a.x);
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
        var maxSeriesValue = config.maxSeriesValue;
        var minSeriesValue = config.minSeriesValue || 0;
        if (typeof maxSeriesValue === 'undefined') {
            maxSeriesValue = 0;
            data.series.forEach(function (serie) {
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
        serie.values.forEach(function (value, valueIndex, values) {
            var x = getLineX(valueIndex, lineConfig, this.config);
            var y = this.chartHeight - (value * lineConfig.oneSeriesValueHeight) + this.config.padding.top;
            console.log('Line: ' + this.data.xAxis.columns[valueIndex] + ' = ' + value);
            if (valueIndex === 0) {
                this.context.moveTo(x, y);
                preP = { x: x, y: y };
            } else {
                if (lineConfig.smoothCurves) {
                    var curP = { x: x, y: y };
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
                    dx1 = dx2;
                    dy1 = dy2;
                    preP = curP;
                } else {
                    this.context.lineTo(x, y);
                }
            }
        }, this);
        this.context.stroke();
        this.context.restore();
        return lineConfig;
    };





    // ************************************************************************
    // Draw axis labels
    // ************************************************************************
    window.Chart.prototype._drawXAxisLabels = function(lineOrBarConfig) {
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

    window.Chart.prototype._drawYAxisLabels = function(lineOrBarConfig) {
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
            lineWidth: 1
        }, lineConfig, serieConfig);
    };

}(this));