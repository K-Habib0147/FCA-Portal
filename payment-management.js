// ==========================================
// FCA PAYMENT MANAGEMENT
// SUPABASE VERSION
// ==========================================

let currentMember = null;
let paymentHistory = [];

document.addEventListener("DOMContentLoaded", async function () {

    if (typeof supabase === "undefined") {
        alert("FCA database connection is not available.");
        return;
    }

    const urlParams =
        new URLSearchParams(window.location.search);

    const memberId =
        urlParams.get("id");

    if (!memberId) {
        alert("Member information could not be found.");
        window.location.href = "admin-dashboard.html";
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
        window.location.href = "admin-login.html";
        return;
    }


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


    currentMember = member;


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
            .eq("member_id", memberId)
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

        alert(
            "Payment history could not be loaded.\n\n" +
            paymentError.message
        );

        return;
    }


    paymentHistory =
        payments || [];


    displayMember();

    updatePaymentInformation();

    displayPaymentHistory();

    setupPaymentForm();

});


// ==========================================
// DISPLAY MEMBER
// ==========================================

function displayMember() {

    const memberName =
        document.getElementById(
            "memberName"
        );

    const membershipNumber =
        document.getElementById(
            "membershipNumber"
        );

    const applicationNumber =
        document.getElementById(
            "applicationNumber"
        );


    if (memberName) {

        memberName.textContent =
            currentMember.full_name ||
            "---";

    }


    if (membershipNumber) {

        membershipNumber.textContent =
            currentMember.membership_number ||
            "Not Assigned";

    }


    if (applicationNumber) {

        applicationNumber.textContent =
            currentMember.application_number ||
            "---";

    }

}


// ==========================================
// CALCULATE MONTHS DUE
// ==========================================

function calculateMonthsDue() {

    if (!currentMember.registration_date) {
        return 0;
    }


    const registrationDate =
        new Date(
            currentMember.registration_date
        );


    const today =
        new Date();


    let months =
        (
            today.getFullYear() -
            registrationDate.getFullYear()
        ) * 12;


    months +=
        today.getMonth() -
        registrationDate.getMonth();


    // Registration month counts as month 1

    months += 1;


    if (months < 1) {
        months = 1;
    }


    // Maximum 12 months in one cycle

    if (months > 12) {
        months = 12;
    }


    return months;

}


// ==========================================
// CALCULATE TOTALS
// ==========================================

function calculateTotals() {

    const registrationFee =
        2000;

    const monthlyDue =
        1000;

    const monthsDue =
        calculateMonthsDue();

    const monthlyTotal =
        monthsDue *
        monthlyDue;

    const totalDue =
        registrationFee +
        monthlyTotal;


    let amountPaid =
        0;


    paymentHistory.forEach(
        function (payment) {

            amountPaid +=
                Number(
                    payment.amount
                ) || 0;

        }
    );


    const outstanding =
        Math.max(
            totalDue -
            amountPaid,
            0
        );


    return {
        registrationFee,
        monthlyTotal,
        totalDue,
        amountPaid,
        outstanding
    };

}


// ==========================================
// UPDATE PAYMENT SUMMARY
// ==========================================

function updatePaymentInformation() {

    const totals =
        calculateTotals();


    const registrationFee =
        document.getElementById(
            "registrationFee"
        );

    const monthlyDues =
        document.getElementById(
            "monthlyDuesSummary"
        );

    const totalDue =
        document.getElementById(
            "totalDue"
        );

    const amountPaid =
        document.getElementById(
            "amountPaid"
        );

    const outstanding =
        document.getElementById(
            "outstandingBalance"
        );

    const paymentStatus =
        document.getElementById(
            "paymentStatus"
        );


    if (registrationFee) {

        registrationFee.textContent =
            "₦" +
            totals.registrationFee.toLocaleString();

    }


    if (monthlyDues) {

        monthlyDues.textContent =
            "₦" +
            totals.monthlyTotal.toLocaleString();

    }


    if (totalDue) {

        totalDue.textContent =
            "₦" +
            totals.totalDue.toLocaleString();

    }


    if (amountPaid) {

        amountPaid.textContent =
            "₦" +
            totals.amountPaid.toLocaleString();

    }


    if (outstanding) {

        outstanding.textContent =
            "₦" +
            totals.outstanding.toLocaleString();

    }


    if (paymentStatus) {

        if (
            totals.amountPaid >=
            totals.totalDue
        ) {

            paymentStatus.textContent =
                "Paid";

        } else if (
            totals.amountPaid > 0
        ) {

            paymentStatus.textContent =
                "Partially Paid";

        } else {

            paymentStatus.textContent =
                "Pending";

        }

    }

}


// ==========================================
// PAYMENT FORM
// ==========================================

function setupPaymentForm() {

    const form =
        document.getElementById(
            "paymentForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const paymentType =
                document.getElementById(
                    "paymentType"
                ).value;


            const paymentMonth =
                document.getElementById(
                    "paymentMonth"
                ).value;


            const paymentAmount =
                Number(
                    document.getElementById(
                        "paymentAmount"
                    ).value
                );


            const paymentMethod =
                document.getElementById(
                    "paymentMethod"
                ).value;


            const paymentReference =
                document.getElementById(
                    "paymentReference"
                ).value.trim();


            if (!paymentType) {

                alert(
                    "Please select a payment type."
                );

                return;
            }


            if (
                !paymentAmount ||
                paymentAmount <= 0
            ) {

                alert(
                    "Please enter a valid payment amount."
                );

                return;
            }


            if (
                paymentType === "Monthly Dues" &&
                !paymentMonth
            ) {

                alert(
                    "Please select the payment month."
                );

                return;
            }


            // ==========================================
            // PREVENT DUPLICATE REGISTRATION FEE
            // ==========================================

            if (
                paymentType === "Registration Fee"
            ) {

                const exists =
                    paymentHistory.some(
                        function (payment) {

                            return (
                                payment.payment_type ===
                                "Registration Fee"
                            );

                        }
                    );


                if (exists) {

                    alert(
                        "Registration fee has already been recorded."
                    );

                    return;
                }

            }


            // ==========================================
            // PREVENT DUPLICATE MONTHLY PAYMENT
            // ==========================================

            if (
                paymentType === "Monthly Dues"
            ) {

                const exists =
                    paymentHistory.some(
                        function (payment) {

                            return (
                                payment.payment_type ===
                                "Monthly Dues"
                                &&
                                payment.payment_month ===
                                paymentMonth
                            );

                        }
                    );


                if (exists) {

                    alert(
                        paymentMonth +
                        " monthly dues have already been recorded."
                    );

                    return;
                }

            }


            const confirmation =
                confirm(
                    "Record this payment for " +
                    currentMember.full_name +
                    "?"
                );


            if (!confirmation) {
                return;
            }


            const paymentData = {

                member_id:
                    currentMember.id,

                payment_type:
                    paymentType,

                payment_month:
                    paymentMonth || null,

                amount:
                    paymentAmount,

                payment_method:
                    paymentMethod || null,

                reference:
                    paymentReference || null

            };


            // ==========================================
            // SAVE PAYMENT TO SUPABASE
            // ==========================================

            const {
                data: newPayment,
                error
            } =
                await supabase
                    .from("payment_history")
                    .insert(
                        paymentData
                    )
                    .select()
                    .single();


            if (error) {

                console.error(
                    "Payment saving error:",
                    error
                );

                alert(
                    "Payment could not be recorded.\n\n" +
                    error.message
                );

                return;
            }


            paymentHistory.unshift(
                newPayment
            );


            updatePaymentInformation();

            displayPaymentHistory();

            form.reset();


            alert(
                "Payment recorded successfully."
            );

        }
    );

}


// ==========================================
// DISPLAY PAYMENT HISTORY
// ==========================================

function displayPaymentHistory() {

    const table =
        document.getElementById(
            "paymentHistoryTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (
        paymentHistory.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td colspan="8">
                    No payment history available.
                </td>
            </tr>
        `;

        return;
    }


    paymentHistory.forEach(
        function (payment, index) {

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


            // ==========================================
            // RECEIPT LINK
            // ==========================================

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
                    ${index + 1}
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
                    ${paymentDate}
                </td>

                <td>

                    <button
                        type="button"
                        class="receipt-button"
                        onclick="window.location.href='${receiptUrl}'"
                    >
                        Receipt
                    </button>

                </td>

            `;


            table.appendChild(row);

        }
    );

}