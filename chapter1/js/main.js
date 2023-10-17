//declare map variable globally so all functions have access
let map;
let minValue;

//step 1 create map
function createMap(){

    //create the map
    map = L.map('map', {
        center: [46.4419, -93.3655],
        zoom: 6
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};

function calculateMinValue(data){
    //create empty array to store all data values
    let allValues = [];
    //loop through each city
    for(let city of data.features){
        //loop through each year
        for(let year = 2010; year <= 2019; year+=5){
            //get population for current year
            let value = city.properties["AvgComTime"+ String(year)];
            //add value to array
            allValues.push(value);
        }
    }
    //get minimum value of our array
    let minValue = Math.min(...allValues)

    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    let minRadius = 5;
    //Flannery Appearance Compensation formula
    let radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, attributes){

    //Step 4: Determine which attribute to visualize with proportional symbols
    let attribute = "AvgComTime2010";

    //create marker options
    let geojsonMarkerOptions = {
        fillColor: "#ff7800",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        radius: 8  // Adjusted to match the calculated radius
    };

    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            //Step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);

            //Step 6: Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);  // Changed from options to geojsonMarkerOptions

            //create circle marker layer
            var layer = L.circleMarker(latlng, geojsonMarkerOptions);  // Changed from options to geojsonMarkerOptions

            //build popup content string starting with city
            var popupContent = "<p><b>City:</b> " + feature.properties.city + "</p>";

            // Add the attribute value to the popup content string
            popupContent += "<p><b>Avg Commute Time (2010):</b> " + attValue + " minutes" + "</p>";

            // Bind the popup to the circle marker
            layer.bindPopup(popupContent);  // Added this line to bind popup

            return layer;

            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);  // Changed from options to geojsonMarkerOptions
        }
    }).addTo(map);
};

function createSequenceControls(){
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

    //set slider attributes
    document.querySelector(".range-slider").max = 14;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');
};

//build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    let attributes = [];

    //properties of the first feature in the dataset
    let properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (let attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("AvgComTime") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    fetch("data/AvgComTimesGJSON.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create an attributes array
            let attributes = processData(json);
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json);
            createSequenceControls();
        })
};



document.addEventListener('DOMContentLoaded',createMap)