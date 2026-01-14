document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const searchInput = document.getElementById("searchInput");
    const table = document.getElementById("vpnTable");
    const scrollBtn = document.getElementById("scrollTopBtn");

    function detectTimeTheme() {
        const hour = new Date().getHours();
        return hour >= 20 || hour < 7 ? "dark" : "light";
    }

    function updateIcon() {
        if (!themeIcon) return;
        themeIcon.textContent = body.classList.contains("dark") ? "☀️" : "🌙";
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            body.classList.toggle("dark", savedTheme === "dark");
        } else {
            const autoTheme = detectTimeTheme();
            body.classList.toggle("dark", autoTheme === "dark");
        }
        updateIcon();
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            body.classList.toggle("dark");
            localStorage.setItem(
                "theme",
                body.classList.contains("dark") ? "dark" : "light"
            );
            updateIcon();
        });
    }

    loadTheme();

    if (searchInput && table) {
        searchInput.addEventListener("keyup", () => {
            const filter = searchInput.value.toLowerCase();
            const rows = table.getElementsByTagName("tr");
            for (let i = 1; i < rows.length; i++) {
                const text = rows[i].textContent.toLowerCase();
                rows[i].style.display = text.includes(filter) ? "" : "none";
            }
        });
    }

    if (scrollBtn) {
        window.addEventListener("scroll", () => {
            scrollBtn.style.display = window.scrollY > 300 ? "block" : "none";
        });

        scrollBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    if (table) {
        const headers = table.querySelectorAll("thead th.sortable");
        let sortState = {};

        headers.forEach((header, index) => {
            header.addEventListener("click", () => {
                const type = header.getAttribute("data-sort") || "text";
                const isAsc = !(sortState[index] === "asc");
                sortState = {};
                sortState[index] = isAsc ? "asc" : "desc";

                headers.forEach(h => {
                    h.classList.remove("sorted-asc", "sorted-desc");
                });
                header.classList.add(isAsc ? "sorted-asc" : "sorted-desc");

                sortTableByColumn(table, index, type, isAsc);
            });
        });

        function sortTableByColumn(table, columnIndex, type = "text", asc = true) {
            const tbody = table.tBodies[0];
            const rowsArray = Array.from(tbody.querySelectorAll("tr"));
            const direction = asc ? 1 : -1;

            const getCellValue = (row) => {
                const cell = row.children[columnIndex];
                if (!cell) return "";

                const dataValue = cell.getAttribute("data-value");
                if (dataValue !== null) {
                    if (type === "num") {
                        return parseFloat(dataValue.replace(',', '.')) || 0;
                    }
                    return dataValue.toLowerCase();
                }

                const text = cell.textContent.trim();
                return type === "num"
                    ? parseFloat(text.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
                    : text.toLowerCase();
            };

            rowsArray.sort((a, b) => {
                const aVal = getCellValue(a);
                const bVal = getCellValue(b);

                if (aVal < bVal) return -1 * direction;
                if (aVal > bVal) return 1 * direction;
                return 0;
            });

            rowsArray.forEach(row => tbody.appendChild(row));
        }
    }
});