/* =========================================================
   WHEN THE LIGHT DIES
   GAME LOOP
========================================================= */

"use strict";


const GameLoop = (() => {

    let running = false;

    let lastTime = 0;

    let animationFrame = null;


    /* =====================================================
       START
    ===================================================== */

    function start() {

        if (running) {
            return;
        }


        running = true;

        lastTime =
            performance.now();


        animationFrame =
            requestAnimationFrame(
                loop
            );
    }


    /* =====================================================
       STOP
    ===================================================== */

    function stop() {

        running = false;


        if (
            animationFrame !== null
        ) {

            cancelAnimationFrame(
                animationFrame
            );

            animationFrame =
                null;
        }
    }


    /* =====================================================
       MAIN LOOP
    ===================================================== */

    function loop(
        currentTime
    ) {

        if (!running) {
            return;
        }


        let delta =
            (
                currentTime -
                lastTime
            ) / 1000;


        lastTime =
            currentTime;


        /*
           Prevent huge delta values when
           the browser tab was inactive.
        */

        delta =
            Math.min(
                delta,
                0.1
            );


        update(
            delta
        );


        render(
            delta
        );


        animationFrame =
            requestAnimationFrame(
                loop
            );
    }


    /* =====================================================
       UPDATE
    ===================================================== */

    function update(
        delta
    ) {

        const state =
            getGameState();


        if (!state) {
            return;
        }


        if (
            state.gamePaused ||
            state.gameOver
        ) {

            return;
        }


        /*
           GAME STATE TIME
        */

        updateGameTime(
            state,
            delta
        );


        /*
           PLAYER
        */

        if (
            typeof Player !==
            "undefined" &&
            typeof Player.update ===
            "function"
        ) {

            Player.update(
                delta
            );
        }


        /*
           WORLD
        */

        if (
            typeof World !==
            "undefined" &&
            typeof World.update ===
            "function"
        ) {

            World.update(
                delta
            );
        }


        /*
           EVENTS
        */

        if (
            typeof Events !==
            "undefined" &&
            typeof Events.update ===
            "function"
        ) {

            Events.update(
                delta
            );
        }


        /*
           STORY EVENT CHECK
        */

        if (
            typeof Events !==
            "undefined" &&
            typeof Events.checkEvents ===
            "function"
        ) {

            Events.checkEvents();
        }


        /*
           UPDATE HUD
        */

        updateHUD();
    }


    /* =====================================================
       GAME TIME
    ===================================================== */

    function updateGameTime(
        state,
        delta
    ) {

        if (
            typeof state.gameTime !==
            "number"
        ) {

            state.gameTime =
                0;
        }


        state.gameTime +=
            delta;


        updateClock(
            state.gameTime
        );
    }


    /* =====================================================
       CLOCK
    ===================================================== */

    function updateClock(
        seconds
    ) {

        const element =
            document.getElementById(
                "game-time"
            );


        if (!element) {
            return;
        }


        const totalSeconds =
            Math.floor(
                seconds
            );


        const minutes =
            Math.floor(
                totalSeconds / 60
            );


        const remainingSeconds =
            totalSeconds % 60;


        element.textContent =

            String(
                minutes
            ).padStart(
                2,
                "0"
            )

            +

            ":" +

            String(
                remainingSeconds
            ).padStart(
                2,
                "0"
            );
    }


    /* =====================================================
       HUD
    ===================================================== */

    function updateHUD() {

        const state =
            getGameState();


        if (!state) {
            return;
        }


        updateHealth(
            state
        );


        updateSanity(
            state
        );


        updateBattery(
            state
        );
    }


    /* =====================================================
       HEALTH
    ===================================================== */

    function updateHealth(
        state
    ) {

        const bar =
            document.getElementById(
                "health-bar"
            );


        if (!bar) {
            return;
        }


        const health =
            Number(
                state.player?.health
            ) || 0;


        bar.style.width =
            `${clamp(health, 0, 100)}%`;
    }


    /* =====================================================
       SANITY
    ===================================================== */

    function updateSanity(
        state
    ) {

        const bar =
            document.getElementById(
                "sanity-bar"
            );


        if (!bar) {
            return;
        }


        const sanity =
            Number(
                state.player?.sanity
            ) || 0;


        bar.style.width =
            `${clamp(sanity, 0, 100)}%`;
    }


    /* =====================================================
       BATTERY
    ===================================================== */

    function updateBattery(
        state
    ) {

        const bar =
            document.getElementById(
                "battery-bar"
            );


        if (!bar) {
            return;
        }


        const battery =
            Number(
                state.player?.battery
            ) || 0;


        bar.style.width =
            `${clamp(battery, 0, 100)}%`;
    }


    /* =====================================================
       CLAMP
    ===================================================== */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );
    }


    /* =====================================================
       GET GAME STATE
    ===================================================== */

    function getGameState() {

        if (
            typeof GameState ===
            "undefined"
        ) {

            return null;
        }


        if (
            typeof GameState.get !==
            "function"
        ) {

            return null;
        }


        return GameState.get();
    }


    /* =====================================================
       RENDER
    ===================================================== */

    function render(
        delta
    ) {

        if (
            typeof World !==
            "undefined" &&
            typeof World.render ===
            "function"
        ) {

            World.render(
                delta
            );
        }


        /*
           Player rendering can be connected
           when the visual player/camera system
           is implemented.
        */
    }


    /* =====================================================
       IS RUNNING
    ===================================================== */

    function isRunning() {

        return running;
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        start,

        stop,

        update,

        render,

        isRunning
    };

})();
