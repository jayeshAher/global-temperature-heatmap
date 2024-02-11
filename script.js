document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
    const h = 600;
    const w = 1400;
    const padding = { top: 60, right: 250, bottom: 100, left: 100 };
    const legendWidth = 300;
    const legendHeight = 20;
    const legendPadding = 40;
    const numColors = 9;
    const numTicks = numColors + 1;
    const legendColorWidth = legendWidth / numColors;

    // Create SVG Container
    const svg = d3
        .select("body")
        .append("svg")
        .attr("height", h + padding.top + padding.bottom)
        .attr("width", w + padding.left + padding.right)
        .attr("class", "map")
        .append("g")
        .attr("transform", `translate(${padding.left}, ${padding.top})`);

    // Add Title
    const title = svg
        .append("text")
        .attr("x", (w - padding.left - padding.right) / 2)
        .attr("y", padding.top / 2)
        .attr("id", "title")
        .attr("text-anchor", "middle")
        .text("Temperature Variations Heatmap");

    // Add Description
    const description = svg
        .append("text")
        .attr("x", (w - padding.left - padding.right) / 2)
        .attr("y", (padding.top / 2) + 20)
        .attr("id", "description")
        .attr("text-anchor", "middle")
        .text("1753 - 2015");

    // Create Tooltip
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("display", "none");

    // Fetch Data
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Process Data
            const monthlyVar = data.monthlyVariance;
            const baseTemp = data.baseTemperature;
            monthlyVar.forEach(d => d.month -= 1);

            // Calculate Min and Max Temperatures
            const minTemp = baseTemp + d3.min(monthlyVar, d => d.variance);
            const maxTemp = baseTemp + d3.max(monthlyVar, d => d.variance);

            // Create X Scale
            const xScale = d3
                .scaleBand()
                .domain(monthlyVar.map(d => d.year))
                .range([padding.left, w - padding.right]);

            // Create Y Scale
            const yScale = d3
                .scaleBand()
                .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
                .range([padding.top, h - padding.bottom]);

            // Create Diverging Color Scale
            const divergingColorScale = d3
                .scaleDiverging()
                .domain([minTemp, baseTemp, maxTemp])
                .range(["blue", "white", "red"]);

            // Create X Axis
            const xAxis = d3
                .axisBottom(xScale)
                .tickValues(xScale.domain().filter(year => year % 10 === 0));

            svg.append("g")
                .attr("transform", `translate(0, ${h - padding.bottom})`)
                .attr("id", "x-axis")
                .call(xAxis);

            // Create Y Axis
            const yAxis = d3
                .axisLeft(yScale)
                .tickValues(yScale.domain())
                .tickFormat(d => d3.timeFormat("%B")(new Date(2000, d, 1)));

            svg.append("g")
                .attr("transform", `translate(${padding.left}, 0)`)
                .attr("id", "y-axis")
                .call(yAxis);

            // Calculate Temperature Value Corresponding to Start of Each Color Swatch Interval
            const colorSwatchStartTemps = Array.from({ length: numTicks }, (_, i) => {
                return minTemp + (i * (maxTemp - minTemp) / numColors);
            });

            // Create Legend Container
            const legend = svg
                .append("g")
                .attr("id", "legend")
                .attr("transform", `translate(${padding.left}, ${h - padding.bottom + legendPadding})`);

            // Create Legend Color Scale
            const legendColorScale = d3
                .scaleDiverging()
                .domain([minTemp, baseTemp, maxTemp])
                .range(["blue", "white", "red"]);

            // Create Legend X Scale
            const legendScaleX = d3
                .scaleLinear()
                .domain([minTemp, maxTemp])
                .range([0, legendWidth]);

            // Create Legend X Axis
            const legendAxisX = d3
                .axisBottom(legendScaleX)
                .tickValues(colorSwatchStartTemps)
                .tickSize(10)
                .tickFormat(d => d.toFixed(1));

            legend.append("g")
                .attr("transform", `translate(0, ${legendHeight})`)
                .call(legendAxisX);

            // Add Color Swatches
            for (let i = 0; i < numColors; i++) {
                legend.append("rect")
                    .attr("x", i * legendColorWidth)
                    .attr("y", 0)
                    .attr("width", legendColorWidth)
                    .attr("height", legendHeight)
                    .attr("fill", legendColorScale(colorSwatchStartTemps[i]))
                    .style("stroke", "black");
            }

            // Create Cells
            const cell = svg.selectAll(".cell")
                .data(monthlyVar)
                .enter()
                .append("rect")
                .attr("x", d => xScale(d.year))
                .attr("y", d => yScale(d.month))
                .attr("width", xScale.bandwidth())
                .attr("height", yScale.bandwidth())
                .attr("fill", d => divergingColorScale(baseTemp + d.variance))
                .attr("class", "cell")
                .attr("data-month", d => d.month)
                .attr("data-year", d => d.year)
                .attr("data-temp", d => baseTemp + d.variance)
                .on("mouseover", function(event, d) {
                    tooltip
                        .style("display", "block")
                        .style("left", `${event.pageX}px`)
                        .style("top", `${event.pageY}px`)
                        .attr("data-year", d.year)
                        .html(
                            `Month: ${d.month + 1}<br>
                            Year: ${d.year}<br>
                            Temperature: ${(baseTemp + d.variance).toFixed(2)}&deg;C<br>
                            Variance: ${d.variance}&deg;C`
                        );
                    d3.select(this).style("border", "1px solid black");
                })
                .on("mouseout", function() {
                    tooltip
                        .style("display", "none");
                    d3.select(this).style("border", "none");
                });
        });
});
