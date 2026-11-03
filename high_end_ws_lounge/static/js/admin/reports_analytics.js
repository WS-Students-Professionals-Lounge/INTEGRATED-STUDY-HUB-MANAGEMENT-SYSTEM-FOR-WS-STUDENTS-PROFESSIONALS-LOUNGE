(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const section = document.querySelector('.analytics-section');
        if (!section) return;

        const yearSelect = section.querySelector('#analyticsYear');
        const content = section.querySelector('#analyticsContent');
        const emptyState = section.querySelector('#analyticsEmpty');
        const errorMessage = section.querySelector('#analyticsError');
        const forecastStatus = section.querySelector('#analyticsForecastStatus');
        const monthStatus = section.querySelector('#analyticsMonthStatus');
        const estimatedPaymentDates = section.querySelector('#analyticsEstimatedPaymentDates');
        const chartInstances = [];

        function formatMoney(value) {
            return `PHP ${Number(value || 0).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }

        function currentPhilippineYear() {
            return Number(new Intl.DateTimeFormat('en', {
                year: 'numeric',
                timeZone: 'Asia/Manila'
            }).format(new Date()));
        }

        function populateYearSelector() {
            const currentYear = currentPhilippineYear();
            for (let year = currentYear + 1; year >= 2000; year -= 1) {
                const option = document.createElement('option');
                option.value = String(year);
                option.textContent = String(year);
                option.selected = year === currentYear;
                yearSelect.appendChild(option);
            }
        }

        function destroyCharts() {
            while (chartInstances.length) {
                chartInstances.pop().destroy();
            }
        }

        function themePalette() {
            const dark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                dark: dark,
                text: dark ? '#e2e8f0' : '#475569',
                grid: dark ? 'rgba(203, 213, 225, 0.15)' : 'rgba(100, 116, 139, 0.16)',
                blue: dark ? '#60a5fa' : '#2563eb',
                green: '#16a34a',
                red: '#ef4444'
            };
        }

        function commonScales(palette) {
            return {
                x: {
                    ticks: { color: palette.text },
                    grid: { color: palette.grid }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: palette.text },
                    grid: { color: palette.grid }
                }
            };
        }

        function chartOptions(palette, legendPosition) {
            return {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: legendPosition || 'top',
                        labels: { color: palette.text, usePointStyle: true, padding: 16 }
                    }
                }
            };
        }

        function addChart(canvasId, config) {
            const canvas = section.querySelector(`#${canvasId}`);
            if (!canvas || typeof Chart === 'undefined') return;
            chartInstances.push(new Chart(canvas, config));
        }

        function setChartDataState(canvasId, emptyId, hasData) {
            section.querySelector(`#${canvasId}`).hidden = !hasData;
            section.querySelector(`#${emptyId}`).hidden = hasData;
        }

        function updateTheme() {
            const palette = themePalette();
            chartInstances.forEach(function (chart) {
                if (chart.options.scales) {
                    Object.values(chart.options.scales).forEach(function (scale) {
                        if (scale.ticks) scale.ticks.color = palette.text;
                        if (scale.grid) scale.grid.color = palette.grid;
                    });
                }
                if (chart.options.plugins && chart.options.plugins.legend) {
                    chart.options.plugins.legend.labels.color = palette.text;
                }
                chart.data.datasets.forEach(function (dataset) {
                    if (dataset.label === 'Revenue') {
                        dataset.borderColor = palette.blue;
                        dataset.backgroundColor = palette.dark
                            ? 'rgba(96, 165, 250, 0.16)'
                            : 'rgba(37, 99, 235, 0.12)';
                        if (Array.isArray(dataset.pointBackgroundColor)) {
                            dataset.pointBackgroundColor = dataset.pointBackgroundColor.map(
                                color => color === '#2563eb' || color === '#60a5fa'
                                    ? palette.blue
                                    : color
                            );
                        }
                    }
                    if (chart.config.type === 'doughnut') {
                        dataset.borderColor = palette.dark ? '#1e293b' : '#ffffff';
                    }
                });
                chart.update('none');
            });
        }

        function renderCharts(data) {
            destroyCharts();
            const palette = themePalette();
            const months = data.months || [];
            const revenue = data.monthly_revenue || [];
            const finishedMonthCount = Number(data.finished_month_count || 0);
            const visibleMonthCount = Number(data.visible_month_count || 0);
            const monthsWithRevenue = revenue
                .map((value, index) => (
                    index < finishedMonthCount && Number(value) > 0 ? index : -1
                ))
                .filter(index => index >= 0);
            const highest = monthsWithRevenue.length
                ? monthsWithRevenue.reduce(
                    (best, index) => revenue[index] > revenue[best] ? index : best,
                    monthsWithRevenue[0]
                )
                : -1;
            const lowest = monthsWithRevenue.length
                ? monthsWithRevenue.reduce(
                    (worst, index) => revenue[index] < revenue[worst] ? index : worst,
                    monthsWithRevenue[0]
                )
                : -1;
            const finishedRevenue = revenue
                .slice(0, finishedMonthCount)
                .map(amount => Number(amount || 0));
            const averageRevenue = finishedRevenue.length
                ? finishedRevenue.reduce((total, amount) => total + amount, 0) /
                    finishedRevenue.length
                : 0;
            const chartLabels = months.slice(0, visibleMonthCount);
            const actualRevenue = revenue.slice(0, visibleMonthCount);
            const averageLine = Array(visibleMonthCount).fill(null);
            for (let index = 0; index < Math.min(finishedMonthCount, visibleMonthCount); index += 1) {
                averageLine[index] = averageRevenue;
            }
            const forecastLine = Array(visibleMonthCount).fill(null);
            const forecast = data.forecast && data.forecast.available
                ? data.forecast
                : null;
            if (forecast) {
                chartLabels.push(`${forecast.label} ${forecast.year} (Estimate)`);
                actualRevenue.push(null);
                averageLine.push(null);
                forecastLine.push(Number(forecast.amount));
                const lastFinishedIndex = finishedMonthCount - 1;
                if (lastFinishedIndex >= 0) {
                    forecastLine[lastFinishedIndex] = Number(
                        revenue[lastFinishedIndex] || 0
                    );
                }
            }
            const actualColors = revenue.map((value, index) => (
                index === highest ? palette.green :
                    index === lowest ? palette.red : palette.blue
            ));

            addChart('analyticsMonthlyChart', {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Revenue',
                            data: actualRevenue,
                            borderColor: palette.blue,
                            backgroundColor: 'rgba(37, 99, 235, 0.12)',
                            fill: true,
                            tension: 0.3,
                            pointRadius: 4,
                            pointBackgroundColor: chartLabels.map((label, index) => (
                                actualColors[index] || palette.blue
                            )),
                            spanGaps: false
                        },
                        {
                            label: 'Monthly average',
                            data: averageLine,
                            borderColor: '#f59e0b',
                            borderDash: [6, 5],
                            borderWidth: 2,
                            pointRadius: 0,
                            fill: false
                        }
                    ].concat(forecast ? [{
                            label: 'Estimate',
                            data: forecastLine,
                            borderColor: '#a855f7',
                            borderDash: [3, 5],
                            borderWidth: 2,
                            pointRadius: forecastLine.map(value => value === null ? 0 : 4),
                            pointBackgroundColor: '#a855f7',
                            fill: false,
                            spanGaps: true
                        }] : [])
                },
                options: Object.assign(chartOptions(palette), {
                    scales: commonScales(palette)
                })
            });

            const roomRevenue = data.room_revenue || [];
            setChartDataState(
                'analyticsRoomRevenueChart',
                'analyticsRoomRevenueEmpty',
                roomRevenue.length > 0
            );
            if (roomRevenue.length) {
                addChart('analyticsRoomRevenueChart', {
                    type: 'doughnut',
                    data: {
                        labels: roomRevenue.map(room => room.name),
                        datasets: [{
                            data: roomRevenue.map(room => room.revenue),
                            backgroundColor: [
                                '#2563eb', '#16a34a', '#f59e0b', '#a855f7',
                                '#ef4444', '#06b6d4', '#f97316', '#64748b'
                            ],
                            borderColor: palette.dark ? '#1e293b' : '#ffffff',
                            borderWidth: 2
                        }]
                    },
                    options: Object.assign(chartOptions(palette, 'bottom'), {
                        cutout: '62%'
                    })
                });
            }

            const sources = (data.sources || []).filter(source => source.revenue > 0);
            setChartDataState(
                'analyticsSourceChart',
                'analyticsSourceEmpty',
                sources.length > 0
            );
            if (sources.length) {
                addChart('analyticsSourceChart', {
                    type: 'bar',
                    data: {
                        labels: sources.map(source => source.label),
                        datasets: [{
                            label: 'Revenue by source',
                            data: sources.map(source => source.revenue),
                            backgroundColor: ['#2563eb', '#16a34a', '#a855f7', '#f59e0b'],
                            borderRadius: 5
                        }]
                    },
                    options: Object.assign(chartOptions(palette), {
                        indexAxis: 'y',
                        scales: commonScales(palette)
                    })
                });
            }

            const roomUsage = (data.rooms || []).filter(room => room.sessions > 0);
            setChartDataState(
                'analyticsRoomUsageChart',
                'analyticsRoomUsageEmpty',
                roomUsage.length > 0
            );
            if (roomUsage.length) {
                addChart('analyticsRoomUsageChart', {
                    type: 'bar',
                    data: {
                        labels: roomUsage.map(room => room.name),
                        datasets: [{
                            label: 'Completed sessions',
                            data: roomUsage.map(room => room.sessions),
                            backgroundColor: '#3a6ea5',
                            borderRadius: 5
                        }]
                    },
                    options: Object.assign(chartOptions(palette), {
                        indexAxis: 'y',
                        scales: commonScales(palette)
                    })
                });
            }

            const weekdays = data.weekdays || [];
            const weekdaySessionCount = weekdays.reduce(
                (total, day) => total + Number(day.sessions || 0),
                0
            );
            setChartDataState(
                'analyticsWeekdayChart',
                'analyticsWeekdayEmpty',
                weekdaySessionCount > 0
            );
            if (weekdaySessionCount > 0) {
                addChart('analyticsWeekdayChart', {
                    type: 'bar',
                    data: {
                        labels: weekdays.map(day => day.label),
                        datasets: [{
                            label: 'Completed sessions',
                            data: weekdays.map(day => day.sessions),
                            backgroundColor: '#0f9f8f',
                            borderRadius: 5
                        }]
                    },
                    options: Object.assign(chartOptions(palette), {
                        scales: commonScales(palette)
                    })
                });
            }
        }

        function updateKpis(data) {
            const kpis = data.kpis || {};
            section.querySelector('#analyticsTotalRevenue').textContent =
                formatMoney(kpis.total_revenue);
            section.querySelector('#analyticsCompletedSessions').textContent =
                Number(kpis.completed_sessions || 0).toLocaleString('en-PH');
            section.querySelector('#analyticsAverageBill').textContent =
                formatMoney(kpis.average_reservation_bill);
            section.querySelector('#analyticsBestMonth').textContent =
                kpis.best_month ? kpis.best_month.label : '—';
            section.querySelector('#analyticsMostUsedRoom').textContent =
                kpis.most_used_room ? kpis.most_used_room.name : '—';

            const insights = section.querySelector('#analyticsInsights');
            insights.replaceChildren();
            (data.insights || []).forEach(function (insight) {
                const item = document.createElement('li');
                item.textContent = insight;
                insights.appendChild(item);
            });
            if (!insights.childElementCount) {
                const item = document.createElement('li');
                item.textContent = 'There are no notable sales patterns for this year yet.';
                insights.appendChild(item);
            }

            if (data.forecast && data.forecast.available) {
                forecastStatus.textContent =
                    `Estimate for ${data.forecast.label} ${data.forecast.year}: ` +
                    `${formatMoney(data.forecast.amount)}. ` +
                    'Based on the last three fully finished months.';
            } else {
                forecastStatus.textContent =
                    'Not enough finished months to forecast (3 full months required).';
            }

            const currentMonthLabel = (data.months || []).find(
                label => label.includes('(Month so far)')
            );
            monthStatus.textContent = currentMonthLabel
                ? `${currentMonthLabel.replace(' (Month so far)', '')} is Month so far.`
                : 'All displayed months are finished.';
            const dateStats = data.payment_date_stats || {};
            estimatedPaymentDates.textContent =
                `${Number(dateStats.estimated || 0).toLocaleString('en-PH')} of ` +
                `${Number(dateStats.total || 0).toLocaleString('en-PH')} payments use an estimated date`;
        }

        async function loadAnalytics() {
            errorMessage.hidden = true;
            emptyState.hidden = true;
            content.hidden = true;
            destroyCharts();

            try {
                const endpoint = new URL(section.dataset.endpoint, window.location.origin);
                endpoint.searchParams.set('year', yearSelect.value);
                const response = await fetch(endpoint.toString(), {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: { Accept: 'application/json' }
                });
                if (!response.ok) {
                    throw new Error(`Analytics request failed with status ${response.status}`);
                }
                const data = await response.json();
                if (!data || data.status === 'error') {
                    throw new Error(data && data.message ? data.message : 'Invalid analytics response');
                }

                const kpis = data.kpis || {};
                const hasData = Number(kpis.total_revenue || 0) > 0 ||
                    Number(kpis.completed_sessions || 0) > 0;
                updateKpis(data);
                if (!hasData) {
                    emptyState.hidden = false;
                    return;
                }

                content.hidden = false;
                renderCharts(data);
            } catch (error) {
                console.error('Unable to load Reports analytics:', error);
                errorMessage.hidden = false;
            }
        }

        populateYearSelector();
        yearSelect.addEventListener('change', loadAnalytics);
        new MutationObserver(updateTheme).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        loadAnalytics();
    });
})();
