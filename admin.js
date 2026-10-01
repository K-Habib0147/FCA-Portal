// ==========================================
// FCA ADMIN DASHBOARD
// SUPABASE VERSION
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

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
    // CHECK LOGIN SESSION
    // ==========================================

    const {
        data: sessionData,
        error: sessionError
    } = await supabase.auth.getSession();
    console.log(
    "FCA ADMIN SESSION:",
    sessionData
);


    if (
        sessionError ||
        !sessionData ||
        !sessionData.session
    ) {

        window.location.href =
            "admin-login.html";

        return;
    }


    // ==========================================
    // ELEMENTS
    // ==========================================

    const totalMembers =
        document.getElementById("totalMembers");

    const pendingMembers =
        document.getElementById("pendingMembers");

    const approvedMembers =
        document.getElementById("approvedMembers");

    const rejectedMembers =
        document.getElementById("rejectedMembers");

    const membersTable =
        document.getElementById("membersTable");


    let members = [];


    // ==========================================
    // LOAD MEMBERS FROM SUPABASE
    // ==========================================

    async function loadMembers() {

        const {
            data,
            error
        } = await supabase
            .from("members")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Supabase members error:",
                error
            );

            alert(
                "Unable to load members.\n\n" +
                error.message
            );

            return;
        }


        members =
            data || [];


        updateStatistics();

        displayMembers();

    }


    // ==========================================
    // UPDATE STATISTICS
    // ==========================================

    function updateStatistics() {

        const total =
            members.length;


        const pending =
            members.filter(
                member =>
                    member.status ===
                    "Pending Approval"
            ).length;


        const approved =
            members.filter(
                member =>
                    member.status ===
                    "Approved"
            ).length;


        const rejected =
            members.filter(
                member =>
                    member.status ===
                    "Rejected"
            ).length;


        if (totalMembers) {

            totalMembers.textContent =
                total;

        }


        if (pendingMembers) {

            pendingMembers.textContent =
                pending;

        }


        if (approvedMembers) {

            approvedMembers.textContent =
                approved;

        }


        if (rejectedMembers) {

            rejectedMembers.textContent =
                rejected;

        }

    }


    // ==========================================
    // DISPLAY MEMBERS
    // ==========================================

    function displayMembers(
        memberList = members
    ) {

        if (!membersTable) {
            return;
        }


        membersTable.innerHTML =
            "";


        if (
            memberList.length ===
            0
        ) {

            membersTable.innerHTML = `

                <tr>

                    <td colspan="6">

                        No membership applications found.

                    </td>

                </tr>

            `;

            return;

        }


        memberList.forEach(
            function (
                member,
                index
            ) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${member.full_name || "---"}
                    </td>

                    <td>
                        ${member.email || "---"}
                    </td>

                    <td>
                        ${member.application_number || "---"}
                    </td>

                    <td>
                        ${member.status || "---"}
                    </td>

                    <td>

                        <button
                            class="admin-action-btn"
                            data-action="view"
                            data-id="${member.id}">
                            View
                        </button>

                        <button
                            class="admin-action-btn"
                            data-action="edit"
                            data-id="${member.id}">
                            Edit
                        </button>

                        <button
                            class="admin-action-btn"
                            data-action="payment"
                            data-id="${member.id}">
                            Payment
                        </button>

                        ${
                            member.status ===
                            "Pending Approval"

                            ? `

                                <button
                                    class="admin-action-btn"
                                    data-action="approve"
                                    data-id="${member.id}">
                                    Approve
                                </button>

                                <button
                                    class="admin-action-btn"
                                    data-action="reject"
                                    data-id="${member.id}">
                                    Reject
                                </button>

                            `

                            : ""
                        }

                        <button
                            class="admin-action-btn"
                            data-action="delete"
                            data-id="${member.id}">
                            Delete
                        </button>

                    </td>

                `;


                membersTable.appendChild(
                    row
                );

            }
        );

    }


    // ==========================================
    // VIEW MEMBER
    // ==========================================

    function viewMember(
        memberId
    ) {

        window.location.href =
            "member-details.html?id=" +
            encodeURIComponent(
                memberId
            );

    }


    // ==========================================
    // EDIT MEMBER
    // ==========================================

    function editMember(
        memberId
    ) {

        window.location.href =
            "member-details.html?id=" +
            encodeURIComponent(
                memberId
            ) +
            "&edit=true";

    }


    // ==========================================
    // PAYMENT
    // ==========================================

    function managePayment(
        memberId
    ) {

        window.location.href =
            "payment-management.html?id=" +
            encodeURIComponent(
                memberId
            );

    }


    // ==========================================
    // APPROVE MEMBER
    // ==========================================

    async function approveMember(
        memberId
    ) {

        const member =
            members.find(
                item =>
                    item.id ===
                    memberId
            );


        if (!member) {
            return;
        }


        if (
            !confirm(
                "Approve " +
                member.full_name +
                " as an FCA member?"
            )
        ) {

            return;

        }


        // ==========================================
        // GET MEMBERSHIP NUMBERS
        // ==========================================

        const {
            data: approvedMembers,
            error: numberError
        } =
            await supabase
                .from("members")
                .select(
                    "membership_number"
                )
                .not(
                    "membership_number",
                    "is",
                    null
                );


        if (numberError) {

            console.error(
                numberError
            );

            alert(
                "Unable to generate membership number."
            );

            return;
        }


        let highestNumber =
            0;


        if (
            approvedMembers &&
            approvedMembers.length
        ) {

            approvedMembers.forEach(
                function (
                    item
                ) {

                    const match =
                        (
                            item.membership_number ||
                            ""
                        ).match(
                            /\/(\d+)$/
                        );


                    if (match) {

                        const number =
                            parseInt(
                                match[1],
                                10
                            );


                        if (
                            number >
                            highestNumber
                        ) {

                            highestNumber =
                                number;

                        }

                    }

                }
            );

        }


        const membershipNumber =
            "FCA/FEDPONAM/2026/" +
            String(
                highestNumber + 1
            ).padStart(
                4,
                "0"
            );


        // ==========================================
        // APPROVE
        // ==========================================

        const {
            error
        } =
            await supabase
                .from("members")
                .update({

                    membership_number:
                        membershipNumber,

                    status:
                        "Approved",

                    approval_date:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    memberId
                );


        if (error) {

            console.error(
                error
            );

            alert(
                "Member could not be approved.\n\n" +
                error.message
            );

            return;
        }


        alert(
            "Member Approved Successfully!\n\n" +
            "Membership Number:\n" +
            membershipNumber
        );


        await loadMembers();

    }


    // ==========================================
    // REJECT MEMBER
    // ==========================================

    async function rejectMember(
        memberId
    ) {

        const member =
            members.find(
                item =>
                    item.id ===
                    memberId
            );


        if (!member) {
            return;
        }


        if (
            !confirm(
                "Reject " +
                member.full_name +
                "'s membership application?"
            )
        ) {

            return;

        }


        const {
            error
        } =
            await supabase
                .from("members")
                .update({

                    status:
                        "Rejected"

                })
                .eq(
                    "id",
                    memberId
                );


        if (error) {

            console.error(
                error
            );

            alert(
                "Application could not be rejected.\n\n" +
                error.message
            );

            return;
        }


        alert(
            "Application rejected."
        );


        await loadMembers();

    }


    // ==========================================
    // DELETE MEMBER
    // ==========================================

    async function deleteMember(
        memberId
    ) {

        const member =
            members.find(
                item =>
                    item.id ===
                    memberId
            );


        if (!member) {
            return;
        }


        if (
            !confirm(
                "Are you sure you want to permanently delete " +
                member.full_name +
                "?"
            )
        ) {

            return;

        }


        const {
            error
        } =
            await supabase
                .from("members")
                .delete()
                .eq(
                    "id",
                    memberId
                );


        if (error) {

            console.error(
                error
            );

            alert(
                "Member could not be deleted.\n\n" +
                error.message
            );

            return;
        }


        alert(
            "Member deleted successfully."
        );


        await loadMembers();

    }


    // ==========================================
    // BUTTON EVENTS
    // ==========================================

    if (membersTable) {

        membersTable.addEventListener(
            "click",
            async function (event) {

                const button =
                    event.target.closest(
                        "button[data-action]"
                    );


                if (!button) {
                    return;
                }


                const action =
                    button.dataset.action;

                const memberId =
                    button.dataset.id;


                if (
                    action ===
                    "view"
                ) {

                    viewMember(
                        memberId
                    );

                }


                else if (
                    action ===
                    "edit"
                ) {

                    editMember(
                        memberId
                    );

                }


                else if (
                    action ===
                    "payment"
                ) {

                    managePayment(
                        memberId
                    );

                }


                else if (
                    action ===
                    "approve"
                ) {

                    await approveMember(
                        memberId
                    );

                }


                else if (
                    action ===
                    "reject"
                ) {

                    await rejectMember(
                        memberId
                    );

                }


                else if (
                    action ===
                    "delete"
                ) {

                    await deleteMember(
                        memberId
                    );

                }

            }
        );

    }


    // ==========================================
    // SEARCH
    // ==========================================

    const searchBox =
        document.getElementById(
            "memberSearch"
        );


    if (searchBox) {

        searchBox.addEventListener(
            "input",
            function () {

                const searchTerm =
                    this.value
                        .toLowerCase()
                        .trim();


                const filteredMembers =
                    members.filter(
                        function (
                            member
                        ) {

                            return (

                                (
                                    member.full_name ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        searchTerm
                                    )

                                ||

                                (
                                    member.email ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        searchTerm
                                    )

                                ||

                                (
                                    member.application_number ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        searchTerm
                                    )

                            );

                        }
                    );


                displayMembers(
                    filteredMembers
                );

            }
        );

    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    await loadMembers();

});