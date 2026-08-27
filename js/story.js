/* =========================================================
   WHEN THE LIGHT DIES
   STORY SYSTEM
   Main Narrative Controller
========================================================= */

"use strict";


const Story = (() => {

    let initialized = false;

    let currentChapter = 0;

    let currentObjective = "";

    const chapters = {

        0: {
            id: "awakening",
            title: "THE AWAKENING"
        },

        1: {
            id: "house",
            title: "THE HOUSE"
        },

        2: {
            id: "echoes",
            title: "THE ECHOES"
        },

        3: {
            id: "basement",
            title: "BELOW"
        },

        4: {
            id: "truth",
            title: "THE TRUTH"
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

        currentChapter = 0;

        setObjective(
            "Find a way out of the house."
        );
    }


    /* =====================================================
       START STORY
    ===================================================== */

    function start() {

        initialize();

        currentChapter = 0;

        setStoryFlag(
            "story_started",
            true
        );


        setObjective(
            "Find a way out of the house."
        );


        startDialogue(
            getOpeningDialogue()
        );
    }


    /* =====================================================
       OPENING DIALOGUE
    ===================================================== */

    function getOpeningDialogue() {

        return {

            textSpeed: 22,

            lines: [

                {
                    character:
                        "UNKNOWN",

                    text:
                        "Where... am I?"
                },

                {
                    character:
                        "UNKNOWN",

                    text:
                        "I can't remember how I got here."
                },

                {
                    character:
                        "UNKNOWN",

                    text:
                        "The lights... why are they flickering?"
                },

                {
                    character:
                        "UNKNOWN",

                    text:
                        "I need to find a way out."
                }
            ]
        };
    }


    /* =====================================================
       START DIALOGUE
    ===================================================== */

    function startDialogue(
        dialogue
    ) {

        if (
            typeof Dialogue !==
            "undefined"
        ) {

            Dialogue.start(
                dialogue
            );
        }
    }


    /* =====================================================
       ROOM ENTER
    ===================================================== */

    function onRoomEnter(
        roomId
    ) {

        switch (
            roomId
        ) {

            case "intro":

                handleIntroRoom();

                break;


            case "hallway":

                handleHallway();

                break;


            case "living-room":

                handleLivingRoom();

                break;


            case "kitchen":

                handleKitchen();

                break;


            case "bedroom":

                handleBedroom();

                break;


            case "basement":

                handleBasement();

                break;
        }
    }


    /* =====================================================
       INTRO
    ===================================================== */

    function handleIntroRoom() {

        if (
            hasStoryFlag(
                "intro_seen"
            )
        ) {

            return;
        }


        setStoryFlag(
            "intro_seen",
            true
        );


        setObjective(
            "Explore the house."
        );
    }


    /* =====================================================
       HALLWAY
    ===================================================== */

    function handleHallway() {

        if (
            hasStoryFlag(
                "hallway_seen"
            )
        ) {

            return;
        }


        setStoryFlag(
            "hallway_seen",
            true
        );


        setObjective(
            "Search the rooms for clues."
        );


        startDialogue({

            textSpeed: 22,

            lines: [

                {
                    character:
                        "UNKNOWN",

                    text:
                        "This hallway wasn't here before..."
                },

                {
                    character:
                        "UNKNOWN",

                    text:
                        "Or maybe I just don't remember it."
                }
            ]
        });
    }


    /* =====================================================
       LIVING ROOM
    ===================================================== */

    function handleLivingRoom() {

        if (
            hasStoryFlag(
                "living_room_seen"
            )
        ) {

            return;
        }


        setStoryFlag(
            "living_room_seen",
            true
        );


        setObjective(
            "Investigate the television."
        );
    }


    /* =====================================================
       KITCHEN
    ===================================================== */

    function handleKitchen() {

        if (
            hasStoryFlag(
                "kitchen_seen"
            )
        ) {

            return;
        }


        setStoryFlag(
            "kitchen_seen",
            true
        );


        setObjective(
            "Search the kitchen."
        );
    }


    /* =====================================================
       BEDROOM
    ===================================================== */

    function handleBedroom() {

        if (
            hasStoryFlag(
                "bedroom_seen"
            )
        ) {

            return;
        }


        setStoryFlag(
            "bedroom_seen",
            true
        );


        setObjective(
            "Read the diary."
        );


        startDialogue({

            textSpeed: 22,

            lines: [

                {
                    character:
                        "UNKNOWN",

                    text:
                        "Someone lived here."
                },

                {
                    character:
                        "UNKNOWN",

                    text:
                        "But why does this room feel familiar?"
                }
            ]
        });
    }


    /* =====================================================
       BASEMENT
    ===================================================== */

    function handleBasement() {

        if (
            !hasStoryFlag(
                "basement_unlocked"
            )
        ) {

            setObjective(
                "Find a way to restore power."
            );

            return;
        }


        if (
            hasStoryFlag(
                "generator_started"
            )
        ) {

            return;
        }


        setObjective(
            "Start the generator."
        );
    }


    /* =====================================================
       CLUE DISCOVERED
    ===================================================== */

    function discoverClue(
        clueId
    ) {

        setStoryFlag(
            clueId,
            true
        );


        switch (
            clueId
        ) {

            case "television_message":

                onTelevisionMessage();

                break;


            case "missing_person_diary":

                onDiaryFound();

                break;
        }
    }


    /* =====================================================
       TELEVISION
    ===================================================== */

    function onTelevisionMessage() {

        setObjective(
            "Find the missing person's diary."
        );


        startDialogue({

            textSpeed: 18,

            lines: [

                {
                    character:
                        "TELEVISION",

                    text:
                        "DON'T TRUST THE LIGHT."
                },

                {
                    character:
                        "TELEVISION",

                    text:
                        "IT KNOWS WHERE YOU ARE."
                }
            ]
        });
    }


    /* =====================================================
       DIARY
    ===================================================== */

    function onDiaryFound() {

        setStoryFlag(
            "diary_found",
            true
        );


        setObjective(
            "Find the key to the basement."
        );


        startDialogue({

            textSpeed: 20,

            lines: [

                {
                    character:
                        "UNKNOWN",

                    text:
                        "These pages... they're about me."
                },

                {
                    character:
                        "UNKNOWN",

                    text:
                        "That's impossible."
                }
            ]
        });
    }


    /* =====================================================
       ITEM OBTAINED
    ===================================================== */

    function onItemObtained(
        itemId
    ) {

        switch (
            itemId
        ) {

            case "small_key":

                if (
                    hasStoryFlag(
                        "diary_found"
                    )
                ) {

                    setObjective(
                        "Return to the hallway."
                    );
                }

                break;


            case "basement_key":

                setStoryFlag(
                    "basement_unlocked",
                    true
                );


                setObjective(
                    "Enter the basement."
                );

                break;
        }
    }


    /* =====================================================
       GENERATOR
    ===================================================== */

    function onGeneratorActivated() {

        setStoryFlag(
            "generator_started",
            true
        );


        setObjective(
            "Return upstairs."
        );


        startDialogue({

            textSpeed: 20,

            lines: [

                {
                    character:
                        "UNKNOWN",

                    text:
                        "The power is back."
                },

                {
                    character:
                        "UNKNOWN",

                    text:
                        "Then why is the darkness still here?"
                },

                {
                    character:
                        "UNKNOWN",

                    text:
                        "..."
                },

                {
                    character:
                        "UNKNOWN",

                    text:
                        "Something is breathing."
                }
            ]
        });
    }


    /* =====================================================
       GENERIC INTERACTION
    ===================================================== */

    function onInteraction(
        objectId
    ) {

        /*
           Story events can be added here
           without changing the interaction
           engine.
        */

        if (
            objectId ===
            "old-television"
        ) {

            discoverClue(
                "television_message"
            );
        }
    }


    /* =====================================================
       DIALOGUE END
    ===================================================== */

    function onDialogueEnd() {

        /*
           Story progression can be
           evaluated after every dialogue.
        */

        evaluateProgress();
    }


    /* =====================================================
       PROGRESSION
    ===================================================== */

    function evaluateProgress() {

        if (
            hasStoryFlag(
                "generator_started"
            ) &&
            !hasStoryFlag(
                "truth_started"
            )
        ) {

            currentChapter = 4;


            setStoryFlag(
                "truth_started",
                true
            );


            setObjective(
                "Discover the truth."
            );
        }
    }


    /* =====================================================
       SET OBJECTIVE
    ===================================================== */

    function setObjective(
        text
    ) {

        currentObjective =
            text;


        const element =
            document.getElementById(
                "objective-text"
            );


        if (element) {

            element.textContent =
                text;
        }
    }


    /* =====================================================
       STORY FLAGS
    ===================================================== */

    function setStoryFlag(
        flag,
        value
    ) {

        if (
            typeof GameState.setStoryFlag ===
            "function"
        ) {

            GameState.setStoryFlag(
                flag,
                value
            );
        }
    }


    function hasStoryFlag(
        flag
    ) {

        if (
            typeof GameState.hasStoryFlag ===
            "function"
        ) {

            return GameState.hasStoryFlag(
                flag
            );
        }


        return false;
    }


    /* =====================================================
       GENERATOR HOOK
    ===================================================== */

    function onGeneratorActivatedHook() {

        onGeneratorActivated();
    }


    /* =====================================================
       CURRENT CHAPTER
    ===================================================== */

    function getCurrentChapter() {

        return chapters[
            currentChapter
        ] || null;
    }


    /* =====================================================
       GET OBJECTIVE
    ===================================================== */

    function getObjective() {

        return currentObjective;
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        start,

        onRoomEnter,

        discoverClue,

        onItemObtained,

        onGeneratorActivated:
            onGeneratorActivatedHook,

        onInteraction,

        onDialogueEnd,

        getCurrentChapter,

        getObjective
    };

})();
