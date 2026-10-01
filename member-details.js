// ==========================================
// FCA MEMBER DETAILS
// SUPABASE VERSION
// ADMIN PASSPORT PHOTO SUPPORT
// ==========================================

let currentMember = null;


// ==========================================
// LOAD MEMBER
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


        const urlParams =
            new URLSearchParams(
                window.location.search
            );


        const memberId =
            urlParams.get("id");


        const editRequested =
            urlParams.get("edit") === "true";


        if (!memberId) {

            alert(
                "Member information could not be found."
            );

            window.location.href =
                "admin-dashboard.html";

            return;
        }


        // ==========================================
        // CHECK ADMIN SESSION
        // ==========================================

        const {
            data: sessionData
        } =
            await supabase.auth.getSession();


        if (
            !sessionData ||
            !sessionData.session
        ) {

            window.location.href =
                "admin-login.html";

            return;
        }


        // ==========================================
        // GET MEMBER
        // ==========================================

        const {
            data: member,
            error: memberError
        } =
            await supabase
                .from("members")
                .select("*")
                .eq("id", memberId)
                .single();


        if (memberError || !member) {

            console.error(
                "Member loading error:",
                memberError
            );

            alert(
                "Member information could not be found."
            );

            window.location.href =
                "admin-dashboard.html";

            return;
        }


        currentMember =
            member;


        await displayMember(
            member
        );


        // ==========================================
        // OPEN EDIT MODE AUTOMATICALLY
        // ==========================================

        if (editRequested) {

            showEditMode(
                member
            );

        }


        // ==========================================
        // EDIT FORM
        // ==========================================

        const editForm =
            document.getElementById(
                "editMemberForm"
            );


        if (editForm) {

            editForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();

                    await saveMemberChanges(
                        memberId
                    );

                }
            );

        }

    }
);


// ==========================================
// DISPLAY MEMBER
// ==========================================

async function displayMember(
    member
) {

    const setValue =
        function (
            id,
            value
        ) {

            const element =
                document.getElementById(id);


            if (element) {

                element.textContent =
                    value || "---";

            }

        };


    setValue(
        "fullName",
        member.full_name
    );


    setValue(
        "email",
        member.email
    );


    setValue(
        "phone",
        member.phone
    );


    setValue(
        "gender",
        member.gender
    );


    setValue(
        "department",
        member.department
    );


    setValue(
        "school",
        member.school
    );


    setValue(
        "graduationYear",
        member.graduation_year
    );


    setValue(
        "matricNumber",
        member.matric_number
    );


    setValue(
        "address",
        member.address
    );


    setValue(
        "occupation",
        member.occupation
    );


    setValue(
        "emergencyName",
        member.emergency_name
    );


    setValue(
        "emergencyPhone",
        member.emergency_phone
    );


    setValue(
        "stateOrigin",
        member.state_origin
    );


    setValue(
        "applicationNumber",
        member.application_number
    );


    setValue(
        "membershipNumber",
        member.membership_number ||
        "Not Assigned"
    );


    setValue(
        "status",
        member.status
    );


    setValue(
        "paymentStatus",
        "---"
    );


    setValue(
        "paymentMethod",
        "---"
    );


    setValue(
        "registrationDate",
        member.registration_date
            ? new Date(
                member.registration_date
            ).toLocaleString()
            : "---"
    );


    setValue(
        "approvalDate",
        member.approval_date
            ? new Date(
                member.approval_date
            ).toLocaleString()
            : "---"
    );


    // ==========================================
    // PASSPORT PHOTO
    // PRIVATE SUPABASE STORAGE
    // ==========================================

    const photo =
        document.getElementById(
            "memberPhoto"
        );


    if (!photo) {

        return;

    }


    if (!member.passport_photo) {

        photo.style.display =
            "none";

        return;

    }


    const {
        data: photoData,
        error: photoError
    } =
        await supabase.storage
            .from("passport-photos")
            .createSignedUrl(
                member.passport_photo,
                3600
            );


    if (photoError) {

        console.error(
            "Admin passport photo error:",
            photoError
        );

        photo.style.display =
            "none";

        return;

    }


    if (
        photoData &&
        photoData.signedUrl
    ) {

        photo.src =
            photoData.signedUrl;

        photo.alt =
            member.full_name ||
            "FCA Member Passport Photograph";

        photo.style.display =
            "block";

    }

}


// ==========================================
// SHOW EDIT MODE
// ==========================================

function showEditMode(
    member = currentMember
) {

    if (!member) {
        return;
    }


    const viewMode =
        document.getElementById(
            "viewMode"
        );


    const editMode =
        document.getElementById(
            "editMode"
        );


    if (!viewMode || !editMode) {
        return;
    }


    viewMode.style.display =
        "none";


    editMode.style.display =
        "block";


    document.getElementById(
        "editFullName"
    ).value =
        member.full_name || "";


    document.getElementById(
        "editMemberEmail"
    ).value =
        member.email || "";


    document.getElementById(
        "editMemberPhone"
    ).value =
        member.phone || "";


    document.getElementById(
        "editGender"
    ).value =
        member.gender || "";


    document.getElementById(
        "editDepartment"
    ).value =
        member.department || "";


    document.getElementById(
        "editSchool"
    ).value =
        member.school || "";


    document.getElementById(
        "editGraduationYear"
    ).value =
        member.graduation_year || "";


    document.getElementById(
        "editMatricNumber"
    ).value =
        member.matric_number || "";


    document.getElementById(
        "editAddress"
    ).value =
        member.address || "";


    document.getElementById(
        "editOccupation"
    ).value =
        member.occupation || "";


    document.getElementById(
        "editEmergencyName"
    ).value =
        member.emergency_name || "";


    document.getElementById(
        "editEmergencyPhone"
    ).value =
        member.emergency_phone || "";


    document.getElementById(
        "editStateOrigin"
    ).value =
        member.state_origin || "";

}


// ==========================================
// SAVE MEMBER CHANGES
// ==========================================

async function saveMemberChanges(
    memberId
) {

    const updatedMember = {

        full_name:
            document.getElementById(
                "editFullName"
            ).value.trim(),

        email:
            document.getElementById(
                "editMemberEmail"
            ).value.trim().toLowerCase(),

        phone:
            document.getElementById(
                "editMemberPhone"
            ).value.trim(),

        gender:
            document.getElementById(
                "editGender"
            ).value,

        department:
            document.getElementById(
                "editDepartment"
            ).value.trim(),

        school:
            document.getElementById(
                "editSchool"
            ).value.trim(),

        graduation_year:
            document.getElementById(
                "editGraduationYear"
            ).value.trim(),

        matric_number:
            document.getElementById(
                "editMatricNumber"
            ).value.trim(),

        address:
            document.getElementById(
                "editAddress"
            ).value.trim(),

        occupation:
            document.getElementById(
                "editOccupation"
            ).value.trim(),

        emergency_name:
            document.getElementById(
                "editEmergencyName"
            ).value.trim(),

        emergency_phone:
            document.getElementById(
                "editEmergencyPhone"
            ).value.trim(),

        state_origin:
            document.getElementById(
                "editStateOrigin"
            ).value.trim(),

        updated_at:
            new Date().toISOString()

    };


    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (
        !updatedMember.full_name ||
        !updatedMember.email
    ) {

        alert(
            "Full Name and Email are required."
        );

        return;
    }


    // ==========================================
    // SAVE TO SUPABASE
    // ==========================================

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
                memberId
            );


    if (error) {

        console.error(
            "Update error:",
            error
        );

        alert(
            "Member information could not be updated.\n\n" +
            error.message
        );

        return;
    }


    alert(
        "Member information updated successfully."
    );


    window.location.href =
        "member-details.html?id=" +
        encodeURIComponent(
            memberId
        );

}


// ==========================================
// CANCEL EDIT
// ==========================================

function cancelEdit() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const memberId =
        params.get("id");


    if (!memberId) {

        window.location.href =
            "admin-dashboard.html";

        return;
    }


    window.location.href =
        "member-details.html?id=" +
        encodeURIComponent(
            memberId
        );

}