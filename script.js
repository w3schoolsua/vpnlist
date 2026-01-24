/*
===========================================================
  Тема, кнопка вгору, VPN-таблиця з JSON, пошуком, фільтрами, сортуванням
===========================================================
*/

// ===== Перемикач теми =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

(function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.body.classList.add('dark');
        themeIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('dark');
        themeIcon.textContent = '🌙';
    }
})();

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
});

// ===== Кнопка "Вгору" =====
const scrollBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollBtn.style.display = 'block';
    } else {
        scrollBtn.style.display = 'none';
    }
});

scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== VPN Таблиця з JSON =====
const tableContainer = document.getElementById("tableContainer");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const countryFilter = document.getElementById("countryFilter");

let originalData = [];
let filteredData = [];
let sortColumn = null;
let sortDirection = "asc";

/*
    Завантаження локального JSON
*/
async function loadData() {
    tableContainer.innerHTML = `<div class="no-data">Завантаження…</div>`;

    try {
        const response = await fetch("./data.json");
        if (!response.ok) throw new Error("Помилка завантаження JSON");

        originalData = await response.json();
        filteredData = [...originalData];

        fillFilters();
        renderTable();
    } catch (err) {
        tableContainer.innerHTML = `<div class="no-data">Помилка завантаження даних</div>`;
        console.error(err);
    }
}

/*
    Автоматичне заповнення фільтрів (Тип, Країна)
*/
function fillFilters() {
    const types = [...new Set(originalData.map(item => item.type))];
    const countries = [...new Set(originalData.map(item => item.country))];

    typeFilter.innerHTML = `<option value="">Всі типи</option>` +
        types.map(t => `<option value="${t}">${t}</option>`).join("");

    countryFilter.innerHTML = `<option value="">Всі країни</option>` +
        countries.map(c => `<option value="${c}">${c}</option>`).join("");
}

/*
    Рендер таблиці
*/
function renderTable() {
    if (!filteredData.length) {
        tableContainer.innerHTML = `<div class="no-data">Немає даних</div>`;
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th data-col="id">№</th>
                    <th data-col="name">Назва</th>
                    <th data-col="type">Тип</th>
                    <th data-col="traffic">Ліміт трафіку</th>
                    <th data-col="country">Країна</th>
                    <th data-col="os">Операційна система</th>
                    <th data-col="price">Ціна</th>
                    <th data-col="description">Опис</th>
                </tr>
            </thead>
            <tbody>
    `;

    filteredData.forEach(row => {
        html += `
            <tr>
                <td>${row.id}</td>
                <td>${row.name}</td>
                <td>${row.type}</td>
                <td>${row.traffic}</td>
                <td>${row.country}</td>
                <td>${row.os}</td>
                <td>${row.price}</td>
                <td>${row.description}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    tableContainer.innerHTML = html;

    // Сортування
    document.querySelectorAll("th").forEach(th => {
        th.addEventListener("click", () => sortByColumn(th.dataset.col));
    });

    // Класи сортування
    document.querySelectorAll("th").forEach(th => th.classList.remove("sort-asc", "sort-desc"));
    if (sortColumn) {
        const th = document.querySelector(`th[data-col="${sortColumn}"]`);
        if (th) th.classList.add(sortDirection === "asc" ? "sort-asc" : "sort-desc");
    }
}

/*
    Пошук + фільтри
*/
function applyFilters() {
    const search = searchInput.value.toLowerCase();
    const type = typeFilter.value;
    const country = countryFilter.value;

    filteredData = originalData.filter(item => {
        const matchesSearch = Object.values(item).some(val =>
            String(val).toLowerCase().includes(search)
        );

        const matchesType = type ? item.type === type : true;
        const matchesCountry = country ? item.country === country : true;

        return matchesSearch && matchesType && matchesCountry;
    });

    renderTable();
}

searchInput.addEventListener("input", applyFilters);
typeFilter.addEventListener("change", applyFilters);
countryFilter.addEventListener("change", applyFilters);

/*
    Сортування
*/
function sortByColumn(col) {
    if (sortColumn === col) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
        sortColumn = col;
        sortDirection = "asc";
    }

    filteredData.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];

        // Числове сортування, якщо можливо
        const numA = parseFloat(String(valA).replace(',', '.'));
        const numB = parseFloat(String(valB).replace(',', '.'));
        const bothNumeric = !isNaN(numA) && !isNaN(numB);

        if (bothNumeric) {
            return sortDirection === "asc" ? numA - numB : numB - numA;
        }

        // Текстове сортування
        return sortDirection === "asc"
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
    });

    renderTable();
}

/*
    Старт
*/
loadData();


/* Стрілочки в меню таблиці для сортування */
document.querySelectorAll("th").forEach((th, index) => {
    th.addEventListener("click", () => {
        const table = th.closest("table");
        const tbody = table.querySelector("tbody");
        const rows = Array.from(tbody.querySelectorAll("tr"));

        const isAsc = th.classList.contains("sorted-asc");

        // скидаємо класи на всіх заголовках
        table.querySelectorAll("th").forEach(h => h.classList.remove("sorted-asc", "sorted-desc"));

        // ставимо новий клас
        th.classList.add(isAsc ? "sorted-desc" : "sorted-asc");

        const direction = isAsc ? -1 : 1;

        rows.sort((a, b) => {
            const A = a.children[index].innerText.trim().toLowerCase();
            const B = b.children[index].innerText.trim().toLowerCase();

            if (!isNaN(A) && !isNaN(B)) {
                return (Number(A) - Number(B)) * direction;
            }

            return A.localeCompare(B) * direction;
        });

        rows.forEach(row => tbody.appendChild(row));
    });
});

/* Дата оновлення сторінки */
document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("updated-date");

    const date = new Date(document.lastModified);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    el.textContent = `сторінку оновлено: ${day}.${month}.${year}`;
});