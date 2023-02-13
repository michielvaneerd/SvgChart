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
        yAxisStep: 10,
        legend: true,
        legendSelect: true,
        yAxisGrid: true,
        yAxisLabels: true,
        xAxisGrid: true,
        xAxisGridPadding: 10,
        yAxisGridPadding: 10,
        xAxisLabels: true,
        xAxisGridColumns: true, // we have now columns we can select / deselect instead of just x axis lines, so it is similar to bar charts
        padding: {
            top: 60,
            left: 60,
            right: 160,
            bottom: 60
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
            }
        ]
    };

    function getNewData() {
        var data = {
            series: {
                nose: Array(6).fill(1).map(item => getRandomIntInclusive(0, 100)),
                eye: Array(6).fill(1).map(item => getRandomIntInclusive(0, 100)),
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
    chart.drawConfig();
    chart.drawData(getNewData());

    document.getElementById('button').addEventListener('click', function() {
        chart.drawData(getNewData());
    });

}());