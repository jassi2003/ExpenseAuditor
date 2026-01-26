import { seedAdminIfMissing, loginUser } from "../storage/indexDb.js";

const loginForm = document.querySelector(".loginForm");
const formMail = document.querySelector("#formEmail");
const formPassword = document.querySelector("#formPass");
const errorMssg = document.querySelector("#loginErrorMssg");

// Seeding admin once when page loads
(async function init() {
  try {
    await seedAdminIfMissing();
  } catch (err) {
    console.error("Admin seeding failed:", err);
  }
})();

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = formMail.value.trim().toLowerCase();
  const password = formPassword.value.trim();

  errorMssg.innerText = "";

  if (!email || !password) {
    errorMssg.innerText = "Please enter email and password";
    return;
  }

  try {
   const user = await loginUser(email, password);

sessionStorage.setItem("loggedInRole", user.role);
sessionStorage.setItem("loggedInEmail", user.email);
sessionStorage.setItem("userId", user.userId);
sessionStorage.setItem("department", user.department);



    if (user.role === "admin") {
      window.location.href = "../adminPanel/admin.html";
    } else {
      window.location.href = "../employeePanel/employee.html";
    }
  } catch (err) {
    errorMssg.innerText = err || "Invalid credentials";
  }
});
