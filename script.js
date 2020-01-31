'use strict';

const closestBtn = document.getElementById('closest-btn'),
    latitude = document.getElementById('latitude'),        
    longitude = document.getElementById('longitude'),
    stateAbbr = document.getElementById('state-abbr'),
    latitudes = document.querySelectorAll('input[id$="latitude"]'),
    longitudes = document.querySelectorAll('input[id$="longitude"]'),
    nameFields = document.querySelectorAll('input[id$="name"]'),
    addBtn = document.getElementById('add-btn'),
    allCitites = document.getElementById('all-cities'),
    saveLs = document.getElementById('save-ls'),
    clearLs = document.getElementById('clear-ls'),
    search = document.getElementById('search-name'),
    cityList = document.getElementById('city-list');

class City {
    constructor(cityName, stateAbbr, latitude, longitude) {
        this.cityName = cityName;
        this.stateAbbr = stateAbbr;
        this.latitude = latitude;
        this.longitude = longitude;
        this.deltaAB = 0;
    }
}
class CityMap {

    constructor(strCities) {
        if (strCities) {
            let cities = strCities.replace(/\s+/g,' ');
            cities = cities.slice(0, -1);
            cities = cities.split('; ');

            const citiesArr = [];
            
            cities.forEach(element => {
                let splitEl = element.replace(/"/g,"").split(', ')
                citiesArr.push(splitEl);
            });

            this.cities = [];
            for (let cityData of citiesArr) {
                let cityObj = new City(cityData[0], cityData[1], +cityData[2], +cityData[3]);
                this.cities.push(cityObj);
            }
        } else {
            this.cities = JSON.parse(localStorage.getItem('items'));
        }
    }
    theMostTypeCity() {
        const cityType = document.querySelector('#city-type');
        const typeResult = document.querySelector('#type-result');
        switch(cityType.value) {
            case "nothernmost": 
                typeResult.value = this.cities.sort(byFieldDesc('latitude'))[0].cityName;        
                break;
            case "easternmost": 
                typeResult.value = this.cities.sort(byFieldDesc('longitude'))[0].cityName;
                break;
            case "southernmost":
                typeResult.value = this.cities.sort(byFieldAsc('latitude'))[0].cityName;
                break;
            case "westernmost": 
                typeResult.value = this.cities.sort(byFieldAsc('longitude'))[0].cityName;
                break;
        }

        cityType.addEventListener('change', this.theMostTypeCity.bind(this));
        

    }
    findTheClosestCity() {
        const latitude = document.getElementById('latitude'),        
            longitude = document.getElementById('longitude'),
            closestRes = document.getElementById('closest-res');

        if (!latitude.value || !longitude.value ) { 
            closestRes.value = '';
            return;
        }

        const tempArray = this.cities.concat();
        const point = new City();

        point.latitude = latitude.value;
        point.longitude = longitude.value;

        let minDeltaAB = this.deltaAB(tempArray[0], point);
        for (let city of tempArray) {
            city.deltaAB = this.deltaAB(city, point);
            if (city.deltaAB <= minDeltaAB) {
                minDeltaAB = city.deltaAB;
            }
        }
        tempArray.sort(byFieldAsc('deltaAB'));
        closestRes.value = tempArray[0].cityName;            
    }
    deltaAB(point1, point2) {
        const deltaLatitude = point1.latitude - point2.latitude;
        const deltaLongitude = point1.longitude - point2.longitude;
        return Math.sqrt(Math.pow(deltaLatitude, 2) + Math.pow(deltaLongitude, 2));
    }
    getStates() {
        const statesRes = document.getElementById('states-res');
        
        const statesArr = this.getUniqueStatesArr();
        statesRes.textContent = statesArr;
        // this.createStateSelect(statesArr);
    }
    getUniqueStatesArr() {
        let statesList = [];

        for (let city of this.cities) {
            statesList.push(city.stateAbbr.trim());
        }

        const uniqueSet = new Set(statesList);
        statesList = [...uniqueSet];
        return statesList.sort();
    }
    createStateSelect(statesArr) {
        // console.log('statesArr: ', statesArr);
        while (stateAbbr.firstChild) {
            stateAbbr.removeChild(stateAbbr.firstChild);
        }

        for (let state of statesArr) {
            let option = document.createElement('option');
            option.setAttribute('value', state);
            option.innerText = state;
            stateAbbr.append(option);
        }
       
        this.getStateCities();
        stateAbbr.addEventListener('change', this.getStateCities.bind(this));//, stateAbbr.value

        
    }
    getStateCities() {
        while (cityList.firstChild) {
            cityList.removeChild(cityList.firstChild);
        }
        for (let city of this.cities) {
            if(city.stateAbbr === stateAbbr.value) { 
                let liElem = document.createElement('li');
                liElem.textContent = city.cityName;
                cityList.appendChild(liElem);
            }
        }
    }
    checkNumbersAndDot(e) {
        if ((e.which < 45 || e.which > 57)  || e.which === 47)
        {
            e.preventDefault();
        }
    }
    checkEnteredCoord(coordinate) {
        // сделать проверку, если придумаю
    }
    addCityInfo() {
        const addCity = document.querySelector('.add-city'),
        addInfo = addCity.querySelectorAll('input[type="text"]');

        if(!addInfo[0].value || !addInfo[1].value || !addInfo[2].value || !addInfo[3].value) {
            return;
        }

        const cityValue = this.setFirstCapitalized(addInfo[0].value); //city name
        const stateValue = this.setToUpperCase(addInfo[1].value); // state abbr
        
        const addCityObj = new City(cityValue, stateValue, +addInfo[2].value, +addInfo[3].value);
        this.cities.push(addCityObj);
        
        addInfo.forEach((item) => {
            item.value = '';
        });
        this.theMostTypeCity();
        this.getStates();  
        this.getAllCities();  
        this.searchCities();        
    }
    checkEngLetters(e) {
        const theEvent = e || window.event;
        let key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode( key );
        const regex = /[A-Za-z\s]/;
        if( !regex.test(key) ) {
            theEvent.returnValue = false;
            if(theEvent.preventDefault) {
                theEvent.preventDefault();
            }
        }
    }
    setFirstCapitalized(name) {
        name = name.trim().replace(/\s+/g, ' ').split(' ');

        return name.map(function(word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');

    }
    setToUpperCase(name) {
        name = name.trim().toUpperCase();
        return name;
    }
    getAllCities() {
        // allCitites.innerHTML= "";
        while (allCitites.firstChild) {
            allCitites.removeChild(allCitites.firstChild);
        }
        
        this.cities = this.cities.sort(byFieldAsc('cityName'));
        this.cities.forEach(item => {
            this.addLi(item.cityName);
        });
    }
    addLi(text) {
        const li = document.createElement('li');
        li.textContent = text;
        allCitites.appendChild(li);
    }
    setLocalStorage() {
        localStorage.setItem('items', JSON.stringify(this.cities));
    }
    clearLocalStorage() {
        localStorage.clear();
    }
    searchCities() {
        const search = document.getElementById('search-name');

        while (cityList.firstChild) {
            cityList.removeChild(cityList.firstChild);
        }

        for (let city of this.cities) {
            if((city.stateAbbr.toLowerCase()).search(search.value.toLowerCase()) !== -1) { 
                let liElem = document.createElement('li');
                liElem.textContent = `${city.cityName}, ${city.stateAbbr}`;
                cityList.appendChild(liElem);
            }
        }
        
    }
    eventListeners() {
        latitudes.forEach((item) => {
            item.addEventListener('keypress', this.checkNumbersAndDot);
        });
        longitudes.forEach((item) => {
            item.addEventListener('keypress', this.checkNumbersAndDot);
        });
        nameFields.forEach((item) => {
            item.addEventListener('keypress', this.checkEngLetters);
        });
        closestBtn.addEventListener('click', this.findTheClosestCity.bind(this));
        addBtn.addEventListener('click', this.addCityInfo.bind(this));
        saveLs.addEventListener('click', this.setLocalStorage.bind(this));
        clearLs.addEventListener('click', this.clearLocalStorage.bind(this));
        search.addEventListener('input', this.searchCities.bind(this));

    }
}

const cities = localStorage.getItem('items') ? new CityMap('') : 
                                               new CityMap(`"Nashville, TN", 36.17, -86.78;
                                                        "New York, NY", 40.71, -74.00;
                                                        "Atlanta, GA", 33.75, -84.39;
                                                        "Denver, CO", 39.74, -104.98;
                                                        "Seattle, WA", 47.61, -122.33;
                                                        "Los Angeles, CA", 34.05, -118.24;
                                                        "Memphis, TN", 35.15, -90.05;`);

cities.eventListeners();
cities.theMostTypeCity();
cities.getStates();
cities.getAllCities();
cities.searchCities();


function byFieldAsc(field) {
    return (a, b) => a[field] > b[field] ? 1 : -1;
}
function byFieldDesc(field) {
    return (a, b) => a[field] < b[field] ? 1 : -1;
}
  
  


