const STORAGE_KEY = "employeely_employees_v1";
const $ = (id) => document.getElementById(id);
const dialog = $("employeeDialog");
const form = $("employeeForm");
const today = new Date();
const localDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
const demoEmployees = [
  {id:"EMP-1001",name:"Aarav Sharma",email:"aarav.sharma@example.com",phone:"+91 98765 10001",department:"Engineering",role:"Frontend Developer",joinDate:"2024-02-12",status:"Active",salary:55000},
  {id:"EMP-1002",name:"Priya Kumar",email:"priya.kumar@example.com",phone:"+91 98765 10002",department:"Human Resources",role:"HR Executive",joinDate:"2023-11-06",status:"Active",salary:42000},
  {id:"EMP-1003",name:"Rahul Nair",email:"rahul.nair@example.com",phone:"+91 98765 10003",department:"Finance",role:"Accountant",joinDate:"2025-03-18",status:"On Leave",salary:48000},
  {id:"EMP-1004",name:"Meera Iyer",email:"meera.iyer@example.com",phone:"+91 98765 10004",department:"Marketing",role:"Marketing Specialist",joinDate:"2024-08-21",status:"Active",salary:46000},
  {id:"EMP-1005",name:"Vikram Patel",email:"vikram.patel@example.com",phone:"+91 98765 10005",department:"Sales",role:"Sales Executive",joinDate:"2025-06-02",status:"Inactive",salary:39000}
];
let employees = loadEmployees();

function loadEmployees() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? [...demoEmployees] : JSON.parse(saved);
  } catch (error) {
    console.warn("Could not load saved employee data.", error);
    return [...demoEmployees];
  }
}
function saveEmployees() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  } catch (error) {
    showToast("Could not save data. Check browser storage settings.");
  }
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function initials(name) {
  return String(name).trim().split(/\s+/).slice(0,2).map(part => part[0] || "").join("").toUpperCase();
}
function formatDate(value) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function getFilteredEmployees() {
  const query = $("searchInput").value.trim().toLowerCase();
  const department = $("departmentFilter").value;
  const status = $("statusFilter").value;
  return employees.filter(emp => {
    const searchable = [emp.id,emp.name,emp.email,emp.department,emp.role].join(" ").toLowerCase();
    return (!query || searchable.includes(query)) && (!department || emp.department === department) && (!status || emp.status === status);
  }).sort((a,b) => a.name.localeCompare(b.name));
}
function render() {
  $("totalCount").textContent = employees.length;
  $("activeCount").textContent = employees.filter(e => e.status === "Active").length;
  $("departmentCount").textContent = new Set(employees.map(e => e.department).filter(Boolean)).size;
  $("newCount").textContent = employees.filter(e => e.joinDate && new Date(`${e.joinDate}T00:00:00`) >= monthStart && new Date(`${e.joinDate}T00:00:00`) <= today).length;
  const filtered = getFilteredEmployees();
  $("employeeRows").innerHTML = filtered.map(emp => {
    const statusClass = emp.status.toLowerCase().replace(/\s+/g,"-");
    return `<tr>
      <td><div class="employee-cell"><div class="person-avatar">${escapeHtml(initials(emp.name))}</div><div><strong>${escapeHtml(emp.name)}</strong><small>${escapeHtml(emp.id)} · ${escapeHtml(emp.email)}</small></div></div></td>
      <td>${escapeHtml(emp.department)}</td><td>${escapeHtml(emp.role)}</td><td>${escapeHtml(formatDate(emp.joinDate))}</td>
      <td><span class="status status-${escapeHtml(statusClass)}">${escapeHtml(emp.status)}</span></td>
      <td><div class="actions"><button class="action-btn" data-edit="${escapeHtml(emp.id)}" aria-label="Edit ${escapeHtml(emp.name)}">Edit</button><button class="action-btn delete" data-delete="${escapeHtml(emp.id)}" aria-label="Delete ${escapeHtml(emp.name)}">Delete</button></div></td>
    </tr>`;
  }).join("");
  $("emptyState").hidden = filtered.length !== 0;
  $("resultCount").textContent = `Showing ${filtered.length} of ${employees.length} employee${employees.length === 1 ? "" : "s"}`;
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function resetForm() {
  form.reset();
  $("employeeId").value = "";
  $("dialogTitle").textContent = "Add employee";
  $("joinDate").value = localDate(today);
  $("status").value = "Active";
  $("formError").textContent = "";
}
function openAddDialog() {
  resetForm();
  dialog.showModal();
  $("fullName").focus();
}
function openEditDialog(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;
  resetForm();
  $("dialogTitle").textContent = "Edit employee";
  $("employeeId").value = emp.id;
  $("fullName").value = emp.name || "";
  $("email").value = emp.email || "";
  $("phone").value = emp.phone || "";
  $("department").value = emp.department || "";
  $("role").value = emp.role || "";
  $("joinDate").value = emp.joinDate || localDate(today);
  $("status").value = emp.status || "Active";
  $("salary").value = emp.salary ?? "";
  dialog.showModal();
}
$("addEmployee").addEventListener("click", openAddDialog);
$("addEmployeeTop").addEventListener("click", openAddDialog);
$("closeDialog").addEventListener("click", () => dialog.close());
$("cancelDialog").addEventListener("click", () => dialog.close());
$("searchInput").addEventListener("input", render);
$("departmentFilter").addEventListener("change", render);
$("statusFilter").addEventListener("change", render);
$("clearFilters").addEventListener("click", () => {
  $("searchInput").value = "";
  $("departmentFilter").value = "";
  $("statusFilter").value = "";
  render();
});
$("employeeRows").addEventListener("click", event => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  if (editButton) openEditDialog(editButton.dataset.edit);
  if (deleteButton) {
    const emp = employees.find(e => e.id === deleteButton.dataset.delete);
    if (emp && confirm(`Delete ${emp.name} (${emp.id})? This cannot be undone.`)) {
      employees = employees.filter(e => e.id !== emp.id);
      saveEmployees();
      render();
      showToast("Employee deleted.");
    }
  }
});
form.addEventListener("submit", event => {
  event.preventDefault();
  $("formError").textContent = "";
  const id = $("employeeId").value;
  const email = $("email").value.trim().toLowerCase();
  if (employees.some(emp => emp.email.toLowerCase() === email && emp.id !== id)) {
    $("formError").textContent = "An employee with this email address already exists.";
    $("email").focus();
    return;
  }
  const record = {
    id: id || `EMP-${String(Date.now()).slice(-6)}`,
    name: $("fullName").value.trim(),
    email,
    phone: $("phone").value.trim(),
    department: $("department").value,
    role: $("role").value.trim(),
    joinDate: $("joinDate").value,
    status: $("status").value,
    salary: $("salary").value === "" ? "" : Number($("salary").value)
  };
  if (id) {
    employees = employees.map(emp => emp.id === id ? record : emp);
  } else {
    employees.push(record);
  }
  saveEmployees();
  render();
  dialog.close();
  showToast(id ? "Employee details updated." : "Employee added successfully.");
});
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
render();
