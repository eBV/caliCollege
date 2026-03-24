/* ============================================================
   ATHLETE PROFILE — Malik Vaden
   Displays recruiting profile + email template launcher
   in the sidebar. Stats sourced from MaxPreps (Mar 2026).
   ============================================================ */

(function() {

  var BBALL_TEMPLATE_SUBJECT = 'Recruitment Inquiry: Malik Vaden | Class of 2026 | 12.4 PPG / 4.8 RPG | Wooster HS (NV)';

  var BBALL_TEMPLATE_BODY = function(coachLastName) {
    var salutation = coachLastName ? 'Dear Coach ' + coachLastName + ',' : 'Dear Coach,';
    return salutation + '\n\n' +
'My name is Malik Vaden, and I am a 5\'11" Senior Small Forward/Guard at Wooster High School. I am writing to formally express my interest in your basketball program.\n\n' +
'Throughout my varsity career, I have focused on being a versatile, two-way player. This season, I have increased my production to 12.4 points, 4.8 rebounds, and 2.0 assists per game. I pride myself on my efficiency and my ability to contribute on both ends of the floor, averaging nearly 2 steals per game over my career.\n\n' +
'My goal is to bring this same work ethic and consistency to a collegiate program. You can review my full game-by-game statistics and career totals here:\nhttps://www.maxpreps.com/nv/reno/wooster-colts/athletes/malik-vaden/basketball/stats/?careerid=9nfc63bvo76aa\n\n' +
'I would welcome the opportunity to speak with you about how I can contribute to your team\'s success. Thank you for your time.\n\n' +
'Sincerely,\n\nMalik Vaden\nClass of 2026 | Wooster High School\n[Phone Number]\n[Email Address]';
  };

  var BASEBALL_TEMPLATE_SUBJECT = 'Recruitment Inquiry: Malik Vaden | Class of 2026 | CF | .306 Career Varsity AVG';

  var BASEBALL_TEMPLATE_BODY = function(coachLastName) {
    var salutation = coachLastName ? 'Dear Coach ' + coachLastName + ',' : 'Dear Coach,';
    return salutation + '\n\n' +
'My name is Malik Vaden, and I am a Senior Center Fielder at Wooster High School in Reno, Nevada. I am reaching out to share my career performance data and express my strong interest in joining your baseball program.\n\n' +
'I have been a consistent contributor to the Wooster Varsity lineup since my freshman year. Over 78 varsity games, I have maintained a .306 career batting average with 63 hits and 31 RBIs. My most recent full seasons include a .354 AVG as a sophomore and a .338 AVG as a junior. I am a reliable outfielder with the plate discipline to maintain a high on-base percentage.\n\n' +
'I am looking for a program where I can continue to develop my skills and help the team compete at a high level. My full career stats and season logs are available here:\nhttps://www.maxpreps.com/nv/reno/wooster-colts/athletes/malik-vaden/baseball/stats/?careerid=9nfc63bvo76aa\n\n' +
'I would appreciate any information you can provide regarding your recruitment process or upcoming scout days. Thank you for your consideration.\n\n' +
'Best regards,\n\nMalik Vaden\nClass of 2026 | Wooster High School\n[Phone Number]\n[Email Address]';
  };

  /* Build last name from full coach name string */
  function lastName(fullName) {
    if (!fullName) return '';
    var parts = fullName.trim().split(' ');
    return parts[parts.length - 1];
  }

  /* Launch mailto with pre-filled template */
  window.AthleteEmail = {
    sendBasketball: function(coachEmail, coachName) {
      var ln = lastName(coachName);
      var subject = encodeURIComponent(BBALL_TEMPLATE_SUBJECT);
      var body    = encodeURIComponent(BBALL_TEMPLATE_BODY(ln));
      var to      = coachEmail || '';
      window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
    },
    sendBaseball: function(coachEmail, coachName) {
      var ln = lastName(coachName);
      var subject = encodeURIComponent(BASEBALL_TEMPLATE_SUBJECT);
      var body    = encodeURIComponent(BASEBALL_TEMPLATE_BODY(ln));
      var to      = coachEmail || '';
      window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
    },
    previewBasketball: function(coachName) {
      return BBALL_TEMPLATE_BODY(lastName(coachName));
    },
    previewBaseball: function(coachName) {
      return BASEBALL_TEMPLATE_BODY(lastName(coachName));
    }
  };

  /* Render the athlete profile panel into #athlete-profile */
  function renderProfile() {
    var el = document.getElementById('athlete-profile');
    if (!el) return;

    el.innerHTML =
      '<div class="athlete-header">' +
        '<div class="athlete-avatar">MV</div>' +
        '<div class="athlete-info">' +
          '<div class="athlete-name">Malik Vaden</div>' +
          '<div class="athlete-meta">Wooster HS — Reno, NV</div>' +
          '<div class="athlete-meta">Sr. (2026) · 5\'11" · #21</div>' +
        '</div>' +
      '</div>' +

      '<div class="athlete-sports">' +
        '<div class="athlete-sport-block">' +
          '<div class="athlete-sport-label">🏀 Basketball</div>' +
          '<div class="athlete-stat-grid">' +
            '<div class="athlete-stat"><span class="astat-val">12.4</span><span class="astat-lbl">PPG</span></div>' +
            '<div class="athlete-stat"><span class="astat-val">4.8</span><span class="astat-lbl">RPG</span></div>' +
            '<div class="athlete-stat"><span class="astat-val">2.0</span><span class="astat-lbl">APG</span></div>' +
            '<div class="athlete-stat"><span class="astat-val">1.6</span><span class="astat-lbl">SPG</span></div>' +
          '</div>' +
          '<div class="athlete-stat-sub">Career: 11.0 PPG · 35% FG · 32% 3P · 61% FT</div>' +
        '</div>' +

        '<div class="athlete-sport-block">' +
          '<div class="athlete-sport-label">⚾ Baseball — CF</div>' +
          '<div class="athlete-stat-grid">' +
            '<div class="athlete-stat"><span class="astat-val">.306</span><span class="astat-lbl">AVG</span></div>' +
            '<div class="athlete-stat"><span class="astat-val">.376</span><span class="astat-lbl">OBP</span></div>' +
            '<div class="athlete-stat"><span class="astat-val">.726</span><span class="astat-lbl">OPS</span></div>' +
            '<div class="athlete-stat"><span class="astat-val">31</span><span class="astat-lbl">RBI</span></div>' +
          '</div>' +
          '<div class="athlete-stat-sub">78 GP · 63 H · .354 soph · .338 junior</div>' +
        '</div>' +
      '</div>' +

      '<div class="athlete-links">' +
        '<a class="athlete-link" href="https://www.maxpreps.com/nv/reno/wooster-colts/athletes/malik-vaden/basketball/stats/?careerid=9nfc63bvo76aa" target="_blank" rel="noopener">🏀 Basketball Stats ↗</a>' +
        '<a class="athlete-link" href="https://www.maxpreps.com/nv/reno/wooster-colts/athletes/malik-vaden/baseball/stats/?careerid=9nfc63bvo76aa" target="_blank" rel="noopener">⚾ Baseball Stats ↗</a>' +
      '</div>';
  }

  document.addEventListener('DOMContentLoaded', renderProfile);

})();
