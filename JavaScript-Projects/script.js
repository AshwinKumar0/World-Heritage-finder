const form = document.querySelector('form');
const resultsDiv = document.querySelector('#world-heritage-list');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Retrieve the user's input city name
  const cityName = event.target.elements.cityName.value;

  // Use OpenCage API to retrieve latitude and longitude of the city
  const apiKey = '3066c905848d4cf796044817c45c300b';
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cityName)}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  // Extract the latitude and longitude from the API response
  const { lat, lng } = data.results[0].geometry;

  // Display the latitude and longitude on the webpage
  resultsDiv.innerHTML = `<div id="cordinate"><span>Latitude:   ${lat}</span><span>Longitude:   ${lng}</span></div>`;

  // Use the latitude and longitude to construct the XML file path
  const xmlFilePath = `file.xml`;

  // Use fetch API to read the XML file instead of XMLHttpRequest
  const xmlResponse = await fetch(xmlFilePath);
  const xmlText = await xmlResponse.text();

  // Parse the XML response into an XML document object
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  // Find the UNESCO World Heritage Sites within a certain radius of the latitude and longitude
  const sites = xmlDoc.getElementsByTagName('row');
  const nearbySites = [];
  for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    const siteLat = Number(site.getElementsByTagName('latitude')[0].textContent);
    const siteLon = Number(site.getElementsByTagName('longitude')[0].textContent);
    const distance = calculateDistance(lat, lng, siteLat, siteLon);
    if (distance <= 100) { // Change the radius as needed
      const siteName = site.getElementsByTagName('site')[0].textContent;
      const siteRegion = site.getElementsByTagName('region')[0].textContent;
      const siteImage = site.getElementsByTagName('image_url')[0].textContent;
      const siteDescription = site.getElementsByTagName('short_description')[0].textContent;
      nearbySites.push({
        name: siteName,
        region: siteRegion,
        image: siteImage,
        description: siteDescription,
      });
    }
  }

  // Display the nearby UNESCO World Heritage Sites on the webpage
  nearbySites.forEach(site => {
    resultsDiv.innerHTML += `
    <div id="Content">
    <img src="${site.image}" width="200">
    <div id="details">
      <h2>${site.name}</h2>
      <h5>(${site.region})<h5>
      ${site.description}
      </div>
      </div>
    `;
  });
});

// Helper function to calculate the distance between two latitude and longitude coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}