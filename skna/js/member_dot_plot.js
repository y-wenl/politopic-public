// Code based on beeswarm.js by Martin Heinz, released under MIT license:
// Copyright 2020 Martin Heinz
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


let height = 500;
let width = 1000;
let margin = ({top: 0, right: 40, bottom: 34, left: 40});

// Data structure describing displayed data
let Datum = {
    age: "age",
    gender: "gender",
    terms: "terms",
    attendance: "attendance",
    loyalty: "loyalty",
    dp_vote_freq: "dp_vote_freq",
    dp_alignment: "dp_alignment",
    gugmin_alignment: "gugmin_alignment",
    jeong_alignment: "jeong_alignment"
};

// Data structure describing legend fields value
let Legend = {
    age: "나이",
    gender: "젠더",
    terms: "당선횟수",
    attendance: "출석속도",
    loyalty: "정당 충실",
    dp_vote_freq: "더불어민주당과 투표속도",
    dp_alignment: "더불어민주당과 평균유사성",
    gugmin_alignment: "국민의힘과 평균유사성",
    jeong_alignment: "정의당과 평균유사성",
};

// Data structure describing how numbers should be formatted
let NFormat = {
    age: "d",
    gender: "s",
    terms: "d",
    attendance: ".2%",
    loyalty: ".3f",
    dp_vote_freq: ".2%",
    dp_alignment: ".3f",
    gugmin_alignment: ".3f",
    jeong_alignment: ".3f"
};

let chartState = {};

chartState.measure = Datum.age;
chartState.legend = Legend.age;
chartState.nformat = NFormat.age;

let ypos = {
    "더불어민주당": 1.2*(height / 3) - margin.bottom / 2,
    "국민의힘":     2.1*(height / 3) - margin.bottom / 2,

    "정의당":     2.7*(height / 3) - margin.bottom / 2,
    "국민의당":   2.7*(height / 3) - margin.bottom / 2,
    "기본소득당": 2.7*(height / 3) - margin.bottom / 2,
    "시대전환":   2.7*(height / 3) - margin.bottom / 2,
    "무소속":     2.7*(height / 3) - margin.bottom / 2
}

// Colors used for circles depending on party group
let colors = d3.scaleOrdinal()
    .domain(["더불어민주당",
        "국민의힘",
        "정의당",
        "국민의당",
        "기본소득당",
        "시대전환",
        "무소속"])
    .range(['#004EA2','#E61E2B','#FFCC00','#FCA746','#82C8B4','#5A147E','#999999']);

d3.select("#dpColor").style("color", colors("더불어민주당"));
d3.select("#gugminColor").style("color", colors("국민의힘"));
d3.select("#jeongColor").style("color", colors("정의당"));
d3.select("#ppColor").style("color", colors("국민의당"));
d3.select("#bipColor").style("color", colors("기본소득당"));
d3.select("#sidaeColor").style("color", colors("시대전환"));
d3.select("#musogColor").style("color", colors("무소속"));

let svg = d3.select("#svganchor")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

let xScale = d3.scaleLinear()
    .range([margin.left, width - margin.right]);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")");

// Create tooltip div and make it invisible
let tooltip = d3.select("#svganchor").append("div")
    .attr("class", "graph-tooltip")
    .style("opacity", 0);

// Create party labels
svg.append("text")
    .attr("class", "party_group")
    .attr("x", 0)
    .attr("y", ypos["더불어민주당"] - height*0.13)
    .text("더불어민주당");
svg.append("text")
    .attr("class", "party_group")
    .attr("x", 0)
    .attr("y", ypos["국민의힘"] - height*0.1)
    .text("국민의힘");
svg.append("text")
    .attr("class", "party_group")
    .attr("x", 0)
    .attr("y", ypos["무소속"] - height*0.1)
    .text("기타");

// create csv parser for parseRows
let csvHeaders = [];
function csvParser(row_data, index) {
    if (index == 0) {
        csvHeaders = row_data;
        return null; // not added
    } else {
        // map headers to data
        output = {};
        for (let i = 0; i < csvHeaders.length; i++) {
            output[csvHeaders[i]] = row_data[i];
        }
    }
    return output;
}

// Load and process data
//d3.csv("data/members_fullinfo_session21.csv") // triggers csp error
d3.text("data/members_fullinfo_session21.csv")
    .then(text => d3.csvParseRows(text, csvParser))
    .then(function (data) {

    let dataSet = data;

    // Set chart domain max value to the highest age value in data set
    xScale.domain(d3.extent(data, function (d) {
        return +d.age;
    }));

    redraw();

    // Listen to click on "age", "loyalty", "dp freq" buttons and trigger redraw when they are clicked
    d3.selectAll(".measure-button").on("click", function() {
        let thisClicked = this.value;

        if (chartState.measure !== thisClicked) {
            chartState.measure = thisClicked;
            if (thisClicked === Datum.age) {
                chartState.legend = Legend.age;
                chartState.nformat = NFormat.age;
            }
            if (thisClicked === Datum.gender) {
                chartState.legend = Legend.gender;
                chartState.nformat = NFormat.gender;
            }
            if (thisClicked === Datum.terms) {
                chartState.legend = Legend.terms;
                chartState.nformat = NFormat.terms;
            }
            if (thisClicked === Datum.attendance) {
                chartState.legend = Legend.attendance;
                chartState.nformat = NFormat.attendance;
            }
            if (thisClicked === Datum.loyalty) {
                chartState.legend = Legend.loyalty;
                chartState.nformat = NFormat.loyalty;
            }
            if (thisClicked === Datum.dp_vote_freq) {
                chartState.legend = Legend.dp_vote_freq;
                chartState.nformat = NFormat.dp_vote_freq;
            }
            if (thisClicked === Datum.dp_alignment) {
                chartState.legend = Legend.dp_alignment;
                chartState.nformat = NFormat.dp_alignment;
            }
            if (thisClicked === Datum.gugmin_alignment) {
                chartState.legend = Legend.gugmin_alignment;
                chartState.nformat = NFormat.gugmin_alignment;
            }
            if (thisClicked === Datum.jeong_alignment) {
                chartState.legend = Legend.jeong_alignment;
                chartState.nformat = NFormat.jeong_alignment;
            }
            redraw();
        }
    });

    function redraw() {

        // set current button
        // TODO
        d3.selectAll(".measure-button").each(function() {
            if (this.value === chartState.measure) {
                d3.select(this).classed("current", true);
            } else {
                d3.select(this).classed("current", false);
            }
        });

        // Set scale to linear
        xScale = d3.scaleLinear().range([ margin.left, width - margin.right ])

        let xExtent = d3.extent(dataSet, function(d) {
            return +d[chartState.measure];
        })

        if (chartState.measure === Datum.dp_vote_freq) {
            // increase extent a bit to accommodate everything near 1
            xExtent[1] = 1.02;
        }
        //if (chartState.measure === Datum.loyalty) {
            //// increase extent a bit to accommodate everything near 1
            //xExtent[1] = 1.02;
        //}
        if ((chartState.measure === Datum.loyalty)
            || (chartState.measure === Datum.dp_alignment)
            || (chartState.measure === Datum.gugmin_alignment)
            || (chartState.measure === Datum.jeong_alignment)
        ) {
            let xMin1 = d3.min(dataSet, function(d) {
                // trick to get minimum nonzero value
                return +d[Datum.loyalty] || Infinity;
            });
            let xMin2 = d3.min(dataSet, function(d) {
                return +d[Datum.dp_alignment];
            });
            let xMin3 = d3.min(dataSet, function(d) {
                return +d[Datum.gugmin_alignment];
            });
            let xMin4 = d3.min(dataSet, function(d) {
                return +d[Datum.jeong_alignment];
            });

            xExtent[0] = Math.min(xMin1, xMin2, xMin3, xMin4);
            xExtent[1] = 1.02;
        }
        if (chartState.measure === Datum.attendance) {
            // set extent manually
            xExtent[0] = 0;
            xExtent[1] = 1;
        }
        if (chartState.measure === Datum.gender) {
            // set extent manually
            xExtent[0] = 0;
            xExtent[1] = 1;
        }
        if (chartState.measure === Datum.terms) {
            // set extent manually
            xExtent[0] = 0;
            xExtent[1] = d3.max(dataSet, function(d) {
                return +d[Datum.terms];
            }) + 0.5;
        }

        xScale.domain(xExtent);

        let xAxis;
        // Set X axis based on new scale. If chart is set to "loyalty" use numbers with a few decimal points
        if ((chartState.measure === Datum.loyalty)
            || (chartState.measure === Datum.dp_alignment)
            || (chartState.measure === Datum.gugmin_alignment)
            || (chartState.measure === Datum.jeong_alignment)) {
            xAxis = d3.axisBottom(xScale)
                .ticks(10, ".2f")
                .tickSizeOuter(0);
        }
        else if (chartState.measure === Datum.age) {
            xAxis = d3.axisBottom(xScale)
                .ticks(10, "d")
                .tickSizeOuter(0);
        }
        else if (chartState.measure === Datum.dp_vote_freq) {
            xAxis = d3.axisBottom(xScale)
                .ticks(10, ".0%")
                .tickSizeOuter(0);
        }
        else if (chartState.measure === Datum.attendance) {
            xAxis = d3.axisBottom(xScale)
                .ticks(10, ".0%")
                .tickSizeOuter(0);
        }
        else if (chartState.measure === Datum.gender) {
            xAxis = d3.axisBottom(xScale)
                .tickValues([0.25, 0.75])
                .tickFormat(function(d) {
                    if (d < 0.5) return "여성";
                    return "남성";
                })
                .tickSizeOuter(0);
        }
        else if (chartState.measure === Datum.terms) {
            xAxis = d3.axisBottom(xScale)
                .ticks(d3.max(dataSet, function(d) {
                    return +d[Datum.terms];
                }) + 1
                    , "d")
                .tickSizeOuter(0);
        }
        else {
            xAxis = d3.axisBottom(xScale)
                .ticks(10, ".1s")
                .tickSizeOuter(0);
        }

        d3.transition(svg).select(".x.axis")
            .transition()
            .duration(250)
            .call(xAxis);

        // Create simulation with specified dataset
        let simulation = d3.forceSimulation(dataSet)
            // Apply positioning force to push nodes towards desired position along X axis
            .force("x", d3.forceX(function(d) {
                // Mapping of values from age/loyalty/dp_vote_freq column of dataset to range of SVG chart (<margin.left, margin.right>)
                if (chartState.measure === Datum.gender) {
                    if (d[chartState.measure] === "M")
                        return xScale(0.75);
                    return xScale(0.25);
                } else {
                    return xScale(+d[chartState.measure]);
                }
            }).strength(
                function(d) {
                if (chartState.measure === Datum.gender) return 0.1;
                if (chartState.measure === Datum.terms) return 0.2;
                return 2;
            }
            ))  // Increase velocity
            .force("y", d3.forceY(function(d) {
                // Apply positioning force to push nodes towards center along Y axis
                return ypos[d.party_group]
            }))
            .force("collide", d3.forceCollide(6)) // Apply collision force with radius of 6 - keeps nodes centers 6 pixels apart
            .stop();  // Stop simulation from starting automatically

        // Manually run simulation
        for (let i = 0; i < dataSet.length; ++i) {
            simulation.tick(1); // reduced from 10 to speed things up
        }

        // Create member circles
        let membersCircles = svg.selectAll(".members")
            .data(dataSet, function(d) { return d.member_id });

        // Add link
        //membersCircles.append("a")
            //.attr("xlink:href", function(d) { return "/skna/member_page_" + d.member_id + ".html" });

        // exit might be broken? anyway, we're not using it
        membersCircles.exit()
            .transition()
            .duration(1000)
            .attr("cx", 0)
            .attr("cy", function (d) { return ypos[d.party_group] })
            .remove();

        membersCircles.enter()
            .append("a")
            .attr("xlink:href", function(d) { return "/skna/member_page_" + d.member_id + ".html" })
            .append("circle")
            .attr("class", "members")
            .attr("cx", 0)
            .attr("cy", function (d) { return ypos[d.party_group] })
            .attr("r", 5)
            .attr("fill", function(d){ return colors(d.party_group)})
            .merge(membersCircles)
            .transition()
            .duration(1000)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        // Show tooltip when hovering over circle (data for respective member)
        function formatData(d, measure, nformat) {
            if (measure === Datum.gender) {
                if (d[measure] === "M") return "남성";
                if (d[measure] === "F") return "여성";
                return d[measure];
            } else {
                return d3.format(nformat)(d[measure]);
            }
        }

        d3.selectAll(".members").on("mousemove", function(event, d) {
            tooltip.html(`이름: <strong>${d.name}</strong><br>
                          정당: <strong>${d.party_group}</strong><br>
                          선거구: <strong>${d.district}</strong><br>
                          ${chartState.legend}:
                          <strong>${formatData(d, chartState.measure, chartState.nformat)}</strong>`)
                .style('top', event.pageY - 12 + 'px')
                .style('left', event.pageX + 25 + 'px')
                .style("opacity", 0.9);

        }).on("mouseout", function(_) {
            tooltip.style("opacity", 0);
        });

    }

}).catch(function (error) {
    if (error) throw error;
});
