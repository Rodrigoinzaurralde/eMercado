setTimeout(function() {
    const prevUrl = localStorage.getItem("prevUrl");
    if (prevUrl) {
        window.location.href = prevUrl;
    } else {
        localStorage.clear();
        window.location.href = "login.html";
    }
}, 5000);