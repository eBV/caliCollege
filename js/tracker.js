/* ============================================================
   TRACKER — Application tracker modal
   API: window.Tracker
   ============================================================ */

(function() {

  var _currentId = null;

  var DIVISION_CLASSES = {
    'NCAA-D1':'badge--d1','NCAA-D2':'badge--d2','NCAA-D3':'badge--d3',
    'NAIA':'badge--naia','CCCAA':'badge--cccaa'
  };
  var DIVISION_LABELS = {
    'NCAA-D1':'NCAA Division I','NCAA-D2':'NCAA Division II','NCAA-D3':'NCAA Division III',
    'NAIA':'NAIA','CCCAA':'Community College'
  };

  function getSchoolById(id) {
    return window.SCHOOLS_DATA.find(function(s) { return s.id === id; });
  }

  function populateModal(school, state) {
    document.getElementById('modal-school-name').textContent = school.name;

    var badge = document.getElementById('modal-division-badge');
    badge.className = 'badge ' + (DIVISION_CLASSES[school.division] || '');
    badge.textContent = DIVISION_LABELS[school.division] || school.division;

    document.getElementById('modal-city').textContent = school.city + ', CA';
    document.getElementById('modal-distance').textContent = school.distanceFromLakewood + ' miles from Lakewood';

    // Coach emails
    var emailsEl = document.getElementById('modal-coach-emails');
    var emailsHtml = '';
    if (state.basketballCoachEmail || school.basketballCoachEmail) {
      var bEmail = state.basketballCoachEmail || school.basketballCoachEmail || '';
      if (bEmail) emailsHtml += '<a href="mailto:' + bEmail + '" class="coach-link">🏀 ' + bEmail + '</a>';
    }
    if (state.baseballCoachEmail || school.baseballCoachEmail) {
      var baseEmail = state.baseballCoachEmail || school.baseballCoachEmail || '';
      if (baseEmail) emailsHtml += '<a href="mailto:' + baseEmail + '" class="coach-link">⚾ ' + baseEmail + '</a>';
    }
    emailsEl.innerHTML = emailsHtml;

    // Form fields
    document.getElementById('tracker-priority').value       = state.priority || 'medium';
    document.getElementById('tracker-status').value         = state.appStatus || 'not_started';
    document.getElementById('tracker-date-applied').value   = state.dateApplied || '';
    document.getElementById('tracker-coach-contacted').checked = !!state.coachContacted;
    document.getElementById('tracker-financial').value      = state.financialAidStatus || 'not_applied';
    document.getElementById('tracker-bball-email').value    = state.basketballCoachEmail || school.basketballCoachEmail || '';
    document.getElementById('tracker-baseball-email').value = state.baseballCoachEmail || school.baseballCoachEmail || '';
    document.getElementById('tracker-notes').value          = state.notes || '';

    // Footer links
    var linksEl = document.getElementById('modal-links');
    linksEl.innerHTML =
      '<a href="' + school.applicationURL + '" target="_blank" rel="noopener" class="modal-link">Apply Now ↗</a>' +
      '<a href="' + school.athleticsURL + '" target="_blank" rel="noopener" class="modal-link">Athletics ↗</a>';

    // Email template buttons
    var emailActionsEl = document.getElementById('modal-email-actions');
    if (emailActionsEl && window.AthleteEmail) {
      var bballEmail = state.basketballCoachEmail || school.basketballCoachEmail || '';
      var baseEmail  = state.baseballCoachEmail  || school.baseballCoachEmail  || '';
      var bballCoach = school.basketballCoach || '';
      var baseCoach  = school.baseballCoach   || '';
      emailActionsEl.innerHTML =
        '<div class="email-actions-label">📧 Send Recruitment Email</div>' +
        '<div class="email-actions-row">' +
          '<button class="btn btn--email btn--email-bball" onclick="AthleteEmail.sendBasketball(\'' + bballEmail.replace(/'/g, "\\'") + '\',\'' + bballCoach.replace(/'/g, "\\'") + '\')">🏀 Email Basketball Coach' + (bballCoach ? '<span class="coach-name-hint"> · ' + bballCoach + '</span>' : '') + '</button>' +
          '<button class="btn btn--email btn--email-base" onclick="AthleteEmail.sendBaseball(\'' + baseEmail.replace(/'/g, "\\'") + '\',\'' + baseCoach.replace(/'/g, "\\'") + '\')">⚾ Email Baseball Coach' + (baseCoach ? '<span class="coach-name-hint"> · ' + baseCoach + '</span>' : '') + '</button>' +
        '</div>';
    }
  }

  function readFormData() {
    return {
      priority:            document.getElementById('tracker-priority').value,
      appStatus:           document.getElementById('tracker-status').value,
      dateApplied:         document.getElementById('tracker-date-applied').value,
      coachContacted:      document.getElementById('tracker-coach-contacted').checked,
      financialAidStatus:  document.getElementById('tracker-financial').value,
      basketballCoachEmail: document.getElementById('tracker-bball-email').value,
      baseballCoachEmail:  document.getElementById('tracker-baseball-email').value,
      notes:               document.getElementById('tracker-notes').value
    };
  }

  window.Tracker = {
    open: function(id) {
      _currentId = id;
      var school = getSchoolById(id);
      if (!school) return;
      var state = Store.getSchool(id);
      populateModal(school, state);

      document.getElementById('tracker-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';

      // Focus first field
      setTimeout(function() {
        var el = document.getElementById('tracker-priority');
        if (el) el.focus();
      }, 150);
    },

    close: function() {
      _currentId = null;
      document.getElementById('tracker-overlay').classList.remove('open');
      document.body.style.overflow = '';
    },

    save: function() {
      if (!_currentId) return;
      var data = readFormData();
      Store.saveSchool(_currentId, data);
      this.close();
      if (window.App) window.App.rerender();
      if (window.StatsBar) window.StatsBar.render();
      if (window.App) window.App.showToast('Saved!', 'success');
    }
  };

  // Wire modal buttons after DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('modal-close').addEventListener('click', function() {
      window.Tracker.close();
    });
    document.getElementById('modal-cancel').addEventListener('click', function() {
      window.Tracker.close();
    });
    document.getElementById('modal-save').addEventListener('click', function() {
      window.Tracker.save();
    });

    // Close on overlay background click
    document.getElementById('tracker-overlay').addEventListener('click', function(e) {
      if (e.target === this) window.Tracker.close();
    });

    // Close on ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') window.Tracker.close();
    });
  });

})();
