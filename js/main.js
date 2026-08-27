/* =========================================================
   WHEN THE LIGHT DIES
   MAIN GAME ENGINE
   Version 0.1.0
========================================================= */

"use strict";


/* =========================================================
   GAME ENGINE
========================================================= */

const Game = (() => {

    let initialized = false;
    let lastTime = 0;
    let animationFrame = null;


    /* =====================================================
       DOM
    ===================================================== */

    const DOM = {};


    function cacheDOM() {

        DOM.game =
            document.getElementById("game");

        DOM.loadingScreen =
            document.getElementById("loading-screen");

        DOM.loadingProgress =
            document.getElementById("loading-progress");

        DOM.mainMenu =
            document.getElementById("main-menu");

        DOM.gameScreen =
            document.getElementById("game-screen");

        DOM.settingsScreen =
            document.getElementById("settings-screen");

        DOM.creditsScreen =
            document.getElementById("credits-screen");

        DOM.pauseMenu =
            document.getElementById("pause-menu");

        DOM.inventoryScreen =
            document.getElementById("inventory-screen");

        DOM.deathScreen =
            document.getElementById("death-screen");

        DOM.endingScreen =
            document.getElementById("ending-screen");

        DOM.objectiveText =
            document.getElementById("objective-text");

        DOM.gameTime =
            document.getElementById("game-time");

        DOM.healthBar =
            document.getElementById("health-bar");

        DOM.sanityBar =
            document.getElementById("sanity-bar");

        DOM.batteryBar =
            document.getElementById("battery-bar");

        DOM.interactionPrompt =
            document.getElementById(
                "interaction-prompt"
            );

        DOM.interactionKey =
            document.getElementById(
                "interaction-key"
            );

        DOM.interactionText =
            document.getElementById(
                "interaction-text"
            );

        DOM.inventorySlots =
            document.getElementById(
                "inventory-slots"
            );

        DOM.fullInventory =
            document.getElementById(
                "full-inventory"
            );

        DOM.dialogueContainer =
            document.getElementById(
                "dialogue-container"
            );

        DOM.notificationContainer =
            document.getElementById(
                "notification-container"
            );

        DOM.darkness =
            document.getElementById(
                "darkness"
            );

        DOM.flashlight =
            document.getElementById(
                "flashlight"
            );

        DOM.screenTransition =
            document.getElementById(
                "screen-transition"
            );
    }


    /* =====================================================
       SCREEN MANAGEMENT
    ===================================================== */

    function hideAllScreens() {

        document
            .querySelectorAll(".screen")
            .forEach(screen => {

                screen.classList.remove(
                    "active"
                );
            });
    }


    function showScreen(id) {

        hideAllScreens();

        const screen =
            document.getElementById(id);

        if (screen) {

            screen.classList.add(
                "active"
            );
        }
    }


    /* =====================================================
       LOADING
    ===================================================== */

    function startLoading() {

        showScreen(
            "loading-screen"
        );


        let progress = 0;


        const timer =
            setInterval(() => {

                progress += 5;


                if (DOM.loadingProgress) {

                    DOM.loadingProgress.style.width =
                        `${progress}%`;
                }


                if (progress >= 100) {

                    clearInterval(timer);

                    setTimeout(
                        () => {

                            showMainMenu();

                        },
                        300
                    );
                }

            }, 30);
    }


    /* =====================================================
       MAIN MENU
    ===================================================== */

    function showMainMenu() {

        showScreen(
            "main-menu"
        );

        hidePauseMenu();

        hideInventoryScreen();

        hideDialogue();
    }


    /* =====================================================
       START NEW GAME
    ===================================================== */

    function startNewGame() {

        if (
            typeof GameState ===
            "undefined"
        ) {

            console.error(
                "GameState is not loaded."
            );

            return;
        }


        GameState.reset();


        if (
            typeof Player !==
            "undefined"
        ) {

            Player.initialize();
        }


        if (
            typeof Events !==
            "undefined"
        ) {

            Events.initialize();
        }


        if (
            typeof World !==
            "undefined"
        ) {

            if (
                typeof World.initialize ===
                "function"
            ) {

                World.initialize();
            }
        }


        if (
            typeof Inventory !==
            "undefined"
        ) {

            if (
                typeof Inventory.initialize ===
                "function"
            ) {

                Inventory.initialize();
            }
        }


        if (
            typeof Puzzles !==
            "undefined"
        ) {

            if (
                typeof Puzzles.initialize ===
                "function"
            ) {

                Puzzles.initialize();
            }
        }


        if (
            typeof Horror !==
            "undefined"
        ) {

            if (
                typeof Horror.initialize ===
                "function"
            ) {

                Horror.initialize();
            }
        }


        if (
            typeof EnemyAI !==
            "undefined"
        ) {

            if (
                typeof EnemyAI.initialize ===
                "function"
            ) {

                EnemyAI.initialize();
            }
        }


        if (
            typeof AudioSystem !==
            "undefined"
        ) {

            if (
                typeof AudioSystem.initialize ===
                "function"
            ) {

                AudioSystem.initialize();
            }
        }


        if (
            typeof Endings !==
            "undefined"
        ) {

            if (
                typeof Endings.initialize ===
                "function"
            ) {

                Endings.initialize();
            }
        }


        GameState.startGame();


        showScreen(
            "game-screen"
        );


        if (
            typeof Story !==
            "undefined"
        ) {

            if (
                typeof Story.startChapter1 ===
                "function"
            ) {

                Story.startChapter1();
            }
        }


        updateUI();


        notify(
            "Something is wrong...",
            "story"
        );
    }


    /* =====================================================
       CONTINUE
    ===================================================== */

    function continueGame() {

        if (
            typeof SaveSystem ===
            "undefined"
        ) {

            notify(
                "Save system unavailable.",
                "error"
            );

            return;
        }


        const loaded =
            SaveSystem.load();


        if (!loaded) {

            notify(
                "No saved game found.",
                "warning"
            );

            return;
        }


        showScreen(
            "game-screen"
        );


        GameState.startGame();


        updateUI();
    }


    /* =====================================================
       SAVE
    ===================================================== */

    function saveGame() {

        if (
            typeof SaveSystem ===
            "undefined"
        ) {

            return false;
        }


        const result =
            SaveSystem.save();


        if (result) {

            notify(
                "Game saved.",
                "success"
            );
        }


        return result;
    }


    /* =====================================================
       PAUSE
    ===================================================== */

    function togglePause() {

        const state =
            GameState.get();


        if (
            !state.gameStarted ||
            state.gameOver
        ) {

            return;
        }


        if (
            state.gamePaused
        ) {

            resumeGame();

        } else {

            pauseGame();
        }
    }


    function pauseGame() {

        GameState.pause();

        showPauseMenu();
    }


    function resumeGame() {

        GameState.resume();

        hidePauseMenu();
    }


    function showPauseMenu() {

        if (DOM.pauseMenu) {

            DOM.pauseMenu.classList.add(
                "active"
            );
        }
    }


    function hidePauseMenu() {

        if (DOM.pauseMenu) {

            DOM.pauseMenu.classList.remove(
                "active"
            );
        }
    }


    /* =====================================================
       INVENTORY
    ===================================================== */

    function toggleInventory() {

        const state =
            GameState.get();


        if (
            !state.gameStarted ||
            state.gameOver
        ) {

            return;
        }


        if (
            DOM.inventoryScreen &&
            DOM.inventoryScreen.classList.contains(
                "active"
            )
        ) {

            closeInventory();

        } else {

            openInventory();
        }
    }


    function openInventory() {

        if (DOM.inventoryScreen) {

            DOM.inventoryScreen.classList.add(
                "active"
            );
        }


        if (
            typeof Inventory !==
            "undefined" &&
            typeof Inventory.render ===
            "function"
        ) {

            Inventory.render();
        }
    }


    function closeInventory() {

        if (DOM.inventoryScreen) {

            DOM.inventoryScreen.classList.remove(
                "active"
            );
        }
    }


    /* =====================================================
       SETTINGS
    ===================================================== */

    function openSettings() {

        showScreen(
            "settings-screen"
        );
    }


    function openCredits() {

        showScreen(
            "credits-screen"
        );
    }


    function returnToMenu() {

        GameState.pause();

        showMainMenu();
    }


    /* =====================================================
       DIALOGUE
    ===================================================== */

    function hideDialogue() {

        if (DOM.dialogueContainer) {

            DOM.dialogueContainer.classList.remove(
                "active"
            );
        }
    }


    function advanceDialogue() {

        if (
            typeof Story ===
            "undefined"
        ) {

            return;
        }


        if (
            typeof Story.isActive ===
            "function" &&
            Story.isActive()
        ) {

            Story.next();
        }
    }


    /* =====================================================
       INPUT EVENTS
    ===================================================== */

    function setupInput() {

        /*
           IMPORTANT:
           Main game actions are handled here
           only through explicit keydown checks.

           Enter is intentionally NOT a gameplay
           action. This prevents accidental Enter
           activation and the previous freeze issue.
        */


        window.addEventListener(
            "keydown",
            event => {

                const state =
                    GameState.get();


                /* =========================
                   ESC
                ========================== */

                if (
                    event.code ===
                    "Escape"
                ) {

                    event.preventDefault();

                    if (
                        DOM.inventoryScreen &&
                        DOM.inventoryScreen.classList.contains(
                            "active"
                        )
                    ) {

                        closeInventory();

                        return;
                    }


                    togglePause();

                    return;
                }


                /* =========================
                   SPACE
                ========================== */

                if (
                    event.code ===
                    "Space"
                ) {

                    if (
                        Story &&
                        typeof Story.isWaitingForChoice ===
                        "function" &&
                        Story.isWaitingForChoice()
                    ) {

                        return;
                    }


                    if (
                        Story &&
                        typeof Story.isActive ===
                        "function" &&
                        Story.isActive()
                    ) {

                        event.preventDefault();

                        advanceDialogue();

                        return;
                    }
                }


                /* =========================
                   F
                ========================== */

                if (
                    event.code ===
                    "KeyF"
                ) {

                    if (
                        state.gameStarted &&
                        !state.gamePaused
                    ) {

                        event.preventDefault();

                        if (
                            typeof Player !==
                            "undefined"
                        ) {

                            Player.toggleFlashlight();
                        }
                    }

                    return;
                }


                /* =========================
                   I
                ========================== */

                if (
                    event.code ===
                    "KeyI"
                ) {

                    if (
                        state.gameStarted &&
                        !state.gamePaused
                    ) {

                        event.preventDefault();

                        toggleInventory();
                    }

                    return;
                }
            },
            {
                passive: false
            }
        );


        /*
           Prevent browser default behaviour for
           Space when the game is active.
        */

        window.addEventListener(
            "keyup",
            event => {

                if (
                    event.code ===
                    "Space"
                ) {

                    if (
                        GameState.get()
                            .gameStarted
                    ) {

                        event.preventDefault();
                    }
                }
            },
            {
                passive: false
            }
        );
    }


    /* =====================================================
       BUTTON EVENTS
    ===================================================== */

    function setupButtons() {

        const newGame =
            document.getElementById(
                "btn-new-game"
            );


        const continueGameButton =
            document.getElementById(
                "btn-continue"
            );


        const loadGameButton =
            document.getElementById(
                "btn-load-game"
            );


        const settingsButton =
            document.getElementById(
                "btn-settings"
            );


        const creditsButton =
            document.getElementById(
                "btn-credits"
            );


        const resumeButton =
            document.getElementById(
                "btn-resume"
            );


        const saveButton =
            document.getElementById(
                "btn-save"
            );


        const pauseSettings =
            document.getElementById(
                "btn-pause-settings"
            );


        const mainMenuButton =
            document.getElementById(
                "btn-main-menu"
            );


        const closeInventoryButton =
            document.getElementById(
                "btn-close-inventory"
            );


        const retryButton =
            document.getElementById(
                "btn-retry"
            );


        const deathMenuButton =
            document.getElementById(
                "btn-death-menu"
            );


        const endingContinueButton =
            document.getElementById(
                "btn-ending-continue"
            );


        const settingsBack =
            document.getElementById(
                "btn-settings-back"
            );


        const creditsBack =
            document.getElementById(
                "btn-credits-back"
            );


        if (newGame) {

            newGame.addEventListener(
                "click",
                startNewGame
            );
        }


        if (continueGameButton) {

            continueGameButton.addEventListener(
                "click",
                continueGame
            );
        }


        if (loadGameButton) {

            loadGameButton.addEventListener(
                "click",
                continueGame
            );
        }


        if (settingsButton) {

            settingsButton.addEventListener(
                "click",
                openSettings
            );
        }


        if (creditsButton) {

            creditsButton.addEventListener(
                "click",
                openCredits
            );
        }


        if (resumeButton) {

            resumeButton.addEventListener(
                "click",
                resumeGame
            );
        }


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                saveGame
            );
        }


        if (pauseSettings) {

            pauseSettings.addEventListener(
                "click",
                openSettings
            );
        }


        if (mainMenuButton) {

            mainMenuButton.addEventListener(
                "click",
                returnToMenu
            );
        }


        if (closeInventoryButton) {

            closeInventoryButton.addEventListener(
                "click",
                closeInventory
            );
        }


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                startNewGame
            );
        }


        if (deathMenuButton) {

            deathMenuButton.addEventListener(
                "click",
                showMainMenu
            );
        }


        if (endingContinueButton) {

            endingContinueButton.addEventListener(
                "click",
                showMainMenu
            );
        }


        if (settingsBack) {

            settingsBack.addEventListener(
                "click",
                showMainMenu
            );
        }


        if (creditsBack) {

            creditsBack.addEventListener(
                "click",
                showMainMenu
            );
        }
    }


    /* =====================================================
       UI UPDATE
    ===================================================== */

    function updateUI() {

        if (
            typeof GameState ===
            "undefined"
        ) {

            return;
        }


        const state =
            GameState.get();


        /* =========================
           HEALTH
        ========================== */

        if (DOM.healthBar) {

            DOM.healthBar.style.width =
                `${clamp(
                    state.player.health,
                    0,
                    100
                )}%`;
        }


        /* =========================
           SANITY
        ========================== */

        if (DOM.sanityBar) {

            DOM.sanityBar.style.width =
                `${clamp(
                    state.player.sanity,
                    0,
                    100
                )}%`;
        }


        /* =========================
           BATTERY
        ========================== */

        if (DOM.batteryBar) {

            DOM.batteryBar.style.width =
                `${clamp(
                    state.player.battery,
                    0,
                    100
                )}%`;
        }


        /* =========================
           OBJECTIVE
        ========================== */

        if (
            DOM.objectiveText &&
            state.objective
        ) {

            DOM.objectiveText.textContent =
                state.objective.description ||
                state.objective.title ||
                "...";
        }


        /* =========================
           GAME TIME
        ========================== */

        if (DOM.gameTime) {

            DOM.gameTime.textContent =
                formatTime(
                    state.gameTime
                );
        }


        /* =========================
           FLASHLIGHT
        ========================== */

        if (DOM.flashlight) {

            if (
                state.player.flashlightOn
            ) {

                DOM.flashlight.classList.add(
                    "active"
                );

            } else {

                DOM.flashlight.classList.remove(
                    "active"
                );
            }
        }
    }


    /* =====================================================
       DEATH
    ===================================================== */

    function showDeathScreen() {

        const state =
            GameState.get();


        state.gameOver = true;


        showScreen(
            "death-screen"
        );
    }


    /* =====================================================
       ENDING
    ===================================================== */

    function showEnding(
        endingId
    ) {

        showScreen(
            "ending-screen"
        );


        if (
            typeof Endings !==
            "undefined" &&
            typeof Endings.show ===
            "function"
        ) {

            Endings.show(
                endingId
            );
        }
    }


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    function notify(
        message,
        type = "info"
    ) {

        if (
            !DOM.notificationContainer
        ) {

            return;
        }


        const notification =
            document.createElement(
                "div"
            );


        notification.className =
            `notification notification-${type}`;


        notification.textContent =
            message;


        DOM.notificationContainer
            .appendChild(
                notification
            );


        setTimeout(
            () => {

                notification.classList.add(
                    "hide"
                );


                setTimeout(
                    () => {

                        notification.remove();

                    },
                    300
                );

            },
            2500
        );
    }


    /* =====================================================
       GAME LOOP
    ===================================================== */

    function loop(timestamp) {

        if (!lastTime) {

            lastTime =
                timestamp;
        }


        let delta =
            (
                timestamp -
                lastTime
            ) / 1000;


        lastTime =
            timestamp;


        /*
           Prevent giant delta after tab switching.
        */

        delta =
            Math.min(
                delta,
                0.1
            );


        update(
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

    function update(delta) {

        if (
            typeof GameState ===
            "undefined"
        ) {

            return;
        }


        const state =
            GameState.get();


        if (
            state.gameStarted &&
            !state.gamePaused &&
            !state.gameOver
        ) {

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
               INTERACTION
            */

            if (
                typeof Interaction !==
                "undefined" &&
                typeof Interaction.update ===
                "function"
            ) {

                Interaction.update(
                    delta
                );
            }


            /*
               PUZZLES
            */

            if (
                typeof Puzzles !==
                "undefined" &&
                typeof Puzzles.update ===
                "function"
            ) {

                Puzzles.update(
                    delta
                );
            }


            /*
               HORROR
            */

            if (
                typeof Horror !==
                "undefined" &&
                typeof Horror.update ===
                "function"
            ) {

                Horror.update(
                    delta
                );
            }


            /*
               ENEMY AI
            */

            if (
                typeof EnemyAI !==
                "undefined" &&
                typeof EnemyAI.update ===
                "function"
            ) {

                EnemyAI.update(
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
               GAME TIME
            */

            if (
                typeof GameState.updateTime ===
                "function"
            ) {

                GameState.updateTime(
                    delta
                );
            }


            /*
               AUDIO
            */

            if (
                typeof AudioSystem !==
                "undefined" &&
                typeof AudioSystem.update ===
                "function"
            ) {

                AudioSystem.update(
                    delta
                );
            }
        }


        updateUI();


        checkGameOver();
    }


    /* =====================================================
       GAME OVER CHECK
    ===================================================== */

    function checkGameOver() {

        if (
            typeof GameState ===
            "undefined"
        ) {

            return;
        }


        const state =
            GameState.get();


        if (
            state.gameOver
        ) {

            return;
        }


        if (
            state.player.health <= 0 ||
            state.player.sanity <= 0
        ) {

            if (
                typeof GameState.killPlayer ===
                "function"
            ) {

                GameState.killPlayer();
            }


            showDeathScreen();
        }
    }


    /* =====================================================
       HELPERS
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


    function formatTime(
        seconds
    ) {

        seconds =
            Math.max(
                0,
                Math.floor(
                    seconds || 0
                )
            );


        const minutes =
            Math.floor(
                seconds / 60
            );


        const remaining =
            seconds % 60;


        return (
            String(minutes)
                .padStart(2, "0")
            +
            ":"
            +
            String(remaining)
                .padStart(2, "0")
        );
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        if (initialized) {

            return;
        }


        initialized = true;


        cacheDOM();

        setupButtons();

        setupInput();

        startLoading();


        lastTime =
            performance.now();


        animationFrame =
            requestAnimationFrame(
                loop
            );


        console.log(
            "WHEN THE LIGHT DIES engine initialized."
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        update,

        startNewGame,

        continueGame,

        saveGame,

        pauseGame,

        resumeGame,

        togglePause,

        toggleInventory,

        openSettings,

        openCredits,

        showMainMenu,

        showDeathScreen,

        showEnding,

        notify
    };

})();


/* =========================================================
   BOOT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Game.initialize();

    }
);
