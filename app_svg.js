(function () {

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // This will stay the same between each draw
    var config = {
        maxValue: 100,
        minValue: 0,
        yAxisStep: 20,
        legend: true,
        legendSelect: true,
        yAxisGrid: true,
        yAxisLabels: true,
        xAxisGrid: true,
        xAxisGridPadding: 6,
        yAxisGridPadding: 6,
        xAxisGridDash: '2,2', // stroke-dasharray
        yAxisGridDash: '2,2', // stroke-dasharray
        xAxisLabels: true,
        xAxisGridColumns: true, // we have now columns we can select / deselect instead of just x axis lines, so it is similar to bar charts
        xAxisGridColumnsSelectable: true,
        title: 'De titel',
        yAxisTitle: 'Dit is de Y-as',
        xAxisTitle: 'Dit is de X-as',
        connectNullValues: false,
        lineWidth: 3,
        pointRadius: 6,
        points: true,
        padding: {
            top: 80,
            left: 100,
            right: 160,
            bottom: 80
        },
        series: [
            {
                title: 'Nose',
                id: 'nose',
                color: 'orange'
            },
            {
                title: 'Eye',
                id: 'eye',
                color: 'blue'
            },
            {
                title: 'Ear',
                id: 'ear',
                color: 'green'
            }
        ]
    };

    function getNewData(random) {
        var data = {
            series: {
                nose: random ? Array(6).fill(1).map(item => getRandomIntInclusive(0, 100)) : [10, 100, null, 45, null, 2],
                eye: random ? Array(6).fill(1).map(item => getRandomIntInclusive(0, 100)) : [45, 56, 23, 67, 87, 3],
                ear: random ? Array(6).fill(1).map(item => getRandomIntInclusive(0, 100)) : [4, 5, 2, 16, 17, 33],
            },
            xAxis: {
                columns: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun']
            }
        };
        console.log(data);
        return data;
    }
    // Data will change between each draw
    
    var chart = new window.SvgChart(document.getElementById('svgWrapper'), config);
    chart.init();
    chart.data(getNewData(false));

    document.getElementById('button').addEventListener('click', function() {
        chart.data(getNewData(true));
    });

}());