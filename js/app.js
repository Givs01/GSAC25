document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content");
    const navItems = document.querySelectorAll("#navigation-footer button");
    const loader = document.getElementById("loader");

    let loaderTimeout;
    let reloadTimeout;

    const showLoader = () => {
        clearTimeout(loaderTimeout);
        loader.classList.add("active");
    };

    const hideLoader = () => {
        loaderTimeout = setTimeout(() => {
            loader.classList.remove("active");
        }, 300);
    };

    const showError = (message) => {
        content.innerHTML = `<div class="error-message">${message}</div>`;
        hideLoader();
    };

    const saveToSession = (key, value) => {
        sessionStorage.setItem(key, JSON.stringify(value));
    };

    const loadFromSession = (key) => {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    };

    const memoryCache = new Map();

    const appendFooter = (htmlContent) => {
        return htmlContent + `
            <br>
            <section class="org">
                <h3>Organizers</h3>
                <img src="images/org_logo.jpg" alt="logo" onerror="this.onerror=null; this.src='default-image.png'">
            </section>
        `;
    };

    const fetchSectionData = async (section, displayImmediately = true) => {
        if (memoryCache.has(section)) {
            const cachedData = memoryCache.get(section);
            if (displayImmediately) {
                content.innerHTML = cachedData;
                hideLoader();
            }
            return cachedData;
        }

        showLoader();

        try {
            const module = await import(`./${section}.js`);
            const data = module[`load${capitalizeFirstLetter(section)}`] ? await module[`load${capitalizeFirstLetter(section)}`]() : "";

            const contentWithFooter = appendFooter(data);
            memoryCache.set(section, contentWithFooter);
            saveToSession(section, contentWithFooter);

            if (displayImmediately) {
                content.innerHTML = contentWithFooter;
                hideLoader();
            }

            return contentWithFooter;
        } catch (err) {
            console.error(err);
            showError(`Error loading ${section} content: ${err.message}`);
            hideLoader();
        }
    };

    const capitalizeFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const loadSection = (section, refresh = false) => {
        showLoader();

        const cachedContent = loadFromSession(section);

        if (!refresh && cachedContent) {
            content.innerHTML = cachedContent;
            fetchSectionData(section, false);
        } else {
            fetchSectionData(section, true);
        }

        createScrollToTopButton();
    };

    const setActiveNav = (section) => {
        document.querySelector("#navigation-footer button.active")?.classList.remove("active");
        const activeNavItem = document.querySelector(`#navigation-footer button[data-section="${section}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add("active");
            sessionStorage.setItem("activeSection", section);
        }
    };

    const setDefaultScroll = () => {
        window.scrollTo(0, 1);
    };

    const preloadSections = () => {
        const sections = ["home", "programme", "speakers", "presentations", "venue"];
        sections.forEach((section) => fetchSectionData(section, false));
    };

    const startPreloadAfterLoad = () => {
        setTimeout(preloadSections, 5000);
    };

    const reload = (section) => {
        clearTimeout(reloadTimeout);
        reloadTimeout = setTimeout(() => {
            loadSection(section, true);
            startPreloadAfterLoad();
        }, 5000);
    };

    const activeSection = sessionStorage.getItem("activeSection") || "home";
    setActiveNav(activeSection);

    const hashSection = window.location.hash.replace("#", "");
    const initialSection = hashSection || activeSection;
    setActiveNav(initialSection);
    loadSection(initialSection);

    startPreloadAfterLoad();
    setDefaultScroll();

    navItems.forEach((item) => {
        item.addEventListener("click", async () => {
            const section = item.getAttribute("data-section");
            setActiveNav(section);
            showLoader();

            await loadSection(section);
            setDefaultScroll();
            history.pushState({ section }, "", `#${section}`);

            preloadSections();
        });
    });

    window.addEventListener("popstate", (event) => {
        const state = event.state;
        if (state && state.section) {
            showLoader();
            loadSection(state.section);
            setActiveNav(state.section);
            preloadSections();
        } else {
            setActiveNav("home");
            loadSection("home");
            preloadSections();
        }
    });

    window.addEventListener("beforeunload", () => {
        sessionStorage.clear();
    });

    window.addEventListener("reloadSection", () => {
        reload(activeSection);
    });
});

function createScrollToTopButton() {
    if (document.getElementById("scrollToTop")) return;

    const scrollButton = document.createElement("button");
    scrollButton.id = "scrollToTop";
    scrollButton.innerHTML = '<i class="fa fa-circle-chevron-up"></i>';
    document.body.appendChild(scrollButton);

    window.addEventListener("scroll", () => {
        if (window.scrollY > 200) {
            scrollButton.classList.add("visible");
        } else {
            scrollButton.classList.remove("visible");
        }
    });

    scrollButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

