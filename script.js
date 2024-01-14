            document.addEventListener('DOMContentLoaded', function() {
                const h = 600;
                const w = 1400;
                const padding = 60;
                const apiUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

                //create svg container
                const svg = d3.select("body")
                .append("svg")
                .attr("height", h)
                .attr("width", w)
                .attr("class", "map");

                //Add a title
                const title = svg.append("text")
                    .attr("x", (w - 2 * padding) / 2)
                    .attr("y", padding)
                    .attr("id", "title")
                    .attr("text-anchor", "middle")
                    .text("Temperature Variations Heatmap");

                //Add title description
                const description = svg.append("text")
                    .attr("x", (w - 2 * padding) / 2)
                    .attr("y", padding + 30)
                    .attr("id", "description")
                    .attr("text-anchor", "middle")
                    .text("1753 - 2015");
                
                //create tooltip
                const tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .attr("id", "tooltip")
                .style("display", "none");
                
                //fetch data
                fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                //process data
                const monthlyVar = data.monthlyVariance;
                const baseTemp = data.baseTemperature;
                const minTemp = baseTemp + d3.min(monthlyVar, d => d.variance);
                const maxTemp = baseTemp + d3.max(monthlyVar, d => d.variance);
                const yearExtent = d3.extent(monthlyVar, d => d.year);
                const roundedStartYear = Math.ceil(yearExtent[0] / 10) * 10;
                    
                //create xScale
                const xScale = d3.scaleLinear()
                    .domain(d3.extent(monthlyVar, (d) => d.year))
                    .range([padding, w - padding]);
                
                //create yScale
                const yScale = d3.scaleLinear()
                    .domain([1, 13])
                    .range([2 * padding, h - padding]);

                //create a diverging color scale
                const divergingColorScale = d3.scaleDiverging()
                    .domain([minTemp, baseTemp, maxTemp])
                    .range(["blue", "white", "red"]);
                
                //create x-axis
                const xAxis = d3.axisBottom(xScale)
                    .tickValues(d3.range(roundedStartYear, yearExtent[1] + 1, 10));
                svg.append("g")
                    .attr("transform", `translate(0, ${h - padding})`)
                    .attr("id", "x-axis")
                    .call(xAxis);

                //create y-axis
                const yAxis = d3.axisLeft(yScale)
                    .tickValues(d3.range(1, 13))
                    .tickFormat(d => d3.timeFormat("%B")(new Date(2000, d-1, 1)));
                svg.append("g")
                    .attr("transform", `translate(${padding}, 0)`)
                    .attr("id", "y-axis")
                    .call(yAxis);
                    
                //create cells
                const cell = svg.selectAll("rect")
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
                            .style("display", "inline-block")
                            .style("left", `${event.pageX}px`)
                            .style("top", `${event.pageY}px`)
                            .attr("data-year", d.year)
                            .html(
                                `Month: ${d.month}<br>
                                 Year: ${d.year}<br>
                                 Temperature: ${baseTemp + d.variance}&deg;C<br>
                                 Variance: ${d.variance}&deg;C`
                                 )
                    })
                    .on("mouseout", function() {
                        tooltip
                            .style("display", "none")
                    })
                })
                
            })