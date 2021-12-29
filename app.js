(function(window) {

    var data = {
        xAxis: {
            columns: ['Jan', 'Feb', 'Mar', 'Apr']
        },
        series: [
            {
                type: 'line',
                name: 'train',
                values: [1, 2, 5, 2],
                color: 'rgba(245, 40, 145, 0.8)'
            },
            {
                type: 'line',
                name: 'car',
                values: [0, 2, 1, 6],
                color: 'rgba(39, 63, 245, 0.8)'
            }
        ]
    };
    var config = {
        smoothCurves: true
    };
    var chart = new window.Chart(document.getElementById('chart'), config, data);

}(this));