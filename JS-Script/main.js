const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab";

let allIssues = [];
let filteredIssues = [];
let currentFilter = "all";
let searchQuery = "";

const cardsContainer = document.getElementById("cards-container");
const issueCountElement = document.getElementById("issue-count");
const openCountElement = document.getElementById("open-count");
const closedCountElement = document.getElementById("closed-count");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");
const loader = document.getElementById("loader");
const modal = document.getElementById("task_modal");

//Spinner
function showLoader() {
  loader.classList.remove("hidden");
  cardsContainer.classList.add("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
  cardsContainer.classList.remove("hidden");
}

function getAuthorName(issue) {
  if (typeof issue.author === "string") return issue.author;
  if (issue.author?.name) return issue.author.name;
  if (issue.author?.username) return issue.author.username;

  return issue.created_by || "Unknown";
}

function getAssigneeName(issue) {
  if (typeof issue.assignee === "string") return issue.assignee;
  if (issue.assignee?.name) return issue.assignee.name;
  if (issue.assignee?.username) return issue.assignee.username;

  return "Unassigned";
}

async function fetchIssues() {
  showLoader();
  try {
    const response = await fetch(`${API_BASE}/issues`);
    const data = await response.json();
    allIssues = data.data || data;
    filteredIssues = [...allIssues];
    updateIssueCounts();
    renderCards();
  } catch (error) {
    console.error("Error fetching issues:", error);
    cardsContainer.innerHTML =
      '<p class="text-center text-red-500">Failed to load issues. Please try again.</p>';
  } finally {
    hideLoader();
  }
}

// Fetch single issue for modal
async function fetchIssueDetails(id) {
  try {
    const response = await fetch(`${API_BASE}/issue/${id}`);
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching issue details:", error);
    return null;
  }
}

function updateIssueCounts() {
  const openCount = allIssues.filter((issue) => issue.status === "open").length;
  const closedCount = allIssues.filter(
    (issue) => issue.status === "closed",
  ).length;

  let countLabel = "Issue";
  if (currentFilter === "open") {
    countLabel = "Open";
  } else if (currentFilter === "closed") {
    countLabel = "Closed";
  }

  const count = filteredIssues.length;
  issueCountElement.textContent = `${count} ${countLabel}`;
  openCountElement.textContent = openCount;
  closedCountElement.textContent = closedCount;
}

function filterIssues() {
  let result = [...allIssues];

  if (currentFilter === "open") {
    result = result.filter((issue) => issue.status === "open");
  } else if (currentFilter === "closed") {
    result = result.filter((issue) => issue.status === "closed");
  }

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (issue) =>
        issue.title?.toLowerCase().includes(query) ||
        issue.description?.toLowerCase().includes(query),
    );
  }

  filteredIssues = result;
  renderCards();
  updateIssueCounts();
}

// Render cards
function renderCards() {
  if (filteredIssues.length === 0) {
    cardsContainer.innerHTML =
      '<p class="text-center text-gray-500">No issues found.</p>';
    return;
  }

  const issuesWithAuthors = filteredIssues.map((issue) => ({
    ...issue,
    authorName: getAuthorName(issue),
  }));

  cardsContainer.innerHTML = issuesWithAuthors
    .map((issue) => {
      const borderClass =
        issue.status === "open" ? "border-open" : "border-closed";
      const statusLabel = issue.status === "open" ? "Open" : "Closed";
      const statusBg =
        issue.status === "open"
          ? "bg-emerald-50 text-emerald-500"
          : "bg-purple-50 text-purple-500";
      const priority = issue.priority || "MEDIUM";
      const priorityClass = getPriorityClass(priority);
      const labels = issue.labels || [];
      const createdDate = formatDate(issue.created_at || issue.createdAt);
      const author = issue.authorName;

      return `
            <div 
                class="w-full bg-white rounded-xl shadow-md border-t-4 ${borderClass} flex flex-col font-sans"
                onclick="openIssueModal(${issue.id})"
            >
                <div class="p-5">
                    <div class="flex justify-between items-center mb-4">
                        <div class="w-8 h-8 rounded-full ${statusBg} flex items-center justify-center">
                            <img src="${issue.status === "open" ? "./assets/Open-Status.png" : "./assets/Closed- Status .png"}" alt="" />
                        </div>
                        <span class="badge ${priorityClass}">
                            ${priority}
                        </span>
                    </div>

                    <h2 class="text-[18px] font-bold text-slate-800 leading-snug mb-2">
                        ${issue.title || "Untitled Issue"}
                    </h2>
                    <p class="text-[15px] text-slate-500 leading-relaxed mb-4 line-clamp-2">
                        ${issue.description || "No description provided."}
                    </p>

                    ${
                      labels.length > 0
                        ? `
                        <div class="flex flex-wrap gap-2">
                            ${labels
                              .map(
                                (label) => `
                                <span class="inline-flex items-center gap-1.5 bg-green-200 border border-gray-200 text-gray-600 text-[12px] font-bold px-3 py-1 rounded-full">
                                    ${label}
                                </span>
                            `,
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                </div>

                <div class="border-t border-slate-100 p-5 py-4 flex flex-col gap-1 text-[14px] text-slate-500">
                    <span>#${issue.id} by ${author}</span>
                    <span>${createdDate}</span>
                </div>
            </div>
        `;
    })
    .join("");
}

function getPriorityClass(priority) {
  const priorityMap = {
    HIGH: "bg-red-50 text-red-500 border-red-200",
    MEDIUM: "bg-yellow-50 text-yellow-600 border-yellow-300",
    LOW: "bg-green-50 text-green-500 border-green-200",
  };
  return priorityMap[priority?.toUpperCase()] || priorityMap["MEDIUM"];
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const options = { month: "numeric", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

async function openIssueModal(id) {
  const modalElement = document.getElementById("task_modal");
  const modalContent = modalElement.querySelector(".modal-box");

  modalElement.showModal();
  modalContent.innerHTML =
    '<div class="flex justify-center items-center p-8"><span class="loading loading-spinner loading-lg"></span></div>';

  const issue = await fetchIssueDetails(id);

  if (!issue) {
    modalContent.innerHTML =
      '<p class="text-center text-red-500">Failed to load issue details.</p>';
    return;
  }

  const statusLabel = issue.status === "open" ? "Opened" : "Closed";
  const statusBadgeClass =
    issue.status === "open" ? "bg-[#00a86b]" : "bg-[#9333ea]";
  const priority = issue.priority || "MEDIUM";
  const priorityClass = getPriorityClass(priority);
  const labels = issue.labels || [];
  const createdDate = formatDate(issue.created_at || issue.createdAt);


  const author = getAuthorName(issue);
  const assignee = getAssigneeName(issue);

  modalContent.innerHTML = `
        <h3 class="font-bold text-[24px] text-slate-800 mb-3">
            ${issue.title || "Untitled Issue"}
        </h3>

        <div class="flex items-center gap-2 text-[14px] text-slate-500 mb-6 font-medium">
            <span class="badge ${statusBadgeClass} border-none text-white px-3 py-3 font-semibold text-xs">
                ${statusLabel}
            </span>
            <span>•</span>
            <span>${statusLabel} by ${author}</span>
            <span>•</span>
            <span>${createdDate}</span>
        </div>

        ${
          labels.length > 0
            ? `
            <div class="flex flex-wrap gap-3 mb-6">
                ${labels
                  .map(
                    (label) => `
                    <span class="inline-flex items-center gap-1.5 bg-orange-200 border border-gray-200 text-gray-600 text-[12px] font-bold px-3 py-1.5 rounded-full">
                        ${label}
                    </span>
                `,
                  )
                  .join("")}
            </div>
        `
            : ""
        }

        <p class="text-[16px] text-slate-500 leading-relaxed mb-6">
            ${issue.description || "No description provided."}
        </p>

        <div class="bg-slate-50 rounded-xl p-6 flex flex-wrap gap-8">
            <div class="flex-1 min-w-[150px]">
                <p class="text-slate-500 text-[15px] mb-2">Assignee:</p>
                <p class="font-bold text-[16px] text-slate-800">${assignee}</p>
            </div>
            <div class="flex-1 min-w-[150px]">
                <p class="text-slate-500 text-[15px] mb-2">Priority:</p>
                <span class="${priorityClass} text-[12px] font-bold px-4 py-1.5 rounded-full">
                    ${priority}
                </span>
            </div>
        </div>

        <div class="modal-action mt-6">
            <form method="dialog">
                <button class="bg-[#5b00ff] hover:bg-[#4300d1] text-white border-none px-8 rounded-lg text-[16px] py-2 cursor-pointer">
                    Close
                </button>
            </form>
        </div>
    `;
}

function handleFilterClick(filter) {
  currentFilter = filter;

  filterButtons.forEach((btn) => {
    const btnFilter = btn.dataset.filter;
    if (btnFilter === filter) {
      btn.classList.remove("btn-soft");
      btn.classList.add("btn-active", "btn-primary");
    } else {
      btn.classList.remove("btn-active", "btn-primary");
      btn.classList.add("btn-soft");
    }
  });

  if (searchQuery) {
    searchIssues(searchQuery);
  } else {
    filterIssues();
  }
}

let debounceTimer;

async function searchIssues(query) {
  showLoader();
  try {
    const response = await fetch(
      `${API_BASE}/issues/search?q=${encodeURIComponent(query)}`,
    );
    const data = await response.json();
    allIssues = data.data || data;

    if (currentFilter === "open") {
      filteredIssues = allIssues.filter((issue) => issue.status === "open");
    } else if (currentFilter === "closed") {
      filteredIssues = allIssues.filter((issue) => issue.status === "closed");
    } else {
      filteredIssues = [...allIssues];
    }

    updateIssueCounts();
    renderCards();
  } catch (error) {
    console.error("Error searching issues:", error);
    cardsContainer.innerHTML =
      '<p class="text-center text-red-500">Failed to search issues. Please try again.</p>';
  } finally {
    hideLoader();
  }
}

function handleSearch(event) {
  searchQuery = event.target.value.trim();

  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    if (searchQuery) {
      searchIssues(searchQuery);
    } else {

      fetchIssues();
    }
  }, 300);
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    handleFilterClick(btn.dataset.filter);
  });
});

searchInput.addEventListener("input", handleSearch);


document.addEventListener("DOMContentLoaded", () => {
  fetchIssues();
  handleFilterClick("all");
});
