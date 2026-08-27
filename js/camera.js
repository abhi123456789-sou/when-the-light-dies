/* =========================================================
   WHEN THE LIGHT DIES
   CAMERA SYSTEM
========================================================= */

"use strict";


const Camera = (() => {

    const camera = {

        x: 0,
        y: 0,

        targetX: 0,
        targetY: 0,

        offsetX: 0,
        offsetY: 0,

        smoothing: 8,

        shake: 0,
        shakeIntensity: 0,

        zoom: 1
    };


    let initialized = false;


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        if (initialized) {
            return;
        }

        initialized = true;

        reset();
    }


    /* =====================================================
       RESET
    ===================================================== */

    function reset() {

        camera.x = 0;
        camera.y = 0;

        camera.targetX = 0;
        camera.targetY = 0;

        camera.offsetX = 0;
        camera.offsetY = 0;

        camera.shake = 0;
        camera.shakeIntensity = 0;

        camera.zoom = 1;

        apply();
    }


    /* =====================================================
       SET POSITION
    ===================================================== */

    function setPosition(
        x,
        y
    ) {

        camera.x =
            Number(x) || 0;

        camera.y =
            Number(y) || 0;

        camera.targetX =
            camera.x;

        camera.targetY =
            camera.y;

        apply();
    }


    /* =====================================================
       SET TARGET
    ===================================================== */

    function setTarget(
        x,
        y
    ) {

        camera.targetX =
            Number(x) || 0;

        camera.targetY =
            Number(y) || 0;
    }


    /* =====================================================
       UPDATE
    ===================================================== */

    function update(
        delta
    ) {

        const factor =
            Math.min(
                1,
                camera.smoothing *
                delta
            );


        camera.x +=
            (
                camera.targetX -
                camera.x
            ) * factor;


        camera.y +=
            (
                camera.targetY -
                camera.y
            ) * factor;


        updateShake(
            delta
        );


        apply();
    }


    /* =====================================================
       SHAKE
    ===================================================== */

    function shake(
        intensity = 5,
        duration = 300
    ) {

        camera.shakeIntensity =
            Math.max(
                0,
                Number(intensity) || 0
            );


        camera.shake =
            Math.max(
                0,
                Number(duration) || 0
            );
    }


    /* =====================================================
       UPDATE SHAKE
    ===================================================== */

    function updateShake(
        delta
    ) {

        if (
            camera.shake <= 0
        ) {

            camera.offsetX = 0;
            camera.offsetY = 0;

            return;
        }


        camera.shake -=
            delta * 1000;


        const strength =
            camera.shakeIntensity *
            Math.max(
                0,
                camera.shake / 300
            );


        camera.offsetX =
            (
                Math.random() -
                0.5
            ) *
            strength;


        camera.offsetY =
            (
                Math.random() -
                0.5
            ) *
            strength;


        if (
            camera.shake <= 0
        ) {

            camera.shake = 0;

            camera.shakeIntensity = 0;

            camera.offsetX = 0;

            camera.offsetY = 0;
        }
    }


    /* =====================================================
       ZOOM
    ===================================================== */

    function setZoom(
        value
    ) {

        camera.zoom =
            Math.max(
                0.5,
                Math.min(
                    3,
                    Number(value) || 1
                )
            );


        apply();
    }


    /* =====================================================
       GET ZOOM
    ===================================================== */

    function getZoom() {

        return camera.zoom;
    }


    /* =====================================================
       APPLY TO WORLD
    ===================================================== */

    function apply() {

        const world =
            document.getElementById(
                "world"
            );


        if (!world) {
            return;
        }


        world.style.transform =
            `translate3d(${-camera.x + camera.offsetX}px, ${-camera.y + camera.offsetY}px, 0) scale(${camera.zoom})`;
    }


    /* =====================================================
       FOLLOW PLAYER
    ===================================================== */

    function followPlayer() {

        if (
            typeof Player ===
            "undefined"
        ) {

            return;
        }


        const player =
            Player.getState();


        if (!player) {
            return;
        }


        if (
            typeof player.x !==
            "number" ||
            typeof player.y !==
            "number"
        ) {

            return;
        }


        setTarget(
            player.x,
            player.y
        );
    }


    /* =====================================================
       GET POSITION
    ===================================================== */

    function getPosition() {

        return {

            x: camera.x,

            y: camera.y
        };
    }


    /* =====================================================
       GET STATE
    ===================================================== */

    function getState() {

        return {

            x: camera.x,

            y: camera.y,

            targetX:
                camera.targetX,

            targetY:
                camera.targetY,

            zoom:
                camera.zoom,

            shake:
                camera.shake
        };
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        reset,

        setPosition,

        setTarget,

        update,

        shake,

        setZoom,

        getZoom,

        followPlayer,

        getPosition,

        getState
    };

})();
