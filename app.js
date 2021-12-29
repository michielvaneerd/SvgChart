(function (window) {

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    var data = {
        xAxis: {
            columns: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        series: [
            {
                type: 'bar',
                name: 'car',
                values: Array.from(Array(12).keys()).map(function(key) {
                    return getRandomInt(20);
                }),
                color: 'rgba(39, 63, 245, 0.8)'
            },
            {
                type: 'line',
                name: 'train',
                values: Array.from(Array(12).keys()).map(function(key) {
                    return getRandomInt(20);
                }),
                color: 'rgba(245, 40, 145, 0.8)'
            },
            {
                type: 'line',
                name: 'bike',
                values: Array.from(Array(12).keys()).map(function(key) {
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
        // Always set every nested properties! So don't just set padding.top and leave the rest
        padding: {
            top: 10,
            bottom: 30,
            start: 10,
            end: 10
        },
        // Global line config, can be overruled from within serie.config
        line: {
            smoothCurves: false,
            followBars: true, // line points will be center of bars on x axis, can only be set for complete chart
        }
    };
    var chart = new window.Chart(document.getElementById('chart'), config, data);

}(this));