(function (window) {

    var config = {
        title: 'Chart title',
        legend: true,
        highlightClickedColumn: false,
        backgroundColor: '#E0E0E0',
        xAxisGridLineHalf: true,
        xAxisGridDashed: true,
        yAxisGridDashed: true,
        yAxisMax: 100,
        yAxisMin: 0,
        yAxisTitle: 'Dit is een test!',
        xAxisTitle: 'Dit is een test!',
        padding: {
            start: 80,
            top: 80,
            end: 160,
            bottom: 80
        },
        lineChart: {
            width: 2,
            showPoints: true,
            showClickedPointValue: true,
            //pointWidth: 10
        }
    };

    var data = {
        series: [
            {
                name: 'nose',
                title: 'Nose',
                type: 'line',
                color: '#CCAA00',
                values: [20, 0, 60, 70, 56, 23, 100]
            },
            {
                name: 'eye',
                title: 'Eye',
                type: 'line',
                color: '#ABABAB',
                values: [10, 35, 60, 23, 26, 45, 89]
            }
        ],
        xAxis: {
            columns: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']
        }
    };

    var chart = new window.Chart(document.getElementById('chart'), config);
    chart.draw(data);

}(this));