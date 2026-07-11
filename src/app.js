(function () {
  const CASE = globalThis.SECRET_FURRY_CASE;
  const STORAGE_KEY = `secret-furry:${CASE.id}`;
  const CATEGORY_ORDER = ["Identity", "Public record", "Personal", "Personality", "Online", "Language", "Creative trace", "Timeline", "Private interests", "Physical evidence", "Digital trail", "Relationship", "Motive", "Contradiction", "Red herring"];

  let state = {
    started: false,
    filed: [],
    opened: [],
    knownSources: [],
    activePerson: null,
    profileView: "detail",
    filter: "all",
    activeSource: null,
    sound: true,
    deductionShown: false,
    revealSeen: false,
    confronted: false,
    ending: null
  };
  let selectedChunk = null;
  let toastTimer = null;
  let audioContext = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const filed = (id) => state.filed.includes(id);
  const clue = (id) => CASE.clues[id];
  const discovered = (personId) => filed(`${personId}_name`);
  const activeSource = () => CASE.sources.find((source) => source.id === state.activeSource);
  const SOURCE_ADDRESSES = {
    moonrise_news: "gatehouse.bw/night/moonrise-velvet-static",
    expo_directory: "moonrise.bw/tonight/featured-people",
    afterdark_chat: "recovery.local/moonrise/after-dark-floor",
    lumen_thread: "lumen.bw/thread/VS-884",
    anime_forum: "moonboard.net/identity/99104",
    ren_portfolio: "renmarch.studio/commissions/archive",
    event_logs: "moonrise-sec.local/export/privacy-404",
    backstage_archive: "incident.local/moonrise/404/backstage",
    private_dm: "hush.local/recovery/get-my-head-back"
  };

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.filed)) state = { ...state, ...saved };
    } catch { /* Start fresh if a local save is malformed. */ }
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Saving is helpful, not required. */ }
  }

  function sourceUnlocked(source) {
    return source.requires.every(filed);
  }

  function newlyUnlocked(before) {
    return CASE.sources.filter((source) => sourceUnlocked(source) && !before.includes(source.id));
  }

  function finalReady() {
    return CASE.finalKeys.every(filed);
  }

  function currentPhase() {
    const amount = CASE.finalKeys.filter(filed).length;
    if (amount === CASE.finalKeys.length) return "foxfire";
    if (amount >= 4) return "private";
    if (amount >= 2) return "suspect";
    return "public";
  }

  function flash(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3900);
  }

  function tone(kind = "accept") {
    if (!state.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const settings = {
        select: [420, .025, "square"],
        accept: [660, .055, "triangle"],
        reject: [125, .07, "sawtooth"],
        mail: [850, .09, "sine"],
        reveal: [310, .22, "triangle"]
      }[kind] || [520, .05, "square"];
      oscillator.type = settings[2];
      oscillator.frequency.setValueAtTime(settings[0], audioContext.currentTime);
      gain.gain.setValueAtTime(.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + settings[1]);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + settings[1]);
    } catch { /* Audio feedback is optional. */ }
  }

  function personName(personId) {
    return discovered(personId) ? CASE.people[personId].name : "UNKNOWN CONTACT";
  }

  function personRole(personId) {
    const roleId = `${personId}_role`;
    return filed(roleId) ? clue(roleId).value : "Role not established";
  }

  function profileFacts(personId) {
    return state.filed
      .map((id) => ({ id, data: clue(id) }))
      .filter(({ data }) => data && data.kind !== "identity" && data.kind !== "image" && (data.person === personId || data.endpoints?.includes(personId)));
  }

  function profileStatus(personId) {
    const facts = profileFacts(personId);
    if (facts.some(({ data }) => data.category === "Motive")) return "PRIVATE MOTIVE RECORDED";
    if (facts.some(({ data }) => data.kind === "conflict" || data.category === "Contradiction")) return "CONTEXT CONFLICT ACTIVE";
    if (facts.some(({ data }) => data.category === "Private interests")) return "PRIVATE OUTLINE EMERGING";
    if (facts.length) return "PUBLIC OUTLINE EMERGING";
    return "IDENTITY ONLY";
  }

  function renderFactGroups(personId) {
    const facts = profileFacts(personId);
    const groups = new Map();
    facts.forEach(({ id, data }) => {
      const category = data.kind === "relationship" ? "Relationship" : data.category;
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push({ id, data });
    });
    const ordered = CATEGORY_ORDER.filter((category) => groups.has(category));
    if (!ordered.length) return `<section class="fact-group empty">DROP SOURCE DATA INTO THIS DOSSIER</section>`;
    return ordered.map((category) => {
      const items = groups.get(category).map(({ data }) => {
        const source = CASE.sources.find((item) => item.id === data.source);
        return `<li>${escapeHtml(data.value)} <em>· ${escapeHtml(source?.subject || "source")}</em></li>`;
      }).join("");
      return `<section class="fact-group"><h4>${escapeHtml(category.toUpperCase())}</h4><ul>${items}</ul></section>`;
    }).join("");
  }

  function renderDossier(personId) {
    const person = CASE.people[personId];
    const photoKnown = filed(person.photoClue);
    return `<article class="dossier profile-drop-surface ${photoKnown ? "photo-known" : ""}" data-profile-drop="${personId}">
      <div class="profile-hero">
        <div class="profile-portrait portrait-${person.portrait}"></div>
        <div class="portrait-mask"><span>VISUAL ID ENCRYPTED</span></div>
        <div class="profile-identity"><small>${person.code} // ACTIVE DOSSIER</small><h3>${escapeHtml(person.name)}</h3><p>${escapeHtml(personRole(personId))}</p></div>
      </div>
      <div class="profile-body">
        <div class="profile-status"><span>PROFILE INTERPRETATION</span><b>${profileStatus(personId)}</b></div>
        <div class="profile-fields">${renderFactGroups(personId)}<aside class="profile-note"><b>ANALYST MARGIN</b><br>${escapeHtml(person.note)}</aside></div>
      </div>
    </article>`;
  }

  function renderEmptyDossier() {
    const identityReady = selectedChunk && clue(selectedChunk)?.kind === "identity";
    return `<article class="empty-dossier profile-drop-surface ${identityReady ? "drag-ready" : ""}" data-profile-drop="new">
      <div class="cipher-face">?</div><h3>NO ACTIVE IDENTITY</h3><p>Names create dossiers. Pull a highlighted name from a source and release it anywhere in this panel.</p><strong>${identityReady ? "IDENTITY READY — RELEASE TO CREATE" : "WAITING FOR A NAME DATA CHUNK"}</strong>
    </article>`;
  }

  function renderNetwork() {
    const relationships = state.filed.map((id) => ({ id, data: clue(id) })).filter(({ data }) => data?.kind === "relationship");
    const visiblePeople = new Set(Object.keys(CASE.people).filter(discovered));
    relationships.forEach(({ data }) => data.endpoints.forEach((id) => visiblePeople.add(id)));
    if (!visiblePeople.size) return `<section class="network-board"><div class="network-empty">CREATE PROFILES TO BEGIN THE RELATIONSHIP MAP</div></section>`;
    const lines = relationships.map(({ data }) => {
      const [a, b] = data.endpoints.map((id) => CASE.people[id].position);
      return `<line x1="${a[0]}%" y1="${a[1]}%" x2="${b[0]}%" y2="${b[1]}%"></line>`;
    }).join("");
    const labels = relationships.map(({ data }) => {
      const [a, b] = data.endpoints.map((id) => CASE.people[id].position);
      return `<span class="network-label" style="left:${(a[0]+b[0])/2}%;top:${(a[1]+b[1])/2}%">${escapeHtml(data.label)}</span>`;
    }).join("");
    const nodes = [...visiblePeople].map((personId) => {
      const person = CASE.people[personId];
      const known = discovered(personId);
      const photo = filed(person.photoClue);
      return `<button class="network-node ${photo ? "" : "masked"}" data-network-person="${known ? personId : ""}" style="left:${person.position[0]}%;top:${person.position[1]}%" type="button" ${known ? "" : "disabled"}><span class="node-image portrait-${person.portrait}"></span><b>${escapeHtml(known ? person.name : "UNKNOWN CONTACT")}</b></button>`;
    }).join("");
    return `<section class="network-board"><svg class="network-svg" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>${labels}${nodes}</section>`;
  }

  function renderProfileStage() {
    const stage = $("#profileStage");
    stage.innerHTML = state.profileView === "network"
      ? renderNetwork()
      : state.activePerson && discovered(state.activePerson)
        ? renderDossier(state.activePerson)
        : renderEmptyDossier();
    $$("[data-profile-view]").forEach((button) => button.classList.toggle("active", button.dataset.profileView === state.profileView));
    bindTilt();
  }

  function renderRail() {
    const people = Object.keys(CASE.people).filter(discovered);
    $("#profileRail").innerHTML = people.map((personId) => {
      const person = CASE.people[personId];
      return `<button class="rail-person ${filed(person.photoClue) ? "" : "masked"} ${state.activePerson === personId ? "active" : ""}" data-rail-person="${personId}" type="button"><span class="mini-portrait portrait-${person.portrait}"></span><span>${escapeHtml(person.name)}</span></button>`;
    }).join("") + `<button class="rail-new" data-new-profile type="button" title="Create a profile from a name chunk">+</button>`;
  }

  function chunkMarkup(id, label) {
    const data = clue(id);
    if (!data) return `<span>${escapeHtml(label)}</span>`;
    const classes = ["chunk", data.kind || "fact", data.key ? "key" : "", data.conflict ? "conflict" : "", filed(id) ? "filed" : "", selectedChunk === id ? "selected" : ""].filter(Boolean).join(" ");
    return `<button class="${classes}" data-chunk="${id}" draggable="${filed(id) ? "false" : "true"}" type="button">${escapeHtml(label)}</button>`;
  }

  function parseChunks(html) {
    return html.replace(/\{\{chunk:([^|}]+)\|([^}]+)\}\}/g, (_, id, label) => chunkMarkup(id.trim(), label.trim()));
  }

  function renderReader() {
    const reader = $("#reader");
    const inbox = $("#inboxPanel");
    const source = activeSource();
    if (!source) {
      inbox.classList.remove("hidden");
      reader.classList.add("hidden");
      reader.innerHTML = "";
      return;
    }
    inbox.classList.add("hidden");
    reader.classList.remove("hidden");
    const address = SOURCE_ADDRESSES[source.id] || `capture.local/${source.id}`;
    reader.innerHTML = `<div class="source-browserbar"><span class="browser-controls">‹　›　↻</span><span class="browser-lock">◆</span><span class="source-address">${escapeHtml(address)}</span><span class="capture-status">CAPTURED ${escapeHtml(source.time)}</span></div><div class="source-page skin-${source.skin}">${parseChunks(source.html)}</div>`;
  }

  function renderEmails() {
    const list = CASE.sources.filter(sourceUnlocked);
    $("#emailList").innerHTML = list.map((source) => {
      const unread = !state.opened.includes(source.id);
      return `<button class="email ${unread ? "unread" : ""}" data-source="${source.id}" type="button"><i class="email-dot"></i><span class="email-sender"><b>${escapeHtml(source.from)}</b></span><span class="email-copy"><strong>${escapeHtml(source.subject)}</strong><small>${escapeHtml(source.preview)}</small></span><time>${escapeHtml(source.time)}</time></button>`;
    }).join("") || `<p class="inbox-empty">No leads are currently available. Re-open a source tab and continue tracing its highlighted data.</p>`;
    const unreadExists = CASE.sources.some((source) => sourceUnlocked(source) && !state.opened.includes(source.id));
    const unreadCount = CASE.sources.filter((source) => sourceUnlocked(source) && !state.opened.includes(source.id)).length;
    $("#mailPulse").style.visibility = unreadExists ? "visible" : "hidden";
    $("#inboxBadge").textContent = unreadCount;
    $("#availableLeadCount").textContent = `${list.length} ${list.length === 1 ? "LEAD" : "LEADS"}`;
  }

  function renderSourceTabs() {
    const opened = state.opened.map((id) => CASE.sources.find((source) => source.id === id)).filter(Boolean);
    $("#openedSourceTabs").innerHTML = opened.map((source) => `<button class="${state.activeSource === source.id ? "active" : ""}" data-source="${source.id}" type="button" title="${escapeHtml(source.subject)}">${escapeHtml(source.subject)}</button>`).join("");
    $("#inboxTab").classList.toggle("active", !state.activeSource);
  }

  function updatePhase() {
    const phase = currentPhase();
    document.body.dataset.phase = phase;
    const labels = { public: "SIGNAL QUIET", suspect: "POSSIBLE OVERLAP", private: "STRONG IDENTITY PATTERN", foxfire: "IDENTITY CORROBORATED" };
    $("#signalLabel").textContent = labels[phase];
    $("#sourceHint").textContent = selectedChunk
      ? clue(selectedChunk).kind === "identity" ? "Name selected: release it on the profile panel to create a dossier." : `Selected data belongs somewhere in ${clue(selectedChunk).kind === "relationship" ? "the connected profiles" : "one active dossier"}.`
      : activeSource()
        ? "Source open. Pull marked information into the active dossier, or return to Inbox for another lead."
        : "Open an available email lead. Its linked source will replace the Inbox.";
  }

  function renderAll() {
    renderProfileStage();
    renderRail();
    renderEmails();
    renderSourceTabs();
    renderReader();
    updatePhase();
  }

  function openInbox() {
    state.activeSource = null;
    persist();
    renderAll();
    $("#inboxPanel").scrollTop = 0;
  }

  function openSource(id) {
    const source = CASE.sources.find((item) => item.id === id);
    if (!source || !sourceUnlocked(source)) { flash("That lead is still encrypted by an unresolved trail."); tone("reject"); return; }
    state.activeSource = id;
    if (!state.opened.includes(id)) state.opened.push(id);
    persist();
    renderAll();
    $("#reader").scrollTop = 0;
  }

  function selectChunk(id) {
    if (!clue(id) || filed(id)) return;
    selectedChunk = id;
    tone("select");
    $$("[data-chunk]").forEach((button) => button.classList.toggle("selected", button.dataset.chunk === id));
    renderProfileStage();
    updatePhase();
    const data = clue(id);
    flash(data.kind === "identity" ? "Identity selected. Release it anywhere in the profile panel to create a dossier." : data.kind === "relationship" ? "Relationship selected. Open either connected profile and release it there." : `Data selected. Open ${CASE.people[data.person].name} and release it anywhere in the dossier.`);
  }

  function canFileToActive(data) {
    if (data.kind === "identity") return true;
    if (data.kind === "relationship") return state.activePerson && data.endpoints.includes(state.activePerson);
    return state.activePerson === data.person;
  }

  function fileChunk(id) {
    const data = clue(id);
    if (!data || filed(id)) return;
    if (state.profileView !== "detail") { flash("Open a profile from the network before filing this data."); tone("reject"); return; }
    if (!canFileToActive(data)) { flash(data.kind === "identity" ? "This name can create a new dossier here." : "That information belongs to a different person. Switch the active profile."); tone("reject"); return; }
    if (data.kind !== "identity" && data.kind !== "relationship" && !discovered(data.person)) { flash("Find and file this person’s name before adding private information."); tone("reject"); return; }

    const before = CASE.sources.filter(sourceUnlocked).map((source) => source.id);
    const readerScroll = $("#reader").scrollTop;
    state.filed.push(id);
    if (data.kind === "identity") state.activePerson = data.person;
    selectedChunk = null;
    const afterNew = newlyUnlocked(before);
    afterNew.forEach((source) => { if (!state.knownSources.includes(source.id)) state.knownSources.push(source.id); });
    persist();
    renderAll();
    $("#reader").scrollTop = readerScroll;
    tone(data.kind === "identity" ? "mail" : "accept");
    if (data.kind === "identity") flash(`New dossier created: ${CASE.people[data.person].name}.`);
    else if (data.kind === "image") flash(`Visual identity revealed for ${CASE.people[data.person].name}.`);
    else if (data.kind === "relationship") flash(`Relationship added: ${data.label}.`);
    else flash(`${data.category} filed automatically in ${CASE.people[data.person].name}’s dossier.`);
    if (afterNew.length) setTimeout(() => { tone("mail"); flash(`New Inbox lead: ${afterNew.map((source) => source.subject).join(" / ")}`); }, 650);
    if (finalReady() && !state.deductionShown) {
      state.deductionShown = true;
      persist();
      setTimeout(showDeduction, 900);
    }
  }

  function showDeduction() {
    const labels = {
      nadia_phrase: ["LANGUAGE", "matched"], nadia_fandom_view: ["IDENTITY", "echoed"], nadia_lounge: ["ACCESS", "confirmed"], nadia_commission: ["CHARACTER", "traced"], nadia_device: ["DEVICE", "matched"], nadia_private: ["MOTIVE", "understood"], link_nadia_imogen: ["HANDLER", "connected"]
    };
    $("#deductionPillars").innerHTML = CASE.finalKeys.map((id) => `<span>${labels[id][0]}<b>${labels[id][1]}</b></span>`).join("");
    $("#deductionModal").classList.remove("hidden");
    tone("reveal");
  }

  function chooseEnding(ending) {
    state.ending = ending;
    persist();
    $("#endingText").textContent = CASE.endings[ending];
    $$("[data-ending]").forEach((button) => { button.disabled = true; button.classList.toggle("chosen", button.dataset.ending === ending); });
    tone("reveal");
  }

  function bindTilt() {
    const card = $(".dossier");
    if (!card || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.setProperty("--tilt-y", `${x * 1.5}deg`);
      card.style.setProperty("--tilt-x", `${y * -1.2}deg`);
    });
    card.addEventListener("pointerleave", () => { card.style.setProperty("--tilt-y", "0deg"); card.style.setProperty("--tilt-x", "0deg"); });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function handleClick(event) {
    if (event.target.closest("#startButton")) {
      state.started = true; persist(); $("#introModal").classList.add("hidden"); tone("mail"); flash("Case opened. Begin with the two available Inbox leads."); return;
    }
    if (event.target.closest("#resetButton")) { localStorage.removeItem(STORAGE_KEY); location.reload(); return; }
    if (event.target.closest("#soundButton")) { state.sound = !state.sound; persist(); $("#soundButton").textContent = state.sound ? "♪" : "×"; flash(state.sound ? "Sound enabled." : "Sound muted."); return; }
    if (event.target.closest("[data-open-inbox]")) { openInbox(); return; }
    const email = event.target.closest("[data-source]");
    if (email) { openSource(email.dataset.source); return; }
    const capturedControl = event.target.closest(".source-page button:not(.chunk)");
    if (capturedControl) { flash("Read-only capture: this source control is not live."); tone("reject"); return; }
    const chunkButton = event.target.closest("[data-chunk]");
    if (chunkButton) { selectChunk(chunkButton.dataset.chunk); return; }
    const view = event.target.closest("[data-profile-view]");
    if (view) { state.profileView = view.dataset.profileView; persist(); renderProfileStage(); return; }
    const rail = event.target.closest("[data-rail-person]");
    if (rail) { state.activePerson = rail.dataset.railPerson; state.profileView = "detail"; persist(); renderProfileStage(); renderRail(); return; }
    if (event.target.closest("[data-new-profile]")) { state.activePerson = null; state.profileView = "detail"; persist(); renderProfileStage(); renderRail(); return; }
    const node = event.target.closest("[data-network-person]");
    if (node && node.dataset.networkPerson) { state.activePerson = node.dataset.networkPerson; state.profileView = "detail"; persist(); renderProfileStage(); renderRail(); return; }
    if (event.target.closest(".profile-drop-surface") && selectedChunk) { fileChunk(selectedChunk); return; }
    if (event.target.closest("#revealButton")) { state.revealSeen = true; persist(); $("#deductionModal").classList.add("hidden"); $("#revealModal").classList.remove("hidden"); tone("reveal"); return; }
    if (event.target.closest("#confrontButton")) { state.confronted = true; persist(); $("#revealModal").classList.add("hidden"); $("#decisionModal").classList.remove("hidden"); return; }
    const ending = event.target.closest("[data-ending]");
    if (ending) chooseEnding(ending.dataset.ending);
  }

  function handleDragStart(event) {
    const chunkButton = event.target.closest("[data-chunk]");
    if (!chunkButton || filed(chunkButton.dataset.chunk)) return;
    selectedChunk = chunkButton.dataset.chunk;
    chunkButton.classList.add("dragging");
    event.dataTransfer.setData("text/plain", selectedChunk);
    event.dataTransfer.effectAllowed = "move";
    renderProfileStage();
    updatePhase();
  }

  function handleDragEnd(event) {
    const chunkButton = event.target.closest("[data-chunk]");
    if (chunkButton) chunkButton.classList.remove("dragging");
    $$(".profile-drop-surface").forEach((surface) => surface.classList.remove("drag-ready"));
  }

  function handleDragOver(event) {
    const surface = event.target.closest(".profile-drop-surface");
    if (!surface || state.profileView !== "detail") return;
    event.preventDefault();
    surface.classList.add("drag-ready");
  }

  function handleDragLeave(event) {
    const surface = event.target.closest(".profile-drop-surface");
    if (surface && !surface.contains(event.relatedTarget)) surface.classList.remove("drag-ready");
  }

  function handleDrop(event) {
    const surface = event.target.closest(".profile-drop-surface");
    if (!surface) return;
    event.preventDefault();
    surface.classList.remove("drag-ready");
    fileChunk(event.dataTransfer.getData("text/plain") || selectedChunk);
  }

  function boot() {
    restore();
    const initiallyUnlocked = CASE.sources.filter(sourceUnlocked).map((source) => source.id);
    if (!state.knownSources.length) state.knownSources = initiallyUnlocked;
    if (state.activePerson && !discovered(state.activePerson)) state.activePerson = null;
    document.addEventListener("click", handleClick);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);
    $("#soundButton").textContent = state.sound ? "♪" : "×";
    renderAll();
    if (state.started) $("#introModal").classList.add("hidden");
    if (state.revealSeen && !state.confronted) { $("#revealModal").classList.remove("hidden"); }
    if (state.confronted) { $("#decisionModal").classList.remove("hidden"); }
    if (state.ending) chooseEnding(state.ending);
    if (finalReady() && !state.revealSeen && !state.confronted) showDeduction();
  }

  boot();
})();
