'use strict';

// prettier-ignore

const stateList = document.querySelector('#state');
const locationName = document.querySelector('#location__name');
const locationAddress = document.querySelector('#location__address');
const locationVaccine = document.querySelector('#location__vaccines');
const vaccineList = document.querySelector('#vaccine__list');
const locationInfoDiv = document.querySelector('#location__info');
const closeButton = document.querySelector('#close_button');
const saveButton = document.querySelector('#save-button');
const savedList = document.querySelector('#saved-list');
const bookmarkButton = document.querySelector('#bookmark');
const savedDiv = document.querySelector('#saved-div');
const savedAlert = document.querySelector('.alert');

const closeInfo = () => {
  locationInfoDiv.classList.add('invisible');
  locationInfoDiv.classList.remove('visible');
  vaccineList.innerHTML = '';
  locationVaccine.innerHTML = '';
  locationInfoDiv.removeAttribute('data_location');
};

closeButton.addEventListener('click', closeInfo);

const saveData = e => {
  e.preventDefault();
  const locationData = locationInfoDiv.getAttribute('data_location');
  if (!localStorage.getItem('savedLocations')) {
    const locationArray = [];
    locationArray.push(locationData);
    localStorage.setItem('savedLocations', JSON.stringify(locationArray));
  } else {
    const locationArray = JSON.parse(localStorage.getItem('savedLocations'));
    locationArray.push(locationData);
    localStorage.setItem('savedLocations', JSON.stringify(locationArray));
  }
  savedAlert.classList.remove('invisible');
  setTimeout(() => {
    savedAlert.classList.add('invisible');
  }, 2000);
};

const bookmarkhandler = e => {
  e.preventDefault();
  savedDiv.classList.toggle('invisible');
  savedList.innerHTML = '';
  const savedArray = JSON.parse(localStorage.getItem('savedLocations'));
  console.log(savedArray);
  if (savedArray.length) {
    savedArray.forEach(location => {
      location = JSON.parse(location);
      const li = document.createElement('li');
      li.className =
        'cursor-pointer border-gray-400 flex flex-col transition duration-500 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl rounded-2xl border-2 p-4 mb-4   border-red-400';
      const div1 = document.createElement('div');
      div1.className =
        'cursor-pointer select-none flex flex-1 flex-col items-center p-4 ';
      div1.setAttribute('data_position', JSON.stringify(location));
      div1.innerHTML = `
      <div class="flex-1 pl-1 mr-16 cursor-not-allowed">
      <div class="text-2xl text-gray-600 cursor-not-allowed font-medium">
        ${location.properties.name} <br> ${location.properties.address}
        <br> ${Object.keys(location.properties.appointment_vaccine_types)}
      </div>
    </div>

      `;
      li.setAttribute('data_position', JSON.stringify(location));
      li.appendChild(div1);
      savedList.appendChild(li);
    });
  }
};

saveButton.addEventListener('click', saveData);
bookmarkButton.addEventListener('click', bookmarkhandler);

const openInfoDiv = location => {
  locationInfoDiv.classList.remove('invisible');
  locationInfoDiv.classList.add('visible');
  locationInfoDiv.setAttribute('data_location', JSON.stringify(location));
};

const renderLocationDetails = (coords, myIcon, location, vaccine, map) => {
  L.marker([coords[1], coords[0]], { icon: myIcon })
    .on('click', e => {
      closeInfo();
      openInfoDiv(location);
      locationName.textContent = location.properties.name;
      locationAddress.textContent = location.properties.address;
      for (const key in location.properties.appointment_vaccine_types) {
        const pTag = window.document.createElement('p');
        pTag.textContent = key;
        locationVaccine.appendChild(pTag);
      }
      const pTag2 = window.document.createElement('p');
      if (location.properties.appointments_available) {
        pTag2.innerHTML =
          'Appointments are available at this location! <br> Walkins are welcomed.';
      } else {
        pTag2.innerHTML =
          'Walkins are available! <br> Call for Appointment Info.';
      }
      vaccineList.appendChild(pTag2);
    })
    .addTo(map)
    .bindPopup(`${location.properties.name} <br> <p> ${vaccine}  </p>`);
};

const setMarkers = async (map, state = 'CA') => {
  let result = await getData(state);
  if (result) {
    for (let location of result) {
      if (location.properties.appointment_vaccine_types) {
        const coords = location.geometry.coordinates;
        if ('moderna' in location.properties.appointment_vaccine_types) {
          myIcon = L.divIcon({ className: 'my__div--icon-moderna' });
          renderLocationDetails(coords, myIcon, location, 'Moderna(18+)', map);
        } else if ('pfizer' in location.properties.appointment_vaccine_types) {
          var myIcon = L.divIcon({ className: 'my__div--icon-pfizer' });
          renderLocationDetails(coords, myIcon, location, 'pfizer(12+)', map);
        } else if ('jj' in location.properties.appointment_vaccine_types) {
          var myIcon = L.divIcon({ className: 'my__div--icon-jj' });
          renderLocationDetails(
            coords,
            myIcon,
            location,
            'Johnson & Johnson(18+)',
            map
          );
        }
      }
    }
  }
};

states.forEach(state => {
  const option = document.createElement('option');
  const stateInfo = state.split('-');
  option.value = stateInfo;
  option.text = stateInfo[1].trim();
  stateList.appendChild(option);
});

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position, err) => {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    const map = L.map('map').setView(coords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    var legend = L.control({ position: 'topright' });

    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'legend');
      div.style.backgroundColor = 'white';
      div.style.color = 'var(--color-dark--2)';
      div.innerHTML += "<h4 style='text-align: center'> Vaccine </h4>";
      div.innerHTML +=
        "<div style='display:inline-block' class='my__div--icon-moderna'> </div><span> Moderna(18+) </span><br>";
      div.innerHTML +=
        "<div style='display:inline-block' class='my__div--icon-pfizer'> </div><span> Pfizer(12+) </span><br>";
      div.innerHTML +=
        "<div style='display:inline-block' class='my__div--icon-jj'> </div><span> Johnson & Johnson(18+)</span><br>";
      return div;
    };
    legend.addTo(map);
    getState(coords.join()).then(res => setMarkers(map,res));
    stateList.addEventListener('change', e => {
      const stateArray = e.target.value;
      setMarkers(map, stateArray.split(',')[0].trim());
      geolocation.forEach(location => {
        if (
          location['state'].toLowerCase() ==
          stateArray.split(',')[1].trim().toLowerCase()
        ) {
          map.setView([location['latitude'], location['longitude']], 6);
        }
      });
    });

    savedList.addEventListener('click', e => {
      e.preventDefault();
      const el = e.target;
      const position = JSON.parse(el.getAttribute('data_position'));
      console.log(position);
      map.setView(
        [position.geometry.coordinates[1], position.geometry.coordinates[0]],
        20
      );
    });
    if (err) throw new Error(err);
  });
}
