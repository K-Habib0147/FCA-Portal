document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("adminLoginForm");

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("adminUsername").value.trim().toLowerCase();

        const password =
            document.getElementById("adminPassword").value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        const result = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (result.error) {
            console.error(result.error);
            alert("Invalid email or password.");
            return;
        }

        if (!result.data.session) {
            alert("Login could not be completed.");
            return;
        }

        sessionStorage.setItem("fcaAdminLoggedIn", "true");

        alert("Login successful!");

        window.location.href = "admin-dashboard.html";

    });

});