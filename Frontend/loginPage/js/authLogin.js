console.log("authLogin loaded");

const role = sessionStorage.getItem("loggedInRole");

if (role) {
  alert("Already logged in.");

  if (role === "employee") {
    window.location.href = "../employeePanel/employee.html";
  } else if (role === "admin") {
    window.location.href = "../adminPanel/admin.html";
  } else {
    // ✅ if role is invalid/unknown
    sessionStorage.removeItem("loggedInRole");
    sessionStorage.removeItem("loggedInEmail");
    window.location.href = "../loginPage/login.html";
  }
}
