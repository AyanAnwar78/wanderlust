// public/js/map.js
function initMap() {
  const location = window.listingLocation || { lat: 28.6139, lng: 77.2090 }; // New Delhi fallback
  const title = window.listingTitle || "Listing";

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 8,
    center: location,
  });

  new google.maps.Marker({
    position: location,
    map: map,
    title: title,
  });
}
