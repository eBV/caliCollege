/* ============================================================
   APP — Main bootstrap, event wiring, view router
   Loads LAST — all other modules must be loaded before this
   ============================================================ */

/* ===== MERGE SCORECARD + COACH DATA into SCHOOLS_DATA ===== */
(function() {
  if (!window.SCHOOLS_DATA) return;
  window.SCHOOLS_DATA.forEach(function(school) {
    if (window.SCORECARD_DATA && window.SCORECARD_DATA[school.id]) {
      var sc = window.SCORECARD_DATA[school.id];
      Object.keys(sc).forEach(function(k) { school[k] = sc[k]; });
    }
    if (window.COACH_DATA && window.COACH_DATA[school.id]) {
      var cd = window.COACH_DATA[school.id];
      Object.keys(cd).forEach(function(k) { school[k] = cd[k]; });
    }
  });
})();

(function() {

  var _currentView = 'cards';
  var _mapInited = false;
  var _debounceTimer = null;

  /* ===== TOAST ===== */
  function showToast(msg, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = '0.3s ease';
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2500);
  }
  window.App = window.App || {};
  window.App.showToast = showToast;

  /* ===== GET FILTERED SCHOOLS ===== */
  function getFiltered() {
    var opts = Filters.readFromDOM();
    return Filters.apply(window.SCHOOLS_DATA, opts);
  }

  /* ===== RERENDER CURRENT VIEW ===== */
  function rerender() {
    var schools = getFiltered();
    var countEl = document.getElementById('results-count');
    if (countEl) countEl.textContent = schools.length + ' school' + (schools.length !== 1 ? 's' : '');
    StatsBar.render(schools.length);

    switch (_currentView) {
      case 'cards':   CardView.render(schools); break;
      case 'table':   TableView.render(schools); break;
      case 'map':
        MapView.render(schools);
        break;
      case 'compare':
        // Compare doesn't filter — shows selected schools regardless
        CompareView.render();
        break;
    }
    updateCompareCount();
  }
  window.App.rerender = rerender;

  /* ===== VIEW SWITCHER ===== */
  function switchView(viewName) {
    _currentView = viewName;

    // Update tab active state
    document.querySelectorAll('.view-tab').forEach(function(tab) {
      tab.classList.toggle('view-tab--active', tab.getAttribute('data-view') === viewName);
    });

    // Toggle section visibility
    document.querySelectorAll('.view-section').forEach(function(section) {
      section.classList.remove('view-section--active');
    });
    var active = document.getElementById('view-' + viewName);
    if (active) active.classList.add('view-section--active');

    // Map: lazy init + invalidateSize
    if (viewName === 'map') {
      if (!_mapInited) {
        _mapInited = true;
        MapView.init();
      }
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          MapView.invalidateSize();
          MapView.render(getFiltered());
        });
      });
    }

    if (viewName === 'compare') {
      CompareView.render();
    }

    rerender();
  }
  window.App.switchView = switchView;

  /* ===== COMPARE COUNT BADGE ===== */
  function updateCompareCount() {
    var list = Store.getCompareList();
    var badge = document.getElementById('compare-count');
    if (badge) {
      badge.textContent = list.length;
      badge.style.display = list.length > 0 ? 'inline-flex' : 'none';
    }
  }

  /* ===== EVENT DELEGATION — Card and Table actions ===== */
  function handleActionClick(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');
    var id = el.getAttribute('data-id');
    if (!id) return;

    if (action === 'track') {
      e.preventDefault();
      e.stopPropagation();
      Tracker.open(id);
    }
    if (action === 'compare') {
      e.preventDefault();
      e.stopPropagation();
      var ok = Store.toggleCompare(id);
      if (!ok) {
        showToast('Max 4 schools in Compare. Remove one first.', 'warning');
      } else {
        rerender();
        updateCompareCount();
      }
    }
    if (action === 'remove-compare') {
      e.preventDefault();
      Store.saveSchool(id, { inCompare: false });
      updateCompareCount();
      CompareView.render();
    }
  }

  /* ===== SEARCH INPUT (debounced) ===== */
  function onSearch() {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(function() {
      rerender();
      var searchInput = document.getElementById('search-input');
      var clearBtn = document.getElementById('search-clear');
      if (clearBtn && searchInput) {
        clearBtn.classList.toggle('visible', searchInput.value.length > 0);
      }
    }, 200);
  }

  /* ===== INIT ===== */
  document.addEventListener('DOMContentLoaded', function() {

    // View tab clicks
    document.querySelectorAll('.view-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        switchView(tab.getAttribute('data-view'));
      });
    });

    // Search input
    var searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.addEventListener('input', onSearch);

    // Search clear
    var clearBtn = document.getElementById('search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        var si = document.getElementById('search-input');
        if (si) { si.value = ''; si.focus(); }
        clearBtn.classList.remove('visible');
        rerender();
      });
    }

    // Filter changes
    document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(function(cb) {
      cb.addEventListener('change', rerender);
    });

    // Sort select
    var sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.addEventListener('change', rerender);

    // Rating sliders
    var bballSlider = document.getElementById('filter-basketball');
    var baseSlider  = document.getElementById('filter-baseball');
    var bballVal    = document.getElementById('bball-rating-val');
    var baseVal     = document.getElementById('baseball-rating-val');

    if (bballSlider) {
      bballSlider.addEventListener('input', function() {
        var v = parseInt(this.value);
        if (bballVal) bballVal.textContent = v === 1 ? 'Any' : v + '★';
        rerender();
      });
    }
    if (baseSlider) {
      baseSlider.addEventListener('input', function() {
        var v = parseInt(this.value);
        if (baseVal) baseVal.textContent = v === 1 ? 'Any' : v + '★';
        rerender();
      });
    }

    // Reset filters
    var resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        // Uncheck all, then re-check
        document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(function(cb) {
          cb.checked = true;
        });
        if (bballSlider) { bballSlider.value = 1; if (bballVal) bballVal.textContent = 'Any'; }
        if (baseSlider)  { baseSlider.value  = 1; if (baseVal)  baseVal.textContent  = 'Any'; }
        if (sortSelect)  sortSelect.value = 'distance_asc';
        var si = document.getElementById('search-input');
        if (si) { si.value = ''; }
        if (clearBtn) clearBtn.classList.remove('visible');
        rerender();
        showToast('Filters reset', 'info');
      });
    }

    // Export button
    var exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', function() { Export.downloadCSV(); });

    // Mobile filters toggle
    var filtersToggle = document.getElementById('filters-toggle');
    var filtersPanel  = document.getElementById('filters-panel');
    var filtersOverlay = document.createElement('div');
    filtersOverlay.className = 'filters-overlay';
    document.body.appendChild(filtersOverlay);

    if (filtersToggle && filtersPanel) {
      filtersToggle.addEventListener('click', function() {
        filtersPanel.classList.toggle('filters--open');
        filtersOverlay.classList.toggle('visible');
      });
      filtersOverlay.addEventListener('click', function() {
        filtersPanel.classList.remove('filters--open');
        filtersOverlay.classList.remove('visible');
      });
    }

    // Event delegation for all action buttons (track, compare, remove-compare)
    document.addEventListener('click', handleActionClick);

    // Initial render
    rerender();
    updateCompareCount();

    console.log('CA College Athletics Dashboard loaded. Schools:', window.SCHOOLS_DATA.length);
  });

})();
