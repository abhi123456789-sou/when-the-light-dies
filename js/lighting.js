/* =========================================================
   WHEN THE LIGHT DIES
   LIGHTING SYSTEM
========================================================= */

"use strict";


const Lighting = (() => {

    let initialized = false;

    const settings = {

        darkness: 0.72,

        flashlightRadius: 180,

        flashlightIntensity: 0.85,

        flickerEnabled: true
    };


    let flickerTimer = null;


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        if (initialized) {
            return;
        }

        initialized = true;

        applyDarkness();

        updateFlashlight();
    }


    /* =====================================================
       UPDATE
    ===================================================== */

    function update(delta) {

        if (!initialized) {
            return;
        }


        updateFlashlight();


        const state =
            getState();


        if (
            !state ||
            !state.player
        ) {
            return;
        }


        /*
           Battery almost empty =
           unstable flashlight.
        */

        if (
            state.player.flashlightOn &&
            state.player.battery <= 15 &&
            settings.flickerEnabled
        ) {

            randomFlicker();
        }
    }


    /* =====================================================
       GET GAME STATE
    ===================================================== */

    function getState() {

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
       APPLY DARKNESS
    ===================================================== */

    function applyDarkness() {

        const darkness =
            document.getElementById(
                "darkness"
            );


        if (!darkness) {
            return;
        }


        darkness.style.opacity =
            clamp(
                settings.darkness,
                0,
                1
            );
    }


    /* =====================================================
       UPDATE FLASHLIGHT
    ===================================================== */

    function updateFlashlight() {

        const flashlight =
            document.getElementById(
                "flashlight"
            );


        if (!flashlight) {
            return;
        }


        const state =
            getState();


        if (
            !state ||
            !state.player ||
            !state.player.flashlightOn ||
            state.player.battery <= 0
        ) {

            flashlight.style.opacity =
                "0";

            flashlight.style.background =
                "none";

            return;
        }


        flashlight.style.opacity =
            String(
                settings.flashlightIntensity
            );


        /*
           CSS radial gradient creates the
           flashlight cone around the center
           of the player's view.

           Position can later be connected
           to the actual player coordinates.
        */

        flashlight.style.background = `radial-gradient(
            circle ${settings.flashlightRadius}px at 50% 50%,
            rgba(255,255,255,0.95) 0%,
            rgba(255,255,255,0.65) 20%,
            rgba(255,255,255,0.18) 48%,
            rgba(0,0,0,0) 75%
        )`;
    }


    /* =====================================================
       FLASHLIGHT ON
    ===================================================== */

    function turnOn() {

        const state =
            getState();


        if (
            !state ||
            !state.player
        ) {
            return false;
        }


        if (
            state.player.battery <= 0 ||
            !state.player.isAlive
        ) {

            return false;
        }


        state.player.flashlightOn =
            true;


        updateFlashlight();

        return true;
    }


    /* =====================================================
       FLASHLIGHT OFF
    ===================================================== */

    function turnOff() {

        const state =
            getState();


        if (
            !state ||
            !state.player
        ) {
            return;
        }


        state.player.flashlightOn =
            false;


        updateFlashlight();
    }


    /* =====================================================
       TOGGLE FLASHLIGHT
    ===================================================== */

    function toggleFlashlight() {

        const state =
            getState();


        if (
            !state ||
            !state.player
        ) {
            return false;
        }


        if (
            state.player.flashlightOn
        ) {

            turnOff();

        } else {

            turnOn();
        }


        return state.player.flashlightOn;
    }


    /* =====================================================
       SET DARKNESS
    ===================================================== */

    function setDarkness(
        value
    ) {

        settings.darkness =
            clamp(
                Number(value),
                0,
                1
            );


        applyDarkness();
    }


    /* =====================================================
       SET FLASHLIGHT RADIUS
    ===================================================== */

    function setFlashlightRadius(
        value
    ) {

        settings.flashlightRadius =
            Math.max(
                20,
                Number(value) || 20
            );


        updateFlashlight();
    }


    /* =====================================================
       SET FLASHLIGHT INTENSITY
    ===================================================== */

    function setFlashlightIntensity(
        value
    ) {

        settings.flashlightIntensity =
            clamp(
                Number(value),
                0,
                1
            );


        updateFlashlight();
    }


    /* =====================================================
       FLICKER
    ===================================================== */

    function flicker(
        duration = 800,
        interval = 90
    ) {

        const flashlight =
            document.getElementById(
                "flashlight"
            );


        if (!flashlight) {
            return;
        }


        if (flickerTimer) {

            window.clearInterval(
                flickerTimer
            );

            flickerTimer = null;
        }


        const originalOpacity =
            flashlight.style.opacity;


        let elapsed = 0;


        flickerTimer =
            window.setInterval(
                () => {

                    elapsed += interval;


                    flashlight.style.opacity =
                        Math.random() > 0.45
                            ? originalOpacity || "1"
                            : "0";


                    if (
                        elapsed >=
                        duration
                    ) {

                        window.clearInterval(
                            flickerTimer
                        );


                        flickerTimer =
                            null;


                        updateFlashlight();
                    }

                },
                interval
            );
    }


    /* =====================================================
       RANDOM LOW BATTERY FLICKER
    ===================================================== */

    function randomFlicker() {

        if (
            Math.random() >
            0.025
        ) {
            return;
        }


        flicker(
            350,
            70
        );
    }


    /* =====================================================
       BLACKOUT
    ===================================================== */

    function blackout(
        duration = 1000
    ) {

        const darkness =
            document.getElementById(
                "darkness"
            );


        if (!darkness) {
            return;
        }


        const original =
            settings.darkness;


        darkness.style.opacity =
            "1";


        window.setTimeout(
            () => {

                darkness.style.opacity =
                    String(
                        original
                    );

            },
            Math.max(
                0,
                duration
            )
        );
    }


    /* =====================================================
       FLASH EFFECT
    ===================================================== */

    function flash(
        duration = 120
    ) {

        const overlay =
            document.getElementById(
                "world-overlay"
            );


        if (!overlay) {
            return;
        }


        overlay.classList.add(
            "light-flash"
        );


        window.setTimeout(
            () => {

                overlay.classList.remove(
                    "light-flash"
                );

            },
            duration
        );
    }


    /* =====================================================
       ENABLE FLICKER
    ===================================================== */

    function setFlickerEnabled(
        enabled
    ) {

        settings.flickerEnabled =
            Boolean(
                enabled
            );
    }


    /* =====================================================
       GET SETTINGS
    ===================================================== */

    function getSettings() {

        return {

            ...settings
        };
    }


    /* =====================================================
       CLAMP
    ===================================================== */

    function clamp(
        value,
        min,
        max
    ) {

        if (
            Number.isNaN(value)
        ) {

            return min;
        }


        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );
    }


    /* =====================================================
       CLEANUP
    ===================================================== */

    function destroy() {

        if (flickerTimer) {

            window.clearInterval(
                flickerTimer
            );

            flickerTimer =
                null;
        }
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        update,

        turnOn,

        turnOff,

        toggleFlashlight,

        setDarkness,

        setFlashlightRadius,

        setFlashlightIntensity,

        flicker,

        blackout,

        flash,

        setFlickerEnabled,

        getSettings,

        destroy
    };

})();
