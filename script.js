document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
    const h = 600;
    const w = 1400;
    const padding = 60;

    //Create SVG Container
    const svg = d3
        .select("body")
        .append("svg")
        .attr("height", h)
        .attr("width", w)
        .attr("class", "map");

    //Add Title
    const title = svg
        .append("text")
        .attr("x", (w - 2 * padding) / 2)
        .attr("y", padding)
        .attr("id", "title")
        .attr("text-anchor", "middle")
        .text("Temperature Variations Heatmap");

    //Add Description
    const description = svg
        .append("text")
        .attr("x", (w - 2 * padding) / 2)
        .attr("y", padding + 30)
        .attr("id", "description")
        .attr("text-anchor", "middle")
        .text("1753 - 2015");

    //Create Tooltip
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
    // Process data
    const monthlyVar = data.monthlyVariance;
    const baseTemp = data.baseTemperature;
    monthlyVar.forEach(d => d.month -= 1);

    // Calculate Minimum and Maximum Temperatures
    const minTemp = baseTemp + d3.min(monthlyVar, d => d.variance);
    const maxTemp = baseTemp + d3.max(monthlyVar, d => d.variance);

    // Create xScale
    const xScale = d3
        .scaleBand()
        .domain(monthlyVar.map(d => d.year))
        .range([padding, w - padding]);

    // Create yScale
    const yScale = d3
        .scaleBand()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .range([2 * padding, h - padding]);

    // Create Diverging Color Scale
    const divergingColorScale = d3
        .scaleDiverging()
        .domain([minTemp, baseTemp, maxTemp])
        .range(["blue", "white", "red"]);

    // Create X Axis
    const xAxis = d3
        .axisBottom(xScale)
        .tickValues(xScale.domain().filter(year => year % 10 === 0))
    svg
        .append("g")
        .attr("transform", `translate(0, ${h - padding})`)
        .attr("id", "x-axis")
        .call(xAxis);

    // Create Y Axis
    const yAxis = d3
        .axisLeft(yScale)
        .tickValues(yScale.domain())
        .tickFormat(d => d3.timeFormat("%B")(new Date(2000, d, 1)));
    svg
        .append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .attr("id", "y-axis")
        .call(yAxis);

    // Create Cells
    const cell = svg
        .selectAll("rect")
        .data(monthlyVar)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.month))
        .attr("height", (h - (2 * padding)) / 12)
        .attr("width", (w - (2 * padding)) / (monthlyVar.length / 12))
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