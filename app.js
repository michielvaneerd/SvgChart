(function(window) {

    var data = {
        xAxis: {
            columns: ['Jan', 'Feb', 'Mar', 'Apr']
        },
        series: [
            {
                type: 'bar',
                name: 'car',
                values: [5, 2, 1, 6],
                color: 'rgba(39, 63, 245, 0.8)'
            },
            {
                type: 'line',
                name: 'train',
                values: [1, 2, 5, 2],
                color: 'rgba(245, 40, 145, 0.8)'
            },
            {
                type: 'line',
                name: 'bike',
                values: [0, 1, 8, 2],
                color: 'rgba(50, 0, 255, 0.8)',
                config: {
                    // You can overrule some "global" config
                    smoothCurves: true
                }
            },
        ]
    };
    var config = {
        // Global line config, can be overruled from within serie.config
        line: {
            smoothCurves: false
        }
    };
    var chart = new window.Chart(document.getElementById('chart'), config, data);

}(this));