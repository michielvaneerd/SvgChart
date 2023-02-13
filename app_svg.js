(function () {

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
        xAxisLabels: true,
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
    // Data will change between each draw
    var data = {
        series: {
            nose: [11, 45, 66, 66, 78, 99],
            eye: [12, 34, 56, 23, 45, 67]
        },
        xAxis: {
            columns: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun']
        }
    };
    var chart = new window.SvgChart(document.getElementById('svgWrapper'), config);
    chart.drawConfig();
    chart.drawData(data);

}());