/* ============================================================
   MAP VIEW — Leaflet.js interactive map
   API: window.MapView
   CRITICAL: #map div must have explicit CSS height before init
   ============================================================ */

(function() {

  var _map = null;
  var _markers = {};
  var _initialized = false;
  var _legendAdded = false;

  var LAKEWOOD = [33.8536, -118.1359];

  var DIVISION_COLORS = {
    'NCAA-D1': '#C41E3A',
    'NCAA-D2': '#007BFF',
    'NCAA-D3': '#28A745',
    'NAIA':    '#E09200',
    'CCCAA':   '#17A2B8'
  };

  var DIVISION_LABELS = {
    'NCAA-D1': 'NCAA D1', 'NCAA-D2': 'NCAA D2', 'NCAA-D3': 'NCAA D3',
    'NAIA': 'NAIA', 'CCCAA': 'Community College'
  };

  function makeIcon(division) {
    var color = DIVISION_COLORS[division] || '#888';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">' +
      '<circle cx="11" cy="11" r="9" fill="' + color + '" stroke="white" stroke-width="2" opacity="0.9"/>' +
      '</svg>';
    return L.divIcon({
      html: svg,
      className: '',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -14]
    });
  }

  function makeHomePinIcon() {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">' +
      '<polygon points="15,2 28,13 23,13 23,27 17,27 17,20 13,20 13,27 7,27 7,13 2,13" fill="#C41E3A" stroke="white" stroke-width="1.5"/>' +
      '</svg>';
    return L.divIcon({
      html: svg,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 28],
      popupAnchor: [0, -30]
    });
  }

  function makePopupHTML(school, trackerState) {
    var appStatus = (trackerState && trackerState.appStatus) || 'not_started';
    var color = DIVISION_COLORS[school.division] || '#888';
    return '<div class="map-popup">' +
      '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
        '<span style="width:10px;height:10px;border-radius:50%;background:' + color + ';display:inline-block;flex-shrink:0"></span>' +
        '<div class="map-popup-name">' + school.name + '</div>' +
      '</div>' +
      '<div class="map-popup-city">' + school.city + ' · ' + school.distanceFromLakewood + ' mi from Lakewood</div>' +
      '<div class="map-popup-ratings">' +
        '<span>🏀 ' + school.basketballRating + '/5</span>' +
        '<span>⚾ ' + school.baseballRating + '/5</span>' +
        '<span>$' + (school.tuitionInState < 2000 ? school.tuitionInState.toLocaleString() : (Math.round(school.tuitionInState/1000) + 'k')) + '/yr</span>' +
      '</div>' +
      '<button class="map-popup-btn" data-action="track" data-id="' + school.id + '">Track Application</button>' +
    '</div>';
  }

  function addLegend() {
    if (_legendAdded || !_map) return;
    _legendAdded = true;
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
      var div = L.DomUtil.create('div', 'map-legend');
      var html = '<strong style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#B0B0B0">Division</strong>';
      Object.keys(DIVISION_COLORS).forEach(function(div_key) {
        html += '<div class="map-legend-item">' +
          '<span class="map-legend-dot" style="background:' + DIVISION_COLORS[div_key] + '"></span>' +
          '<span>' + DIVISION_LABELS[div_key] + '</span>' +
          '</div>';
      });
      div.innerHTML = html;
      return div;
    };
    legend.addTo(_map);
  }

  window.MapView = {

    init: function() {
      if (_initialized) return;
      _initialized = true;

      _map = L.map('map', {
        center: LAKEWOOD,
        zoom: 9,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(_map);

      // Home marker for Lakewood
      L.marker(LAKEWOOD, { icon: makeHomePinIcon() })
        .addTo(_map)
        .bindPopup('<div class="map-popup"><div class="map-popup-name" style="color:#C41E3A">📍 Lakewood, CA</div><div class="map-popup-city">Home Base · 90712</div></div>');

      addLegend();
    },

    render: function(schools) {
      if (!_map) return;

      // Clear existing school markers
      Object.keys(_markers).forEach(function(id) {
        _map.removeLayer(_markers[id]);
      });
      _markers = {};

      // Add markers for filtered schools
      schools.forEach(function(school) {
        if (!school.lat || !school.lng) return;
        var trackerState = Store.getSchool(school.id);
        var marker = L.marker([school.lat, school.lng], {
          icon: makeIcon(school.division),
          title: school.name
        });
        marker.bindPopup(makePopupHTML(school, trackerState), {
          maxWidth: 240,
          className: 'map-dark-popup'
        });
        marker.addTo(_map);
        _markers[school.id] = marker;
      });
    },

    invalidateSize: function() {
      if (_map) _map.invalidateSize();
    }
  };

  // Handle "Track" clicks inside map popups (delegated)
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action="track"][data-id]');
    if (!btn) return;
    // Close popup first
    if (_map) _map.closePopup();
    var id = btn.getAttribute('data-id');
    if (window.Tracker) window.Tracker.open(id);
  });

})();
