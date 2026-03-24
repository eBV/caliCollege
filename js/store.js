/* ============================================================
   STORE — localStorage persistence for application tracker
   API: window.Store
   ============================================================ */

(function() {
  var STORAGE_KEY = 'caliCollegeTracker';
  var SCHEMA_VERSION = 1;

  var DEFAULT_SCHOOL_STATE = {
    priority: 'medium',
    appStatus: 'not_started',
    dateApplied: '',
    coachContacted: false,
    basketballCoachEmail: '',
    baseballCoachEmail: '',
    financialAidStatus: 'not_applied',
    notes: '',
    inCompare: false
  };

  function _load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return _fresh();
      var data = JSON.parse(raw);
      if (!data || data.version !== SCHEMA_VERSION) return _fresh();
      return data;
    } catch(e) {
      return _fresh();
    }
  }

  function _fresh() {
    return { version: SCHEMA_VERSION, schools: {} };
  }

  function _save(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch(e) {
      console.warn('Store: could not save to localStorage', e);
    }
  }

  window.Store = {
    getAll: function() {
      return _load();
    },

    getSchool: function(id) {
      var data = _load();
      var school = data.schools[id];
      if (!school) {
        return Object.assign({}, DEFAULT_SCHOOL_STATE);
      }
      return Object.assign({}, DEFAULT_SCHOOL_STATE, school);
    },

    saveSchool: function(id, updates) {
      var data = _load();
      if (!data.schools[id]) {
        data.schools[id] = Object.assign({}, DEFAULT_SCHOOL_STATE);
      }
      Object.assign(data.schools[id], updates);
      _save(data);
    },

    getCompareList: function() {
      var data = _load();
      var ids = [];
      Object.keys(data.schools).forEach(function(id) {
        if (data.schools[id].inCompare) ids.push(id);
      });
      return ids;
    },

    toggleCompare: function(id) {
      var current = this.getSchool(id);
      var compareList = this.getCompareList();
      if (!current.inCompare && compareList.length >= 4) {
        return false; // max reached
      }
      this.saveSchool(id, { inCompare: !current.inCompare });
      return true;
    },

    getSubmittedCount: function() {
      var data = _load();
      var count = 0;
      var submitted = ['submitted', 'accepted', 'waitlisted', 'enrolled'];
      Object.values(data.schools).forEach(function(s) {
        if (submitted.indexOf(s.appStatus) !== -1) count++;
      });
      return count;
    },

    reset: function() {
      if (confirm('Reset ALL application tracker data? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        return true;
      }
      return false;
    },

    exportData: function() {
      return _load();
    }
  };
})();
