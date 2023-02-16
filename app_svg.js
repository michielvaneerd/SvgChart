(function () {

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // This will stay the same between each draw
    var config = {
        // Optional style values, only required when you want to save it to a PNG (because then CSS won't be used)
        backgroundColor: 'bisque',
        fontFamily: 'sans-serif',
        fontSizeAxisLabel: 'small',
        fontSizeTitle: 'normal',
        fontSizeAxisTitle: 'smaller',
        fontSizeLegend: 'smaller',
        barFillOpacity: 0.5,
        lineWidth: 3,
        xAxisGridLineWidth: 1,
        xAxisGridLineColor: '#C0C0C0',
        xAxisGridLineDashArray: '1,1',
        yAxisGridLineWidth: 1,
        yAxisGridLineColor: '#C0C0C0',
        yAxisGridLineDashArray: '1,1',
        xAxisLabelColor: 'red',
        yAxisLabelColor: 'green',
        titleColor: 'purple',
        xAxisTitleColor: 'orange',
        yAxisTitleColor: 'pink',

        // Other values
        showValue: true,
        transition: true,
        maxValue: 100,
        minValue: 0,
        yAxisStep: 10,
        legend: true,
        legendSelect: true,
        yAxisGrid: true,
        yAxisLabels: true,
        xAxisGrid: true,
        xAxisGridPadding: 0,
        yAxisGridPadding: 0,
        xAxisLabels: true,
        xAxisGridColumns: true, // we have now columns we can select / deselect instead of just x axis lines, so it is similar to bar charts, also good if you use bar charts in teh same chart!
        xAxisGridColumnsSelectable: true,
        title: 'De titel',
        yAxisTitle: 'Dit is de Y-as',
        xAxisTitle: 'Dit is de X-as',
        connectNullValues: false,
        curved: true,
        pointRadius: 3,
        points: true,
        barSpacing: 10,
        barStrokeWidth: 1,
        padding: {
            top: 80,
            left: 100,
            right: 120,
            bottom: 80
        },
        series: [
            {
                title: 'Ear',
                id: 'ear',
                color: 'green',
                type: 'bar'
            },
            {
                title: 'Mouth',
                id: 'mouth',
                color: 'indigo',
                type: 'bar'
            },
            {
                title: 'Nose',
                id: 'nose',
                color: 'orange',
                type: 'line'
            },
            {
                title: 'Eye',
                id: 'eye',
                color: 'blue',
                type: 'line'
            },
        ]
    };

    function getNewData(random) {
        var data = {
            series: {
                nose: random ? Array(6).fill(1).map(item => getRandomIntInclusive(0, 100)) : [100, 100, null, 45, null, 2],
                eye: random ? Array(6).fill(1).map(item => getRandomIntInclusive(0, 100)) : [100, 0, 0, 67, 87, null],
                ear: random ? Array(6).fill(1).map(item => getRandomIntInclusive(0, 100)) : [null, null, 2, 16, 17, 33],
                mouth: random ? Array(6).fill(1).map(item => getRandomIntInclusive(0, 100)) : [null, null, 2, 16, 17, 33],
            },
            xAxis: {
                columns: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun']
            }
        };
        return data;
    }
    // Data will change between each draw

    var chart = new window.SvgChart(document.getElementById('svgWrapper'), config);
    chart.init();
    chart.data(getNewData(true));

    document.getElementById('button').addEventListener('click', function () {
        chart.data(getNewData(true));
    });

    document.getElementById('saveButton').addEventListener('click', function () {
        chart.saveAsPng('test.png');
    });

}());