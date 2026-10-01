document.addEventListener("DOMContentLoaded", function () {

    // Get all members
    const members =
        JSON.parse(localStorage.getItem("fcaMembers")) || [];

    // Get information from the URL
    const urlParams =
        new URLSearchParams(window.location.search);

    const memberIndex =
        urlParams.get("member");

    const paymentIndex =
        urlParams.get("payment");


    // Check member
    if (
        memberIndex === null ||
        !members[Number(memberIndex)]
    ) {

        alert("Member information not found.");

        return;
    }


    const member =
        members[Number(memberIndex)];


    // Check payment
    if (
        !Array.isArray(member.paymentHistory) ||
        paymentIndex === null ||
        !member.paymentHistory[Number(paymentIndex)]
    ) {

        alert("Payment information not found.");

        return;
    }


    const payment =
        member.paymentHistory[Number(paymentIndex)];


    // ==========================================
    // RECEIPT NUMBER
    // ==========================================

    const receiptNumber =
        "FCA/RCPT/" +
        new Date().getFullYear() +
        "/" +
        String(
            Number(paymentIndex) + 1
        ).padStart(4, "0");


    // ==========================================
    // DISPLAY RECEIPT
    // ==========================================

    document.getElementById(
        "receiptNumber"
    ).textContent =
        receiptNumber;


    document.getElementById(
        "paymentDate"
    ).textContent =
        payment.date || "---";


    document.getElementById(
        "memberName"
    ).textContent =
        member.fullName || "---";


    document.getElementById(
        "membershipNumber"
    ).textContent =
        member.membershipNumber ||
        "Not Assigned";


    document.getElementById(
        "applicationNumber"
    ).textContent =
        member.applicationNumber ||
        "---";


    // ==========================================
    // PAYMENT AMOUNT
    // ==========================================

    const amount =
        Number(payment.amount);


    document.getElementById(
        "paymentAmount"
    ).textContent =
        "₦" +
        amount.toLocaleString();


    // ==========================================
    // PAYMENT METHOD
    // ==========================================

    document.getElementById(
        "paymentMethod"
    ).textContent =
        payment.method || "---";


    // ==========================================
    // PAYMENT REFERENCE
    // ==========================================

    document.getElementById(
        "paymentReference"
    ).textContent =
        payment.reference || "---";

});