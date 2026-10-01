// ==========================================
// FCA MEMBER DASHBOARD
// SUPABASE VERSION
// SECURE MEMBER EMAIL
// WITH PASSPORT PHOTO UPLOAD
// ==========================================

let currentMember = null;
let paymentHistory = [];


// ==========================================
// CHECK MEMBER LOGIN
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (typeof supabase === "undefined") {

            alert(
                "FCA database connection is not available."
            );

            return;
        }


        const {
            data: sessionData
        } =
            await supabase.auth.getSession();


        if (
            !sessionData ||
            !sessionData.session
        ) {

            window.location.href =
                "member-login.html";

            return;
        }


        const user =
            sessionData.session.user;


        // ==========================================
        // LOAD MEMBER
        // ==========================================

        const {
            data: member,
            error: memberError
        } =
            await supabase
                .from("members")
                .select("*")
                .eq("id", user.id)
                .single();


        if (
            memberError ||
            !member
        ) {

            console.error(
                "Member loading error:",
                memberError
            );

            alert(
                "Member information could not be found."
            );

            await supabase.auth.signOut();

            window.location.href =
                "member-login.html";

            return;
        }


        currentMember =
            member;


        // ==========================================
        // LOAD PAYMENT HISTORY
        // ==========================================

        const {
            data: payments,
            error: paymentError
        } =
            await supabase
                .from("payment_history")
                .select("*")
                .eq("member_id", member.id)
                .order(
                    "payment_date",
                    {
                        ascending: false
                    }
                );


        if (paymentError) {

            console.error(
                "Payment history error:",
                paymentError
            );

            paymentHistory = [];

        } else {

            paymentHistory =
                payments || [];

        }


        // ==========================================
        // DISPLAY MEMBER INFORMATION
        // ==========================================

        displayMemberInformation();


        // ==========================================
        // DISPLAY PAYMENT INFORMATION
        // ==========================================

        displayPaymentInformation();


        // ==========================================
        // DISPLAY PAYMENT HISTORY
        // ==========================================

        displayPaymentHistory();


        // ==========================================
        // LOAD MEMBER PHOTO
        // ==========================================

        await displayMemberPhoto();

    }
);


// ==========================================
// DISPLAY MEMBER INFORMATION
// ==========================================

function displayMemberInformation() {

    const member =
        currentMember;


    setText(
        "memberName",
        member.full_name || "Member"
    );


    setText(
        "applicationNumber",
        member.application_number || "---"
    );


    setText(
        "membershipNumber",
        member.membership_number ||
        "Not Assigned"
    );


    setText(
        "memberStatus",
        member.status || "---"
    );


    setText(
        "profileFullName",
        member.full_name || "---"
    );


    setText(
        "profileEmail",
        member.email || "---"
    );


    setText(
        "profilePhone",
        member.phone || "---"
    );


    setText(
        "profileGender",
        member.gender || "---"
    );


    setText(
        "profileDepartment",
        member.department || "---"
    );


    setText(
        "profileSchool",
        member.school || "---"
    );


    setText(
        "profileGraduationYear",
        member.graduation_year || "---"
    );


    setText(
        "profileMatricNumber",
        member.matric_number || "---"
    );


    setText(
        "profileStateOrigin",
        member.state_origin || "---"
    );


    setText(
        "profileOccupation",
        member.occupation || "---"
    );

}


// ==========================================
// HELPER
// ==========================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value || "---";

    }

}


// ==========================================
// PAYMENT CALCULATION
// ==========================================

function getRegistrationDate() {

    if (
        !currentMember ||
        !currentMember.registration_date
    ) {

        return new Date();

    }


    const date =
        new Date(
            currentMember.registration_date
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return new Date();

    }


    return date;

}


function getMonthsDue() {

    const registrationDate =
        getRegistrationDate();


    const registrationTotal =
        (
            registrationDate.getFullYear()
            * 12
        ) +
        registrationDate.getMonth();


    const currentDate =
        new Date();


    const currentTotal =
        (
            currentDate.getFullYear()
            * 12
        ) +
        currentDate.getMonth();


    let monthsDue =
        currentTotal -
        registrationTotal +
        1;


    if (
        monthsDue < 1
    ) {

        monthsDue = 1;

    }


    if (
        monthsDue > 12
    ) {

        monthsDue = 12;

    }


    return monthsDue;

}


// ==========================================
// PAYMENT SUMMARY
// ==========================================

function displayPaymentInformation() {

    const REGISTRATION_FEE =
        2000;


    const MONTHLY_DUES =
        1000;


    const monthsDue =
        getMonthsDue();


    const totalDue =
        REGISTRATION_FEE +
        (
            monthsDue *
            MONTHLY_DUES
        );


    let amountPaid =
        0;


    paymentHistory.forEach(
        function (payment) {

            amountPaid +=
                Number(
                    payment.amount || 0
                );

        }
    );


    const outstandingBalance =
        Math.max(
            totalDue -
            amountPaid,
            0
        );


    let paymentStatus =
        "Pending";


    if (
        amountPaid >= totalDue
    ) {

        paymentStatus =
            "Paid";

    }

    else if (
        amountPaid > 0
    ) {

        paymentStatus =
            "Partially Paid";

    }


    setText(
        "paymentStatus",
        paymentStatus
    );


    setText(
        "amountPaid",
        "₦" +
        amountPaid.toLocaleString()
    );


    setText(
        "outstandingBalance",
        "₦" +
        outstandingBalance.toLocaleString()
    );

}


// ==========================================
// MEMBER PASSPORT
// PRIVATE SUPABASE STORAGE
// ==========================================

async function displayMemberPhoto() {

    const dashboardPhoto =
        document.getElementById(
            "dashboardMemberPhoto"
        );


    if (!dashboardPhoto) {

        return;

    }


    if (
        !currentMember ||
        !currentMember.passport_photo
    ) {

        dashboardPhoto.removeAttribute("src");

        dashboardPhoto.alt =
            "No passport photograph";

        return;

    }


    const {
        data,
        error
    } =
        await supabase.storage
            .from("passport-photos")
            .createSignedUrl(
                currentMember.passport_photo,
                3600
            );


    if (error) {

        console.error(
            "Passport photo loading error:",
            error
        );

        dashboardPhoto.removeAttribute("src");

        dashboardPhoto.alt =
            "Passport photograph unavailable";

        return;

    }


    if (
        data &&
        data.signedUrl
    ) {

        dashboardPhoto.src =
            data.signedUrl;

        dashboardPhoto.alt =
            currentMember.full_name ||
            "Member passport photograph";

    }

}


// ==========================================
// PAYMENT HISTORY
// ==========================================

function displayPaymentHistory() {

    const historyTable =
        document.getElementById(
            "memberPaymentHistory"
        );


    if (!historyTable) {

        return;

    }


    historyTable.innerHTML =
        "";


    if (
        !paymentHistory ||
        paymentHistory.length === 0
    ) {

        historyTable.innerHTML = `

            <tr>

                <td colspan="7">
                    No payment history available.
                </td>

            </tr>

        `;

        return;

    }


    paymentHistory.forEach(
        function (payment) {

            const row =
                document.createElement(
                    "tr"
                );


            const paymentDate =
                payment.payment_date
                    ? new Date(
                        payment.payment_date
                    ).toLocaleString()
                    : "---";


            const receiptUrl =
                "payment-receipt.html" +
                "?member=" +
                encodeURIComponent(
                    currentMember.id
                ) +
                "&payment=" +
                encodeURIComponent(
                    payment.id
                );


            row.innerHTML = `

                <td>
                    ${paymentDate}
                </td>

                <td>
                    ${payment.payment_type || "---"}
                </td>

                <td>
                    ${payment.payment_month || "---"}
                </td>

                <td>
                    ₦${Number(
                        payment.amount || 0
                    ).toLocaleString()}
                </td>

                <td>
                    ${payment.payment_method || "---"}
                </td>

                <td>
                    ${payment.reference || "---"}
                </td>

                <td>

                    <button
                        type="button"
                        onclick="
                            window.location.href='${receiptUrl}'
                        "
                    >
                        Print Receipt
                    </button>

                </td>

            `;


            historyTable.appendChild(
                row
            );

        }
    );

}


// ==========================================
// EDIT PROFILE
// ==========================================

window.toggleEditProfile =
    function () {

        const form =
            document.getElementById(
                "editProfileForm"
            );


        if (!form) {

            return;

        }


        if (
            form.style.display === "none" ||
            form.style.display === ""
        ) {

            form.style.display =
                "block";


            // Email is displayed but not editable

            setInputValue(
                "editEmail",
                currentMember.email
            );


            const emailInput =
                document.getElementById(
                    "editEmail"
                );


            if (emailInput) {

                emailInput.readOnly =
                    true;

                emailInput.title =
                    "Your registered login email cannot be changed here.";

            }


            setInputValue(
                "editPhone",
                currentMember.phone
            );


            setInputValue(
                "editAddress",
                currentMember.address
            );


            setInputValue(
                "editOccupation",
                currentMember.occupation
            );


            setInputValue(
                "editEmergencyName",
                currentMember.emergency_name
            );


            setInputValue(
                "editEmergencyPhone",
                currentMember.emergency_phone
            );

        }

        else {

            form.style.display =
                "none";

        }

    };


// ==========================================
// HELPER FOR INPUTS
// ==========================================

function setInputValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.value =
            value || "";

    }

}


// ==========================================
// SAVE PROFILE CHANGES
// WITH PASSPORT PHOTO UPLOAD
// ==========================================

window.saveProfileChanges =
    async function () {

        const phoneInput =
            document.getElementById(
                "editPhone"
            );


        const addressInput =
            document.getElementById(
                "editAddress"
            );


        const occupationInput =
            document.getElementById(
                "editOccupation"
            );


        const emergencyNameInput =
            document.getElementById(
                "editEmergencyName"
            );


        const emergencyPhoneInput =
            document.getElementById(
                "editEmergencyPhone"
            );


        const phone =
            phoneInput
                ? phoneInput.value.trim()
                : "";


        const address =
            addressInput
                ? addressInput.value.trim()
                : "";


        const occupation =
            occupationInput
                ? occupationInput.value.trim()
                : "";


        const emergencyName =
            emergencyNameInput
                ? emergencyNameInput.value.trim()
                : "";


        const emergencyPhone =
            emergencyPhoneInput
                ? emergencyPhoneInput.value.trim()
                : "";


        const passportInput =
            document.getElementById(
                "passportPhoto"
            );


        // ==========================================
        // CHECK PASSPORT FILE
        // ==========================================

        let selectedFile = null;


        if (
            passportInput &&
            passportInput.files &&
            passportInput.files.length > 0
        ) {

            selectedFile =
                passportInput.files[0];


            if (
                selectedFile.size >
                2 * 1024 * 1024
            ) {

                alert(
                    "Passport photograph is too large.\n\n" +
                    "Maximum allowed size is 2 MB."
                );

                return;

            }


            if (
                !selectedFile.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image file."
                );

                return;

            }

        }


        // ==========================================
        // UPLOAD PASSPORT PHOTO
        // ==========================================

        let passportPath =
            currentMember.passport_photo ||
            null;


        if (selectedFile) {

            const fileExtension =
                selectedFile.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const safeExtension =
                [
                    "jpg",
                    "jpeg",
                    "png",
                    "webp"
                ].includes(
                    fileExtension
                )
                    ? fileExtension
                    : "jpg";


            const filePath =
                currentMember.id +
                "/passport-" +
                Date.now() +
                "." +
                safeExtension;


            const {
                error: uploadError
            } =
                await supabase.storage
                    .from("passport-photos")
                    .upload(
                        filePath,
                        selectedFile,
                        {
                            cacheControl:
                                "3600",

                            upsert:
                                false,

                            contentType:
                                selectedFile.type
                        }
                    );


            if (uploadError) {

                console.error(
                    "Passport upload error:",
                    uploadError
                );

                alert(
                    "Passport photograph could not be uploaded.\n\n" +
                    uploadError.message
                );

                return;

            }


            passportPath =
                filePath;

        }


        // ==========================================
        // UPDATE MEMBER PROFILE
        // EMAIL IS NOT UPDATED HERE
        // ==========================================

        const updatedMember = {

            phone:
                phone,

            address:
                address,

            occupation:
                occupation,

            emergency_name:
                emergencyName,

            emergency_phone:
                emergencyPhone,

            passport_photo:
                passportPath,

            updated_at:
                new Date().toISOString()

        };


        const {
            error
        } =
            await supabase
                .from("members")
                .update(
                    updatedMember
                )
                .eq(
                    "id",
                    currentMember.id
                );


        if (error) {

            console.error(
                "Profile update error:",
                error
            );


            alert(
                "Profile could not be updated.\n\n" +
                error.message
            );

            return;

        }


        // ==========================================
        // UPDATE CURRENT MEMBER
        // ==========================================

        currentMember.phone =
            phone;


        currentMember.address =
            address;


        currentMember.occupation =
            occupation;


        currentMember.emergency_name =
            emergencyName;


        currentMember.emergency_phone =
            emergencyPhone;


        currentMember.passport_photo =
            passportPath;


        // ==========================================
        // UPDATE PROFILE DISPLAY
        // ==========================================

        setText(
            "profileEmail",
            currentMember.email
        );


        setText(
            "profilePhone",
            phone
        );


        setText(
            "profileOccupation",
            occupation
        );


        // ==========================================
        // REFRESH PHOTO
        // ==========================================

        await displayMemberPhoto();


        // ==========================================
        // CLEAR FILE INPUT
        // ==========================================

        if (passportInput) {

            passportInput.value =
                "";

        }


        // ==========================================
        // CLOSE FORM
        // ==========================================

        const editForm =
            document.getElementById(
                "editProfileForm"
            );


        if (editForm) {

            editForm.style.display =
                "none";

        }


        alert(
            selectedFile
                ? "Profile and passport photograph updated successfully!"
                : "Profile updated successfully!"
        );

    };


// ==========================================
// MEMBER LOGOUT
// ==========================================

window.logoutMember =
    async function () {

        const confirmation =
            confirm(
                "Are you sure you want to logout?"
            );


        if (!confirmation) {

            return;

        }


        await supabase.auth.signOut();


        sessionStorage.removeItem(
            "fcaMemberLoggedIn"
        );


        sessionStorage.removeItem(
            "fcaMemberIndex"
        );


        sessionStorage.removeItem(
            "fcaMemberId"
        );


        window.location.href =
            "member-login.html";

    };


// ==========================================
// CHANGE MEMBER PASSWORD
// SUPABASE AUTH VERSION
// ==========================================

window.changeMemberPassword =
    async function () {

        const currentPassword =
            document.getElementById(
                "currentPassword"
            ).value.trim();


        const newPassword =
            document.getElementById(
                "newPassword"
            ).value.trim();


        const confirmNewPassword =
            document.getElementById(
                "confirmNewPassword"
            ).value.trim();


        if (!currentPassword) {

            alert(
                "Please enter your current password."
            );

            return;

        }


        if (!newPassword) {

            alert(
                "Please enter your new password."
            );

            return;

        }


        if (newPassword.length < 6) {

            alert(
                "New password must contain at least 6 characters."
            );

            return;

        }


        if (
            newPassword !==
            confirmNewPassword
        ) {

            alert(
                "New passwords do not match."
            );

            return;

        }


        if (
            newPassword ===
            currentPassword
        ) {

            alert(
                "Your new password must be different from your current password."
            );

            return;

        }


        if (
            typeof supabase ===
            "undefined"
        ) {

            alert(
                "FCA database connection is not available."
            );

            return;

        }


        const {
            data: sessionData,
            error: sessionError
        } =
            await supabase.auth.getSession();


        if (
            sessionError ||
            !sessionData ||
            !sessionData.session
        ) {

            alert(
                "Your session has expired. Please log in again."
            );

            window.location.href =
                "member-login.html";

            return;

        }


        const confirmation =
            confirm(
                "Are you sure you want to change your password?"
            );


        if (!confirmation) {

            return;

        }


        const {
            error
        } =
            await supabase.auth.updateUser({

                password:
                    newPassword

            });


        if (error) {

            console.error(
                "Password update error:",
                error
            );


            alert(
                "Password could not be changed.\n\n" +
                error.message
            );

            return;

        }


        document.getElementById(
            "currentPassword"
        ).value =
            "";


        document.getElementById(
            "newPassword"
        ).value =
            "";


        document.getElementById(
            "confirmNewPassword"
        ).value =
            "";


        alert(
            "Password changed successfully!\n\n" +
            "Please use your new password the next time you log in."
        );

    };