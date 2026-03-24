/* ============================================================
   COMPARE VIEW — Side-by-side school comparison (max 4)
   API: window.CompareView
   ============================================================ */

(function() {

  var DIVISION_CLASSES = {
    'NCAA-D1':'badge--d1','NCAA-D2':'badge--d2','NCAA-D3':'badge--d3',
    'NAIA':'badge--naia','CCCAA':'badge--cccaa'
  };
  var DIVISION_LABELS = {
    'NCAA-D1':'D1','NCAA-D2':'D2','NCAA-D3':'D3','NAIA':'NAIA','CCCAA':'CC'
  };
  var STATUS_LABELS = {
    'not_started':'Not Started','researching':'Researching','in_progress':'In Progress',
    'submitted':'Submitted','accepted':'Accepted','waitlisted':'Waitlisted',
    'denied':'Denied','enrolled':'Enrolled ★'
  };

  function stars(rating, best) {
    var s = '';
    for (var i = 1; i <= 5; i++) {
      s += '<span class="' + (i <= rating ? 'star-filled' : 'star-empty') + '">★</span>';
    }
    return '<span class="stars' + (rating === best ? ' compare-best' : '') + '">' + s + ' (' + rating + ')</span>';
  }

  window.CompareView = {
    render: function() {
      var compareIds = Store.getCompareList();
      var emptyEl  = document.getElementById('compare-empty');
      var gridEl   = document.getElementById('compare-grid');
      if (!gridEl) return;

      if (compareIds.length === 0) {
        if (emptyEl) emptyEl.style.display = 'flex';
        gridEl.innerHTML = '';
        gridEl.style.display = 'none';
        return;
      }

      if (emptyEl) emptyEl.style.display = 'none';
      gridEl.style.display = 'grid';

      // Get school objects
      var schools = compareIds.map(function(id) {
        return SCHOOLS_DATA.find(function(s) { return s.id === id; });
      }).filter(Boolean);

      // Define col count (label + N schools)
      var numCols = 1 + schools.length;
      gridEl.style.gridTemplateColumns = '160px ' + schools.map(function() { return '1fr'; }).join(' ');

      // Best values
      var bestBball    = Math.max.apply(null, schools.map(function(s) { return s.basketballRating; }));
      var bestBaseball = Math.max.apply(null, schools.map(function(s) { return s.baseballRating; }));
      var bestCombined = Math.max.apply(null, schools.map(function(s) { return s.combinedRating; }));
      var minTuition   = Math.min.apply(null, schools.map(function(s) { return s.tuitionInState; }));
      var minDistance  = Math.min.apply(null, schools.map(function(s) { return s.distanceFromLakewood; }));

      function row(label, fn) {
        var html = '<div class="compare-label">' + label + '</div>';
        schools.forEach(function(s) { html += '<div>' + fn(s) + '</div>'; });
        return html;
      }

      var html = '';

      // Header row with school names + remove buttons
      html += '<div class="compare-label" style="background:var(--color-surface-3)!important;border-bottom:2px solid var(--color-primary)!important;padding:16px!important">Compare</div>';
      schools.forEach(function(s) {
        var t = Store.getSchool(s.id);
        html += '<div class="compare-header">' +
          '<span class="badge ' + (DIVISION_CLASSES[s.division]||'') + '">' + (DIVISION_LABELS[s.division]||s.division) + '</span>' +
          '<span class="compare-school-name">' + s.name + '</span>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">' +
            '<a href="' + s.applicationURL + '" target="_blank" rel="noopener" class="modal-link" onclick="event.stopPropagation()">Apply ↗</a>' +
            '<a href="' + s.athleticsURL + '" target="_blank" rel="noopener" class="modal-link" onclick="event.stopPropagation()">Athletics ↗</a>' +
          '</div>' +
          '<button class="compare-remove" data-action="remove-compare" data-id="' + s.id + '">✕ Remove</button>' +
        '</div>';
      });

      // Data rows
      html += row('City', function(s) { return s.city + ', CA'; });
      html += row('Distance', function(s) {
        var cls = s.distanceFromLakewood === minDistance ? ' style="color:var(--color-success);font-weight:600"' : '';
        return '<span' + cls + '>' + s.distanceFromLakewood + ' miles</span>';
      });
      html += row('Division', function(s) {
        return '<span class="badge ' + (DIVISION_CLASSES[s.division]||'') + '">' + (DIVISION_LABELS[s.division]||s.division) + '</span>';
      });
      html += row('Conference', function(s) { return s.conference; });
      html += row('Tuition (In-State)', function(s) {
        var cls = s.tuitionInState === minTuition ? ' style="color:var(--color-success);font-weight:600"' : '';
        return '<span' + cls + '>$' + s.tuitionInState.toLocaleString() + '/yr</span>';
      });
      html += row('Tuition (Out-of-State)', function(s) {
        return '$' + s.tuitionOutOfState.toLocaleString() + '/yr';
      });
      html += row('Students', function(s) { return s.studentPopulation.toLocaleString(); });
      html += row('Mascot', function(s) { return s.mascot; });
      html += row('🏀 Basketball', function(s) { return stars(s.basketballRating, bestBball); });
      html += row('⚾ Baseball', function(s) { return stars(s.baseballRating, bestBaseball); });
      html += row('Combined Rating', function(s) {
        var cls = s.combinedRating === bestCombined ? ' style="color:var(--color-success);font-weight:600"' : '';
        return '<span' + cls + '>' + s.combinedRating.toFixed(1) + ' / 5.0</span>';
      });
      html += row('App Status', function(s) {
        var t = Store.getSchool(s.id);
        var st = t.appStatus || 'not_started';
        return '<span class="status-pill status-' + st + '">' + (STATUS_LABELS[st]||st) + '</span>';
      });
      html += row('Priority', function(s) {
        var t = Store.getSchool(s.id);
        var p = t.priority || 'medium';
        var labels = { top: '🔴 Top', high: '🟠 High', medium: '🟡 Medium', low: '🟢 Low' };
        return labels[p] || p;
      });
      html += row('Notes', function(s) {
        return '<span style="font-size:12px;line-height:1.5;color:var(--color-text-muted)">' + s.notes + '</span>';
      });

      gridEl.innerHTML = html;
    }
  };

})();
