/* =================== Country & Region Registry =================== */
/* Source of truth for the Country / Region overlay.
   Apple-inspired grouping, single-source, no duplicates. */

(function () {
  const COUNTRIES_DATA = [
    {
      region: "Africa, Middle East & India",
      i18nKey: "region.africaMiddleEastIndia",
      countries: [
        { name: "Algeria", label: "Algeria", languageCode: "ar" },
        { name: "Angola", label: "Angola", languageCode: "pt" },
        { name: "Bahrain", label: "Bahrain", languageCode: "ar" },
        { name: "Botswana", label: "Botswana", languageCode: "en" },
        { name: "Cameroon", label: "Cameroun", languageCode: "fr" },
        { name: "Egypt", label: "مصر", languageCode: "ar" },
        { name: "Ghana", label: "Ghana", languageCode: "en" },
        { name: "India", label: "India", languageCode: "hi" },
        { name: "Iran", label: "ایران", languageCode: "fa" },
        { name: "Israel", label: "ישראל", languageCode: "he" },
        { name: "Ivory Coast", label: "Côte d’Ivoire", languageCode: "fr" },
        { name: "Jordan", label: "الأردن", languageCode: "ar" },
        { name: "Kenya", label: "Kenya", languageCode: "en" },
        { name: "Kuwait", label: "الكويت", languageCode: "ar" },
        { name: "Lebanon", label: "لبنان", languageCode: "ar" },
        { name: "Morocco", label: "المغرب", languageCode: "ar" },
        { name: "Mozambique", label: "Moçambique", languageCode: "pt" },
        { name: "Namibia", label: "Namibia", languageCode: "en" },
        { name: "Nigeria", label: "Nigeria", languageCode: "en" },
        { name: "Oman", label: "عُمان", languageCode: "ar" },
        { name: "Pakistan", label: "پاکستان", languageCode: "ur" },
        { name: "Qatar", label: "قطر", languageCode: "ar" },
        { name: "Saudi Arabia", label: "المملكة العربية السعودية", languageCode: "ar" },
        { name: "Senegal", label: "Sénégal", languageCode: "fr" },
        { name: "South Africa", label: "South Africa", languageCode: "en" },
        { name: "Tanzania", label: "Tanzania", languageCode: "sw" },
        { name: "Tunisia", label: "تونس", languageCode: "ar" },
        { name: "Turkey", label: "Türkiye", languageCode: "tr" },
        { name: "Uganda", label: "Uganda", languageCode: "en" },
        { name: "United Arab Emirates", label: "الإمارات العربية المتحدة", languageCode: "ar" }
      ]
    },
    {
      region: "Asia Pacific",
      i18nKey: "region.asiaPacific",
      countries: [
        { name: "Australia", label: "Australia", languageCode: "en" },
        { name: "Bangladesh", label: "বাংলাদেশ", languageCode: "bn" },
        { name: "Brunei", label: "Brunei", languageCode: "ms" },
        { name: "Cambodia", label: "កម្ពុជា", languageCode: "km" },
        { name: "China Mainland", label: "中国大陆", languageCode: "zh" },
        { name: "Hong Kong", label: "香港", languageCode: "zh" },
        { name: "Indonesia", label: "Indonesia", languageCode: "id" },
        { name: "Japan", label: "日本", languageCode: "ja" },
        { name: "Kazakhstan", label: "Қазақстан", languageCode: "kk" },
        { name: "Macau", label: "澳門", languageCode: "zh" },
        { name: "Malaysia", label: "Malaysia", languageCode: "ms" },
        { name: "New Zealand", label: "New Zealand", languageCode: "en" },
        { name: "Philippines", label: "Pilipinas", languageCode: "fil" },
        { name: "Singapore", label: "Singapore", languageCode: "en" },
        { name: "South Korea", label: "대한민국", languageCode: "ko" },
        { name: "Sri Lanka", label: "ශ්‍රී ලංකා", languageCode: "si" },
        { name: "Taiwan", label: "台灣", languageCode: "zh" },
        { name: "Thailand", label: "ไทย", languageCode: "th" },
        { name: "Vietnam", label: "Việt Nam", languageCode: "vi" }
      ]
    },
    {
      region: "Europe",
      i18nKey: "region.europe",
      countries: [
        { name: "Albania", label: "Shqipëria", languageCode: "sq" },
        { name: "Andorra", label: "Andorra", languageCode: "ca" },
        { name: "Armenia", label: "Հայաստան", languageCode: "hy" },
        { name: "Austria", label: "Österreich", languageCode: "de" },
        { name: "Azerbaijan", label: "Azərbaycan", languageCode: "az" },
        { name: "Belarus", label: "Беларусь", languageCode: "be" },
        { name: "Belgium", label: "België", languageCode: "nl" },
        { name: "Bosnia and Herzegovina", label: "Bosna i Hercegovina", languageCode: "bs" },
        { name: "Bulgaria", label: "България", languageCode: "bg" },
        { name: "Croatia", label: "Hrvatska", languageCode: "hr" },
        { name: "Cyprus", label: "Κύπρος", languageCode: "el" },
        { name: "Czech Republic", label: "Česko", languageCode: "cs" },
        { name: "Denmark", label: "Danmark", languageCode: "da" },
        { name: "Estonia", label: "Eesti", languageCode: "et" },
        { name: "Finland", label: "Suomi", languageCode: "fi" },
        { name: "France", label: "France", languageCode: "fr" },
        { name: "Georgia", label: "საქართველო", languageCode: "ka" },
        { name: "Germany", label: "Deutschland", languageCode: "de" },
        { name: "Greece", label: "Ελλάδα", languageCode: "el" },
        { name: "Hungary", label: "Magyarország", languageCode: "hu" },
        { name: "Iceland", label: "Ísland", languageCode: "is" },
        { name: "Ireland", label: "Ireland", languageCode: "en" },
        { name: "Italy", label: "Italia", languageCode: "it" },
        { name: "Kosovo", label: "Kosovë", languageCode: "sq" },
        { name: "Latvia", label: "Latvija", languageCode: "lv" },
        { name: "Liechtenstein", label: "Liechtenstein", languageCode: "de" },
        { name: "Lithuania", label: "Lietuva", languageCode: "lt" },
        { name: "Luxembourg", label: "Luxembourg", languageCode: "fr" },
        { name: "Malta", label: "Malta", languageCode: "mt" },
        { name: "Moldova", label: "Moldova", languageCode: "ro" },
        { name: "Monaco", label: "Monaco", languageCode: "fr" },
        { name: "Montenegro", label: "Crna Gora", languageCode: "sr" },
        { name: "Netherlands", label: "Nederland", languageCode: "nl" },
        { name: "North Macedonia", label: "Северна Македонија", languageCode: "mk" },
        { name: "Norway", label: "Norge", languageCode: "no" },
        { name: "Poland", label: "Polska", languageCode: "pl" },
        { name: "Portugal", label: "Portugal", languageCode: "pt" },
        { name: "Romania", label: "România", languageCode: "ro" },
        { name: "Russia", label: "Россия", languageCode: "ru" },
        { name: "San Marino", label: "San Marino", languageCode: "it" },
        { name: "Serbia", label: "Srbija", languageCode: "sr" },
        { name: "Slovakia", label: "Slovensko", languageCode: "sk" },
        { name: "Slovenia", label: "Slovenija", languageCode: "sl" },
        { name: "Spain", label: "España", languageCode: "es" },
        { name: "Sweden", label: "Sverige", languageCode: "sv" },
        { name: "Switzerland", label: "Schweiz", languageCode: "de" },
        { name: "Turkey", label: "Türkiye", languageCode: "tr" },
        { name: "Ukraine", label: "Україна", languageCode: "uk" },
        { name: "United Kingdom", label: "United Kingdom", languageCode: "en" },
        { name: "Vatican City", label: "Città del Vaticano", languageCode: "it" }
      ]
    },
    {
      region: "Latin America & Caribbean",
      i18nKey: "region.latinAmericaCaribbean",
      countries: [
        { name: "Argentina", label: "Argentina", languageCode: "es" },
        { name: "Bahamas", label: "Bahamas", languageCode: "en" },
        { name: "Barbados", label: "Barbados", languageCode: "en" },
        { name: "Belize", label: "Belize", languageCode: "en" },
        { name: "Bermuda", label: "Bermuda", languageCode: "en" },
        { name: "Bolivia", label: "Bolivia", languageCode: "es" },
        { name: "Brazil", label: "Brasil", languageCode: "pt" },
        { name: "Cayman Islands", label: "Cayman Islands", languageCode: "en" },
        { name: "Chile", label: "Chile", languageCode: "es" },
        { name: "Colombia", label: "Colombia", languageCode: "es" },
        { name: "Costa Rica", label: "Costa Rica", languageCode: "es" },
        { name: "Dominican Republic", label: "República Dominicana", languageCode: "es" },
        { name: "Ecuador", label: "Ecuador", languageCode: "es" },
        { name: "El Salvador", label: "El Salvador", languageCode: "es" },
        { name: "Guatemala", label: "Guatemala", languageCode: "es" },
        { name: "Honduras", label: "Honduras", languageCode: "es" },
        { name: "Jamaica", label: "Jamaica", languageCode: "en" },
        { name: "Mexico", label: "México", languageCode: "es" },
        { name: "Nicaragua", label: "Nicaragua", languageCode: "es" },
        { name: "Panama", label: "Panamá", languageCode: "es" },
        { name: "Paraguay", label: "Paraguay", languageCode: "es" },
        { name: "Peru", label: "Perú", languageCode: "es" },
        { name: "Puerto Rico", label: "Puerto Rico", languageCode: "es" },
        { name: "Trinidad and Tobago", label: "Trinidad and Tobago", languageCode: "en" },
        { name: "Uruguay", label: "Uruguay", languageCode: "es" },
        { name: "Venezuela", label: "Venezuela", languageCode: "es" }
      ]
    },
    {
      region: "United States & Canada",
      i18nKey: "region.unitedStatesCanada",
      countries: [
        { name: "Canada", label: "Canada", languageCode: "en" },
        { name: "United States", label: "United States", languageCode: "en" }
      ]
    }
  ];

  // Expose for other modules (read-only)
  window.ARTAN_COUNTRIES_DATA = COUNTRIES_DATA;

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('country-regions');
    if (!container) return;

    COUNTRIES_DATA.forEach((region, idx) => {
      const regionEl = document.createElement('div');
      regionEl.className = 'country-region';
      regionEl.dataset.region = region.region;

      const title = document.createElement('h3');
      title.className = 'region-title';
      title.dataset.i18nKey = region.i18nKey;
      title.textContent = region.region;

      const list = document.createElement('ul');
      list.className = 'country-list';

      region.countries.forEach(country => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = 'country-option';
        btn.dataset.country = country.name;
        btn.textContent = country.label;
        li.appendChild(btn);
        list.appendChild(li);
      });

      regionEl.appendChild(title);
      regionEl.appendChild(list);

      // Separator after each region EXCEPT the last one
      if (idx !== COUNTRIES_DATA.length - 1) {
        const hr = document.createElement('hr');
        hr.className = 'footer-separator';
        regionEl.appendChild(hr);
      }

      container.appendChild(regionEl);
    });

    // Single delegated handler for country selection
    container.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('.country-option') : null;
      if (!btn) return;

      const name = btn.dataset.country || btn.textContent || '';
      const label = btn.textContent || name;

      document.dispatchEvent(
        new CustomEvent('country-selected', { detail: { name, label } })
      );
    });
  });
})();