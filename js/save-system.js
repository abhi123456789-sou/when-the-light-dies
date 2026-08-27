/* =========================================================
   WHEN THE LIGHT DIES
   SAVE / LOAD SYSTEM
========================================================= */

"use strict";


const SaveSystem = (() => {

    const SAVE_KEY =
        "when_the_light_dies_save";

    const VERSION = 1;


    /* =====================================================
       SAVE GAME
    ===================================================== */

    function save() {

        if (
            typeof GameState ===
            "undefined"
        ) {

            console.warn(
                "GameState is not available."
            );

            return false;
        }


        const state =
            GameState.get();


        if (!state) {

            console.warn(
                "No game state available."
            );

            return false;
        }


        const saveData = {

            version: VERSION,

            timestamp:
                Date.now(),

            state:
                JSON.parse(
                    JSON.stringify(
                        state
                    )
                )
        };


        try {

            localStorage.setItem(

                SAVE_KEY,

                JSON.stringify(
                    saveData
                )
            );


            notify(
                "GAME SAVED"
            );


            return true;

        } catch (error) {

            console.error(
                "Save failed:",
                error
            );


            notify(
                "SAVE FAILED"
            );


            return false;
        }
    }


    /* =====================================================
       LOAD GAME
    ===================================================== */

    function load() {

        const raw =
            localStorage.getItem(
                SAVE_KEY
            );


        if (!raw) {

            notify(
                "NO SAVE DATA FOUND"
            );


            return false;
        }


        try {

            const saveData =
                JSON.parse(
                    raw
                );


            if (
                !saveData ||
                !saveData.state
            ) {

                throw new Error(
                    "Invalid save data."
                );
            }


            restoreState(
                saveData.state
            );


            notify(
                "GAME LOADED"
            );


            return true;

        } catch (error) {

            console.error(
                "Load failed:",
                error
            );


            notify(
                "LOAD FAILED"
            );


            return false;
        }
    }


    /* =====================================================
       RESTORE STATE
    ===================================================== */

    function restoreState(
        savedState
    ) {

        const currentState =
            GameState.get();


        /*
           Remove old properties.
        */

        Object.keys(
            currentState
        ).forEach(
            key => {

                delete currentState[
                    key
                ];
            }
        );


        /*
           Restore saved properties.
        */

        Object.assign(

            currentState,

            JSON.parse(
                JSON.stringify(
                    savedState
                )
            )
        );


        /*
           Make sure required objects
           still exist.
        */

        ensureStateStructure();


        /*
           Refresh UI.
        */

        refreshGameSystems();
    }


    /* =====================================================
       ENSURE STATE STRUCTURE
    ===================================================== */

    function ensureStateStructure() {

        const state =
            GameState.get();


        if (!state.player) {

            state.player = {};
        }


        if (
            !Array.isArray(
                state.player.inventory
            )
        ) {

            state.player.inventory =
                [];
        }


        if (
            typeof state.player.health !==
            "number"
        ) {

            state.player.health =
                100;
        }


        if (
            typeof state.player.sanity !==
            "number"
        ) {

            state.player.sanity =
                100;
        }


        if (
            typeof state.player.battery !==
            "number"
        ) {

            state.player.battery =
                100;
        }


        if (
            typeof state.storyFlags !==
            "object" ||
            state.storyFlags === null
        ) {

            state.storyFlags =
                {};
        }
    }


    /* =====================================================
       REFRESH SYSTEMS
    ===================================================== */

    function refreshGameSystems() {

        if (
            typeof Player !==
            "undefined"
        ) {

            if (
                typeof Player.getState ===
                "function"
            ) {

                Player.getState();
            }
        }


        if (
            typeof Inventory !==
            "undefined"
        ) {

            if (
                typeof Inventory.render ===
                "function"
            ) {

                Inventory.render();
            }
        }


        updateObjectiveUI();

        updateTimeUI();
    }


    /* =====================================================
       OBJECTIVE UI
    ===================================================== */

    function updateObjectiveUI() {

        const element =
            document.getElementById(
                "objective-text"
            );


        if (!element) {
            return;
        }


        const state =
            GameState.get();


        if (
            state.objective &&
            typeof state.objective ===
            "string"
        ) {

            element.textContent =
                state.objective;
        }
    }


    /* =====================================================
       TIME UI
    ===================================================== */

    function updateTimeUI() {

        const element =
            document.getElementById(
                "game-time"
            );


        if (!element) {
            return;
        }


        const state =
            GameState.get();


        if (
            state.gameTime !==
            undefined
        ) {

            element.textContent =
                formatTime(
                    state.gameTime
                );
        }
    }


    /* =====================================================
       FORMAT TIME
    ===================================================== */

    function formatTime(
        seconds
    ) {

        seconds =
            Math.max(
                0,
                Math.floor(
                    Number(seconds) || 0
                )
            );


        const minutes =
            Math.floor(
                seconds / 60
            );


        const remainingSeconds =
            seconds % 60;


        return (

            String(minutes)
                .padStart(2, "0")

            +

            ":" +

            String(
                remainingSeconds
            )
            .padStart(2, "0")
        );
    }


    /* =====================================================
       CHECK SAVE
    ===================================================== */

    function hasSave() {

        return (
            localStorage.getItem(
                SAVE_KEY
            ) !== null
        );
    }


    /* =====================================================
       DELETE SAVE
    ===================================================== */

    function deleteSave() {

        localStorage.removeItem(
            SAVE_KEY
        );


        notify(
            "SAVE DATA DELETED"
        );
    }


    /* =====================================================
       GET SAVE INFO
    ===================================================== */

    function getSaveInfo() {

        const raw =
            localStorage.getItem(
                SAVE_KEY
            );


        if (!raw) {
            return null;
        }


        try {

            const saveData =
                JSON.parse(
                    raw
                );


            return {

                version:
                    saveData.version,

                timestamp:
                    saveData.timestamp,

                date:
                    new Date(
                        saveData.timestamp
                    )
            };

        } catch {

            return null;
        }
    }


    /* =====================================================
       AUTO SAVE
    ===================================================== */

    function autoSave() {

        save();
    }


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    function notify(
        message
    ) {

        if (
            typeof Interaction !==
            "undefined" &&
            typeof Interaction.notify ===
            "function"
        ) {

            Interaction.notify(
                message
            );

            return;
        }


        const container =
            document.getElementById(
                "notification-container"
            );


        if (!container) {
            return;
        }


        const notification =
            document.createElement(
                "div"
            );


        notification.className =
            "game-notification";


        notification.textContent =
            message;


        container.appendChild(
            notification
        );


        window.setTimeout(
            () => {

                notification.remove();

            },
            2000
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        save,

        load,

        autoSave,

        hasSave,

        deleteSave,

        getSaveInfo
    };

})();
