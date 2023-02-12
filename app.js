(function (window) {

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    var config = {
        title: 'Chart title',
        legend: true,
        highlightClickedColumn: false,
        backgroundColor: '#E0E0E0',
        xAxisGridLineHalf: false,
        xAxisGridDashed: true,
        yAxisGridDashed: true,
        yAxisMax: 100,
        xAxisStep: 1,
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
            connectNullValues: false,
            smooth: false,
            pointWidth: 4
        },
        barChart: {
            spaceBetweenBars: 20
        }
    };

    var data = {
        series: [
            {
                name: 'nose',
                title: 'Nose',
                type: 'line',
                color: '#CCAA00',
                values: Array(20).fill(10).map((value, index) => getRandomIntInclusive(0, 100))
            },
            {
                name: 'ear',
                title: 'Ear',
                type: 'line',
                color: 'rgba(255, 0, 0, 0.8)',
                values: Array(20).fill(10).map((value, index) => getRandomIntInclusive(0, 100))
            },
            {
                name: 'eye',
                title: 'Eye',
                type: 'bar',
                color: 'rgba(12, 123, 255, 0.5)',
                values: Array(20).fill(20).map((value, index) => getRandomIntInclusive(0, 100))
            }
        ],
        xAxis: {
            columns: Array(20).fill(1).map((value, index) => value + index)
        }
    };

    var chart = new window.Chart(document.getElementById('chart'), config);
    chart.draw(data);

}(this));