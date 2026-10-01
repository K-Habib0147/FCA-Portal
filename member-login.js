// ==========================================
// FCA MEMBER LOGIN
// SUPABASE AUTH VERSION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const loginForm =
        document.getElementById("memberLoginForm");


    if (!loginForm) {

        console.error(
            "Member login form not found."
        );

        return;
    }


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==========================================
            // GET LOGIN DETAILS
            // ==========================================

            const email =
                document
                    .getElementById("memberEmail")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("memberPassword")
                    .value;


            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;
            }


            // ==========================================
            // CHECK SUPABASE
            // ==========================================

            if (typeof supabase === "undefined") {

                alert(
                    "FCA database connection is not available."
                );

                return;
            }


            // ==========================================
            // LOGIN WITH SUPABASE AUTH
            // ==========================================

            const {
                data,
                error
            } =
                await supabase.auth.signInWithPassword({

                    email: email,

                    password: password

                });


            if (error) {

                console.error(
                    "Login error:",
                    error
                );

                alert(
                    "Login failed.\n\n" +
                    error.message
                );

                return;
            }


            if (
                !data ||
                !data.user
            ) {

                alert(
                    "Login could not be completed."
                );

                return;
            }


            // ==========================================
            // GET MEMBER PROFILE
            // ==========================================

            const {
                data: member,
                error: memberError
            } =
                await supabase
                    .from("members")
                    .select("*")
                    .eq("id", data.user.id)
                    .single();


            if (memberError || !member) {

                console.error(
                    "Member profile error:",
                    memberError
                );

                await supabase.auth.signOut();

                alert(
                    "Your member profile could not be found."
                );

                return;
            }


            // ==========================================
            // CHECK APPROVAL STATUS
            // ==========================================

            if (
                String(member.status)
                    .trim()
                    .toLowerCase()
                !==
                "approved"
            ) {

                await supabase.auth.signOut();

                alert(
                    "Your membership application has not been approved yet."
                );

                return;
            }


            // ==========================================
            // LOGIN SUCCESS
            // ==========================================

            sessionStorage.setItem(
                "fcaMemberLoggedIn",
                "true"
            );


            sessionStorage.setItem(
                "fcaMemberId",
                member.id
            );


            alert(
                "Login successful!"
            );


            // ==========================================
            // GO TO DASHBOARD
            // ==========================================

            window.location.href =
                "dashboard.html";

        }
    );

});