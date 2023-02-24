(function () {

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // This will stay the same between each draw
    var config = {
        onXAxisLabelGroupSelect: function(chart, selectedColumnIndex) {
            console.log(selectedColumnIndex);
        },
        // Optional style values, only required when you want to save it to a PNG (because then CSS won't be used)
        drawBefore: function(chart, groupEl) {
            groupEl.appendChild(chart.el('rect', {
                x: chart.config.padding.left + chart.config.xAxisGridPadding,
                y: chart.config.padding.top + chart.config.yAxisGridPadding,
                width: chart.chartWidth,
                height: chart.chartHeight / 4,
                fill: 'green',
                fillOpacity: 0.2
            }));
            groupEl.appendChild(chart.el('rect', {
                x: chart.config.padding.left + chart.config.xAxisGridPadding,
                y: chart.config.padding.top + chart.config.yAxisGridPadding + (chart.chartHeight / 4),
                width: chart.chartWidth,
                height: chart.chartHeight / 2,
                fill: 'orange',
                fillOpacity: 0.2
            }));
            groupEl.appendChild(chart.el('rect', {
                x: chart.config.padding.left + chart.config.xAxisGridPadding,
                y: chart.config.padding.top + chart.config.yAxisGridPadding + (chart.chartHeight / 4) + (chart.chartHeight / 2),
                width: chart.chartWidth,
                height: chart.chartHeight / 4,
                fill: 'red',
                fillOpacity: 0.2
            }));
        },

        // Other values
        //focusedValueWidth: 120,
        //transition: false,
        // maxValue: 100,
        // minValue: 0,
        // yAxisStep: 10,
        // legend: true,
        // legendSelect: true,
        // yAxis: true,
        // yAxisGrid: true,
        // yAxisLabels: true,
        // xAxisGrid: true,
        // xAxisLabels: true,
        title: 'De titel',
        yAxisTitle: 'Dit is de Y-as',
        xAxisTitle: 'Dit is de X-as',
        xAxisLabelRotation: 90,
        // connectNullValues: false,
        // lineCurved: true,
        // pointRadius: 3,
        // points: true,
        // barSpacing: 4,
        // barStrokeWidth: 1,
        barStacked: false,
        // xAxisLabelRotation: 45,
        xAxisLabelTop: 50,
        // showValueOnFocus: true,
        chartType: 'line-and-bar',
        padding: {
            top: 80,
            left: 100,
            right: 20,
            bottom: 140
        },
        series: [
            {
                title: 'Ear',
                id: 'ear',
                //color: 'green',
                gradient: ['red', 'orange'],
                type: 'bar'
            },
            {
                title: 'Mouth',
                id: 'mouth',
                //color: 'indigo',
                type: 'bar'
            },
            {
                // Dus color: algemeen fallback
                // Altijd kijken naar strokeColor
                // Als fillGradient is gevuld dan deze pakken, anders color, anders default color.
                title: 'Hand',
                id: 'hand',
                type: 'bar',
                //color: 'green',
                //pointColor: 'red', // pointColor => strokeColor => color
                //strokeColor: 'purple', // dit is ook de point color!
                fillGradient: ['purple', 'pink'],
            },
            {
                title: 'Nose',
                id: 'nose',
                //color: 'orange',
                type: 'line'
            },
            {
                title: 'Eye',
                id: 'eye',
                //color: 'blue',
                type: 'line'
            },
        ]
    };

    function getNewData(random) {
        var data = {
            series: {
                nose: random ? Array(12).fill(1).map(item => getRandomIntInclusive(0, 100)) : [null, 100, null, 45, null, 2, 34, 24, null, 15, 12, null],
                eye: random ? Array(12).fill(1).map(item => getRandomIntInclusive(0, 100)) : [100, 100, null, 45, null, 2, 34, null, null, null, 12, 34],
                ear: random ? Array(12).fill(1).map(item => getRandomIntInclusive(0, 100)) : [10, 20, null, 45, null, 2, 30, null, null, null, 10, 20],
                mouth: random ? Array(12).fill(1).map(item => getRandomIntInclusive(0, 100)) : [80, 20, null, 45, null, 28, 20, null, null, null, 20, 40],
                hand: random ? Array(12).fill(1).map(item => getRandomIntInclusive(0, 100)) : [10, 60, null, 10, null, 70, 50, null, null, null, 70, 40],
            },
            xAxis: {
                //columns: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
                columns: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
                //columns: ['jan']
            }
        };
        return data;
    }
    // Data will change between each draw

    function getNewData2() {
        return {
            series: {
                nose: getRandomIntInclusive(0, 10),
                eye: getRandomIntInclusive(0, 10),
                ear: getRandomIntInclusive(0, 10),
                mouth: getRandomIntInclusive(0, 10),
                hand: getRandomIntInclusive(0, 10),
            }
        };
    }

    var chart = new SvgChart(document.getElementById('svgWrapper'), config);
    chart.chart(getNewData(false));

    document.getElementById('button').addEventListener('click', function () {
        chart.chart(getNewData(true));
    });

    document.getElementById('saveButton').addEventListener('click', function () {
        chart.saveAsPng('test.png');
    });

    var chart2 = new SvgChart(document.getElementById('svgWrapper2'), {
        //transition: false,
        chartType: 'pie',
        backgroundColor: 'bisque',
        legendPosition: 'top', // right, left, bottom
        padding: {
            right: 180,
            left: 180,
            top: 120,
            bottom: 80
        },
        title: 'Pie chart',
        legend: true,
        series: [
            {
                title: 'Ear',
                id: 'ear',
            },
            {
                title: 'Nose',
                id: 'nose',
            },
            {
                title: 'Eye',
                id: 'eye',
            },
            {
                title: 'Mouth',
                id: 'mouth',
            },
            {
                title: 'Hand',
                id: 'hand',
            },
        ]
    });

    document.getElementById('buttonConfig').addEventListener('click', function () {
        chart2.setConfig({
            chartType: 'pie',
            title: 'Blabla',
            series: [
                {
                    title: 'Ear',
                    id: 'ear',
                },
                {
                    title: 'Nose',
                    id: 'nose',
                },
            ]
        });
    });

    chart2.chart(getNewData2());

}());