/* =========================================================
   WHEN THE LIGHT DIES
   INPUT SYSTEM
   PC + MOBILE
   Version 0.1.0
========================================================= */

"use strict";


const Input = (() => {

    /* =====================================================
       STATE
    ===================================================== */

    const keys = new Set();

    const justPressed = new Set();

    const justReleased = new Set();

    const touchState = {

        up: false,
        down: false,
        left: false,
        right: false,

        interact: false,
        flashlight: false,
        inventory: false
    };


    let initialized = false;


    /* =====================================================
       KEY NORMALIZATION
    ===================================================== */

    function normalizeKey(
        event
    ) {

        return event.code ||
            event.key;
    }


    /* =====================================================
       KEY DOWN
    ===================================================== */

    function handleKeyDown(
        event
    ) {

        const code =
            normalizeKey(event);


        /*
           IMPORTANT:
           Enter is deliberately NOT
           mapped to gameplay movement.

           This prevents accidental
           browser/game submission behaviour.
        */

        if (
            !keys.has(code)
        ) {

            justPressed.add(code);
        }


        keys.add(code);


        /*
           Prevent browser scrolling for
           gameplay keys.
        */

        const blockedKeys = [

            "Space",

            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",

            "KeyW",
            "KeyA",
            "KeyS",
            "KeyD",

            "KeyE",
            "KeyF",
            "KeyI",

            "Escape"
        ];


        if (
            blockedKeys.includes(code)
        ) {

            event.preventDefault();
        }
    }


    /* =====================================================
       KEY UP
    ===================================================== */

    function handleKeyUp(
        event
    ) {

        const code =
            normalizeKey(event);


        keys.delete(code);

        justReleased.add(code);


        if (
            code === "Space"
        ) {

            event.preventDefault();
        }
    }


    /* =====================================================
       KEY QUERIES
    ===================================================== */

    function isDown(
        code
    ) {

        return keys.has(code);
    }


    function pressed(
        code
    ) {

        return justPressed.has(code);
    }


    function released(
        code
    ) {

        return justReleased.has(code);
    }


    /* =====================================================
       MOVEMENT
    ===================================================== */

    function getMovement() {

        let x = 0;

        let y = 0;


        if (
            isDown("KeyA") ||
            isDown("ArrowLeft")
        ) {

            x -= 1;
        }


        if (
            isDown("KeyD") ||
            isDown("ArrowRight")
        ) {

            x += 1;
        }


        if (
            isDown("KeyW") ||
            isDown("ArrowUp")
        ) {

            y -= 1;
        }


        if (
            isDown("KeyS") ||
            isDown("ArrowDown")
        ) {

            y += 1;
        }


        /*
           Mobile movement
        */

        if (touchState.left) {

            x -= 1;
        }


        if (touchState.right) {

            x += 1;
        }


        if (touchState.up) {

            y -= 1;
        }


        if (touchState.down) {

            y += 1;
        }


        /*
           Normalize diagonal movement.
        */

        const length =
            Math.sqrt(
                x * x +
                y * y
            );


        if (
            length > 1
        ) {

            x /= length;
            y /= length;
        }


        return {

            x,
            y,

            moving:
                x !== 0 ||
                y !== 0
        };
    }


    /* =====================================================
       ACTIONS
    ===================================================== */

    function isInteractPressed() {

        return (
            pressed("KeyE") ||
            touchState.interact
        );
    }


    function isFlashlightPressed() {

        return (
            pressed("KeyF") ||
            touchState.flashlight
        );
    }


    function isInventoryPressed() {

        return (
            pressed("KeyI") ||
            touchState.inventory
        );
    }


    function isPausePressed() {

        return pressed(
            "Escape"
        );
    }


    function isDialoguePressed() {

        return pressed(
            "Space"
        );
    }


    /* =====================================================
       TOUCH HELPERS
    ===================================================== */

    function setTouch(
        action,
        value
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                touchState,
                action
            )
        ) {

            touchState[action] =
                Boolean(value);
        }
    }


    function createTouchControls() {

        /*
           Do not create duplicate controls.
        */

        if (
            document.getElementById(
                "mobile-controls"
            )
        ) {

            return;
        }


        const container =
            document.createElement(
                "div"
            );


        container.id =
            "mobile-controls";


        container.innerHTML = `

            <div
                class="mobile-movement"
                aria-label="Movement controls"
            >

                <button
                    type="button"
                    data-touch="up"
                    aria-label="Move up"
                >
                    ▲
                </button>

                <div>

                    <button
                        type="button"
                        data-touch="left"
                        aria-label="Move left"
                    >
                        ◀
                    </button>

                    <button
                        type="button"
                        data-touch="down"
                        aria-label="Move down"
                    >
                        ▼
                    </button>

                    <button
                        type="button"
                        data-touch="right"
                        aria-label="Move right"
                    >
                        ▶
                    </button>

                </div>

            </div>


            <div
                class="mobile-actions"
                aria-label="Game actions"
            >

                <button
                    type="button"
                    data-touch="interact"
                    aria-label="Interact"
                >
                    E
                </button>

                <button
                    type="button"
                    data-touch="flashlight"
                    aria-label="Flashlight"
                >
                    F
                </button>

                <button
                    type="button"
                    data-touch="inventory"
                    aria-label="Inventory"
                >
                    I
                </button>

            </div>
        `;


        document.body.appendChild(
            container
        );


        setupTouchButtons();
    }


    /* =====================================================
       TOUCH BUTTON EVENTS
    ===================================================== */

    function setupTouchButtons() {

        const buttons =
            document.querySelectorAll(
                "[data-touch]"
            );


        buttons.forEach(
            button => {

                const action =
                    button.dataset.touch;


                const start =
                    event => {

                        event.preventDefault();

                        setTouch(
                            action,
                            true
                        );

                        button.classList.add(
                            "pressed"
                        );
                    };


                const end =
                    event => {

                        event.preventDefault();

                        setTouch(
                            action,
                            false
                        );

                        button.classList.remove(
                            "pressed"
                        );
                    };


                button.addEventListener(
                    "pointerdown",
                    start,
                    {
                        passive: false
                    }
                );


                button.addEventListener(
                    "pointerup",
                    end,
                    {
                        passive: false
                    }
                );


                button.addEventListener(
                    "pointercancel",
                    end,
                    {
                        passive: false
                    }
                );


                button.addEventListener(
                    "pointerleave",
                    end,
                    {
                        passive: false
                    }
                );
            }
        );
    }


    /* =====================================================
       CLEAR FRAME INPUT
    ===================================================== */

    function endFrame() {

        justPressed.clear();

        justReleased.clear();


        /*
           Action buttons are one-shot.
        */

        touchState.interact =
            false;

        touchState.flashlight =
            false;

        touchState.inventory =
            false;
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        if (initialized) {

            return;
        }


        initialized =
            true;


        window.addEventListener(
            "keydown",
            handleKeyDown,
            {
                passive: false
            }
        );


        window.addEventListener(
            "keyup",
            handleKeyUp,
            {
                passive: false
            }
        );


        /*
           Prevent stuck keys when the
           browser/tab loses focus.
        */

        window.addEventListener(
            "blur",
            clearAll
        );


        /*
           Mobile controls are created
           only on touch-capable devices.
        */

        if (
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0
        ) {

            createTouchControls();
        }
    }


    /* =====================================================
       CLEAR ALL
    ===================================================== */

    function clearAll() {

        keys.clear();

        justPressed.clear();

        justReleased.clear();


        Object.keys(
            touchState
        ).forEach(
            key => {

                touchState[key] =
                    false;
            }
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        update:
            endFrame,

        isDown,

        pressed,

        released,

        getMovement,

        isInteractPressed,

        isFlashlightPressed,

        isInventoryPressed,

        isPausePressed,

        isDialoguePressed,

        setTouch,

        clearAll
    };

})();
