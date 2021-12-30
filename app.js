(function (window) {

    var colCount = 26;

    function getRandomInt(max) {
        return Math.ceil(Math.random() * max);
    }

    var data = {
        xAxis: {
            columns: Array.from(Array(colCount).keys()).map(function(key) {
                return key.toString();
            }),
        },
        series: [
            {
                type: 'bar',
                name: 'car',
                title: 'Car',
                values: Array.from(Array(colCount).keys()).map(function(key) {
                    return getRandomInt(20);
                }),
                color: 'green'
            },
            {
                type: 'bar',
                name: 'train',
                title: 'Train',
                values: Array.from(Array(colCount).keys()).map(function(key) {
                    return getRandomInt(20);
                }),
                color: 'yellow',
                config: {
                    spaceBetweenBars: 20
                }
            },
            {
                type: 'line',
                name: 'plane',
                title: 'Plane',
                values: Array.from(Array(colCount).keys()).map(function(key) {
                    return getRandomInt(20);
                }),
                color: 'rgba(245, 40, 145, 0.8)'
            },
            {
                type: 'line',
                name: 'bike',
                title: 'Bike',
                values: Array.from(Array(colCount).keys()).map(function(key) {
                    return getRandomInt(20);
                }),
                color: 'rgba(50, 0, 255, 0.8)',
                config: {
                    // You can overrule some "global" config
                    smoothCurves: true
                }
            },
        ]
    };
    var config = {
        backgroundColor: '#F0F0F0',
        // Always set every nested properties! So don't just set padding.top and leave the rest
        padding: {
            top: 10,
            bottom: 30,
            start: 30,
            end: 100
        },
        maxSeriesValue: 20,
        yAxisStep: 5,
        xAxisStep: 5,
        legend: true,
        // Global line config, can be overruled from within serie.config
        line: {
            lineWidth: 2,
            smoothCurves: false
        },
        bar: {
            spaceBetweenBars: 10,
        }
    };
    var chart = new window.Chart(document.getElementById('chart'), config, data);

}(this));