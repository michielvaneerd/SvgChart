import { SvgChart } from "../src/svg.js";
import { SvgChartConfig } from "../src/config.js";
import { ChartType } from "../src/types.js";

//SvgChart.setActiveColorPalette(SvgChart.colorPalettes.springPastelsColorPalette);

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomNumbersSummedUpTo(count, maxSum) {
    let sum = maxSum;
    const numbers = [];
    for (let i = 0; i < count - 1; i++) {
        const randomNumber = Math.floor(Math.random() * sum);
        sum -= randomNumber < 0 ? 0 : randomNumber;
        numbers.push(randomNumber < 0 ? 0 : randomNumber);
    }
    numbers.push(sum);
    return numbers;
}

var htmlDirIsLtr = document.documentElement.getAttribute('dir') !== 'rtl';

var chartInfo = {
    chartBasicLine: {
        config: {
            chartType: ChartType.Line,
            transition: true,
            ltr: htmlDirIsLtr,
            title: 'Basic line chart',
            minValue: 0,
            maxValue: 100,
            legendPosition: 'end',
            xAxisTitle: 'Days',
            yAxisTitle: 'Count',
            padding: {
                end: 100,
                start: 80,
                top: 50,
                bottom: 70
            },
            series: [
                {
                    id: 'train',
                    title: 'Train',
                },
                {
                    id: 'car',
                    title: 'Car',
                }
            ]
        },
        data: null,
        chart: null
    },
    chartBasicLineDark: {
        config: {
            chartType: ChartType.Line,
            backgroundColor: 'black',
            titleColor: 'white',
            xAxisGridLineColor: 'green',
            yAxisGridLineColor: 'green',
            xAxisLabelColor: '#C0C0C0',
            yAxisLabelColor: '#C0C0C0',
            xAxisTitleColor: 'white',
            yAxisTitleColor: 'white',
            focusedValueFill: 'white',
            focusedValueColor: 'black',
            lineChartFilled: true,
            legendColor: 'white',
            transition: true,
            ltr: htmlDirIsLtr,
            title: 'Basic line chart dark',
            minValue: 0,
            maxValue: 100,
            legendPosition: 'end',
            xAxisTitle: 'Days',
            yAxisTitle: 'Count',
            padding: {
                end: 100,
                start: 80,
                top: 50,
                bottom: 70
            },
            series: [
                {
                    id: 'train',
                    title: 'Train',
                },
                {
                    id: 'car',
                    title: 'Car',
                }
            ]
        },
        data: {
            series: {
                train: Array(7).fill(1).map(item => getRandomIntInclusive(0, 100)),
                car: Array(7).fill(1).map(item => getRandomIntInclusive(0, 100)),
            },
            xAxis: {
                columns: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
            }
        },
        chart: null
    },
    chartBasicLineBig: {
        config: {
            chartType: ChartType.Line,
            ltr: htmlDirIsLtr,
            title: 'Basic line chart with many values',
            minValue: 0,
            maxValue: 100,
            xAxisTitle: 'Days',
            yAxisStep: 10, // real value step
            yAxisLabelStep: 20,
            xAxisStep: 2, // step between colums (so 2 means display each second step from first one on)
            xAxisLabelStep: 10,
            lineCurved: false,
            yAxisTitle: 'Count',
            points: false,
            lineWidth: 1,
            padding: {
                end: 100,
                start: 80,
                top: 100,
                bottom: 100
            },
            series: [
                {
                    id: 'car',
                    title: 'Car',
                    color: 'blue'
                },
                {
                    id: 'bike',
                    title: 'Bike',
                    color: 'green'
                },
            ],
            xAxisLabelRotation: 45,
            xAxisLabelTop: 30,
            xAxisGridPadding: 20,
            yAxisGridPadding: 20,
            legendPosition: 'top',
            legendTop: 60
        },
        dataFunc: function (id) {
            const total = 100;
            var numbers = [];
            var serieData = {};
            for (let i = 0; i < total; i++) {
                numbers.push(getRandomNumbersSummedUpTo(4, 100));
            };
            chartInfo[id].config.series.forEach(function (serie) {
                serieData[serie.id] = [];
            });
            numbers.forEach(function (numberArray) {
                chartInfo[id].config.series.forEach(function (serie, serieIndex) {
                    serieData[serie.id].push(numberArray[serieIndex]);
                });
            });
            chartInfo[id].data = {
                series: serieData,
                xAxis: {
                    columns: Array(total).fill(1).map(function (value, index) {
                        return 'Item ' + (index + 1);
                    })
                }
            };
        },
        chart: null
    },
    chartBasicBar: {
        config: {
            chartType: ChartType.Bar,
            ltr: htmlDirIsLtr,
            title: 'Basic bar chart',
            minValue: 0,
            maxValue: 100,
            legendPosition: 'top',
            xAxisTitle: 'Days',
            yAxisTitle: 'Count',
            legendTop: 60,
            padding: {
                end: 40,
                start: 80,
                bottom: 60
            },
            series: [
                {
                    id: 'train',
                    title: 'Train',
                },
                {
                    id: 'car',
                    title: 'Car',
                }
            ]
        },
        data: null,
        chart: null
    },
    chartStackedBar: {
        config: {
            chartType: ChartType.Bar,
            ltr: htmlDirIsLtr,
            title: 'Stacked bar chart',
            legendPosition: 'top',
            minValue: 0,
            maxValue: 100,
            legendTop: 60,
            barSpacing: 20,
            barStacked: true,
            series: [
                {
                    id: 'train',
                    title: 'Train',
                },
                {
                    id: 'car',
                    title: 'Car',
                },
                {
                    id: 'bike',
                    title: 'Bike',
                },
                {
                    id: 'feet',
                    title: 'Feet',
                }
            ]
        },
        data: null,
        chart: null,
        dataFunc: function (id) {
            var numbers = [];
            var serieData = {};
            for (let i = 0; i < 7; i++) {
                numbers.push(getRandomNumbersSummedUpTo(4, 100));
            };
            chartInfo[id].config.series.forEach(function (serie) {
                serieData[serie.id] = [];
            });
            numbers.forEach(function (numberArray) {
                chartInfo[id].config.series.forEach(function (serie, serieIndex) {
                    serieData[serie.id].push(numberArray[serieIndex]);
                });
            });
            chartInfo[id].data = {
                series: serieData,
                xAxis: {
                    columns: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
                }
            };
        }
    },
    chartBasicPie: {
        config: {
            chartType: ChartType.Pie,
            ltr: htmlDirIsLtr,
            title: 'Basic pie chart',
            legendPosition: 'top',
            legendTop: 60,
            series: [
                {
                    id: 'train',
                    title: 'Train'
                },
                {
                    id: 'car',
                    title: 'Car'
                },
                {
                    id: 'bike',
                    title: 'Bike'
                },
                {
                    id: 'feet',
                    title: 'Feet'
                }
            ]
        },
        data: null,
        chart: null
    },
    chartBasicDonut: {
        config: {
            chartType: ChartType.Donut,
            ltr: htmlDirIsLtr,
            title: 'Basic donut chart',
            legendPosition: 'top',
            legendTop: 60,
            series: [
                {
                    id: 'train',
                    title: 'Train'
                },
                {
                    id: 'car',
                    title: 'Car'
                },
                {
                    id: 'bike',
                    title: 'Bike'
                },
                {
                    id: 'feet',
                    title: 'Feet'
                }
            ]
        },
        data: null,
        chart: null
    },
    chartBarAndLine: {
        config: {
            chartType: ChartType.LineAndBar,
            ltr: htmlDirIsLtr,
            title: 'Bar and line chart',
            legendPosition: 'top',
            legendTop: 60,
            minValue: 0,
            maxValue: 100,
            barSpacing: 10,
            series: [
                {
                    id: 'bike',
                    title: 'Bike',
                    type: ChartType.Bar
                },
                {
                    id: 'feet',
                    title: 'Feet',
                    type: ChartType.Bar
                },
                {
                    id: 'train',
                    title: 'Train',
                    type: ChartType.Line
                },
                {
                    id: 'car',
                    title: 'Car',
                    type: ChartType.Line
                }
            ]
        },
        data: null,
        chart: null,
    },
    chartCustom: {
        config: {
            padding: {
                bottom: 70,
                start: 80
            },
            chartType: ChartType.Line,
            ltr: htmlDirIsLtr,
            title: 'Custom line chart',
            legendPosition: 'top',
            legendTop: 60,
            xAxisTitle: 'Days',
            yAxisTitle: 'Count',
            xAxisTitleColor: 'black',
            yAxisTitleColor: 'black',
            minValue: 0,
            maxValue: 100,
            barSpacing: 10,
            xAxisGridColumnsSelectable: true,
            xAxisGridColumnsSelectableColor: 'red',
            xAxisGridColumns: true,
            lineCurved: false,
            onXAxisLabelGroupSelect: function (chart, index) {
                var serieValues = [];
                Object.keys(chart.data.series).forEach(function (serie) {
                    serieValues.push(`${serie} = ${chart.data.series[serie][index]}`);
                });
                document.getElementById('chartCustomCodeInfo').innerHTML = `Clicked on '${chart.data.xAxis.columns[index]}' with values: ${serieValues.join(", ")}`;
            },
            drawOnData: function (chart, groupNode) {
                groupNode.appendChild(chart.el('text', {
                    x: chart.config.ltr ? (chart.width - chart.config.padding.end - 2) : (chart.config.padding.end + 2),
                    direction: SvgChartConfig.getDirection(chart.config),
                    y: chart.config.padding.top + 4,
                    textAnchor: 'end',
                    dominantBaseline: 'hanging',
                    fontWeight: 'bold',
                    fontSize: '26px'
                }, document.createTextNode(Date.now())));
            },
            drawOnConfig: function (chart, groupNode) {
                groupNode.appendChild(chart.el('rect', {
                    x: chart.config.padding.left,
                    y: chart.config.padding.top,
                    width: chart.chartWidth,
                    height: chart.lineAndBarValueHeight * 20,
                    fill: 'darkgreen',
                    fillOpacity: 0.2
                }));
                groupNode.appendChild(chart.el('rect', {
                    x: chart.config.padding.left,
                    y: chart.config.padding.top + (chart.lineAndBarValueHeight * 20),
                    width: chart.chartWidth,
                    height: chart.lineAndBarValueHeight * 40,
                    fill: 'orange',
                    fillOpacity: 0.2
                }));
                groupNode.appendChild(chart.el('rect', {
                    x: chart.config.padding.left,
                    y: chart.config.padding.top + (chart.lineAndBarValueHeight * 60),
                    width: chart.chartWidth,
                    height: chart.lineAndBarValueHeight * 40,
                    fill: 'red',
                    fillOpacity: 0.2
                }));
            },
            series: [
                {
                    id: 'train',
                    title: 'Train',
                },
                {
                    id: 'car',
                    title: 'Car',
                },
                {
                    id: 'bike',
                    title: 'Bike',
                }
            ]
        },
        data: null,
        chart: null,
        onNewDataFunc: function () {
            document.getElementById('chartCustomCodeInfo').innerHTML = 'Click a day to see details! ';
        }
    },
    chartDynamic: {
        config: {
            padding: {
                bottom: 70,
                start: 80
            },
            chartType: ChartType.Line,
            ltr: htmlDirIsLtr,
            title: 'Dynamic chart',
            legendPosition: 'top',
            legendTop: 60,
            xAxisTitle: 'Days',
            yAxisTitle: 'Count',
            xAxisTitleColor: 'black',
            yAxisTitleColor: 'black',
            minValue: 0,
            maxValue: 100,
            barSpacing: 10,
            xAxisGridColumnsSelectable: true,
            xAxisGridColumnsSelectableColor: 'red',
            xAxisGridColumns: true,
            lineCurved: true,
            series: [
                {
                    id: 'train',
                    title: 'Train',
                },
                {
                    id: 'car',
                    title: 'Car',
                },
                {
                    id: 'bike',
                    title: 'Bike',
                }
            ]
        },
        data: {
            series: {
                train: Array(7).fill(1).map(item => getRandomIntInclusive(0, 100)),
                car: Array(7).fill(1).map(item => getRandomIntInclusive(0, 100)),
                bike: Array(7).fill(1).map(item => getRandomIntInclusive(0, 100))
            },
            xAxis: {
                columns: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
            }
        },
        chart: null
    }
};

Function.prototype.toJSON = function () {
    return this.toString().replace(/\n/g, "<br>").replace('function(', "FUNC[");
}

function setChartData(id) {
    var isPieOrDonut = [ChartType.Pie, ChartType.Donut].indexOf(chartInfo[id].config.chartType) !== -1;
    var serieData = {};
    chartInfo[id].config.series.forEach(function (serie) {
        serieData[serie.id] = !isPieOrDonut ? Array(7).fill(1).map(item => getRandomIntInclusive(0, 100)) : getRandomIntInclusive(0, 100);
    });
    chartInfo[id].data = {
        series: serieData,
        xAxis: {
            columns: isPieOrDonut ? ['mon'] : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        }
    };
}

/**
 * Rewrites CSV to data object.
 * Format: first row: columns (first column is empty)
 * second and next rows: first column id of serie and next columns are values
 * ,mon,tue,wed,thu,fri,sat,sun
 * train,45,98,45,45,56,67,89
 * car,55,4,7,6,8,9,0
 * 
 */
function csvToData(csv, id) {

    let data = {
        series: {},
        xAxis: {
            columns: null
        }
    };

    const lines = csv.split("\n");

    lines.forEach(function (line, lineIndex) {

        const columns = line.split(',');
        const firstColumn = columns.shift();

        if (lineIndex === 0) {
            data.xAxis.columns = columns;
            return;
        }

        data.series[firstColumn] = columns.map((value) => parseInt(value, 10));

    });

    chartInfo[id].data = data;
}

function stringifyObject(ob) {
    let s = [];
    Object.keys(ob).forEach(function (key) {
        const value = ob[key];
        switch (typeof value) {
            case 'object':
                s.push("    " + '"' + key + '": ' + JSON.stringify(value));
                break;
            case 'number':
                s.push("    " + '"' + key + '": ' + value);
                break;
            case 'string':
                s.push("    " + '"' + key + '": "' + value + '"');
                break;
            case 'function':
                s.push("    " + '"' + key + '": ' + value.toString());
                break;
            case 'boolean':
                s.push("    " + '"' + key + '": ' + value);
                break;
        }
    });
    return "{\n" + s.join(",\n") + "\n}";
}

function doChart(id) {
    if (chartInfo[id].onNewDataFunc) {
        chartInfo[id].onNewDataFunc();
    }
    //if (!chartInfo[id].data) {
    var csvArea = document.getElementById(id + 'CodeDataCsv');
    if (csvArea && csvArea.value) {
        csvToData(csvArea.value.trim(), id);
    } else {
        chartInfo[id].dataFunc ? chartInfo[id].dataFunc(id) : setChartData(id);
    }
    //}
    if (chartInfo[id].chart === null) {
        chartInfo[id].chart = new SvgChart(document.getElementById(id), chartInfo[id].config);
        document.getElementById(id + 'RandomDataButton').addEventListener('click', function () {
            doChart(id);
        });
        document.getElementById(id + 'PngButton').addEventListener('click', function () {
            chartInfo[id].chart.saveAsPng(id + '.png');
        });
    } else {
        chartInfo[id].chart.setConfig(chartInfo[id].config);
    }
    chartInfo[id].chart.chart(chartInfo[id].data);
    var codeConfig = document.getElementById(id + 'CodeConfig').querySelector('code');
    var codeData = document.getElementById(id + 'CodeData').querySelector('code');
    codeConfig.innerHTML = stringifyObject(chartInfo[id].config);
    codeData.innerHTML = JSON.stringify(chartInfo[id].data, null, 2);
    hljs.highlightElement(codeConfig);
    hljs.highlightElement(codeData);
}

function dynamicChart() {

    if (!chartInfo['chartDynamic'].chart) {
        document.getElementById('chartDynamicCodeConfig').value = JSON.stringify(chartInfo['chartDynamic'].config, null, 2);
        document.getElementById('chartDynamicCodeData').value = JSON.stringify(chartInfo['chartDynamic'].data, null, 2);
        document.getElementById('chartDynamicExecuteButton').addEventListener('click', dynamicChart);
        document.getElementById('chartDynamicPngButton').addEventListener('click', function () {
            chartInfo['chartDynamic'].chart.saveAsPng('chartDynamic.png');
        });
    }

    const config = eval("(" + document.getElementById('chartDynamicCodeConfig').value + ")"); // note that JSON.parse doesn't work with functions as values.
    const data = eval("(" + document.getElementById('chartDynamicCodeData').value + ")");

    if (!chartInfo['chartDynamic'].chart) {
        chartInfo['chartDynamic'].chart = new SvgChart(document.getElementById('chartDynamic'), config);
    } else {
        chartInfo['chartDynamic'].chart.setConfig(config);
    }
    chartInfo['chartDynamic'].chart.chart(data);
}

doChart('chartBasicLine');
//doChart('chartBasicLineDark');
//doChart('chartBasicLineBig');
//doChart('chartBasicBar');
//doChart('chartStackedBar');
//doChart('chartBasicPie');
//doChart('chartBasicDonut');
//doChart('chartBarAndLine');
//doChart('chartCustom');
//dynamicChart();
//createToc();

function createToc() {
    const toc = [];
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(function (h, index) {
        const level = h.tagName.toLowerCase().substring(1);
        if (level == 1) {
            return;
        }
        if (!h.id) {
            h.id = 'my-header-' + index;
        }
        toc.push('<div class="my-header-level-' + level + '"><a href="#' + h.id + '">' + h.innerText + '</a></div>');
    });
    document.getElementById('toc').innerHTML = toc.join("\n");
}

function getParent(el, parentTagName) {
    let parent = el;
    while (parent && parent.tagName.toLowerCase() !== parentTagName) {
        parent = parent.parentNode;
    }
    return parent;
}

document.documentElement.addEventListener('click', function (e) {
    const target = e.target;
    if (target.dataset.toggle) {
        const targetId = target.dataset.targetId;
        const csvEl = document.getElementById(targetId + 'CodeDataCsv');
        const toggle = target.dataset.toggle;
        switch (toggle) {
            case 'chart':
                document.getElementById(targetId).classList.remove('my-hidden');
                document.getElementById(targetId + 'CodeConfig').classList.add('my-hidden');
                document.getElementById(targetId + 'CodeData').classList.add('my-hidden');
                if (csvEl) csvEl.classList.add('my-hidden');
                break;
            case 'config':
                document.getElementById(targetId).classList.add('my-hidden');
                document.getElementById(targetId + 'CodeConfig').classList.remove('my-hidden');
                document.getElementById(targetId + 'CodeData').classList.add('my-hidden');
                if (csvEl) csvEl.classList.add('my-hidden');
                break;
            case 'data':
                document.getElementById(targetId).classList.add('my-hidden');
                document.getElementById(targetId + 'CodeConfig').classList.add('my-hidden');
                document.getElementById(targetId + 'CodeData').classList.remove('my-hidden');
                if (csvEl) csvEl.classList.add('my-hidden');
                break;
            case 'data-csv':
                document.getElementById(targetId).classList.add('my-hidden');
                document.getElementById(targetId + 'CodeConfig').classList.add('my-hidden');
                document.getElementById(targetId + 'CodeData').classList.add('my-hidden');
                if (csvEl) csvEl.classList.remove('my-hidden');
                break;
        }
        document.querySelectorAll('button[data-target-id="' + targetId + '"]').forEach(function (el) {
            if (el === target) {
                el.classList.add('my-active-tab');
            } else {
                el.classList.remove('my-active-tab');
            }
        });
    } else if (target.classList.contains('my-copy-button')) {
        var pre = getParent(target, 'pre');
        navigator.clipboard.writeText(pre.querySelector('code').innerText);
    }
});

