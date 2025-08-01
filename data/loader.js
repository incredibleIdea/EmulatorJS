(async function() {
    const scripts = [
        "emulator.js",
        "nipplejs.js",
        "shaders.js",
        "storage.js",
        "gamepad.js",
        "GameManager.js",
        "socket.io.min.js",
        "compression.js"
    ];

    const folderPath = (path) => path.substring(0, path.length - path.split("/").pop().length);
    let scriptPath = (typeof window.EJS_pathtodata === "string") ? window.EJS_pathtodata : folderPath((new URL(document.currentScript.src)).pathname);
    if (!scriptPath.endsWith("/")) scriptPath += "/";
    //console.log(scriptPath);
    function loadScript(file) {
        return new Promise(function(resolve) {
            let script = document.createElement("script");
            script.src = function() {
                if ("undefined" != typeof EJS_paths && typeof EJS_paths[file] === "string") {
                    return EJS_paths[file];
                } else if (file.endsWith("emulator.min.js")) {
                    return scriptPath + file;
                } else {
                    return scriptPath + "src/" + file;
                }
            }();
            script.onload = resolve;
            script.onerror = () => {
                filesmissing(file).then(e => resolve());
            }
            document.head.appendChild(script);
        })
    }

    function loadStyle(file) {
        return new Promise(function(resolve) {
            let css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = function() {
                if ("undefined" != typeof EJS_paths && typeof EJS_paths[file] === "string") {
                    return EJS_paths[file];
                } else {
                    return scriptPath + file;
                }
            }();
            css.onload = resolve;
            css.onerror = () => {
                filesmissing(file).then(e => resolve());
            }
            document.head.appendChild(css);
        })
    }

    async function filesmissing(file) {
        console.error("Failed to load " + file);
        let minifiedFailed = file.includes(".min.") && !file.includes("socket");
        console[minifiedFailed ? "warn" : "error"]("Failed to load " + file + " beacuse it's likly that the minified files are missing.\nTo fix this you have 3 options:\n1. You can download the zip from the latest release here: https://github.com/EmulatorJS/EmulatorJS/releases/latest - Stable\n2. You can download the zip from here: https://cdn.emulatorjs.org/latest/data/emulator.min.zip and extract it to the data/ folder. (easiest option) - Beta\n3. You can build the files by running `npm i && npm run build` in the data/minify folder. (hardest option) - Beta\nNote: you will probably need to do the same for the cores, extract them to the data/cores/ folder.");
        if (minifiedFailed) {
            console.log("Attempting to load non-minified files");
            if (file === "emulator.min.js") {
                for (let i = 0; i < scripts.length; i++) {
                    await loadScript(scripts[i]);
                }
            } else {
                await loadStyle("emulator.css");
            }
        }
    }

    if (("undefined" != typeof EJS_DEBUG_XX && true === EJS_DEBUG_XX)) {
        for (let i = 0; i < scripts.length; i++) {
            await loadScript(scripts[i]);
        }
        await loadStyle("emulator.css");
    } else {
        await loadScript("emulator.min.js");
        await loadStyle("emulator.min.css");
    }
    const config = {};
    config.gameUrl = window.EJS_gameUrl;
    config.dataPath = scriptPath;
    config.system = window.EJS_core;
    config.biosUrl = window.EJS_biosUrl;
    config.gameName = window.EJS_gameName;
    config.color = window.EJS_color;
    config.adUrl = window.EJS_AdUrl;
    config.adMode = window.EJS_AdMode;
    config.adTimer = window.EJS_AdTimer;
    config.adSize = window.EJS_AdSize;
    config.alignStartButton = window.EJS_alignStartButton;
    config.VirtualGamepadSettings = window.EJS_VirtualGamepadSettings;
    config.buttonOpts = window.EJS_Buttons;
    config.volume = window.EJS_volume;
    config.defaultControllers = window.EJS_defaultControls;
    config.startOnLoad = window.EJS_startOnLoaded;
    config.fullscreenOnLoad = window.EJS_fullscreenOnLoaded;
    config.filePaths = window.EJS_paths;
    config.loadState = window.EJS_loadStateURL;
    config.cacheLimit = window.EJS_CacheLimit;
    config.cheats = window.EJS_cheats;
    config.defaultOptions = window.EJS_defaultOptions;
    config.gamePatchUrl = window.EJS_gamePatchUrl;
    config.gameParentUrl = window.EJS_gameParentUrl;
    config.netplayUrl = window.EJS_netplayServer;
    config.gameId = window.EJS_gameID;
    config.backgroundImg = window.EJS_backgroundImage;
    config.backgroundBlur = window.EJS_backgroundBlur;
    config.backgroundColor = window.EJS_backgroundColor;
    config.controlScheme = window.EJS_controlScheme;
    config.threads = window.EJS_threads;
    config.disableCue = window.EJS_disableCue;
    config.startBtnName = window.EJS_startButtonName;
    config.softLoad = window.EJS_softLoad;
    config.capture = window.EJS_screenCapture;
    config.externalFiles = window.EJS_externalFiles;
    config.dontExtractBIOS = window.EJS_dontExtractBIOS;
    config.disableDatabases = window.EJS_disableDatabases;
    config.disableLocalStorage = window.EJS_disableLocalStorage;
    config.forceLegacyCores = window.EJS_forceLegacyCores;
    config.noAutoFocus = window.EJS_noAutoFocus;
    config.videoRotation = window.EJS_videoRotation;
    config.hideSettings = window.EJS_hideSettings;
    config.shaders = Object.assign({}, window.EJS_SHADERS, window.EJS_shaders ? window.EJS_shaders : {});

    let systemLang;
    try {
        systemLang = Intl.DateTimeFormat().resolvedOptions().locale;
    } catch(e) {} //Ignore
    const defaultLangs = ["en", "en-US"];
    const isDefaultLang = (lang) => defaultLangs.includes(lang);
    if ((typeof window.EJS_language === "string" && !isDefaultLang(window.EJS_language)) || (systemLang && window.EJS_disableAutoLang !== false)) {
        const language = window.EJS_language || systemLang;
        const autoLang = !window.EJS_language && typeof systemLang === "string";
        try {
            let languagePath;
            let fallbackPath = false;
            console.log("Loading language", language);
            if ("undefined" != typeof EJS_paths && typeof EJS_paths[language] === "string") {
                languagePath = EJS_paths[language];
            } else {
                languagePath = scriptPath + "localization/" + language + ".json";
                if (language.includes("-") || language.includes("_")) {
                    fallbackPath = scriptPath + "localization/" + language.split(/[-_]/)[0] + ".json";
                }
            }
            config.language = language;
            let langJson = {};
            let missingLang = false;
            if (!isDefaultLang(language)) {
                if (autoLang) {
                    try {
                        let languageJson = await fetch(languagePath);
                        if (!languageJson.ok) throw new Error(`Missing language file: ${languageJson.status}`);
                        langJson = JSON.parse(await languageJson.text());
                        if (fallbackPath) {
                            let fallbackJson = await fetch(fallbackPath);
                            missingLang = !fallbackJson.ok;
                            if (!fallbackJson.ok) throw new Error(`Missing language file: ${fallbackJson.status}`);
                            langJson = { ...JSON.parse(await fallbackJson.text()), ...langJson };
                        }
                    } catch(e) {
                        config.language = language.split(/[-_]/)[0];
                        console.warn("Failed to load language:", language + ",", "trying default language:", config.language);
                        if (!missingLang) {
                            langJson = JSON.parse(await (await fetch(fallbackPath)).text());
                        }
                    }
                } else {
                    langJson = JSON.parse(await (await fetch(languagePath)).text());
                }
                config.langJson = langJson;
            }
        } catch(e) {
            console.log("Missing language:", language, "!!");
            delete config.language;
            delete config.langJson;
        }
    }

    window.EJS_emulator = new EmulatorJS(EJS_player, config);
    window.EJS_adBlocked = (url, del) => window.EJS_emulator.adBlocked(url, del);
    if (typeof window.EJS_ready === "function") {
        window.EJS_emulator.on("ready", window.EJS_ready);
    }
    if (typeof window.EJS_onGameStart === "function") {
        window.EJS_emulator.on("start", window.EJS_onGameStart);
    }
    if (typeof window.EJS_onLoadState === "function") {
        window.EJS_emulator.on("loadState", window.EJS_onLoadState);
    }
    if (typeof window.EJS_onSaveState === "function") {
        window.EJS_emulator.on("saveState", window.EJS_onSaveState);
    }
    if (typeof window.EJS_onLoadSave === "function") {
        window.EJS_emulator.on("loadSave", window.EJS_onLoadSave);
    }
    if (typeof window.EJS_onSaveSave === "function") {
        window.EJS_emulator.on("saveSave", window.EJS_onSaveSave);
    }
})();
