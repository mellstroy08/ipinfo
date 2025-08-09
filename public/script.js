document.addEventListener("DOMContentLoaded", () => {
    // Önceki scriptin sağlam versiyonunu alıyoruz.
    // Tek fark, fetch işleminin yapılacağı URL'yi değiştirmek.

    const loader = document.getElementById("loader");
    const content = document.getElementById("content");
    const ipSearchForm = document.getElementById("ip-search-form");
    const ipInput = document.getElementById("ip-input");
    let map = null;

    // ... (getFlagEmoji, updateElement, initOrUpdateMap fonksiyonları aynı kalabilir) ...
    const getFlagEmoji = (countryCode) => {
        if (!countryCode || countryCode.length !== 2) return "🏳️";
        const codePoints = countryCode
            .toUpperCase()
            .split("")
            .map((char) => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    };
    const updateElement = (id, text) => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = text || "N/A";
        }
    };
    const initOrUpdateMap = (lat, lon) => {
        try {
            if (map) {
                map.flyTo([lat, lon], 10);
            } else {
                map = L.map("map", { zoomControl: false }).setView(
                    [lat, lon],
                    10,
                );
                L.tileLayer(
                    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                    { attribution: "&copy; OpenStreetMap &copy; CARTO" },
                ).addTo(map);
            }
            L.marker([lat, lon]).addTo(map);
        } catch (error) {
            console.error("Harita hatası:", error);
            updateElement(
                "map",
                '<p class="error-message">Harita yüklenemedi.</p>',
            );
        }
    };

    const displayResults = (data) => {
        updateElement("ip", data.ip); // API yanıtı değişti, 'query' yerine 'ip' kullanıyoruz.
        updateElement("country-flag", getFlagEmoji(data.country));
        updateElement("country", data.country);
        updateElement("region", data.region);
        updateElement("city", data.city);
        updateElement("coordinates", data.loc);
        updateElement("timezone", data.timezone);
        updateElement("isp", data.org);

        // Bu API'de ASN ve Proxy bilgisi direkt yok, şimdilik kaldırıyoruz.
        document.getElementById("asn").parentElement.style.display = "none";
        document.getElementById("proxy").parentElement.style.display = "none";

        initOrUpdateMap(...(data.loc || "0,0").split(",").map(Number));
        loader.classList.add("hidden");
        content.classList.remove("hidden");
    };

    const displayError = (errorMessage) => {
        loader.innerHTML = `<div class="card error-message"><h2><i class="fa-solid fa-circle-exclamation"></i> Hata!</h2><p>${errorMessage}</p></div>`;
        loader.classList.remove("hidden");
        content.classList.add("hidden");
    };

    const fetchIpInfo = async (ipAddress = "") => {
        loader.classList.remove("hidden");
        content.classList.add("hidden");
        loader.innerHTML = `<h2>Bilgiler Yükleniyor...</h2><div class="spinner-container"><div class="shimmer"></div></div>`;

        // === İŞTE EN ÖNEMLİ DEĞİŞİKLİK ===
        // Artık harici bir siteye değil, kendi sunucumuzun /api/ipinfo adresine istek atıyoruz.
        // Arama kutusu boşsa kendi IP'mizi, doluysa aranan IP'yi getirir.
        const URL = ipAddress ? `/api/ipinfo?ip=${ipAddress}` : "/api/ipinfo";

        try {
            // URL'deki ?ip=... parametresini sunucu tarafında işlemek için kodu güncellememiz gerek.
            // Şimdilik sadece kullanıcının kendi IP'sini alacak şekilde basitleştirelim.
            // Arama kutusunu daha sonra aktif ederiz.

            // YENİ VE BASİT YAKLAŞIM:
            const response = await fetch("/api/ipinfo"); // Her zaman kendi IP'mizi getirir.

            if (!response.ok)
                throw new Error(`Sunucu Hatası: ${response.status}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            displayResults(data);
        } catch (error) {
            console.error("FETCH HATA:", error);
            displayError(error.message);
        }
    };

    // Arama kutusunu şimdilik devre dışı bırakıp, sonraki adımda ekleyelim.
    ipSearchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Arama özelliği yakında eklenecek!");
        // const query = ipInput.value.trim();
        // if(query) fetchIpInfo(query);
    });

    fetchIpInfo();
});
