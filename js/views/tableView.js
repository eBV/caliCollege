/* ============================================================
   TABLE VIEW — Sortable table of schools
   API: window.TableView
   ============================================================ */

(function() {

  var _currentSort = { col: 'distance', dir: 'asc' };

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

  function stars(rating) {
    var s = '';
    for (var i = 1; i <= 5; i++) {
      s += '<span class="' + (i <= rating ? 'star-filled' : 'star-empty') + '">★</span>';
    }
    return '<span class="stars">' + s + '</span>';
  }

  function buildHead() {
    var cols = [
      { key: 'name',       label: 'School',     sortable: true },
      { key: 'division',   label: 'Division',   sortable: true },
      { key: 'city',       label: 'City',        sortable: true },
      { key: 'distance',   label: 'Dist (mi)',   sortable: true },
      { key: 'basketball', label: '🏀 BBall',    sortable: true },
      { key: 'baseball',   label: '⚾ Baseball', sortable: true },
      { key: 'combined',   label: 'Combined',    sortable: true },
      { key: 'tuition',    label: 'Tuition (In)', sortable: true },
      { key: 'pop',        label: 'Students',    sortable: true },
      { key: 'conference', label: 'Conference',  sortable: false },
      { key: 'status',     label: 'App Status',  sortable: false },
      { key: 'actions',    label: 'Links',       sortable: false }
    ];

    var html = '<tr>';
    cols.forEach(function(c) {
      var cls = '';
      if (c.sortable) {
        cls = 'style="cursor:pointer"';
        if (_currentSort.col === c.key) {
          cls = 'class="sort-' + _currentSort.dir + '" style="cursor:pointer"';
        }
      }
      html += '<th ' + cls + ' data-sort="' + c.key + '">' + c.label + '</th>';
    });
    html += '</tr>';
    return html;
  }

  function buildRows(schools) {
    var html = '';
    schools.forEach(function(s) {
      var t = Store.getSchool(s.id);
      var appStatus = t.appStatus || 'not_started';
      html += '<tr data-id="' + s.id + '">' +
        '<td class="table-school-name" title="' + s.fullName + '">' + s.name + '</td>' +
        '<td><span class="badge ' + (DIVISION_CLASSES[s.division]||'') + '">' + (DIVISION_LABELS[s.division]||s.division) + '</span></td>' +
        '<td>' + s.city + '</td>' +
        '<td>' + s.distanceFromLakewood + '</td>' +
        '<td>' + stars(s.basketballRating) + '</td>' +
        '<td>' + stars(s.baseballRating) + '</td>' +
        '<td style="color:var(--color-text);font-weight:500">' + s.combinedRating.toFixed(1) + '</td>' +
        '<td>$' + s.tuitionInState.toLocaleString() + '</td>' +
        '<td>' + (s.studentPopulation/1000).toFixed(0) + 'k</td>' +
        '<td style="font-size:11px;color:var(--color-text-faint)">' + s.conference + '</td>' +
        '<td><span class="status-pill status-' + appStatus + '">' + (STATUS_LABELS[appStatus]||appStatus) + '</span></td>' +
        '<td style="white-space:nowrap">' +
          '<button class="table-btn table-btn--track" data-action="track" data-id="' + s.id + '">Track</button> ' +
          '<a class="table-link" href="' + s.applicationURL + '" target="_blank" rel="noopener">Apply ↗</a>' +
        '</td>' +
        '</tr>';
    });
    return html || '<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--color-text-faint)">No schools match current filters.</td></tr>';
  }

  window.TableView = {
    _schools: [],

    render: function(schools) {
      this._schools = schools;
      var head = document.getElementById('table-head');
      var body = document.getElementById('table-body');
      if (!head || !body) return;
      head.innerHTML = buildHead();
      body.innerHTML = buildRows(schools);

      // Sort click handlers on th elements
      var ths = head.querySelectorAll('th[data-sort]');
      ths.forEach(function(th) {
        th.addEventListener('click', function() {
          var col = th.getAttribute('data-sort');
          if (!col) return;
          if (_currentSort.col === col) {
            _currentSort.dir = _currentSort.dir === 'asc' ? 'desc' : 'asc';
          } else {
            _currentSort.col = col;
            _currentSort.dir = 'asc';
          }
          // Map table col key to sort option
          var sortMap = {
            'name': 'name_asc',
            'distance': _currentSort.dir === 'asc' ? 'distance_asc' : 'distance_desc',
            'tuition':  _currentSort.dir === 'asc' ? 'tuition_asc' : 'tuition_desc',
            'basketball': 'basketball_desc',
            'baseball':   'baseball_desc',
            'combined':   'combined_desc',
            'pop': _currentSort.dir === 'asc' ? 'population_asc' : 'population_desc',
            'city': 'name_asc',
            'division': 'name_asc'
          };
          var sortVal = sortMap[col] || 'distance_asc';
          var selectEl = document.getElementById('sort-select');
          if (selectEl) selectEl.value = sortVal;
          if (window.App) window.App.rerender();
        });
      });
    }
  };

})();
