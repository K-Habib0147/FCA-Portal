// ==========================================
// FCA MEMBERSHIP ID CARD
// SUPABASE VERSION
// PRIVATE PASSPORT STORAGE
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

    // ==========================================
    // CHECK SUPABASE
    // ==========================================

    if (typeof supabase === "undefined") {

        alert(
            "FCA database connection is not available."
        );

        window.location.href =
            "member-login.html";

        return;
    }


    // ==========================================
    // CHECK MEMBER LOGIN
    // ==========================================

    const {
        data: sessionData,
        error: sessionError
    } = await supabase.auth.getSession();


    if (
        sessionError ||
        !sessionData ||
        !sessionData.session
    ) {

        alert(
            "Please login to your FCA member account first."
        );

        window.location.href =
            "member-login.html";

        return;
    }


    // ==========================================
    // GET LOGGED-IN USER ID
    // ==========================================

    const userId =
        sessionData.session.user.id;


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
            .eq("id", userId)
            .single();


    if (memberError || !member) {

        console.error(
            "Member loading error:",
            memberError
        );

        alert(
            "Member information could not be found."
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

        alert(
            "Membership ID Card is available only after your application has been approved."
        );

        return;
    }


    // ==========================================
    // CHECK MEMBERSHIP NUMBER
    // ==========================================

    if (!member.membership_number) {

        alert(
            "Your membership number has not been assigned yet."
        );

        return;
    }


    // ==========================================
    // DISPLAY MEMBER NAME
    // ==========================================

    const memberName =
        document.getElementById("memberName");


    if (memberName) {

        memberName.textContent =
            member.full_name || "---";

    }


    // ==========================================
    // DISPLAY MEMBERSHIP NUMBER
    // ==========================================

    const membershipNumber =
        document.getElementById(
            "membershipNumber"
        );


    if (membershipNumber) {

        membershipNumber.textContent =
            member.membership_number || "---";

    }


    // ==========================================
    // DISPLAY APPLICATION NUMBER
    // ==========================================

    const applicationNumber =
        document.getElementById(
            "applicationNumber"
        );


    if (applicationNumber) {

        applicationNumber.textContent =
            member.application_number || "---";

    }


    // ==========================================
    // DISPLAY DEPARTMENT
    // ==========================================

    const department =
        document.getElementById(
            "department"
        );


    if (department) {

        department.textContent =
            member.department || "---";

    }


    // ==========================================
    // DISPLAY SCHOOL
    // ==========================================

    const school =
        document.getElementById(
            "school"
        );


    if (school) {

        school.textContent =
            member.school || "---";

    }


    // ==========================================
    // DISPLAY STATUS
    // ==========================================

    const status =
        document.getElementById(
            "status"
        );


    if (status) {

        status.textContent =
            member.status || "---";

    }


    // ==========================================
    // DISPLAY PASSPORT PHOTO
    // PRIVATE SUPABASE STORAGE
    // ==========================================

    const memberPhoto =
        document.getElementById(
            "memberPhoto"
        );


    if (
        memberPhoto &&
        member.passport_photo
    ) {

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
                "Passport photo error:",
                photoError
            );

            memberPhoto.style.display =
                "none";

        }

        else if (
            photoData &&
            photoData.signedUrl
        ) {

            memberPhoto.src =
                photoData.signedUrl;

            memberPhoto.alt =
                member.full_name ||
                "FCA Member Passport Photograph";

            memberPhoto.style.display =
                "block";

        }

    }

});