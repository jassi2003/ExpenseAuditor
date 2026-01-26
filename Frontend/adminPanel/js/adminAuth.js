const role = sessionStorage.getItem("loggedInRole");

if (role !== "admin") {
  alert("Unauthorized access. Please login as Admin.");
  window.location.href = "../loginPage/login.html";
}
