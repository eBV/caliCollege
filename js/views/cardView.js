/* ============================================================
   CARD VIEW — Renders school cards in a grid
   API: window.CardView
   ============================================================ */

(function() {

  var DIVISION_LABELS = {
    'NCAA-D1': 'D1', 'NCAA-D2': 'D2', 'NCAA-D3': 'D3',
    'NAIA': 'NAIA', 'CCCAA': 'CC'
  };

  var DIVISION_CLASSES = {
    'NCAA-D1': 'badge--d1', 'NCAA-D2': 'badge--d2', 'NCAA-D3': 'badge--d3',
    'NAIA': 'badge--naia', 'CCCAA': 'badge--cccaa'
  };

  var STATUS_LABELS = {
    'not_started': 'Not Started',
    'researching': 'Researching',
    'in_progress': 'In Progress',
    'submitted': 'Submitted',
    'accepted': 'Accepted ✓',
    'waitlisted': 'Waitlisted',
    'denied': 'Denied',
    'enrolled': 'Enrolled ★'
  };

  var PRIORITY_LABELS = {
    'top': '🔴', 'high': '🟠', 'medium': '🟡', 'low': '🟢'
  };

  function stars(rating, max) {
    max = max || 5;
    var html = '<span class="stars">';
    for (var i = 1; i <= max; i++) {
      html += '<span class="' + (i <= rating ? 'star-filled' : 'star-empty') + '">★</span>';
    }
    html += '</span>';
    return html;
  }

  function formatTuition(amount) {
    if (amount < 2000) return '$' + amount.toLocaleString() + '/yr';
    return '$' + Math.round(amount / 1000) + 'k/yr';
  }

  function admitBadge(rate) {
    if (rate == null) return '';
    var pct = Math.round(rate * 100);
    var cls = rate < 0.15 ? 'admit--elite' : rate < 0.40 ? 'admit--selective' : rate < 0.70 ? 'admit--moderate' : 'admit--open';
    var label = rate < 0.15 ? 'Elite' : rate < 0.40 ? 'Selective' : rate < 0.70 ? 'Moderate' : 'Accessible';
    return '<span class="admit-badge ' + cls + '" title="Acceptance Rate">' + pct + '% admit · ' + label + '</span>';
  }

  function buildCard(school, trackerState) {
    var compareList = Store.getCompareList();
    var inCompare = compareList.indexOf(school.id) !== -1;
    var appStatus = trackerState.appStatus || 'not_started';
    var priority = trackerState.priority || 'medium';

    return '<div class="school-card' + (inCompare ? ' school-card--compare' : '') + '" data-id="' + school.id + '">' +

      '<div class="card-header">' +
        '<div class="card-header-left">' +
          '<span class="badge ' + (DIVISION_CLASSES[school.division] || '') + '">' +
            (DIVISION_LABELS[school.division] || school.division) +
          '</span>' +
          (priority !== 'medium' ? '<span title="Priority: ' + priority + '">' + (PRIORITY_LABELS[priority] || '') + '</span>' : '') +
        '</div>' +
        '<span class="status-pill status-' + appStatus + '">' + (STATUS_LABELS[appStatus] || appStatus) + '</span>' +
      '</div>' +

      '<h3 class="card-name">' + school.name + '</h3>' +

      '<div class="card-meta">' +
        '<span class="card-city">' + school.city + '</span>' +
        '<span class="card-distance">' + school.distanceFromLakewood + ' mi</span>' +
        '<span style="font-size:11px;color:var(--color-text-faint);font-style:italic;">' + school.conference + '</span>' +
      '</div>' +

      '<div class="card-ratings">' +
        '<div class="card-rating-item">🏀 ' + stars(school.basketballRating) + '</div>' +
        '<div class="card-rating-item">⚾ ' + stars(school.baseballRating) + '</div>' +
      '</div>' +

      '<div class="card-info">' +
        '<span class="card-tuition">' + formatTuition(school.tuitionInState) + ' in-state</span>' +
        '<span class="card-enrollment">' + (school.studentPopulation / 1000).toFixed(0) + 'k students</span>' +
      '</div>' +
      (school.acceptanceRate != null ? '<div class="card-admit-row">' + admitBadge(school.acceptanceRate) + '</div>' : '') +

      '<p class="card-notes">' + school.notes + '</p>' +

      '<div class="card-footer">' +
        '<button class="card-btn card-btn--track" data-action="track" data-id="' + school.id + '">Track App</button>' +
        '<button class="card-btn card-btn--compare' + (inCompare ? ' active' : '') + '" data-action="compare" data-id="' + school.id + '">' +
          (inCompare ? '✓ In Compare' : '+ Compare') +
        '</button>' +
        '<a class="card-btn card-btn--apply" href="' + school.applicationURL + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">Apply ↗</a>' +
      '</div>' +

    '</div>';
  }

  window.CardView = {
    render: function(schools) {
      var grid = document.getElementById('cards-grid');
      if (!grid) return;

      if (!schools || schools.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No schools match your current filters.</p><p style="font-size:12px;color:var(--color-text-faint)">Try adjusting the filters in the sidebar.</p></div>';
        return;
      }

      var html = '';
      schools.forEach(function(school) {
        var trackerState = Store.getSchool(school.id);
        html += buildCard(school, trackerState);
      });
      grid.innerHTML = html;
    }
  };

})();
