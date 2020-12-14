let chart;

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('play').addEventListener('click', e => {
        // How many degrees to spin for each iteration
        let diff = 25 + Math.random() * 10;
        let startAngle = chart.series[0].options.startAngle;

        let t = setInterval(() => {

            startAngle += diff;
            if (startAngle > 360) {
                startAngle -= 360;
            }
            diff *= 0.98;
            chart.series[0].update({ startAngle });

            if (diff < 0.1) {
                clearInterval(t);
                findWinner();
            }
        }, 25);
    });
    // Create the chart
    chart = Highcharts.chart('container', {

        chart: {
            animation: false
        },

        title: {
            text: 'Lykkehjulet'
        },

        data: {
            googleSpreadsheetKey: '1lNehtsWatVeS-fjNYXSCzI7aDjm0Z2dp_tJ79pi2yDw',
            parsed: function (columns) {
                const activeColumn = columns.findIndex(column => column[0] === 'aktiv');
                const endRow = columns[0].indexOf(null);

                let i = columns.length;
                for (i; i >= 0; i--) {
                    if (i !== activeColumn && i !== 0) {
                        columns.splice(i, 1);
                    } else {
                        columns[i].splice(endRow, 1000);
                    }
                }
            },

            complete: function (options) {
                options.series[0].data = options.series[0].data.filter(d => {
                    return d[1] !== null;
                });
                options.series[0].data = options.series[0].data.sort((a, b) => Math.random() - 0.5);
            }
        },

        series: [{
            type: 'pie',
            dataLabels: {
                distance: -20
            },
            startAngle: 360 * Math.random()
        }]

    });

    chart.renderer.path([
            ['M', chart.chartWidth / 2 - 10, chart.plotTop - 5],
            ['L', chart.chartWidth / 2 + 10, chart.plotTop - 5],
            ['L', chart.chartWidth / 2, chart.plotTop + 10],
            ['Z']
        ])
        .attr({
            fill: 'black'
        })
        .add();
});

const radToDeg = r => r * 180 / Math.PI;

const findWinner = () => {
    const data = chart.series[0].data;
    const winThreshold = 360 - 360 / data.length;
    let startAngle;

    for (let i in data) {
        startAngle = radToDeg(chart.series[0].data[i].shapeArgs.start) + 90;
        if (startAngle > 360) {
            startAngle -= 360;
        }
        if (startAngle > winThreshold) {

            console.log({
                name: data[i].name,
                threshold: winThreshold,
                angle: startAngle
            });
        }
    }
}