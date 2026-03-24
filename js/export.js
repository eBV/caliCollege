/* ============================================================
   EXPORT — CSV export of all school data + tracker state
   API: window.Export
   ============================================================ */

(function() {

  function escapeCSV(val) {
    if (val === null || val === undefined) return '""';
    var str = String(val);
    // Escape double quotes by doubling them, then wrap in quotes
    return '"' + str.replace(/"/g, '""') + '"';
  }

  var HEADERS = [
    'ID', 'Name', 'Full Name', 'Type', 'City', 'Region',
    'Distance (mi)', 'Student Pop', 'Division', 'Conference',
    'Basketball Rating', 'Baseball Rating', 'Combined Rating',
    'Tuition In-State', 'Tuition Out-of-State',
    'Application URL', 'Athletics URL', 'Mascot',
    'App Status', 'Priority', 'Coach Contacted', 'Date Applied',
    'Financial Aid Status', 'BBall Coach Email', 'Baseball Coach Email', 'Notes'
  ];

  var STATUS_LABELS = {
    'not_started': 'Not Started', 'researching': 'Researching',
    'in_progress': 'In Progress', 'submitted': 'Submitted',
    'accepted': 'Accepted', 'waitlisted': 'Waitlisted',
    'denied': 'Denied', 'enrolled': 'Enrolled'
  };

  window.Export = {
    downloadCSV: function() {
      var rows = [HEADERS.join(',')];

      window.SCHOOLS_DATA.forEach(function(s) {
        var t = Store.getSchool(s.id);
        var row = [
          escapeCSV(s.id),
          escapeCSV(s.name),
          escapeCSV(s.fullName),
          escapeCSV(s.institutionType),
          escapeCSV(s.city),
          escapeCSV(s.region),
          escapeCSV(s.distanceFromLakewood),
          escapeCSV(s.studentPopulation),
          escapeCSV(s.division),
          escapeCSV(s.conference),
          escapeCSV(s.basketballRating),
          escapeCSV(s.baseballRating),
          escapeCSV(s.combinedRating),
          escapeCSV(s.tuitionInState),
          escapeCSV(s.tuitionOutOfState),
          escapeCSV(s.applicationURL),
          escapeCSV(s.athleticsURL),
          escapeCSV(s.mascot),
          escapeCSV(STATUS_LABELS[t.appStatus] || t.appStatus || 'Not Started'),
          escapeCSV(t.priority || 'medium'),
          escapeCSV(t.coachContacted ? 'Yes' : 'No'),
          escapeCSV(t.dateApplied || ''),
          escapeCSV(t.financialAidStatus || 'not_applied'),
          escapeCSV(t.basketballCoachEmail || ''),
          escapeCSV(t.baseballCoachEmail || ''),
          escapeCSV(t.notes || '')
        ];
        rows.push(row.join(','));
      });

      var csvContent = rows.join('\r\n');
      var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var today = new Date().toISOString().split('T')[0];
      var filename = 'cali-college-tracker-' + today + '.csv';

      var link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (window.App) window.App.showToast('CSV exported: ' + filename, 'success');
    }
  };

})();
