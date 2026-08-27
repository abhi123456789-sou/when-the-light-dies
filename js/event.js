/* =========================================================
   WHEN THE LIGHT DIES
   EVENT ENGINE
========================================================= */

"use strict";

const Events = (() => {

    const events = new Map();

    const activeEvents = new Set();


    /* =====================================================
       REGISTER EVENT
    ===================================================== */

    function register(event) {

        if (
            !event ||
            !event.id
        ) {
            return false;
        }


        events.set(
            event.id,
            event
        );


        return true;
    }


    /* =====================================================
       GET EVENT
    ===================================================== */

    function get(eventId) {

        return events.get(
            eventId
        );
    }


    /* =====================================================
       CONDITION CHECK
    ===================================================== */

    function checkConditions(
        conditions
    ) {

        if (!conditions) {
            return true;
        }


        /* =========================
           FLAGS
        ========================== */

        if (conditions.flags) {

            for (
                const [flag, expected]
                of Object.entries(
                    conditions.flags
                )
            ) {

                const actual =
                    GameState.getValue(
                        `story.flags.${flag}`
                    );


                if (
                    actual !== expected
                ) {

                    return false;
                }
            }
        }


        /* =========================
           ITEMS
        ========================== */

        if (
            Array.isArray(
                conditions.hasItems
            )
        ) {

            for (
                const item
                of conditions.hasItems
            ) {

                if (
                    !GameState.hasItem(
                        item
                    )
                ) {

                    return false;
                }
            }
        }


        /* =========================
           NOT ITEMS
        ========================== */

        if (
            Array.isArray(
                conditions.missingItems
            )
        ) {

            for (
                const item
                of conditions.missingItems
            ) {

                if (
                    GameState.hasItem(
                        item
                    )
                ) {

                    return false;
                }
            }
        }


        /* =========================
           ROOM
        ========================== */

        if (
            conditions.room &&
            GameState.getValue(
                "currentRoom"
            ) !== conditions.room
        ) {

            return false;
        }


        /* =========================
           CHAPTER
        ========================== */

        if (
            typeof conditions.chapter ===
            "number"
        ) {

            if (
                GameState.getValue(
                    "chapter"
                ) !== conditions.chapter
            ) {

                return false;
            }
        }


        /* =========================
           SANITY
        ========================== */

        if (
            typeof conditions.minSanity ===
            "number"
        ) {

            if (
                GameState.getValue(
                    "player.sanity"
                ) < conditions.minSanity
            ) {

                return false;
            }
        }


        if (
            typeof conditions.maxSanity ===
            "number"
        ) {

            if (
                GameState.getValue(
                    "player.sanity"
                ) > conditions.maxSanity
            ) {

                return false;
            }
        }


        return true;
    }


    /* =====================================================
       EXECUTE ACTION
    ===================================================== */

    function executeAction(
        action
    ) {

        if (!action) {
            return;
        }


        /* =========================
           FLAGS
        ========================== */

        if (action.setFlags) {

            Object.entries(
                action.setFlags
            ).forEach(
                ([flag, value]) => {

                    GameState.setFlag(
                        flag,
                        value
                    );
                }
            );
        }


        /* =========================
           ITEMS
        ========================== */

        if (
            Array.isArray(
                action.addItems
            )
        ) {

            action.addItems.forEach(
                item => {

                    GameState.addItem(
                        item
                    );
                }
            );
        }


        if (
            Array.isArray(
                action.removeItems
            )
        ) {

            action.removeItems.forEach(
                item => {

                    GameState.removeItem(
                        item
                    );
                }
            );
        }


        /* =========================
           HEALTH
        ========================== */

        if (
            typeof action.damage ===
            "number"
        ) {

            GameState.damagePlayer(
                action.damage
            );
        }


        if (
            typeof action.heal ===
            "number"
        ) {

            GameState.healPlayer(
                action.heal
            );
        }


        /* =========================
           SANITY
        ========================== */

        if (
            typeof action.sanity ===
            "number"
        ) {

            GameState.changeSanity(
                action.sanity
            );
        }


        /* =========================
           ROOM
        ========================== */

        if (action.changeRoom) {

            GameState.changeRoom(
                action.changeRoom
            );
        }


        /* =========================
           OBJECTIVE
        ========================== */

        if (action.objective) {

            GameState.setObjective(
                action.objective.id,
                action.objective.title,
                action.objective.description
            );
        }


        /* =========================
           DIALOGUE
        ========================== */

        if (action.dialogue) {

            Story.startDialogue(
                action.dialogue
            );
        }


        /* =========================
           EVENT
        ========================== */

        if (action.triggerEvent) {

            trigger(
                action.triggerEvent
            );
        }
    }


    /* =====================================================
       TRIGGER EVENT
    ===================================================== */

    function trigger(eventId) {

        const event =
            get(eventId);


        if (!event) {

            console.warn(
                "Event not found:",
                eventId
            );

            return false;
        }


        if (
            GameState.hasEventTriggered(
                eventId
            )
        ) {

            return false;
        }


        if (
            !checkConditions(
                event.conditions
            )
        ) {

            return false;
        }


        GameState.markEventTriggered(
            eventId
        );


        activeEvents.add(
            eventId
        );


        if (event.action) {

            executeAction(
                event.action
            );
        }


        if (event.completed !== false) {

            GameState.markEventCompleted(
                eventId
            );
        }


        activeEvents.delete(
            eventId
        );


        return true;
    }


    /* =====================================================
       FORCE EVENT
    ===================================================== */

    function force(eventId) {

        const event =
            get(eventId);


        if (!event) {
            return false;
        }


        if (event.action) {

            executeAction(
                event.action
            );
        }


        return true;
    }


    /* =====================================================
       REGISTER DEFAULT EVENTS
    ===================================================== */

    function initialize() {

        register({

            id: "intro_start",

            conditions: {
                chapter: 1,
                room: "intro"
            },

            action: {

                setFlags: {
                    introStarted: true
                },

                objective: {

                    id: "intro_start",

                    title:
                        "Find a way out",

                    description:
                        "Something is wrong. Find out where you are."
                }
            }
        });


        register({

            id: "low_sanity_warning",

            conditions: {

                maxSanity: 25
            },

            action: {

                setFlags: {
                    lowSanityReached: true
                },

                sanity: -2
            }
        });


        register({

            id: "first_darkness",

            conditions: {

                flags: {
                    introStarted: true
                }
            },

            action: {

                setFlags: {
                    darknessExperienced: true
                }
            }
        });
    }


    /* =====================================================
       CHECK ALL EVENTS
    ===================================================== */

    function update() {

        events.forEach(
            event => {

                if (
                    !GameState.hasEventTriggered(
                        event.id
                    )
                ) {

                    if (
                        checkConditions(
                            event.conditions
                        )
                    ) {

                        /*
                           Only automatically trigger
                           explicitly automatic events.
                        */

                        if (
                            event.auto === true
                        ) {

                            trigger(
                                event.id
                            );
                        }
                    }
                }
            }
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        register,

        get,

        trigger,

        force,

        update,

        checkConditions
    };

})();
