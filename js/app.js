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
        const footerHTML = `
            <br>
            <section class="org">
                <h3>Organizers</h3>
                <img src="images/org_logo.jpg" alt="logo" onerror="this.onerror=null; this.src='default-image.png'">
            </section>
        `;
        return htmlContent + footerHTML;
    };

    const fetchSectionData = (section, displayImmediately = true) => {
        if (memoryCache.has(section)) {
            const cachedData = memoryCache.get(section);

            if (displayImmediately) {
                content.innerHTML = cachedData;
                hideLoader();
            }
            return Promise.resolve(cachedData);
        }

        showLoader();

        return import(`./${section}.js`)
            .then((module) => {
                let data;

                switch (section) {
                    case "home":
                        data = module.loadHome ? module.loadHome() : "";
                        break;
                    case "programme":
                        data = module.loadProgramme ? module.loadProgramme() : "";
                        break;
                    case "speakers":
                        data = module.loadSpeakers ? module.loadSpeakers() : "";
                        break;
                    case "presentations":
                        data = module.loadPresentations ? module.loadPresentations() : "";
                        break;
                    case "venue":
                        data = module.loadVenue ? module.loadVenue() : "";
                        break;
                    default:
                        data = "";
                }

                return data;
            })
            .then((htmlContent) => {
                const contentWithFooter = appendFooter(htmlContent);
                memoryCache.set(section, contentWithFooter);
                saveToSession(section, contentWithFooter);

                if (displayImmediately) {
                    content.innerHTML = contentWithFooter;
                    hideLoader();
                }

                return contentWithFooter;
            })
            .catch((err) => {
                console.error(err);
                showError(`Error loading ${section} content: ${err.message}`);
                hideLoader();
            });
    };

    const loadSection = (section, refresh = false) => {
        showLoader();

        const cachedContent = loadFromSession(section);

        if (!refresh && cachedContent) {
            content.innerHTML = cachedContent;
            fetchSectionData(section, false);  // Only preload without showing
        } else {
            fetchSectionData(section, true); // Load the section immediately
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

        sections.forEach((section) => {
            fetchSectionData(section, false);  // Preload, but don't display
        });
    };

    const startPreloadAfterLoad = () => {
        // Preload other sections after the active section has been shown
        setTimeout(preloadSections, 5000);  // Start preload after 5 seconds
    };

    const reload = (section) => {
        // Clear any existing timeout to prevent multiple reloads
        clearTimeout(reloadTimeout);

        // Fetch data and reload after a 5-second delay
        reloadTimeout = setTimeout(() => {
            loadSection(section, true);
            startPreloadAfterLoad();
        }, 5000);  // Reload after 5 seconds delay
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

        if (state) {
            if (state.section) {
                showLoader();
                loadSection(state.section);
                setActiveNav(state.section);
                preloadSections();
            }
        } else {
            setActiveNav("home");
            loadSection("home");
            preloadSections();
        }
    });

    window.addEventListener("beforeunload", () => {
        sessionStorage.clear();
    });

    // Handling reload logic
    window.addEventListener("reloadSection", () => {
        reload(activeSection);  // Trigger a reload of the active section
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
