
const grid = document.getElementById("projectGrid");
const searchInput = document.getElementById("searchInput");
const gradeFilter = document.getElementById("gradeFilter");
const subjectFilter = document.getElementById("subjectFilter");
const projectCount = document.getElementById("projectCount");
const totalCount = document.getElementById("totalCount");
const boothMap = document.getElementById("boothMap");
const subjectSummary = document.getElementById("subjectSummary");
const projectByNumber = new Map(PROJECTS.map(p => [p.projectNumber, p]));

function escapeHTML(value) {
  return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function safeId(projectNumber) { return `project-${String(projectNumber).replace(/[^a-zA-Z0-9_-]/g, "")}`; }
function prefixOf(projectNumber) { return String(projectNumber || "").trim().charAt(0).toUpperCase(); }

function renderSubjectSummary() {
  const counts = PROJECTS.reduce((acc,p) => {
    const key = p.subject || "Other";
    const prefix = prefixOf(p.projectNumber);
    if (!acc[key]) acc[key] = { count: 0, prefix };
    acc[key].count += 1;
    return acc;
  }, {});
  subjectSummary.innerHTML = Object.entries(counts).map(([subject, info]) => `
    <div class="subject-row">
      <span class="color-box booth ${escapeHTML(info.prefix)}"></span>
      <span>${escapeHTML(subject)}</span>
      <strong>${info.count}</strong>
    </div>`).join("");
}

function renderBoothMap() {
  boothMap.innerHTML = MAP_LAYOUT.map((row, rowIndex) => `
    <div class="map-row">
      <span class="row-title">Row ${rowIndex + 1}</span>
      <div class="table-row">
        ${row.map((table, tableIndex) => `
          <div class="table-card">
            <h4>Table ${rowIndex * 5 + tableIndex + 1}</h4>
            <div class="table-booths">
              ${table.map(number => {
                if (number === "EMPTY") return `<div class="booth empty">Empty</div>`;
                const p = projectByNumber.get(number);
                const prefix = prefixOf(number);
                const label = p ? `${number}: ${p.title}` : number;
                return `<a class="booth ${escapeHTML(prefix)}" href="#${safeId(number)}" title="${escapeHTML(label)}">${escapeHTML(number)}</a>`;
              }).join("")}
            </div>
          </div>`).join("")}
      </div>
    </div>`).join("");
}

const grades = [...new Set(PROJECTS.map(p => p.grade).filter(Boolean))].sort((a,b) => Number(a)-Number(b));
const subjects = [...new Set(PROJECTS.map(p => p.subject).filter(Boolean))].sort((a,b) => a.localeCompare(b));
for (const grade of grades) {
  const option = document.createElement("option");
  option.value = grade;
  option.textContent = `Grade ${grade}`;
  gradeFilter.appendChild(option);
}
for (const subject of subjects) {
  const option = document.createElement("option");
  option.value = subject;
  option.textContent = subject;
  subjectFilter.appendChild(option);
}

function renderProjects() {
  const query = searchInput.value.trim().toLowerCase();
  const grade = gradeFilter.value;
  const subject = subjectFilter.value;
  const filtered = PROJECTS.filter(project => {
    const haystack = [project.projectNumber, project.subject, project.grade, project.title, project.abstract, project.question, project.purpose, ...(project.students || [])].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) && (!grade || project.grade === grade) && (!subject || project.subject === subject);
  });
  projectCount.textContent = filtered.length;
  totalCount.textContent = PROJECTS.length;
  if (!filtered.length) {
    grid.innerHTML = `<div class="project-card"><h3>No projects found</h3><p>Try adjusting your search or filters.</p></div>`;
    return;
  }
  grid.innerHTML = filtered.map(project => {
    const students = (project.students || []).map(name => `<span>${escapeHTML(name)}</span>`).join("");
    return `<article class="project-card" id="${safeId(project.projectNumber)}">
        <div class="meta">
          <span class="pill">Booth ${escapeHTML(project.projectNumber || "N/A")}</span>
          <span class="pill">Grade ${escapeHTML(project.grade || "N/A")}</span>
          <span class="pill">${escapeHTML(project.subject || "General Science")}</span>
        </div>
        <h3>${escapeHTML(project.title || "Untitled Project")}</h3>
        <div class="students"><strong>Student(s)</strong>${students || "<span>Not listed</span>"}</div>
        ${project.question ? `<div class="detail"><strong>Research Question</strong><p>${escapeHTML(project.question)}</p></div>` : ""}
        ${project.purpose ? `<details class="detail"><summary>Purpose</summary><p>${escapeHTML(project.purpose)}</p></details>` : ""}
        ${project.abstract ? `<details class="detail"><summary>Abstract / Project Summary</summary><p>${escapeHTML(project.abstract)}</p></details>` : ""}
      </article>`;
  }).join("");
}
searchInput.addEventListener("input", renderProjects);
gradeFilter.addEventListener("change", renderProjects);
subjectFilter.addEventListener("change", renderProjects);
renderSubjectSummary(); renderBoothMap(); renderProjects();
