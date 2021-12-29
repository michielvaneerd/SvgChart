(function (window) {

    var scale = window.devicePixelRatio;

    /**
     * In construvtor set global things we can use for all types of charts:
     * - Set config
     * - Set data
     * - Add canvas en set height / width of canvas we can use
     * And then loop through series and for each serie:
     * - Draw the chart we have
     * - This way we can use for example line and bar charts in the same canvas
     */

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
        //this.config = config;
        this.data = data;
        this.highestSeriesValue = highestSeriesValue;
        this.context = context;
        this.parentHeight = parentHeight;
        this.parentWidth = parentWidth;

        data.series.forEach(function (serie, serieIndex) {

            switch (serie.type) {
                case 'line':
                    this._line(serie, config.line);
                    // this._line(serie, {
                    //     smoothCurves: true
                    // });
                    break;
                case 'bar':
                    this._bar(serie, config.bar);
                    break;
            }

        }, this);

    };

    window.Chart.prototype._bar = function (serie, barConfig) {
        barConfig = Object.assign(this._getBarConfig(barConfig), serie.config || {});
        this.context.save();
        this.context.fillStyle = serie.color;
        serie.values.forEach(function (value, valueIndex, values) {
            var x = (valueIndex * barConfig.columnWidth) + (valueIndex * barConfig.spaceBetweenBars) + barConfig.spaceBetweenBars / 2;
            var y = value * barConfig.oneSeriesValueHeight;
            this.context.fillRect(x, this.parentHeight - y, barConfig.columnWidth, y);
        }, this);
        this.context.restore();
    };

    window.Chart.prototype._getBarConfig = function (barConfig) {
        if (!barConfig) barConfig = {};
        var spaceBetweenBars = ('spaceBetweenBars' in barConfig)
            ? barConfig.spaceBetweenBars
            : this.parentWidth / this.data.xAxis.columns.length / 2;
        return Object.assign({
            oneSeriesValueHeight: this.parentHeight / this.highestSeriesValue,
            columnWidth: (this.parentWidth / this.data.xAxis.columns.length) - spaceBetweenBars,
            spaceBetweenBars: spaceBetweenBars
        }, barConfig);
    }

    window.Chart.prototype._getLineConfig = function (lineConfig) {
        if (!lineConfig) lineConfig = {};
        return Object.assign({
            smoothCurves: false,
            oneSeriesValueHeight: this.parentHeight / this.highestSeriesValue,
            columnWidth: this.parentWidth / this.data.xAxis.columns.length
        }, lineConfig);
    }

    // https://stackoverflow.com/a/39559854
    window.Chart.prototype._line = function (serie, lineConfig) {
        lineConfig = Object.assign(this._getLineConfig(lineConfig), serie.config || {});
        this.context.save();
        // if (lineConfig.smoothCurves) {
        //     this.context.globalAlpha = 0.4;
        // }
        // If f = 0, this will be a straight line
        var leftX = lineConfig.columnWidth / 2;
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
            var x = leftX + (valueIndex * lineConfig.columnWidth);
            var y = value * lineConfig.oneSeriesValueHeight;
            console.log('Write ' + x + ', ' + y);
            if (valueIndex === 0) {
                this.context.moveTo(x, y);
                preP = { x: x, y: y };
            } else {
                if (lineConfig.smoothCurves) {
                    var curP = { x: x, y: y };
                    if (valueIndex < valueLastIndex) {
                        var nexP = { x: leftX + ((valueIndex + 1) * lineConfig.columnWidth), y: values[valueIndex + 1] * lineConfig.oneSeriesValueHeight };
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
    };

    function gradient(a, b) {
        return (b.y - a.y) / (b.x - a.x);
    }

}(this));