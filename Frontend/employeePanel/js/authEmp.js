const role = sessionStorage.getItem("loggedInRole");

if (role !== "employee") {
  alert("Unauthorized access. Please login as Employee.");
  window.location.href = "../loginPage/login.html";
}
