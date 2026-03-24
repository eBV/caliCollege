/* ============================================================
   FILTERS — Pure filter, search, and sort functions
   API: window.Filters
   ============================================================ */

(function() {

  function getDistanceBuckets(checked) {
    var buckets = [];
    checked.forEach(function(v) {
      if (v === '0-25')   buckets.push([0, 25]);
      if (v === '25-50')  buckets.push([25, 50]);
      if (v === '50-100') buckets.push([50, 100]);
      if (v === '100-200')buckets.push([100, 200]);
      if (v === '200+')   buckets.push([200, Infinity]);
    });
    return buckets;
  }

  function getTuitionBuckets(checked) {
    var buckets = [];
    checked.forEach(function(v) {
      if (v === '0-1500')      buckets.push([0, 1500]);
      if (v === '1500-7000')   buckets.push([1500, 7000]);
      if (v === '7000-15000')  buckets.push([7000, 15000]);
      if (v === '15000-30000') buckets.push([15000, 30000]);
      if (v === '30000-60000') buckets.push([30000, 60000]);
      if (v === '60000+')      buckets.push([60000, Infinity]);
    });
    return buckets;
  }

  function inBuckets(value, buckets) {
    if (buckets.length === 0) return false;
    return buckets.some(function(b) {
      return value >= b[0] && value <= b[1];
    });
  }

  function matchesSearch(school, term) {
    if (!term) return true;
    var t = term.toLowerCase();
    return (
      school.name.toLowerCase().indexOf(t) !== -1 ||
      school.fullName.toLowerCase().indexOf(t) !== -1 ||
      school.city.toLowerCase().indexOf(t) !== -1 ||
      school.conference.toLowerCase().indexOf(t) !== -1 ||
      school.mascot.toLowerCase().indexOf(t) !== -1 ||
      school.region.toLowerCase().indexOf(t) !== -1
    );
  }

  function applySort(schools, sortBy) {
    var arr = schools.slice(); // don't mutate original
    arr.sort(function(a, b) {
      switch (sortBy) {
        case 'distance_asc':  return a.distanceFromLakewood - b.distanceFromLakewood;
        case 'distance_desc': return b.distanceFromLakewood - a.distanceFromLakewood;
        case 'name_asc':      return a.name.localeCompare(b.name);
        case 'tuition_asc':   return a.tuitionInState - b.tuitionInState;
        case 'tuition_desc':  return b.tuitionInState - a.tuitionInState;
        case 'basketball_desc': return b.basketballRating - a.basketballRating;
        case 'baseball_desc':   return b.baseballRating - a.baseballRating;
        case 'combined_desc':   return b.combinedRating - a.combinedRating;
        case 'population_desc': return b.studentPopulation - a.studentPopulation;
        case 'population_asc':  return a.studentPopulation - b.studentPopulation;
        default: return a.distanceFromLakewood - b.distanceFromLakewood;
      }
    });
    return arr;
  }

  window.Filters = {
    apply: function(schools, opts) {
      var searchTerm = opts.searchTerm || '';
      var sortBy     = opts.sortBy || 'distance_asc';
      var divisions  = opts.divisions || [];
      var regions    = opts.regions || [];
      var types      = opts.types || [];
      var distanceBuckets = getDistanceBuckets(opts.distances || []);
      var tuitionBuckets  = getTuitionBuckets(opts.tuitions || []);
      var minBball   = opts.minBasketball || 1;
      var minBase    = opts.minBaseball || 1;
      var appStatusFilter = opts.appStatus || null; // null = all

      var filtered = schools.filter(function(s) {
        // Distance
        if (distanceBuckets.length > 0 && !inBuckets(s.distanceFromLakewood, distanceBuckets)) return false;
        // Division
        if (divisions.length > 0 && divisions.indexOf(s.division) === -1) return false;
        // Region
        if (regions.length > 0 && regions.indexOf(s.region) === -1) return false;
        // Institution type
        if (types.length > 0 && types.indexOf(s.institutionType) === -1) return false;
        // Tuition
        if (tuitionBuckets.length > 0 && !inBuckets(s.tuitionInState, tuitionBuckets)) return false;
        // Basketball
        if (s.basketballRating < minBball) return false;
        // Baseball
        if (s.baseballRating < minBase) return false;
        // App status filter
        if (appStatusFilter && appStatusFilter !== 'all') {
          var trackerState = Store.getSchool(s.id);
          if (trackerState.appStatus !== appStatusFilter) return false;
        }
        // Search
        if (!matchesSearch(s, searchTerm)) return false;
        return true;
      });

      return applySort(filtered, sortBy);
    },

    readFromDOM: function() {
      function checkedValues(listId) {
        var vals = [];
        var cbs = document.querySelectorAll('#' + listId + ' input[type="checkbox"]');
        cbs.forEach(function(cb) { if (cb.checked) vals.push(cb.value); });
        return vals;
      }

      var appStatusEl = document.querySelector('#filter-appstatus input[type="checkbox"]');
      var appStatus = null;
      if (appStatusEl && !appStatusEl.checked) {
        // When not "all statuses" checked we'd read specific ones, but for now keep it simple
        appStatus = null;
      }

      return {
        searchTerm: (document.getElementById('search-input') || {}).value || '',
        sortBy: (document.getElementById('sort-select') || {}).value || 'distance_asc',
        distances: checkedValues('filter-distance'),
        divisions: checkedValues('filter-division'),
        regions:   checkedValues('filter-region'),
        types:     checkedValues('filter-type'),
        tuitions:  checkedValues('filter-tuition'),
        minBasketball: parseInt((document.getElementById('filter-basketball') || {value:'1'}).value),
        minBaseball:   parseInt((document.getElementById('filter-baseball')   || {value:'1'}).value),
        appStatus: appStatus
      };
    }
  };

})();
