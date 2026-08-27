/* =========================================================
   WHEN THE LIGHT DIES
   GAME STATE SYSTEM
   Version 0.1.0
========================================================= */

"use strict";


const GameState = (() => {

    /* =====================================================
       DEFAULT STATE
    ===================================================== */

    const createDefaultState = () => ({

        /* =========================
           GAME
        ========================== */

        gameStarted: false,

        gamePaused: false,

        gameOver: false,

        gameTime: 0,

        chapter: 0,

        scene: 0,

        currentRoom: "intro",


        /* =========================
           PLAYER
        ========================== */

        player: {

            health: 100,

            sanity: 100,

            battery: 100,

            isAlive: true,

            isMoving: false,

            isRunning: false,

            flashlightOn: false,

            lastMovement: {

                x: 0,

                y: 0
            },

            position: {

                x: 0,

                y: 0
            },

            rotation: 0
        },


        /* =========================
           STORY
        ========================== */

        story: {

            flags: {},

            choices: {},

            completedEvents: {},

            triggeredEvents: {},

            discoveredLocations: {},

            discoveredClues: {},

            importantDecisions: {}
        },


        /* =========================
           OBJECTIVE
        ========================== */

        objective: {

            id: null,

            title: "",

            description: "",

            completed: false
        },


        /* =========================
           INVENTORY
        ========================== */

        inventory: {

            items: [],

            selectedItem: null,

            capacity: 12
        },


        /* =========================
           PUZZLES
        ========================== */

        puzzles: {

            solved: {},

            active: {},

            progress: {},

            attempts: {}
        },


        /* =========================
           WORLD
        ========================== */

        world: {

            currentLocation: "intro",

            visitedRooms: {},

            unlockedDoors: {},

            openedContainers: {},

            activatedObjects: {},

            worldFlags: {}
        },


        /* =========================
           HORROR
        ========================== */

        horror: {

            fearLevel: 0,

            tension: 0,

            hallucinationLevel: 0,

            jumpscareCount: 0,

            eventsSeen: {}
        },


        /* =========================
           ENEMY
        ========================== */

        enemy: {

            active: false,

            discovered: false,

            alertLevel: 0,

            distance: Infinity,

            currentState: "idle"
        },


        /* =========================
           SETTINGS
        ========================== */

        settings: {

            masterVolume: 100,

            musicVolume: 70,

            sfxVolume: 80,

            brightness: 50
        },


        /* =========================
           META
        ========================== */

        meta: {

            version: "0.1.0",

            startedAt: null,

            lastSavedAt: null,

            playTime: 0
        }

    });


    /* =====================================================
       ACTIVE STATE
    ===================================================== */

    let state =
        createDefaultState();


    /* =====================================================
       RESET
    ===================================================== */

    function reset() {

        state =
            createDefaultState();


        state.meta.startedAt =
            Date.now();


        return state;
    }


    /* =====================================================
       GET STATE
    ===================================================== */

    function get() {

        return state;
    }


    /* =====================================================
       SET ROOT VALUE
    ===================================================== */

    function set(
        key,
        value
    ) {

        if (
            typeof key !== "string" ||
            key.length === 0
        ) {

            return false;
        }


        const parts =
            key.split(".");


        let target =
            state;


        for (
            let i = 0;
            i < parts.length - 1;
            i++
        ) {

            const part =
                parts[i];


            if (
                typeof target[part] !==
                "object" ||
                target[part] === null
            ) {

                target[part] = {};
            }


            target =
                target[part];
        }


        target[
            parts[parts.length - 1]
        ] = value;


        return true;
    }


    /* =====================================================
       GET VALUE
    ===================================================== */

    function getValue(key) {

        if (
            typeof key !== "string" ||
            !key
        ) {

            return undefined;
        }


        const parts =
            key.split(".");


        let value =
            state;


        for (
            const part of parts
        ) {

            if (
                value === null ||
                value === undefined
            ) {

                return undefined;
            }


            value =
                value[part];
        }


        return value;
    }


    /* =====================================================
       START GAME
    ===================================================== */

    function startGame() {

        state.gameStarted =
            true;

        state.gamePaused =
            false;

        state.gameOver =
            false;

        state.player.isAlive =
            true;


        if (!state.meta.startedAt) {

            state.meta.startedAt =
                Date.now();
        }
    }


    /* =====================================================
       PAUSE
    ===================================================== */

    function pause() {

        if (
            !state.gameStarted ||
            state.gameOver
        ) {

            return;
        }


        state.gamePaused =
            true;
    }


    /* =====================================================
       RESUME
    ===================================================== */

    function resume() {

        if (
            !state.gameStarted ||
            state.gameOver
        ) {

            return;
        }


        state.gamePaused =
            false;
    }


    /* =====================================================
       GAME TIME
    ===================================================== */

    function updateTime(delta) {

        if (
            !state.gameStarted ||
            state.gamePaused ||
            state.gameOver
        ) {

            return;
        }


        const safeDelta =
            Number.isFinite(delta)
                ? Math.max(
                    0,
                    delta
                )
                : 0;


        state.gameTime +=
            safeDelta;


        state.meta.playTime +=
            safeDelta;
    }


    /* =====================================================
       PLAYER HEALTH
    ===================================================== */

    function damagePlayer(
        amount
    ) {

        const damage =
            Number(amount);


        if (
            !Number.isFinite(damage) ||
            damage <= 0
        ) {

            return state.player.health;
        }


        state.player.health =
            clamp(
                state.player.health -
                damage,
                0,
                100
            );


        if (
            state.player.health <= 0
        ) {

            killPlayer();
        }


        return state.player.health;
    }


    function healPlayer(
        amount
    ) {

        const heal =
            Number(amount);


        if (
            !Number.isFinite(heal) ||
            heal <= 0
        ) {

            return state.player.health;
        }


        state.player.health =
            clamp(
                state.player.health +
                heal,
                0,
                100
            );


        return state.player.health;
    }


    /* =====================================================
       SANITY
    ===================================================== */

    function changeSanity(
        amount
    ) {

        const change =
            Number(amount);


        if (
            !Number.isFinite(change)
        ) {

            return state.player.sanity;
        }


        state.player.sanity =
            clamp(
                state.player.sanity +
                change,
                0,
                100
            );


        return state.player.sanity;
    }


    /* =====================================================
       BATTERY
    ===================================================== */

    function drainBattery(
        amount
    ) {

        const drain =
            Number(amount);


        if (
            !Number.isFinite(drain) ||
            drain <= 0
        ) {

            return state.player.battery;
        }


        state.player.battery =
            clamp(
                state.player.battery -
                drain,
                0,
                100
            );


        if (
            state.player.battery <= 0
        ) {

            state.player.flashlightOn =
                false;
        }


        return state.player.battery;
    }


    function rechargeBattery(
        amount
    ) {

        const charge =
            Number(amount);


        if (
            !Number.isFinite(charge) ||
            charge <= 0
        ) {

            return state.player.battery;
        }


        state.player.battery =
            clamp(
                state.player.battery +
                charge,
                0,
                100
            );


        return state.player.battery;
    }


    /* =====================================================
       PLAYER DEATH
    ===================================================== */

    function killPlayer() {

        state.player.health =
            0;

        state.player.isAlive =
            false;

        state.player.flashlightOn =
            false;

        state.gameOver =
            true;
    }


    /* =====================================================
       OBJECTIVE
    ===================================================== */

    function setObjective(
        id,
        title,
        description
    ) {

        state.objective = {

            id:
                id ?? null,

            title:
                title ?? "",

            description:
                description ?? "",

            completed:
                false
        };
    }


    function completeObjective() {

        state.objective.completed =
            true;
    }


    /* =====================================================
       INVENTORY
    ===================================================== */

    function addItem(
        item
    ) {

        if (
            !item
        ) {

            return false;
        }


        const itemId =
            typeof item === "string"
                ? item
                : item.id;


        if (!itemId) {

            return false;
        }


        if (
            hasItem(itemId)
        ) {

            return false;
        }


        if (
            state.inventory.items.length >=
            state.inventory.capacity
        ) {

            return false;
        }


        state.inventory.items.push(
            item
        );


        return true;
    }


    function removeItem(
        itemId
    ) {

        const index =
            state.inventory.items.findIndex(
                item => {

                    if (
                        typeof item ===
                        "string"
                    ) {

                        return item ===
                            itemId;
                    }


                    return item.id ===
                        itemId;
                }
            );


        if (index === -1) {

            return false;
        }


        state.inventory.items.splice(
            index,
            1
        );


        if (
            state.inventory.selectedItem ===
            itemId
        ) {

            state.inventory.selectedItem =
                null;
        }


        return true;
    }


    function hasItem(
        itemId
    ) {

        return state.inventory.items.some(
            item => {

                if (
                    typeof item ===
                    "string"
                ) {

                    return item ===
                        itemId;
                }


                return item.id ===
                    itemId;
            }
        );
    }


    function selectItem(
        itemId
    ) {

        if (
            !hasItem(itemId)
        ) {

            return false;
        }


        state.inventory.selectedItem =
            itemId;


        return true;
    }


    /* =====================================================
       STORY FLAGS
    ===================================================== */

    function setFlag(
        flag,
        value = true
    ) {

        if (
            !flag
        ) {

            return false;
        }


        state.story.flags[flag] =
            value;


        return true;
    }


    function getFlag(
        flag
    ) {

        return state.story.flags[
            flag
        ];
    }


    function hasFlag(
        flag
    ) {

        return Boolean(
            state.story.flags[flag]
        );
    }


    /* =====================================================
       STORY CHOICES
    ===================================================== */

    function setChoice(
        choiceId,
        value
    ) {

        if (
            !choiceId
        ) {

            return false;
        }


        state.story.choices[
            choiceId
        ] = value;


        return true;
    }


    function getChoice(
        choiceId
    ) {

        return state.story.choices[
            choiceId
        ];
    }


    /* =====================================================
       EVENTS
    ===================================================== */

    function markEventTriggered(
        eventId
    ) {

        state.story.triggeredEvents[
            eventId
        ] = true;
    }


    function hasEventTriggered(
        eventId
    ) {

        return Boolean(
            state.story.triggeredEvents[
                eventId
            ]
        );
    }


    function markEventCompleted(
        eventId
    ) {

        state.story.completedEvents[
            eventId
        ] = true;
    }


    function hasEventCompleted(
        eventId
    ) {

        return Boolean(
            state.story.completedEvents[
                eventId
            ]
        );
    }


    /* =====================================================
       ROOM
    ===================================================== */

    function changeRoom(
        roomId
    ) {

        if (
            !roomId
        ) {

            return false;
        }


        state.currentRoom =
            roomId;


        state.world.currentLocation =
            roomId;


        state.world.visitedRooms[
            roomId
        ] = true;


        return true;
    }


    /* =====================================================
       WORLD FLAGS
    ===================================================== */

    function setWorldFlag(
        flag,
        value = true
    ) {

        state.world.worldFlags[
            flag
        ] = value;
    }


    function getWorldFlag(
        flag
    ) {

        return state.world.worldFlags[
            flag
        ];
    }


    /* =====================================================
       PUZZLE STATE
    ===================================================== */

    function setPuzzleSolved(
        puzzleId,
        solved = true
    ) {

        state.puzzles.solved[
            puzzleId
        ] = solved;
    }


    function isPuzzleSolved(
        puzzleId
    ) {

        return Boolean(
            state.puzzles.solved[
                puzzleId
            ]
        );
    }


    function setPuzzleProgress(
        puzzleId,
        progress
    ) {

        state.puzzles.progress[
            puzzleId
        ] = progress;
    }


    function getPuzzleProgress(
        puzzleId
    ) {

        return state.puzzles.progress[
            puzzleId
        ];
    }


    /* =====================================================
       HORROR
    ===================================================== */

    function setFear(
        value
    ) {

        state.horror.fearLevel =
            clamp(
                value,
                0,
                100
            );
    }


    function changeFear(
        amount
    ) {

        setFear(
            state.horror.fearLevel +
            amount
        );
    }


    function setTension(
        value
    ) {

        state.horror.tension =
            clamp(
                value,
                0,
                100
            );
    }


    /* =====================================================
       ENEMY
    ===================================================== */

    function setEnemyState(
        enemyState
    ) {

        state.enemy.currentState =
            enemyState;
    }


    /* =====================================================
       SETTINGS
    ===================================================== */

    function updateSetting(
        setting,
        value
    ) {

        if (
            !Object.prototype.hasOwnProperty.call(
                state.settings,
                setting
            )
        ) {

            return false;
        }


        state.settings[setting] =
            value;


        return true;
    }


    /* =====================================================
       SERIALIZE
    ===================================================== */

    function serialize() {

        return JSON.parse(
            JSON.stringify(
                state
            )
        );
    }


    /* =====================================================
       RESTORE
    ===================================================== */

    function restore(
        savedState
    ) {

        if (
            !savedState ||
            typeof savedState !==
            "object"
        ) {

            return false;
        }


        const defaults =
            createDefaultState();


        state =
            deepMerge(
                defaults,
                savedState
            );


        return true;
    }


    /* =====================================================
       UTILITY
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


    function deepMerge(
        target,
        source
    ) {

        Object.keys(source)
            .forEach(key => {

                if (
                    source[key] &&
                    typeof source[key] ===
                    "object" &&
                    !Array.isArray(
                        source[key]
                    )
                ) {

                    if (
                        !target[key] ||
                        typeof target[key] !==
                        "object"
                    ) {

                        target[key] = {};
                    }


                    deepMerge(
                        target[key],
                        source[key]
                    );

                } else {

                    target[key] =
                        source[key];
                }
            });


        return target;
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        reset,

        get,

        set,

        getValue,

        startGame,

        pause,

        resume,

        updateTime,

        damagePlayer,

        healPlayer,

        changeSanity,

        drainBattery,

        rechargeBattery,

        killPlayer,

        setObjective,

        completeObjective,

        addItem,

        removeItem,

        hasItem,

        selectItem,

        setFlag,

        getFlag,

        hasFlag,

        setChoice,

        getChoice,

        markEventTriggered,

        hasEventTriggered,

        markEventCompleted,

        hasEventCompleted,

        changeRoom,

        setWorldFlag,

        getWorldFlag,

        setPuzzleSolved,

        isPuzzleSolved,

        setPuzzleProgress,

        getPuzzleProgress,

        setFear,

        changeFear,

        setTension,

        setEnemyState,

        updateSetting,

        serialize,

        restore
    };

})();
