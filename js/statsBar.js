/* ============================================================
   STATS BAR — Dashboard KPI chips
   API: window.StatsBar
   ============================================================ */

(function() {

  window.StatsBar = {
    render: function(filteredCount) {
      var total = window.SCHOOLS_DATA.length;
      var d1Count = window.SCHOOLS_DATA.filter(function(s) { return s.division === 'NCAA-D1'; }).length;
      var ccCount = window.SCHOOLS_DATA.filter(function(s) { return s.institutionType === 'CommunityCollege'; }).length;
      var nearbyCount = window.SCHOOLS_DATA.filter(function(s) { return s.distanceFromLakewood <= 30; }).length;
      var submittedCount = Store.getSubmittedCount();

      var totalEl = document.getElementById('stat-total');
      if (totalEl) totalEl.textContent = filteredCount !== undefined ? filteredCount + ' / ' + total : total;

      var d1El = document.getElementById('stat-d1');
      if (d1El) d1El.textContent = d1Count;

      var ccEl = document.getElementById('stat-cc');
      if (ccEl) ccEl.textContent = ccCount;

      var nearbyEl = document.getElementById('stat-nearby');
      if (nearbyEl) nearbyEl.textContent = nearbyCount;

      var submittedEl = document.getElementById('stat-submitted');
      if (submittedEl) submittedEl.textContent = submittedCount;
    }
  };

})();
