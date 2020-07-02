var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

console.log("Checkpoint: 1");

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// #scatter is to grab the id = scatter in the index.html file
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
// These are the names of the columns in the csv
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating X-scale var upon click on axis label
function xScale(dataFromCSV, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(dataFromCSV, d => d[chosenXAxis]) * 0.8,
        d3.max(dataFromCSV, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating X-Axis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating Y-scale var upon click on axis label
function yScale(dataFromCSV, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(dataFromCSV, d => d[chosenYAxis]) * 0.8,
        d3.max(dataFromCSV, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating Y-Axis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var left_Axis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(left_Axis);

    return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var x_label;

    //Here are the three X-axis options for the tooltips
    if (chosenXAxis === "poverty") {
        x_label = "Poverty:";
    }
    else if (chosenXAxis === 'age') {
        x_label = "Age:";
    }
    else {
        x_label = "Household Income:";
    }

    var y_label;

    //Here are the three Y-axis options for the tooltips
    if (chosenYAxis === "obesity") {
        y_label = "Obesity:";
    }
    else if (chosenYAxis === 'smokes') {
        y_label = "Smokers:";
    }
    else {
        y_label = "Lacking Healthcare:";
    }


    //This makes the ToolTip itself
    var toolTip = d3.tip()
        .attr("class", "tagForTooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${x_label} ${xFormat(d[chosenXAxis], chosenXAxis)}<br>${y_label} ${d[chosenYAxis]}%`);
        });

    circlesGroup.call(toolTip);

    // on-mouse-over event listener
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // on-mouse-over event listener
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

console.log("Checkpoint: 2");

// This function will update the state labels and use the transition function to place them to where we want 
function makeText(stateLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    stateLabels.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]) -7)
        .attr("y", d => newYScale(d[chosenYAxis]));

    return stateLabels;
}

//This function makes the X-axis the style/format that you want the input-numbers to have for the tooltips
function xFormat(inputNumber, chosenXAxis) {

    //stylize based on variable chosen
    //poverty percentage
    if (chosenXAxis === 'poverty') {
        return `${inputNumber}%`;
    }
    //household income in dollars
    else if (chosenXAxis === 'income') {
        return `$${inputNumber}`;
    }
    //age (number)
    else {
        return `${inputNumber}`;
    }
}

console.log("Checkpoint: 3");

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function (dataFromCSV, err) {
    if (err) throw err;

    console.log("Checkpoint: 4");

    // parse data
    dataFromCSV.forEach(function (data) {
        data.poverty = +data.poverty;
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(dataFromCSV, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(dataFromCSV, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(dataFromCSV)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "pink")
        .attr("opacity", ".5");


    // append initial text in the circles
    var textForCircles = chartGroup.selectAll(".stateAbbr")
        .data(dataFromCSV)
        .enter()
        .append("text")
        .classed("stateAbbr", true)
        .attr("x", d => xLinearScale(d[chosenXAxis])-7)
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", 3)
        .attr("font-size", "11px")
        .text(function (d) { return d.abbr });


    // Create group for all three x-axis labels
    var x_labels_Group = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = x_labels_Group.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Poverty (%)");

    var ageLabel = x_labels_Group.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = x_labels_Group.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for all three y-axis labels
    var y_labels_Group = chartGroup.append("g")
        .attr("transform", `translate(${margin.left}, ${height/2})`);

    var obesityLabel = y_labels_Group.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", 0 - 2*margin.left)
        .attr("dy", "1em")
        .classed("active", true)
        .attr("value", "obesity") // value to grab for event listener
        .text("Obesity (%)");

    var smokerLabel = y_labels_Group.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", 0 - 2*margin.left +20)
        .attr("dy", "1em")
        .classed("inactive", true)
        .attr("value", "smokes") // value to grab for event listener
        .text("Smoker (%)");

    var healthcareLabel = y_labels_Group.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", 0 - 2*margin.left +40)
        .attr("dy", "1em")
        .classed("inactive", true)
        .attr("value", "healthcare") // value to grab for event listener
        .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    x_labels_Group.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(dataFromCSV, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update text with new x values
                textForCircles = makeText(textForCircles, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "income") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel.classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }

        });

    // y-axis labels event listener
    y_labels_Group.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                // console.log(chosenYAxis)

                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(dataFromCSV, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update text with new y values
                textForCircles = makeText(textForCircles, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokerLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokerLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokerLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }

        });

}).catch(function (error) {
    console.log(error);
});
