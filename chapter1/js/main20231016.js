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
function createPropSymbols(data){

    //Step 4: Determine which attribute to visualize with proportional symbols
    let attribute = "AvgComTime2010";

    //create marker options
    let geojsonMarkerOptions = {
        fillColor: "#ff7800",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        radius: 8
    };

    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            //Step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);

            //Step 6: Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            //create circle marker layer
            var layer = L.circleMarker(latlng, options);

            //build popup content string starting with city
            var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";


            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};


//Step 2: Import GeoJSON data
function getData(){
    //load the data
    fetch("data/AvgComTimesGJSON.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json);
        })
};

document.addEventListener('DOMContentLoaded',createMap)