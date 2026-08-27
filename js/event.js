/* =========================================================
   WHEN THE LIGHT DIES
   EVENTS ENGINE
   Scripted Horror Events & Triggers
========================================================= */

"use strict";


const Events = (() => {

    let initialized = false;

    const activeTimers = new Map();

    const triggeredEvents = new Set();


    /* =====================================================
       EVENT DEFINITIONS
    ===================================================== */

    const eventData = {

        first_flicker: {

            once: true,

            trigger: {
                type: "storyFlag",
                flag: "story_started"
            },

            delay: 3000,

            action: "flicker"
        },


        first_sound: {

            once: true,

            trigger: {
                type: "storyFlag",
                flag: "intro_seen"
            },

            delay: 7000,

            action: "whisper"
        },


        hallway_presence: {

            once: true,

            trigger: {
                type: "room",
                room: "hallway"
            },

            delay: 5000,

            action: "presence"
        },


        bedroom_event: {

            once: true,

            trigger: {
                type: "room",
                room: "bedroom"
            },

            delay: 4000,

            action: "bedroomFear"
        },


        basement_event: {

            once: true,

            trigger: {
                type: "room",
                room: "basement"
            },

            delay: 3000,

            action: "basementFear"
        }
    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        if (initialized) {
            return;
        }

        initialized = true;

        triggeredEvents.clear();
    }


    /* =====================================================
       UPDATE
    ===================================================== */

    function update(delta) {

        if (!initialized) {
            return;
        }

        /*
           Timed events are handled through
           window timers.

           This update function is reserved
           for future real-time event logic.
        */
    }


    /* =====================================================
       CHECK ALL EVENTS
    ===================================================== */

    function checkEvents() {

        Object.entries(
            eventData
        ).forEach(
            ([eventId, event]) => {

                if (
                    event.once &&
                    triggeredEvents.has(
                        eventId
                    )
                ) {

                    return;
                }


                if (
                    !checkTrigger(
                        event.trigger
                    )
                ) {

                    return;
                }


                scheduleEvent(
                    eventId,
                    event
                );
            }
        );
    }


    /* =====================================================
       CHECK TRIGGER
    ===================================================== */

    function checkTrigger(
        trigger
    ) {

        if (!trigger) {
            return false;
        }


        switch (
            trigger.type
        ) {

            case "storyFlag":

                if (
                    typeof GameState.hasStoryFlag ===
                    "function"
                ) {

                    return GameState.hasStoryFlag(
                        trigger.flag
                    );
                }


                if (
                    typeof GameState.hasFlag ===
                    "function"
                ) {

                    return GameState.hasFlag(
                        trigger.flag
                    );
                }


                return false;


            case "room":

                if (
                    typeof World ===
                    "undefined"
                ) {

                    return false;
                }


                const room =
                    World.getCurrentRoom();


                return (
                    room &&
                    room.id ===
                    trigger.room
                );


            case "item":

                if (
                    typeof GameState.hasItem ===
                    "function"
                ) {

                    return GameState.hasItem(
                        trigger.item
                    );
                }


                return false;


            default:

                return false;
        }
    }


    /* =====================================================
       SCHEDULE EVENT
    ===================================================== */

    function scheduleEvent(
        eventId,
        event
    ) {

        if (
            activeTimers.has(
                eventId
            )
        ) {

            return;
        }


        const delay =
            Number(event.delay) || 0;


        const timer =
            window.setTimeout(
                () => {

                    activeTimers.delete(
                        eventId
                    );


                    if (
                        event.once
                    ) {

                        triggeredEvents.add(
                            eventId
                        );
                    }


                    executeEvent(
                        eventId,
                        event
                    );

                },
                delay
            );


        activeTimers.set(
            eventId,
            timer
        );
    }


    /* =====================================================
       EXECUTE EVENT
    ===================================================== */

    function executeEvent(
        eventId,
        event
    ) {

        if (!event) {
            return;
        }


        switch (
            event.action
        ) {

            case "flicker":

                flickerLights();

                break;


            case "whisper":

                whisper();

                break;


            case "presence":

                hallwayPresence();

                break;


            case "bedroomFear":

                bedroomFear();

                break;


            case "basementFear":

                basementFear();

                break;


            default:

                console.warn(
                    "Unknown event:",
                    eventId
                );

                break;
        }
    }


    /* =====================================================
       ROOM ENTER
    ===================================================== */

    function onRoomEnter(
        roomId
    ) {

        checkEvents();


        /*
           Direct room-specific triggers.
        */

        switch (
            roomId
        ) {

            case "hallway":

                trigger(
                    "hallway_presence"
                );

                break;


            case "bedroom":

                trigger(
                    "bedroom_event"
                );

                break;


            case "basement":

                trigger(
                    "basement_event"
                );

                break;
        }
    }


    /* =====================================================
       MANUAL TRIGGER
    ===================================================== */

    function trigger(
        eventId
    ) {

        const event =
            eventData[eventId];


        if (!event) {
            return false;
        }


        if (
            event.once &&
            triggeredEvents.has(
                eventId
            )
        ) {

            return false;
        }


        scheduleEvent(
            eventId,
            event
        );


        return true;
    }


    /* =====================================================
       LIGHT FLICKER
    ===================================================== */

    function flickerLights() {

        const effects =
            document.getElementById(
                "world-effects"
            );


        if (!effects) {
            return;
        }


        let count = 0;

        const total =
            6;


        const flickerTimer =
            window.setInterval(
                () => {

                    effects.classList.toggle(
                        "light-flicker"
                    );


                    count++;


                    if (
                        count >= total
                    ) {

                        window.clearInterval(
                            flickerTimer
                        );


                        effects.classList.remove(
                            "light-flicker"
                        );
                    }

                },
                120
            );


        changeSanity(
            -1
        );
    }


    /* =====================================================
       WHISPER
    ===================================================== */

    function whisper() {

        notify(
            "You hear a whisper behind you."
        );


        changeSanity(
            -2
        );


        setStoryFlag(
            "heard_whisper",
            true
        );
    }


    /* =====================================================
       HALLWAY PRESENCE
    ===================================================== */

    function hallwayPresence() {

        notify(
            "Something moved at the end of the hallway."
        );


        changeSanity(
            -3
        );


        setStoryFlag(
            "hallway_presence_seen",
            true
        );


        /*
           Future:
           spawn entity / shadow / enemy.
        */
    }


    /* =====================================================
       BEDROOM FEAR
    ===================================================== */

    function bedroomFear() {

        notify(
            "The room suddenly feels colder."
        );


        changeSanity(
            -4
        );


        setStoryFlag(
            "bedroom_fear",
            true
        );
    }


    /* =====================================================
       BASEMENT FEAR
    ===================================================== */

    function basementFear() {

        notify(
            "Something is moving in the darkness."
        );


        changeSanity(
            -5
        );


        setStoryFlag(
            "basement_fear",
            true
        );
    }


    /* =====================================================
       SANITY
    ===================================================== */

    function changeSanity(
        amount
    ) {

        if (
            typeof GameState.changeSanity ===
            "function"
        ) {

            GameState.changeSanity(
                amount
            );
        }
    }


    /* =====================================================
       STORY FLAG
    ===================================================== */

    function setStoryFlag(
        flag,
        value = true
    ) {

        if (
            typeof GameState.setStoryFlag ===
            "function"
        ) {

            GameState.setStoryFlag(
                flag,
                value
            );

            return;
        }


        if (
            typeof GameState.setFlag ===
            "function"
        ) {

            GameState.setFlag(
                flag,
                value
            );
        }
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
            2500
        );
    }


    /* =====================================================
       RESET EVENTS
    ===================================================== */

    function reset() {

        activeTimers.forEach(
            timer => {

                window.clearTimeout(
                    timer
                );
            }
        );


        activeTimers.clear();

        triggeredEvents.clear();
    }


    /* =====================================================
       GET EVENT STATE
    ===================================================== */

    function hasTriggered(
        eventId
    ) {

        return triggeredEvents.has(
            eventId
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        update,

        checkEvents,

        onRoomEnter,

        trigger,

        reset,

        hasTriggered
    };

})();
