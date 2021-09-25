// http://api.airvisual.com/v2/countries?

// http://api.airvisual.com/v2/states?
    // needs country

// http://api.airvisual.com/v2/cities?
    // needs state
    // needs country

// http://api.airvisual.com/v2/city?
    // needs state
    // needs country
    // needs city

// http://api.airvisual.com/v2/nearest_city?

// app.apiUrl = "http://api.airvisual.com/v2/";


// TEST SEARCH PARAMS
// app.apiCountry = "Canada";
// app.apiState = "Ontario";
// app.apiCity = "Toronto";
// app.apiLat = 43.69309370534632;
// app.apiLon = -79.43223323783614;


// Description	    Name	    Icon
// clear sky        (day)	    01d.png	
// clear sky        (night)	    01n.png	
// few clouds       (day)	    02d.png	
// few clouds       (night)	    02n.png	
// scattered clouds	            03d.png	
// broken clouds	            04d.png	
// shower rain	                09d.png	
// rain             (day time)	10d.png	
// rain             (night time)10n.png	
// thunderstorm	                11d.png	
// snow	                        13d.png	
// mist	                        50d.png	

// https://airvisual.com/images/[[[url]]]
//ex
// https://airvisual.com/images/01d.png

// "p2": "ugm3", //pm2.5
// "p1": "ugm3", //pm10
// "o3": "ppb", //Ozone O3
// "n2": "ppb", //Nitrogen dioxide NO2 
// "s2": "ppb", //Sulfur dioxide SO2 
// "co": "ppm" //Carbon monoxide CO 

const app = {};

app.apiEndpointListCountries = "http://api.airvisual.com/v2/countries";
app.apiEndpointListStates = "http://api.airvisual.com/v2/states";
app.apiEndpointListCities = "http://api.airvisual.com/v2/cities";
app.apiEndpointCityInfo = "http://api.airvisual.com/v2/city";
app.apiEndpointNearestCity = "http://api.airvisual.com/v2/nearest_city";

app.apiKey = "f54d55f6-4ef0-4a18-baa0-cf8f3273a20a";

app.apiCountry = null;
app.apiState = null;
app.apiCity = null;
app.apiLat = null;
app.apiLon = null;

const countrySelector = document.querySelector('#countrySelection');
const stateSelector = document.querySelector('#stateSelection');
const citySelector = document.querySelector('#citySelection');

app.createDropdown = function(selectList, defaultOption, nextSelection, step){
    selectList.forEach(function(listItem){
        nextSelection.disabled = false;
        const options = document.createElement('option');

        if (step == "getCountries"){
            options.innerText = listItem.country;
            options.value = listItem.country;
        }
        else if (step == "getStates"){
            options.innerText = listItem.state;
            options.value = listItem.state;
        }
        else if (step == "getCities"){
            options.innerText = listItem.city;
            options.value = listItem.city;
        }
        else{
            console.log("ERRORS ALL AROUND");
        }
        nextSelection.append(options);
    });
    nextSelection.append(defaultOption)
}

app.printInfo = function(city) {

    console.log("succesfully printed info");
    
    const header = document.querySelector('.header');
    const main = document.querySelector('.main');
    const mainSelection = document.querySelector('.main__selection');

    header.classList.add('header__animation');
    mainSelection.classList.add('main__container');
    main.classList.remove('displayNone');

    const mainUlElement = document.querySelector('.main__apiInfo ul');
    mainUlElement.innerHTML = `
    <li>${city.city}</li>
    <li>${city.country}</li>
    <li>${city.current.pollution.aqius}</li>
    <li>${city.current.weather.hu}</li>
    `

    console.log(city.location.coordinates);
    console.log(city.location.coordinates[0]);
    console.log(city.location.coordinates[1]);
    console.log(city.current.pollution.aqius);
    console.log(city.current.weather.hu); // humidity percent%
    console.log(city.current.weather.ic); // weather icon code
    console.log(city.current.weather.pr); // atmospheric pressure hPa
    console.log(city.current.weather.wd); // wind direction 360*angle N=0
    console.log(city.current.weather.ws); // windspeed m/s
    console.log(city.current.weather.ts); // timestamp
    console.log(city.current.weather.tp); // temperature in celcius
    console.log(city.current.pollution.mainus); //main pollutant
}

app.checkIfValidAPI = function(validateMe){
    console.log(validateMe);
    if (validateMe.status == "success"){
        // console.log(validateMe.data);
        return validateMe.data;
    }
    else if(validateMe.status == "fail"){
        return false;
    }
    else{console.log("HARD ERRORS");}
}

app.accessApi = async function(url){
    const res = await fetch(url);
    const jsonData = await res.json();
    return jsonData;
}

app.getApiData = async function(endpoint, nextSelectorID, step, currentDropdown){
    const url = new URL(endpoint);
    url.search = new URLSearchParams({
        key: app.apiKey,
        country: app.apiCountry,
        state: app.apiState,
        city: app.apiCity,
        lat: app.apiLat,
        lon: app.apiLon
    });

    app.accessApi(url)
    .then(function(apiObject){

        const nextSelection = document.querySelector(nextSelectorID);
        const defaultOption = document.createElement('option')
        defaultOption.selected = true;
        defaultOption.disabled = true;
        defaultOption.defaultSelected = true;
        defaultOption.hidden = true;
        defaultOption.text = "please select from dropdown";

        const selectList = app.checkIfValidAPI(apiObject);

        if (step == "getInfo") {
            app.printInfo(selectList);
        }
        else if (step == "getNearest") {
            console.log("attempting to get nearest");
            app.printInfo(selectList);
        }
        else if(selectList == false){
            defaultOption.text = "No entries found";
            currentDropdown.append(defaultOption);
        }
        else { 
            app.createDropdown(selectList, defaultOption, nextSelection, step);   
        }
    })
}

app.clearSelection = function(elementToSelect){
    const dropdown = document.querySelector(elementToSelect)
    dropdown.disabled = true;
    while (dropdown.hasChildNodes()) {  
        dropdown.removeChild(dropdown.firstChild);
    }
}

app.getSelection = function(){

    countrySelector.addEventListener('change', function(){
        app.apiCountry = this.value;
        app.getApiData(app.apiEndpointListStates, '#stateSelection', "getStates", countrySelector)
        app.clearSelection('#stateSelection');
        app.clearSelection('#citySelection');
    });

    stateSelector.addEventListener('change', function(){
        app.apiState = this.value;
        app.getApiData(app.apiEndpointListCities, '#citySelection', "getCities", stateSelector);
        app.clearSelection('#citySelection');
    });

    citySelector.addEventListener('change', function(){
        app.apiCity = this.value;
        app.getApiData(app.apiEndpointCityInfo, null, "getInfo", citySelector)
    });
}

app.init = function(){   
    // app.getApiData(app.apiEndpointNearestCity, null, "getNearest", null);
    app.getApiData(app.apiEndpointListCountries, '#countrySelection', "getCountries", null);
    app.clearSelection('#stateSelection');
    app.clearSelection('#citySelection');
    app.getSelection();
}

app.init();