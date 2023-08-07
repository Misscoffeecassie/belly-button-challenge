// Global Variable for Data Storage
var bellyButtonData = {};

// HTML Selectors
var dropdownMenu = d3.select("#selDataset");
var demographicPanel = d3.select("#sample-metadata");

// Function to Capitalize Each Word in a String
function capitalizeWords(inputStr) {
    return inputStr.toLowerCase().split(' ').map(function(word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}


// Function to Populate the Demographics Panel
function updateDemographicsPanel(id) {

    var metadataSubset = bellyButtonData.metadata.filter(item => item["id"] == id);
    
    demographicPanel.html("");
    
    Object.entries(metadataSubset[0]).forEach(([key, value]) => { var capitalizedKey = capitalizeWords(key); demographicPanel.append("h6").text(`${capitalizedKey}: ${value}`) });
}



function sortKeyValues(key, order = 'asc') {
    return function innerSort(objA, objB) {
        if (!objA.hasOwnProperty(key) || !objB.hasOwnProperty(key)) {
            return 0;
        }
        const valueA = (typeof objA[key] === 'string')
            ? objA[key].toUpperCase() : objA[key];
        const valueB = (typeof objB[key] === 'string')
            ? objB[key].toUpperCase() : objB[key];
        let comparison = 0;
        if (valueA > valueB) {
            comparison = 1;
        } else if (valueA < valueB) {
            comparison = -1;
        }
        return (
            (order === 'desc') ? (comparison * -1) : comparison
        );
    };
}

// Function to Draw the Bubble Chart
function createBubbleChart(id) {

    var samplesSubset = bellyButtonData["samples"].filter(item => item["id"] == id);
    var bubbleTrace = {
        x: samplesSubset[0].otu_ids,
        y: samplesSubset[0].sample_values,
        mode: 'markers',
        text: samplesSubset[0].otu_labels,
        marker: {
                    color: samplesSubset[0].otu_ids,
                    size: samplesSubset[0].sample_values,
                    colorscale: "Earth"
        }
    };
    var bubbleData = [bubbleTrace];
    var bubbleLayout = {
                    showlegend: false,
                    height: 600,
                    width: 1200,
                    xaxis: { title: "OTU ID"}
    };
    Plotly.newPlot('bubble', bubbleData, bubbleLayout);
}


// Draw the gauge chart
function drawGaugeChart(id) {

    // Just grab the one ID we want
    var metadataSubset = bellyButtonData.metadata.filter(item => item["id"] == id);
    var level = metadataSubset[0].wfreq;

      var gData = [{
        mode: "gauge+number",
        type: "indicator",
        value: level,
        title: { text: "Scrubs per week", font: { size: 16 }},
        gauge: {
          axis: { range: [null, 10] },
          steps: [
            { range: [0, 2], color: "#d3e8d3" },
            { range: [2, 4], color: "#a7d1a7" },
            { range: [4, 6], color: "#7ab97a" },
            { range: [6, 8], color: "#64ae64" },
            { range: [8, 10], color: "#389738" },
          ],
          bar: { color: "black" }
        }
      }];
      
      // 5. Create the layout for the gauge chart.
      var gLayout = { 
        title: { text: "Belly Button Washing Frequency", font: { size: 24 }},
        margin: { t: 150, r: 25, l: 25, b: 130 },
        paper_bgcolor:"rgb(0,0,0,0)"
      };
  
    Plotly.newPlot('gauge', gData, gLayout);
}
// Function to Draw the Bar Plot
function createHorizontalBarPlot(id) {
    console.log("Creating Bar Plot: " + id);
    var samplesSubset = bellyButtonData["samples"].filter(item => item["id"] == id);
    var sample_values = samplesSubset[0].sample_values;
    var otu_ids = samplesSubset[0].otu_ids;
    var otu_labels = samplesSubset[0].otu_labels;
    var combinedData = [];
    for (var i=0; i < sample_values.length; i++) {
        var otu_id = "OTU " + otu_ids[i].toString();
        var dataObject = {"sample_values": sample_values[i], "otu_ids": otu_id, "otu_labels": otu_labels[i]};
        combinedData.push(dataObject);
    }
    var sortedData = combinedData.sort(sortKeyValues("sample_values", "desc"));
    
    var topTenData = sortedData.slice(0, 10).reverse();  // Top 10 data displayed
    var barTrace = {
        type: "bar",
        y: topTenData.map(item => item.otu_ids),
        x: topTenData.map(item => item.sample_values),
        text: topTenData.map(item => item.otu_labels),
        orientation: 'h'
    };
    var barData = [barTrace];
    var barLayout = {
        title: "Top 10 OTUs Found",
        yaxis: { title: "OTU Labels" },
        xaxis: { title: "Values"}
    };
    Plotly.newPlot("bar", barData, barLayout);
}

// Initialization: Load the data, set up the dropdown menu, and draw the initial graphs
function initializeDashboard() {
    d3.json("https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json").then(function(jsonData) {
    
        bellyButtonData = jsonData;
        names = bellyButtonData.names;
        names.forEach(element => { dropdownMenu.append("option").text(element).property("value", element); });

        var id = names[0];

        updateDemographicsPanel(id);
        createHorizontalBarPlot(id);
        createBubbleChart(id);
        drawGaugeChart(id);
    });
}

initializeDashboard();

function optionChanged(newId) {
    updateDemographicsPanel(newId);
    createHorizontalBarPlot(newId);
    createBubbleChart(newId);
    drawGaugeChart(newId);
};