(function (window) {

    var scale = window.devicePixelRatio;

    // ************************************************************************
    // Helper functions
    // ************************************************************************
    function getFollowBarsColumnWidth(chartWidth, data, spaceBetweenBars) {
        return (chartWidth - ((data.xAxis.columns.length - 1) * spaceBetweenBars)) / data.xAxis.columns.length;
    }

    function getSpaceBetweenBars(config, chartWidth, data) {
        return ('spaceBetweenBars' in config)
            ? config.spaceBetweenBars
            : chartWidth / data.xAxis.columns.length / 2;
    }

    function getLineX(valueIndex, lineConfig, config) {
        return lineConfig.followBars
            ? (getBarXStart(valueIndex, lineConfig, config) + lineConfig.columnWidth / 2)
            : ((valueIndex * lineConfig.columnWidth) + config.padding.start);
    }

    function getBarXStart(valueIndex, barConfig, config) {
        return (valueIndex * barConfig.columnWidth) + (valueIndex * barConfig.spaceBetweenBars) + config.padding.start;
    }

    function gradient(a, b) {
        return (b.y - a.y) / (b.x - a.x);
    }





    // ************************************************************************
    // Constructor
    // ************************************************************************
    window.Chart = function (parent, config, data) {

        var parentRect = parent.getBoundingClientRect();
        var parentWidth = parentRect.width;
        var parentHeight = parentRect.height;

        var canvas = document.createElement('canvas');
        canvas.style.width = parentWidth + 'px';
        canvas.style.height = parentHeight + 'px';
        canvas.width = parentWidth * scale;
        canvas.height = parentHeight * scale;
        parent.appendChild(canvas);

        var context = canvas.getContext('2d');
        context.scale(scale, scale);

        // Get highest series value if not given;
        var highestSeriesValue = config.seriesHighestValue;
        if (typeof highestSeriesValue === 'undefined') {
            highestSeriesValue = 0;
            data.series.forEach(function (serie) {
                var max = serie.values.reduce(function (a, b) {
                    return Math.max(a, b);
                }, 0);
                if (max > highestSeriesValue) {
                    highestSeriesValue = max;
                }
            });
        }

        // Set general props we need in multiple methods
        this.config = this._getConfig(config);
        this.data = data;
        this.highestSeriesValue = highestSeriesValue;
        this.context = context;
        this.chartHeight = parentHeight - this.config.padding.top - this.config.padding.bottom;
        this.chartWidth = parentWidth - this.config.padding.start - this.config.padding.end;

        data.series.forEach(function (serie, serieIndex) {
            switch (serie.type) {
                case 'line':
                    var lineConfig = this._drawLineChart(serie, config.line);
                    if (this.config.writeXAxisLabels && serieIndex === 0) {
                        this._drawXAxisLabels(lineConfig);
                    }
                    // this._line(serie, Object.assign(config.line, {
                    //     smoothCurves: true
                    // }));
                    break;
                case 'bar':
                    var barConfig = this._drawBarChart(serie, config.bar);
                    if (this.config.writeXAxisLabels && serieIndex === 0) {
                        this._drawXAxisLabels(barConfig);
                    }
                    break;
            }
        }, this);

    };





    // ************************************************************************
    // Private chart draw methods
    // ************************************************************************
    window.Chart.prototype._drawBarChart = function (serie, barConfig) {
        barConfig = Object.assign(this._getBarConfig(barConfig), serie.config || {});
        this.context.save();
        this.context.fillStyle = serie.color;
        serie.values.forEach(function (value, valueIndex, values) {
            var x = getBarXStart(valueIndex, barConfig, this.config);
            var y = value * barConfig.oneSeriesValueHeight;
            this.context.fillRect(x, this.chartHeight - y + this.config.padding.top, barConfig.columnWidth, y);
        }, this);
        this.context.restore();
        return barConfig;
    };

    // https://stackoverflow.com/a/39559854
    window.Chart.prototype._drawLineChart = function (serie, lineConfig) {
        lineConfig = Object.assign(this._getLineConfig(lineConfig), serie.config || {});
        this.context.save();
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
            console.log('Write ' + x + ', ' + y);
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
    // Draw xAxis labels
    // ************************************************************************
    window.Chart.prototype._drawXAxisLabels = function(lineOrBarConfig) {
        this.context.save();
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.data.xAxis.columns.forEach(function(value, index) {
            var x = getLineX(index, lineOrBarConfig, this.config);
            console.log(value + " = " + x);
            this.context.fillText(value, x, this.chartHeight + this.config.padding.top + (this.config.padding.bottom / 2));
        }, this);
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
            writeXAxisLabels: true
        }, config);
    };

    window.Chart.prototype._getBarConfig = function (barConfig) {
        if (!barConfig) barConfig = {};
        var spaceBetweenBars = getSpaceBetweenBars(barConfig, this.chartWidth, this.data);
        return Object.assign({
            followBars: true,
            oneSeriesValueHeight: this.chartHeight / this.highestSeriesValue,
            columnWidth: getFollowBarsColumnWidth(this.chartWidth, this.data, spaceBetweenBars),
            spaceBetweenBars: spaceBetweenBars
        }, barConfig);
    };

    window.Chart.prototype._getLineConfig = function (lineConfig) {
        if (!lineConfig) lineConfig = {};
        var followBars = !!lineConfig.followBars;
        var spaceBetweenBars = getSpaceBetweenBars(lineConfig, this.chartWidth, this.data);
        var columnWidth = followBars
            ? getFollowBarsColumnWidth(this.chartWidth, this.data, spaceBetweenBars)
            : (this.chartWidth / (this.data.xAxis.columns.length - 1));
        return Object.assign({
            spaceBetweenBars: spaceBetweenBars,
            followBars: followBars,
            smoothCurves: false,
            oneSeriesValueHeight: this.chartHeight / this.highestSeriesValue,
            columnWidth: columnWidth
        }, lineConfig);
    };

}(this));