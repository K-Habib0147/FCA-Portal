// ==========================================
// FCA MEMBERSHIP REGISTRATION
// SUPABASE VERSION
// ==========================================

const membershipForm =
    document.getElementById("membershipForm");


if (membershipForm) {

    membershipForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==========================================
            // GET FORM VALUES
            // ==========================================

            const fullName =
                document.getElementById("fullName").value.trim();

            const email =
                document.getElementById("email").value.trim().toLowerCase();

            const password =
                document.getElementById("password").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const phone =
                document.getElementById("phone").value.trim();

            const gender =
                document.getElementById("gender").value;

            const department =
                document.getElementById("department").value.trim();

            const school =
                document.getElementById("school").value.trim();

            const graduationYear =
                document.getElementById("graduationYear").value;

            const matricNumber =
                document.getElementById("matricNumber").value.trim();

            const address =
                document.getElementById("address").value.trim();

            const occupation =
                document.getElementById("occupation").value.trim();

            const emergencyName =
                document.getElementById("emergencyName").value.trim();

            const emergencyPhone =
                document.getElementById("emergencyPhone").value.trim();

            const stateOrigin =
                document.getElementById("stateOrigin").value.trim();


            // ==========================================
            // VALIDATION
            // ==========================================

            if (password.length < 6) {

                alert(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            if (password !== confirmPassword) {

                alert(
                    "Passwords do not match."
                );

                return;
            }


            if (typeof supabase === "undefined") {

                alert(
                    "FCA registration system is not connected. Please try again."
                );

                return;
            }


            const submitButton =
                membershipForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Submitting...";

            }


            try {

                // ==========================================
                // CREATE AUTH ACCOUNT
                // ==========================================

                const {
                    data: authData,
                    error: authError
                } =
                    await supabase.auth.signUp({

                        email: email,

                        password: password

                    });


                if (authError) {

                    console.error(
                        "Authentication error:",
                        authError
                    );


                    if (
                        authError.message
                            .toLowerCase()
                            .includes("already registered")
                    ) {

                        alert(
                            "This email address is already registered."
                        );

                    } else {

                        alert(
                            authError.message
                        );

                    }

                    return;
                }


                if (!authData.user) {

                    alert(
                        "Registration could not be completed. Please try again."
                    );

                    return;
                }


                // ==========================================
                // GENERATE APPLICATION NUMBER
                // SECURE DATABASE FUNCTION
                // ==========================================

                const {
                    data: applicationNumber,
                    error: applicationNumberError
                } =
                    await supabase.rpc(
                        "generate_application_number"
                    );


                if (applicationNumberError) {

                    console.error(
                        "Application number error:",
                        applicationNumberError
                    );


                    alert(
                        "Your account was created, but an application number could not be generated. Please contact the administrator."
                    );

                    return;
                }


                if (!applicationNumber) {

                    alert(
                        "Application number could not be generated. Please contact the administrator."
                    );

                    return;
                }


                // ==========================================
                // MEMBER DATA
                // ==========================================

                const memberData = {

                    id:
                        authData.user.id,

                    full_name:
                        fullName,

                    email:
                        email,

                    phone:
                        phone,

                    gender:
                        gender,

                    department:
                        department,

                    school:
                        school,

                    graduation_year:
                        graduationYear,

                    matric_number:
                        matricNumber,

                    address:
                        address,

                    occupation:
                        occupation,

                    emergency_name:
                        emergencyName,

                    emergency_phone:
                        emergencyPhone,

                    state_origin:
                        stateOrigin,

                    application_number:
                        applicationNumber,

                    membership_number:
                        null,

                    status:
                        "Pending Approval",

                    registration_date:
                        new Date().toISOString(),

                    approval_date:
                        null

                };


                // ==========================================
                // SAVE MEMBER
                // ==========================================

                const {
                    error: memberError
                } =
                    await supabase
                        .from("members")
                        .insert(memberData);


                if (memberError) {

                    console.error(
                        "Member database error:",
                        memberError
                    );


                    alert(
                        "Account was created, but your membership application could not be saved. Please contact the administrator."
                    );

                    return;
                }


                // ==========================================
                // SUCCESS
                // ==========================================

                alert(

                    "Membership application submitted successfully!\n\n" +

                    "Application Number:\n" +

                    applicationNumber +

                    "\n\nPlease wait for approval."

                );


                membershipForm.reset();


                // ==========================================
                // SIGN OUT
                // ==========================================

                await supabase.auth.signOut();


                window.location.href =
                    "member-login.html";

            }


            catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                alert(
                    "An unexpected error occurred. Please try again."
                );

            }


            finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Submit Registration";

                }

            }

        }
    );

}